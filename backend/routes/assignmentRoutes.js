// backend/routes/assignmentRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import Assignment from "../models/Assignment.js";
import Assessment from "../models/Assessment.js";
import User from "../models/User.js";  // CORRECT MODEL

const router = express.Router();

// __dirname setup for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ---------- MULTER CONFIG FOR ASSIGNMENT FILES ---------- */
const uploadDir = path.join(__dirname, "..", "uploads", "assignments");

// make sure folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/* ========================= FACULTY APIs ========================= */

// CREATE ASSIGNMENT
router.post(
  "/faculty/assignments/create",
  upload.single("file"),
  async (req, res) => {
    try {
      const {
        facultyId,
        title,
        className,
        dueDate,
        description,
        note,
      } = req.body;

      if (!facultyId || !title || !className || !dueDate) {
        return res.status(400).json({
          message: "facultyId, title, className and dueDate are required",
        });
      }

      const fileUrl = req.file
        ? `/uploads/assignments/${req.file.filename}`
        : "";

      const assignment = await Assignment.create({
        facultyId,
        title,
        className,
        dueDate: new Date(dueDate),
        description,
        note,
        fileUrl,
      });

      res.json({ message: "Assignment created", assignment });
    } catch (err) {
      console.error("Create assignment error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// CREATE ASSESSMENT (with questions, Google-form style)
router.post("/faculty/assessments/create", async (req, res) => {
  try {
    const {
      facultyId,
      title,
      className,
      dueDate,
      instructions,
      questions,
    } = req.body;

    if (!facultyId || !title || !className || !dueDate) {
      return res.status(400).json({
        message: "facultyId, title, className and dueDate are required",
      });
    }

    // questions will be an array from frontend
    const safeQuestions = Array.isArray(questions) ? questions : [];

    const assessment = await Assessment.create({
      facultyId,
      title,
      className,
      dueDate: new Date(dueDate),
      instructions: instructions || "",
      questions: safeQuestions,
    });

    res.json({ message: "Assessment created", assessment });
  } catch (err) {
    console.error("Create assessment error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ========================= STUDENT APIs ========================= */

// GET ASSIGNMENTS FOR A STUDENT
router.get("/student/assignments/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId);  // FIXED
    if (!student)
      return res.status(404).json({ message: "Student not found" });

    const assignments = await Assignment.find({
      className: student.className,  // FIXED
    }).sort({ dueDate: 1, createdAt: -1 });

    res.json(assignments);
  } catch (err) {
    console.error("Fetch assignments error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET ASSESSMENTS FOR A STUDENT
router.get("/student/assessments/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId);  // FIXED
    if (!student)
      return res.status(404).json({ message: "Student not found" });

    const assessments = await Assessment.find({
      className: student.className,  // FIXED
    }).sort({ dueDate: 1, createdAt: -1 });

    res.json(assessments);
  } catch (err) {
    console.error("Fetch assessments error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/faculty/assignments/all/:facultyId", async (req, res) => {
  try {
    const list = await Assignment.find({
      facultyId: req.params.facultyId,
    }).sort({ createdAt: -1 });

    res.json({ assignments: list });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;
