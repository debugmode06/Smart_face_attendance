// backend/routes/studentAssessmentRoutes.js
import express from "express";
import authMiddleware from "../middleware/AuthMiddleware.js";
import Assessment from "../models/Assessment.js";
import AssessmentSubmission from "../models/AssessmentSubmission.js";

const router = express.Router();

/* =======================================================
   1️⃣ GET ALL ASSESSMENTS FOR STUDENT
========================================================= */
router.get("/:studentId", authMiddleware, async (req, res) => {
  try {
    const { studentId } = req.params;

    const studentClass = req.user.className;

    // 1) Get assessments
    const assessments = await Assessment.find({ className: studentClass }).sort({
      createdAt: -1,
    });

    // 2) Get submissions for this student
    const submissions = await AssessmentSubmission.find({ studentId });

    // 3) Build lookup map using .toString()
    const submittedMap = {};
    submissions.forEach((s) => {
      submittedMap[s.assessmentId.toString()] = true;
    });

    // 4) Attach submitted flag
    const finalData = assessments.map((a) => ({
      ...a._doc,
      submitted: submittedMap[a._id.toString()] === true,
    }));

    console.log("🔥 FINAL STUDENT ASSESSMENTS:", finalData); // DEBUG LOG

    res.json(finalData);
  } catch (err) {
    console.error("Assessment fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =======================================================
   2️⃣ GET SINGLE ASSESSMENT (ATTEMPT PAGE)
========================================================= */
router.get("/view/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const assessment = await Assessment.findById(id);

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    res.json(assessment);
  } catch (err) {
    console.error("View assessment error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
