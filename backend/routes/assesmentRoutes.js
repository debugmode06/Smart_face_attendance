import express from "express";
import authMiddleware from "../middleware/AuthMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

import {
  getFacultyAssessments,
  getAssessmentById,
  submitAssessment,
  getAssessmentSubmissions,
} from "../controllers/AssessmentController.js";

const router = express.Router();

// Faculty
router.get("/faculty/all", authMiddleware, requireRole("faculty"), getFacultyAssessments);

// Student view
router.get("/:id", authMiddleware, requireRole("student"), getAssessmentById);

// Student submit
router.post("/submit", authMiddleware, requireRole("student"), submitAssessment);

// Faculty – get submissions
router.get("/submissions/:assessmentId", authMiddleware, requireRole("faculty"), getAssessmentSubmissions);

export default router;
