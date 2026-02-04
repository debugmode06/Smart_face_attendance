import express from "express";
import authMiddleware from "../middleware/AuthMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
  getFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty,
} from "../controllers/AdminFacultyController.js";

const router = express.Router();

// GET all faculty
router.get(
  "/faculty",
  authMiddleware,
  requireRole("admin"),
  getFaculty
);

// CREATE faculty
router.post(
  "/faculty",
  authMiddleware,
  requireRole("admin"),
  createFaculty
);

// UPDATE faculty
router.put(
  "/faculty/:id",
  authMiddleware,
  requireRole("admin"),
  updateFaculty
);

// DELETE faculty
router.delete(
  "/faculty/:id",
  authMiddleware,
  requireRole("admin"),
  deleteFaculty
);

export default router;
