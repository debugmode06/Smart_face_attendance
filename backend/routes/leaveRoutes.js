import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import User from "../models/User.js";
import LeaveRequest from "../models/LeaveRequest.js";

const router = express.Router();

// __dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload folder
const uploadDir = path.join(__dirname, "..", "uploads", "leaveRequests");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + file.originalname);
  },
});
const upload = multer({ storage });

/* ===========================================================
    CREATE REQUEST (Leave / OD / Permission)
   =========================================================== */
router.post(
  "/create",
  upload.single("attachment"),
  async (req, res) => {
    try {
      const {
        studentId,
        type,
        fromDate,
        toDate,
        date,
        reason,
        notes,
        eventName,
        organizer,
      } = req.body;

      // Find student's class advisor
      const student = await User.findById(studentId);
      if (!student) return res.status(404).json({ message: "Student not found" });

      const facultyId = student.classAdvisorId;

      const fileUrl = req.file ? `/uploads/leaveRequests/${req.file.filename}` : "";

      const reqObj = await LeaveRequest.create({
        studentId,
        facultyId,
        type,
        fromDate,
        toDate,
        date,
        reason,
        notes,
        eventName,
        organizer,
        attachmentUrl: fileUrl,
        status: "pending",
      });

      res.json(reqObj);
    } catch (err) {
      console.error("Create leave error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* ===========================================================
   GET STUDENT REQUESTS
   =========================================================== */
router.get("/student/:id", async (req, res) => {
  try {
    const data = await LeaveRequest.find({ studentId: req.params.id }).sort({
      createdAt: -1,
    });
    res.json(data);
  } catch (err) {
    console.error("Student fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===========================================================
   GET REQUESTS FOR FACULTY (CLASS ADVISOR)
   =========================================================== */
router.get("/faculty/:facultyId", async (req, res) => {
  try {
    const data = await LeaveRequest.find({
      facultyId: req.params.facultyId,
    })
      .populate("studentId", "name email className department")
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    console.error("Faculty fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===========================================================
   APPROVE REQUEST
   =========================================================== */
router.post("/approve/:id", async (req, res) => {
  try {
    await LeaveRequest.findByIdAndUpdate(req.params.id, {
      status: "approved",
      rejectReason: "",
    });
    res.json({ message: "Approved" });
  } catch (err) {
    console.error("Approve error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===========================================================
   REJECT REQUEST
   =========================================================== */
router.post("/reject/:id", async (req, res) => {
  try {
    await LeaveRequest.findByIdAndUpdate(req.params.id, {
      status: "rejected",
      rejectReason: req.body.reason,
    });
    res.json({ message: "Rejected" });
  } catch (err) {
    console.error("Reject error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
