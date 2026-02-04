// backend/controllers/AiSuggestionController.js
import Ollama from "ollama";
import ClassTimetable from "../models/ClassTimetable.js";
import StudentStats from "../models/StudentStats.js";
import User from "../models/User.js";

const OLLAMA_MODEL = "qwen2.5:7b";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// If it's Saturday/Sunday, treat it as Monday for timetable
function getTodayName() {
  let d = DAYS[new Date().getDay()];
  if (d === "Saturday" || d === "Sunday") d = "Monday";
  return d;
}

// "09:00" -> minutes
function timeStringToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// Return the period happening *right now*
function findCurrentPeriod(periods) {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  return periods.find((p) => {
    const startMin = timeStringToMinutes(p.start);
    const endMin = timeStringToMinutes(p.end);
    return nowMin >= startMin && nowMin <= endMin;
  });
}

function formatInterests(interests = []) {
  if (!interests.length) return "No specific interests provided.";
  if (interests.length === 1) return interests[0];
  return interests.join(", ");
}

function buildPrompt({ user, interests, stats, period }) {
  const interestsText = formatInterests(interests);

  return `
You are an AI mentor for a college student. 
You NEVER output extra text, only pure JSON in the required format.

Student profile:
- Name: ${user.name}
- Class: ${user.className || "N/A"}
- Department: ${user.department || "N/A"}
- Year: ${user.year || "N/A"}
- Interests: ${interestsText}
- Attendance: ${stats.attendancePercent}% 
- Pending assignments: ${stats.assignmentsPending}
- Upcoming exams: ${stats.upcomingExams}

Current period details:
- Period number: ${period.period}
- Label: ${period.subject}
- Time: ${period.start} - ${period.end}
- This period is FREE.

Task:
Help the student use this FREE period productively in a gentle, non-judgemental way.

1) Suggest exactly ONE activity based on the student's PERSONAL INTERESTS.
2) Suggest exactly ONE activity focused on STUDIES or academics.
3) Both suggestions must be SPECIFIC and ACTIONABLE within this single period.

OUTPUT FORMAT:
Return ONLY this JSON (no Markdown, no commentary):

{
  "interest": {
    "period": ${period.period},
    "start": "${period.start}",
    "end": "${period.end}",
    "label": "Personal Interest",
    "suggestion": "string"
  },
  "academic": {
    "period": ${period.period},
    "start": "${period.start}",
    "end": "${period.end}",
    "label": "Academic / Studies",
    "suggestion": "string"
  }
}
`;
}

// ------------------ MAIN CONTROLLER ------------------

export const getAISuggestions = async (req, res) => {
  try {
    // USER
    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", suggestions: [] });
    }

    if (!user.className) {
      return res.json({
        message: "No class assigned to student yet.",
        suggestions: [],
      });
    }

    const todayName = getTodayName();

    // TIMETABLE
    const timetable = await ClassTimetable.findOne({
      className: user.className,
      day: todayName,
    });

    if (!timetable || !timetable.periods || timetable.periods.length === 0) {
      return res.json({
        message: `No timetable found for ${todayName}.`,
        suggestions: [],
      });
    }

    const current = findCurrentPeriod(timetable.periods);

    if (!current) {
      return res.json({
        message: "No active period right now.",
        suggestions: [],
      });
    }

    // Check if free period
    const isFree =
      current.isFreePeriod === true ||
      (current.subject && current.subject.toLowerCase().includes("free"));

    if (!isFree) {
      return res.json({
        message: `Current period (${current.subject}) is not a free period.`,
        suggestions: [],
      });
    }

    // STATS
    const statsDoc = await StudentStats.findOne({ user: user._id });

    const stats = {
      attendancePercent: statsDoc?.attendancePercent ?? 0,
      assignmentsPending: statsDoc?.assignmentsPending ?? 0,
      upcomingExams: statsDoc?.upcomingExams ?? 0,
    };

    const interests = user.interests || [];

    // PROMPT
    const prompt = buildPrompt({
      user,
      interests,
      stats,
      period: current,
    });

    // OLLAMA CALL
    let aiText = "";
    try {
      const result = await Ollama.generate({
        model: OLLAMA_MODEL,
        prompt,
      });
      aiText = result.response || result.output || "";
      console.log("AI RAW (Ollama):", aiText);
    } catch (err) {
      console.error("Ollama AI Error:", err);
      aiText = "";
    }

    // JSON PARSE
    let parsed;
    try {
      const start = aiText.indexOf("{");
      const end = aiText.lastIndexOf("}") + 1;
      const jsonText =
        start !== -1 && end !== -1 ? aiText.slice(start, end) : aiText;
      parsed = JSON.parse(jsonText);
    } catch (e) {
      console.error("AI JSON parse error, raw text:", aiText);
      parsed = null;
    }

    // FALLBACK IF AI FAILED
    if (!parsed || !parsed.interest || !parsed.academic) {
      const fallback = [
        {
          type: "interest",
          period: current.period,
          start: current.start,
          end: current.end,
          label: "Personal Interest",
          suggestion:
            interests.length > 0
              ? `Use this free period to explore your interest in "${interests[0]}". For example, watch one high-quality tutorial or read a short article and take notes.`
              : "Use this free period to explore any topic you genuinely enjoy. Take notes on at least three new things you learn.",
        },
        {
          type: "academic",
          period: current.period,
          start: current.start,
          end: current.end,
          label: "Academic / Studies",
          suggestion:
            stats.attendancePercent < 75
              ? "Your attendance is on the lower side. Use this free period to revise topics from classes you missed and list doubts to ask faculty later."
              : "Use this free period to complete pending assignments or revise key concepts for the next exam. Write down 3 key points you want to remember.",
        },
      ];

      return res.json({
        message: "Fallback suggestions (AI JSON invalid).",
        period: {
          number: current.period,
          subject: current.subject,
          start: current.start,
          end: current.end,
        },
        suggestions: fallback,
      });
    }

    // NORMALIZE
    const suggestions = [];

    if (parsed.interest) {
      suggestions.push({
        type: "interest",
        period: parsed.interest.period,
        start: parsed.interest.start,
        end: parsed.interest.end,
        label: parsed.interest.label || "Personal Interest",
        suggestion: parsed.interest.suggestion,
      });
    }

    if (parsed.academic) {
      suggestions.push({
        type: "academic",
        period: parsed.academic.period,
        start: parsed.academic.start,
        end: parsed.academic.end,
        label: parsed.academic.label || "Academic / Studies",
        suggestion: parsed.academic.suggestion,
      });
    }

    // RESPONSE
    return res.json({
      message: "Suggestions generated.",
      period: {
        number: current.period,
        subject: current.subject,
        start: current.start,
        end: current.end,
      },
      suggestions,
    });
  } catch (err) {
    console.error("AI Suggestion Error:", err);
    return res.status(500).json({
      message: "AI engine error",
      suggestions: [],
    });
  }
};
