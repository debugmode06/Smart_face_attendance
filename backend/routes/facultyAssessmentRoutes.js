import express from "express";
import Assessment from "../models/Assessment.js";
import AssessmentSubmission from "../models/AssessmentSubmission.js";

const router = express.Router();

/* ============================================================
   GET ALL ASSESSMENTS CREATED BY THIS FACULTY
============================================================ */
router.get("/all/:facultyId", async (req, res) => {
  try {
    const { facultyId } = req.params;

    const assessments = await Assessment.find({ facultyId })
      .sort({ createdAt: -1 });

    res.json({ assessments });
  } catch (error) {
    console.error("Faculty assessments fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ============================================================
   GET ALL SUBMISSIONS FOR A SPECIFIC ASSESSMENT
============================================================ */
router.get("/:assessmentId/submissions", async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const submissions = await AssessmentSubmission.find({ assessmentId })
      .populate("studentId", "name email className")
      .sort({ createdAt: -1 });

    res.json({ submissions });
  } catch (err) {
    console.error("Fetch submissions error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ============================================================
   SAVE MARKS FOR A STUDENT'S SUBMISSION
============================================================ */
router.post("/:submissionId/grade", async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { detailedMarks, totalMarks } = req.body;

    const submission = await AssessmentSubmission.findById(submissionId);

    if (!submission)
      return res.status(404).json({ message: "Submission not found" });

    submission.detailedMarks = detailedMarks || {};
    submission.marks = totalMarks ?? null;

    await submission.save();

    res.json({ message: "Marks saved successfully" });
  } catch (error) {
    console.error("Save marks error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
