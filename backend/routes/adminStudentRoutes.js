import express from "express";
import authMiddleware from "../middleware/AuthMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/AdminStudentController.js";

const router = express.Router();

// GET all students
router.get(
  "/students",
  authMiddleware,
  requireRole("admin"),
  getStudents
);

// CREATE student
router.post(
  "/students",
  authMiddleware,
  requireRole("admin"),
  createStudent
);

// UPDATE student
router.put(
  "/students/:id",
  authMiddleware,
  requireRole("admin"),
  updateStudent
);

// DELETE student
router.delete(
  "/students/:id",
  authMiddleware,
  requireRole("admin"),
  deleteStudent
);

export default router;
