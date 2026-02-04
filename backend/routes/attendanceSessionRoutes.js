// routes/attendanceSessionRoutes.js
import express from "express";
const router = express.Router();
import {
  startSession,
  getActiveSession,
  extendTime,
  confirmSession,
  generateExcelReport,
  getStudentActiveSession,
  markAttendance,
  getSessionHistory,
} from "../controllers/AttendanceSessionController.js";
import { protect } from "../middleware/AuthMiddleware.js";
import { faculty, student } from "../middleware/RoleMiddleware.js";

// ============= FACULTY ROUTES =============
// Start new attendance session
router.post("/faculty/start", protect, faculty, startSession);

// Get active session
router.get("/faculty/active", protect, faculty, getActiveSession);

// Extend time (excuse time)
router.post("/faculty/extend-time", protect, faculty, extendTime);

// Confirm session and mark remaining as absent
router.post("/faculty/confirm", protect, faculty, confirmSession);

// Generate Excel report
router.get("/faculty/excel/:sessionId", protect, faculty, generateExcelReport);

// Get session history
router.get("/faculty/history", protect, faculty, getSessionHistory);

// ============= STUDENT ROUTES =============
// Get active session for student
router.get("/student/active", protect, student, getStudentActiveSession);

// Mark attendance
router.post("/student/mark", protect, student, markAttendance);

export default router;


