import express from "express";

const router = express.Router();

// Simple rule-based AI engine
router.get("/ai-suggestions", async (req, res) => {
  try {
    const suggestions = [];

    // Example rules ↓
    const attendance = 82;       // later replace with real DB
    const pendingAssignments = 2;
    const upcomingExams = 1;
    const freePeriod = true;

    if (attendance < 75) {
      suggestions.push("Your attendance is below 75%. Try to attend all classes this week.");
    }

    if (pendingAssignments > 0) {
      suggestions.push(`You have ${pendingAssignments} pending assignments. Start completing them today.`);
    }

    if (upcomingExams > 0) {
      suggestions.push("You have upcoming exams. Revise at least 2 chapters today.");
    }

    if (freePeriod) {
      suggestions.push("You have a free period now — revise notes or prepare for your weakest subject.");
    }

    // default
    if (suggestions.length === 0) {
      suggestions.push("Everything looks good! Keep up the good work.");
    }

    return res.json({ suggestions });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "AI suggestion engine error" });
  }
});

export default router;
