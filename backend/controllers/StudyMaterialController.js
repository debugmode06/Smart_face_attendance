export const generatePersonalMaterial = async (req, res) => {
  try {
    // req.user might be undefined if no auth
    const user = req.user || {};
    const interests =
      Array.isArray(user.interests) && user.interests.length
        ? user.interests
        : ["Cybersecurity", "AI & Machine Learning", "Web Development"];

    const interest = interests[0];
    
    // ... then your BIG COMBINED PROMPT using this `interest`

const prompt = `
You are an expert academic content generator.
Return ONLY VALID JSON. No explanations, no markdown.

The JSON MUST have exactly the following structure:

{
  "material": "string (10-12 full lines of professional study notes)",
  "quiz": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correct": 0
    }
  ]
}

IMPORTANT RULES (YOU MUST FOLLOW STRICTLY):

1. "material":
   - Must be 10–12 full lines.
   - Professional academic tone.
   - No headings, no bullet points, no markdown.
   - Just clean paragraph text.

2. "quiz":
   - ALWAYS generate EXACTLY 5 questions. NOT 1.
   - The array MUST contain exactly 5 objects.
   - Each question MUST be high quality.
   - Options must be realistic and technical.
   - Only one correct answer, with the correct index (0-3).

3. VERY IMPORTANT:
   - You MUST output exactly 5 quiz items.
   - If you generate less or more, regenerate internally until correct.
   - Do NOT output any text outside the JSON object.

TOPIC FOR STUDY MATERIAL AND QUIZ: "${interest}"

Now generate the JSON.`;



    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2:1b",
        prompt,
        stream: false,
      }),
    });

    const data = await response.json();

    let raw = data.response || "";

    // -------------------------------
    //  CLEAN JSON FROM OLLAMA
    // -------------------------------

    // 1. Extract the first {...} block safely
    const firstBrace = raw.indexOf("{");
    const lastBrace = raw.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      return res.status(500).json({
        message: "AI did not return JSON.",
        raw,
      });
    }

    let jsonText = raw.substring(firstBrace, lastBrace + 1);

    // 2. Remove markdown
    jsonText = jsonText.replace(/```json/g, "");
    jsonText = jsonText.replace(/```/g, "");

    // 3. Fix trailing commas:  ,]
    jsonText = jsonText.replace(/,\s*]/g, "]");

    // 4. Fix trailing commas: ,}
    jsonText = jsonText.replace(/,\s*}/g, "}");

    // 5. Remove random comments or stars
    jsonText = jsonText.replace(/[\*]+/g, "");

    // TRY PARSING
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (err) {
      console.error("PARSE FAILED JSON:\n", jsonText);
      return res.status(500).json({
        message: "Failed to parse AI JSON",
        jsonText,
        error: err.toString(),
      });
    }

    return res.json({
      material: parsed.material || "No material generated.",
      quiz: parsed.quiz || [],
    });

  } catch (err) {
    console.error("Ollama Study Material Error:", err);
    return res.status(500).json({
      message: "Server error generating study material",
    });
  }
};
