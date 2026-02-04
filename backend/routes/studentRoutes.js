// backend/routes/studentRoutes.js

import express from "express";
import authMiddleware from "../middleware/AuthMiddleware.js";
import { requireRole } from "../middleware/RoleMiddleware.js";

// Controllers
import { getStudentDashboard } from "../controllers/StudentController.js";
import { getTodayTimetable, getTimetableByDay } from "../controllers/StudentTimetableController.js";
import { getAISuggestions } from "../controllers/AISuggestionController.js";
import { saveInterests } from "../controllers/studentInterestController.js";
import { markStudentAttendance } from "../controllers/AttendanceController.js";
import { getCurrentQR } from "../controllers/QrController.js";
import { getLiveQR } from "../controllers/AttendanceController.js";
import { generatePersonalMaterial } from "../controllers/StudyMaterialController.js";
import { verifyWifiConnection } from "../controllers/AttendanceController.js";

import { protect } from "../middleware/AuthMiddleware.js";


// 🔥 REPLACED BLUETOOTH CONTROLLER
// import { checkBluetoothAuth } from "../controllers/BluetoothController.js";
import { checkGeoAuth } from "../controllers/GeoController.js";

import User from "../models/User.js";

import multer from "multer";
import axios from "axios";
import FormData from "form-data";

const router = express.Router();
const upload = multer();

// Face Service URL from environment variable
const FACE_SERVICE_URL = process.env.FACE_SERVICE_URL || "https://mohans143-face-attendance-api.hf.space";

/* ======================================================
   STUDENT INTERESTS
====================================================== */
router.post("/save-interests", authMiddleware, saveInterests);

/* ======================================================
   STUDENT DASHBOARD (AI + Interests + Face Check Trigger)
====================================================== */
router.get(
  "/dashboard",
  authMiddleware,
  requireRole("student"),
  getStudentDashboard
);

/* ======================================================
   TIMETABLE
====================================================== */
router.get(
  "/timetable",
  authMiddleware,
  requireRole("student"),
  getTodayTimetable
);

// Get timetable for a specific day
router.get(
  "/timetable/day",
  authMiddleware,
  requireRole("student"),
  getTimetableByDay
);

/* ======================================================
   AI SUGGESTIONS
====================================================== */
router.get(
  "/ai-suggestions",
  authMiddleware,
  requireRole("student"),
  getAISuggestions
);

/* ======================================================
   ATTENDANCE SUBMISSION
====================================================== */
router.post(
  "/attendance/mark",
  authMiddleware,
  requireRole("student"),
  markStudentAttendance
);

/* ======================================================
   QR SYSTEM
====================================================== */
router.get("/qr/current", getCurrentQR);
router.get("/qr/live", getLiveQR);

/* ======================================================
   REAL WI-FI VERIFICATION
====================================================== */
router.get(
  "/attendance/check-wifi",
  authMiddleware,
  requireRole("student"),
  verifyWifiConnection
);


/* ======================================================
   ⭐ NEW — GEOLOCATION VERIFICATION (Replaces Bluetooth)
====================================================== */
router.post(
  "/attendance/check-geo",
  authMiddleware,
  requireRole("student"),
  checkGeoAuth
);

/* ======================================================
   GET STUDENT LIST
====================================================== */
router.get("/", async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select(
      "_id name email department className"
    );
    return res.status(200).json({ students });
  } catch (err) {
    console.error("Error fetching students:", err);
    return res.status(500).json({ message: "Error fetching students" });
  }
});

/* ======================================================
   Personalized Study Material
====================================================== */
router.get(
  "/personal-material",
  authMiddleware,
  requireRole("student"),
  generatePersonalMaterial
);

/* ======================================================
   FULL STUDENT LIST FOR ADMIN UI
====================================================== */
router.get("/all/full", async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select(
      "name regNo dept section year dob email contact cgpa performance avatar"
    );

    return res.status(200).json(students);
  } catch (err) {
    console.error("Error fetching student data:", err);
    return res.status(500).json({ message: "Error fetching student data" });
  }
});

/* ======================================================
   FACE REGISTRATION — FIRST TIME ONLY
====================================================== */
router.post(
  "/face/register",
  authMiddleware,
  requireRole("student"),
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
      }

      const form = new FormData();
      form.append("image", req.file.buffer, {
        filename: "face.jpg",
        contentType: "image/jpeg",
      });

      let pyRes;
      try {
        pyRes = await axios.post(`${FACE_SERVICE_URL}/register`, form, {
          headers: form.getHeaders(),
          validateStatus: (status) => status < 500, // Don't throw on 4xx, only 5xx
        });
      } catch (pyErr) {
        console.error("Python service connection error:", pyErr.message);
        if (pyErr.code === "ECONNREFUSED") {
          return res.status(500).json({ 
            message: "Face verification service is not available. Please contact support." 
          });
        }
        throw pyErr;
      }

      // Handle Python service response (even if status is 400)
      if (pyRes.status === 400 || !pyRes.data.success) {
        return res.status(400).json({
          message: pyRes.data.msg || pyRes.data.message || "Face registration failed. Please ensure your face is clearly visible in the camera.",
        });
      }

      await User.findByIdAndUpdate(req.user._id, {
        faceEmbedding: pyRes.data.embedding,
        faceRegistered: true,
      });

      return res.json({
        success: true,
        message: "Face registered successfully",
      });
    } catch (err) {
      console.error("Face register error:", err.response?.data || err.message);
      
      // More specific error handling
      if (err.code === "ECONNREFUSED" || err.message?.includes("connect")) {
        return res.status(500).json({ 
          message: "Face verification service is not available. Please contact support." 
        });
      }
      
      if (err.response?.status === 400) {
        // Python service returned 400 - pass through the error message
        return res.status(400).json({ 
          message: err.response.data?.msg || err.response.data?.message || "Face registration failed. Please ensure your face is clearly visible." 
        });
      }
      
      if (err.response?.data) {
        // Pass through Python service error
        return res.status(err.response.status || 500).json({ 
          message: err.response.data.msg || err.response.data.message || "Face registration error" 
        });
      }
      
      return res
        .status(500)
        .json({ message: err.message || "Server error in face register" });
    }
  }
);

/* ======================================================
   FACE ATTENDANCE → MATCH + AUTO MARK
====================================================== */
router.post(
  "/attendance/face-scan",
  authMiddleware,
  requireRole("student"),
  upload.single("image"),
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id);

      if (!user.faceEmbedding || !user.faceRegistered) {
        return res
          .status(400)
          .json({ message: "Face not registered. Please register first." });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
      }

      const form = new FormData();
      form.append("image", req.file.buffer, {
        filename: "face.jpg",
        contentType: "image/jpeg",
      });
      form.append("stored_embedding", JSON.stringify(user.faceEmbedding));

      const pyRes = await axios.post(`${FACE_SERVICE_URL}/verify`, form, {
        headers: form.getHeaders(),
      });

      if (!pyRes.data.match) {
        return res
          .status(401)
          .json({ message: "Face did not match. Try again." });
      }

      req.body = {
        wifiVerified: true,
        geoVerified: false,      // 🔥 set this if you want auto mark with geo
        faceVerified: true,
        qrVerified: false,
      };

      return markStudentAttendance(req, res);
    } catch (err) {
      console.error(
        "Face attendance error:",
        err.response?.data || err.message
      );
      
      // More specific error messages
      if (err.code === "ECONNREFUSED" || err.message?.includes("connect")) {
        return res.status(500).json({ 
          message: "Face verification service is not available. Please contact support." 
        });
      }
      
      if (err.response?.status === 500) {
        return res.status(500).json({ 
          message: "Face verification service error. Please check if the Python service is running." 
        });
      }
      
      return res
        .status(500)
        .json({ message: err.message || "Server error in face attendance" });
    }
  }
);

router.get("/current-free-period", protect, async (req, res) => {
  try {
    const studentId = req.user.id;

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

    // Use your existing timetable logic:
    const timetable = await StudentTimetable.findOne({ studentId });

    if (!timetable) {
      return res.json({ isFree: false });
    }

    const today = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    const periods = timetable[today] || [];

    const freeNow = periods.find(
      (p) => p.start <= currentTime && p.end >= currentTime && p.isFree === true
    );

    return res.json({ isFree: !!freeNow });
  } catch (err) {
    console.error("FREE PERIOD CHECK ERROR:", err);
    res.status(500).json({ isFree: false });
  }
});


export default router;


