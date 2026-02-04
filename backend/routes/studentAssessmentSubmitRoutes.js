// backend/routes/studentAssessmentSubmitRoutes.js
import express from "express";
import mongoose from "mongoose";
import AssessmentSubmission from "../models/AssessmentSubmission.js";
import Assessment from "../models/Assessment.js";

const router = express.Router();

/**
 *  SUBMIT ASSESSMENT RESPONSE
 */
router.post("/submit", async (req, res) => {
  try {
    const { assessmentId, studentId, answers } = req.body;

    if (!assessmentId || !studentId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Invalid submission format" });
    }

    // Prevent duplicate submission
    const exists = await AssessmentSubmission.findOne({
      assessmentId,
      studentId,
    });

    if (exists) {
      return res.status(400).json({ message: "Assessment already submitted" });
    }

    // Validate assessment exists
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // All valid question IDs from DB
    const validQuestionIds = assessment.questions.map((q) =>
      q._id.toString()
    );

    // Validate answers contain only valid question IDs
    for (const a of answers) {
      if (!a.questionId || !validQuestionIds.includes(a.questionId)) {
        return res.status(400).json({
          message: `Invalid questionId found: ${a.questionId}`,
        });
      }
    }

    // Format answers for Mongo
    const formattedAnswers = answers.map((a) => ({
      questionId: new mongoose.Types.ObjectId(a.questionId),
      answer: a.answer,
    }));

    await AssessmentSubmission.create({
      assessmentId,
      studentId,
      answers: formattedAnswers,
      submittedAt: new Date(),
    });

    return res.json({ message: "Submitted successfully" });
  } catch (error) {
    console.error("Submit error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
