import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/generate", async (req, res) => {
  try {
    const faculty = req.body; // all profile details

    // ⭐ PREMIUM+ MODE PROMPT ⭐
    const prompt = `
You are a Top-1% professional resume writer specializing in global ATS-optimized faculty CVs.
Using the information below, create a Premium+ resume:

${JSON.stringify(faculty, null, 2)}

================ PREMIUM+ RESUME RULES ================

1. Write a powerful headline (LinkedIn style)
Example:
"Assistant Professor | Mathematics & Data Analytics | Researcher – OBE & NEP Framework"

2. Write a 4–5 line Professional Summary using:
• Strong action verbs  
• Measurable achievements  
• OBE/NEP academic keywords  
• Research strengths  
• Teaching specialties  

3. Create 2 skills sections:
• CORE SKILLS (6–10)
• TECHNICAL SKILLS (only if data suggests)

4. EXPERIENCE section:
For each job, write 3–6 HIGH-IMPACT bulletpoints using STAR method:
• Situation  
• Task  
• Action  
• Result (quantify whenever possible)

Example:
• Designed outcome-based lesson plans that improved end-semester pass rate by 18%.

5. EDUCATION:
Clean, one-line per qualification.

6. PUBLICATIONS:
Format professionally (Scopus, UGC, IEEE).

7. ROLES & RESPONSIBILITIES:
2–5 bulletpoints.

8. ACHIEVEMENTS:
List as:
• Award/Grant/Recognition + short context

================ FORMAT LAYOUT ================

==================================================
          FULL NAME (UPPERCASE)
PROFESSIONAL HEADLINE (ONE STRONG LINE)
Email | Phone | Country | State | Scholar/ORCID IDs
==================================================

SUMMARY
• 4–5 line premium summary

CORE SKILLS
• Skill 1  • Skill 2  • Skill 3
• Skill 4  • Skill 5  • Skill 6

TECHNICAL SKILLS
• Skill A  • Skill B  • Skill C
(only include if relevant)

EXPERIENCE
ROLE — Organization (Years)
• Bulletpoint (STAR method)
• Bulletpoint
• Bulletpoint

EDUCATION
• Degree — University (Year)

PUBLICATIONS
• Title — Journal/Scopus/UGC

ROLES & RESPONSIBILITIES
• Bulletpoint 1
• Bulletpoint 2

ACHIEVEMENTS
• Bulletpoint 1
• Bulletpoint 2

==================================================

OUTPUT RULES:
• Use clean ATS-friendly formatting
• No hallucinations — use only given data
• Skip empty sections gracefully
• No paragraphs longer than 3 lines
• Return ONLY the resume text, no notes or explanation
`;

    // ⭐ CALL OLLAMA
    const response = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "llama3.2:1b",   // your model
        prompt: prompt,
        stream: false,
      }
    );

    return res.json({ resume: response.data.response });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "AI generation failed" });
  }
});

export default router;
