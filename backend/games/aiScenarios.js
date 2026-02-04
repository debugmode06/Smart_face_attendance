import express from "express";
import crypto from "crypto";

const router = express.Router();

// simple in-memory cache (safe & fast)
const cache = new Map();

router.post("/logic-drift", async (req, res) => {
  try {
    const key = crypto.createHash("md5").update("logic-drift-v1").digest("hex");
    if (cache.has(key)) {
      console.log("[AI Games] Returning cached scenarios");
      return res.json(cache.get(key));
    }

    const prompt = `Generate 5 short TRUE/FALSE logic scenarios for a 2D game.
Rules:
- Very short statements (max 50 characters)
- Beginner-friendly programming/CS concepts
- Focus on if/else, comparisons, booleans, basic logic
- Return ONLY valid JSON array, no other text

Return STRICT JSON array format:
[
  { "text": "statement here", "answer": true or false, "hint": "short hint" }
]

Example:
[
  { "text": "HTTP is stateless", "answer": true, "hint": "No session memory" },
  { "text": "MongoDB uses tables", "answer": false, "hint": "Uses collections" }
]`;

    console.log("[AI Games] Calling Ollama for logic-drift scenarios...");
    
    const ollamaRes = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2:1b",
        prompt,
        stream: false,
      }),
    });

    if (!ollamaRes.ok) {
      throw new Error(`Ollama returned ${ollamaRes.status}`);
    }

    const data = await ollamaRes.json();
    console.log("[AI Games] Ollama response received, parsing...");

    // Extract JSON from response (might have extra text)
    let responseText = data.response || "";
    console.log("[AI Games] Raw Ollama response (first 500 chars):", responseText.substring(0, 500));
    
    // Try multiple strategies to extract JSON
    let parsedData = null;
    let scenarios = null;
    
    // Strategy 1: Try to find JSON array directly
    let jsonStart = responseText.indexOf("[");
    let jsonEnd = responseText.lastIndexOf("]") + 1;
    
    if (jsonStart !== -1) {
      let jsonText;
      
      if (jsonEnd > jsonStart) {
        // Found both brackets
        jsonText = responseText.substring(jsonStart, jsonEnd);
      } else {
        // Missing closing bracket - extract from [ to end of response
        jsonText = responseText.substring(jsonStart);
        console.log("[AI Games] JSON array missing closing bracket, attempting to complete...");
      }
      
      // Check if JSON is complete (ends with ])
      if (!jsonText.trim().endsWith("]")) {
        console.log("[AI Games] JSON array appears incomplete, attempting to complete...");
        // Remove trailing commas and add closing bracket
        jsonText = jsonText.trim().replace(/,\s*$/, "") + "\n]";
      }
      
      try {
        parsedData = JSON.parse(jsonText);
        if (Array.isArray(parsedData)) {
          scenarios = parsedData;
        }
      } catch (e) {
        console.log("[AI Games] Array parse failed, trying to fix...");
        // Try to fix common JSON issues
        jsonText = jsonText
          .replace(/,\s*]/g, "]") // Remove trailing commas before ]
          .replace(/,\s*}/g, "}") // Remove trailing commas before }
          .trim();
        
        if (!jsonText.endsWith("]")) {
          jsonText = jsonText + "]";
        }
        
        try {
          parsedData = JSON.parse(jsonText);
          if (Array.isArray(parsedData)) {
            scenarios = parsedData;
          }
        } catch (e2) {
          console.log("[AI Games] Could not parse as array, trying to extract items...");
          // Last resort: try to extract individual array items
          const itemMatches = responseText.matchAll(/\{\s*"text"\s*:\s*"[^"]*"\s*,\s*"answer"\s*:\s*(?:true|false)\s*,\s*"hint"\s*:\s*"[^"]*"\s*\}/g);
          const itemsList = Array.from(itemMatches).map(m => {
            try {
              return JSON.parse(m[0]);
            } catch (e3) {
              return null;
            }
          }).filter(Boolean);
          
          if (itemsList.length > 0) {
            console.log("[AI Games] Extracted", itemsList.length, "items using regex");
            scenarios = itemsList;
          }
        }
      }
    }
    
    // Strategy 2: Try to find JSON object (convert to array)
    if (!scenarios) {
      let objStart = responseText.indexOf("{");
      let objEnd = responseText.lastIndexOf("}") + 1;
      
      if (objStart !== -1) {
        // If no closing brace, try to find the last complete entry
        if (objEnd <= objStart) {
          // Find the last complete scenario entry
          const scenarioMatches = responseText.matchAll(/"scenario\d+":\s*\{[^}]*"text"[^}]*"answer"[^}]*"hint"[^}]*\}/g);
          const scenariosList = Array.from(scenarioMatches).map(m => {
            try {
              const entry = JSON.parse("{" + m[0] + "}");
              return Object.values(entry)[0];
            } catch (e) {
              return null;
            }
          }).filter(Boolean);
          
          if (scenariosList.length > 0) {
            console.log("[AI Games] Extracted", scenariosList.length, "scenarios from incomplete object");
            scenarios = scenariosList;
          }
        } else {
          let jsonText = responseText.substring(objStart, objEnd);
          
          // Check if JSON is complete
          if (!jsonText.trim().endsWith("}")) {
            jsonText = jsonText.trim().replace(/,\s*$/, "") + "\n}";
          }
          
          try {
            parsedData = JSON.parse(jsonText);
            // Convert object to array - handle both "scenario1" keys and numeric "0", "1", "2" keys
            if (typeof parsedData === "object" && !Array.isArray(parsedData)) {
              console.log("[AI Games] Found JSON object, converting to array...");
              // Try Object.values first (works for both string and numeric keys)
              const values = Object.values(parsedData).filter(item => 
                item && typeof item === "object" && (item.text || item.statement)
              );
              if (values.length > 0) {
                scenarios = values;
              } else {
                // Fallback: try to extract by iterating keys
                scenarios = Object.keys(parsedData)
                  .sort((a, b) => {
                    // Sort numeric keys properly
                    const numA = parseInt(a);
                    const numB = parseInt(b);
                    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                    return a.localeCompare(b);
                  })
                  .map(key => parsedData[key])
                  .filter(item => item && typeof item === "object" && (item.text || item.statement));
              }
            }
          } catch (e) {
            console.log("[AI Games] Object parse failed, trying regex extraction...");
            // Try to extract individual scenario objects using regex
            // Handle both "scenario1" format and numeric "0", "1", "2" format
            const scenarioMatches = responseText.matchAll(/(?:"scenario\d+"|"\d+"):\s*\{[^}]*"text"[^}]*"answer"[^}]*"hint"[^}]*\}/g);
            const scenariosList = Array.from(scenarioMatches).map(m => {
              try {
                const entry = JSON.parse("{" + m[0] + "}");
                return Object.values(entry)[0];
              } catch (e2) {
                return null;
              }
            }).filter(Boolean);
            
            if (scenariosList.length > 0) {
              console.log("[AI Games] Extracted", scenariosList.length, "scenarios using regex");
              scenarios = scenariosList;
            } else {
              // Last resort: extract any object with text, answer, hint
              const itemMatches = responseText.matchAll(/\{\s*"text"\s*:\s*"[^"]*"\s*,\s*"answer"\s*:\s*(?:true|false)\s*,\s*"hint"\s*:\s*"[^"]*"\s*\}/g);
              const itemsList = Array.from(itemMatches).map(m => {
                try {
                  return JSON.parse(m[0]);
                } catch (e3) {
                  return null;
                }
              }).filter(Boolean);
              
              if (itemsList.length > 0) {
                console.log("[AI Games] Extracted", itemsList.length, "items using fallback regex");
                scenarios = itemsList;
              }
            }
          }
        }
      }
    }
    
    // Strategy 3: Look for JSON in code blocks
    if (!scenarios) {
      const codeBlockMatch = responseText.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/s);
      if (codeBlockMatch) {
        try {
          scenarios = JSON.parse(codeBlockMatch[1]);
        } catch (e) {
          console.log("[AI Games] Code block parse failed");
        }
      }
    }
    
    // Strategy 4: Try to find any array-like structure (more lenient)
    if (!scenarios) {
      const arrayMatch = responseText.match(/\[[\s\S]*?\]/);
      if (arrayMatch) {
        try {
          let jsonText = arrayMatch[0];
          if (!jsonText.trim().endsWith("]")) {
            jsonText = jsonText.trim().replace(/,\s*$/, "") + "]";
          }
          scenarios = JSON.parse(jsonText);
        } catch (e) {
          console.log("[AI Games] Lenient array parse failed");
        }
      }
    }
    
    if (!scenarios || !Array.isArray(scenarios)) {
      console.log("[AI Games] Full response text:", responseText);
      throw new Error("No valid JSON array found in response");
    }

    // Validate and transform scenarios
    if (!Array.isArray(scenarios)) {
      throw new Error("Response is not an array");
    }

    // Transform to match frontend format
    scenarios = scenarios.map((s) => ({
      text: s.text || s.statement || "",
      answer: s.answer === true || s.correct === "TRUE" || s.correct === true || s.answer === "true",
      hint: s.hint || "Think carefully"
    })).filter(s => s.text.length > 0);

    // Ensure we have at least 5 scenarios
    if (scenarios.length < 5) {
      console.log("[AI Games] Not enough scenarios, adding fallbacks");
      const fallbacks = [
        { text: "HTTP is stateless", answer: true, hint: "No session memory" },
        { text: "MongoDB uses tables", answer: false, hint: "Uses collections" },
        { text: "DFS uses a stack", answer: true, hint: "LIFO structure" },
        { text: "CSS is a programming language", answer: false, hint: "Styling language" },
        { text: "REST uses HTTP methods", answer: true, hint: "GET, POST, etc." },
      ];
      scenarios = [...scenarios, ...fallbacks].slice(0, 10);
    }

    console.log(`[AI Games] Generated ${scenarios.length} scenarios`);
    cache.set(key, scenarios);
    res.json(scenarios);
  } catch (err) {
    console.error("[AI Games] Error generating scenarios:", err.message);
    console.error("[AI Games] Full error:", err);
    
    // Return fallback scenarios instead of error
    const fallbacks = [
      { text: "HTTP is stateless", answer: true, hint: "No session memory" },
      { text: "MongoDB uses tables", answer: false, hint: "Uses collections" },
      { text: "DFS uses a stack", answer: true, hint: "LIFO structure" },
      { text: "CSS is a programming language", answer: false, hint: "Styling language" },
      { text: "REST uses HTTP methods", answer: true, hint: "GET, POST, etc." },
      { text: "JavaScript is synchronous", answer: false, hint: "Has async/await" },
      { text: "React uses virtual DOM", answer: true, hint: "Performance optimization" },
      { text: "Python is compiled", answer: false, hint: "Interpreted language" },
    ];
    
    res.json(fallbacks);
  }
});

export default router;

