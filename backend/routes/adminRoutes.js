// backend/routes/adminRoutes.js
import express from "express";
import authMiddleware from "../middleware/AuthMiddleware.js";
import { requireRole } from "../middleware/RoleMiddleware.js";
import User from "../models/User.js";
import WifiFingerprint from "../models/WifiFingerprint.js";
import { seedWeeklyTimetable } from "../controllers/seedTimetableController.js";
import { protectAdmin } from "../middleware/AuthMiddleware.js";
import { getAllStudents } from "../controllers/AdminController.js";
import { getClassStats } from "../controllers/adminClassController.js";

import {
  getTimetableMeta,
  getClassTimetable,
  saveClassTimetable,
  duplicateTimetable,
} from "../controllers/AdminTimetableController.js";

import { getDashboardStats } from "../controllers/adminDashboardController.js";










const router = express.Router();


router.get("/faculty-list", authMiddleware, requireRole("admin"), async (req, res) => {
  const faculty = await User.find({ role: "faculty" });
  res.json({ faculty });
});

router.get("/students", protectAdmin, getAllStudents);

router.get("/seed-timetable", seedWeeklyTimetable);
router.get(
  "/dashboard",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    res.json({
      message: "Admin dashboard data",
      user: req.user,
    });
  }
);

router.get(
  "/classes",
  authMiddleware,
  requireRole("admin"),
  getClassStats
);

// TIMETABLE META (faculty + subjects)
router.get(
  "/timetable/meta",
  authMiddleware,
  requireRole("admin"),
  getTimetableMeta
);

// GET weekly timetable of a class
router.get(
  "/timetable/:className",
  authMiddleware,
  requireRole("admin"),
  getClassTimetable
);

// SAVE weekly timetable of a class
router.post(
  "/timetable/save",
  authMiddleware,
  requireRole("admin"),
  saveClassTimetable
);

// DUPLICATE timetable from one class to another
router.post(
  "/timetable/duplicate",
  authMiddleware,
  requireRole("admin"),
  duplicateTimetable
);

router.get("/dashboard", authMiddleware, requireRole("admin"), getDashboardStats);

// WiFi Fingerprint Management
router.get(
  "/wifi-fingerprints",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const fingerprints = await WifiFingerprint.find({}).select(
        "roomId numAPs createdAt updatedAt"
      );
      res.json({ success: true, fingerprints });
    } catch (err) {
      console.error("Fetch fingerprints error:", err);
      res.status(500).json({ success: false, message: "Failed to fetch fingerprints" });
    }
  }
);

router.post(
  "/wifi-fingerprints/upload",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { roomId, fingerprint, numScans, numAPs } = req.body;

      if (!roomId || !fingerprint) {
        return res.status(400).json({
          success: false,
          message: "roomId and fingerprint are required",
        });
      }

      // Check if fingerprint already exists
      const existing = await WifiFingerprint.findOne({ roomId });

      if (existing) {
        // Update existing
        existing.fingerprint = fingerprint;
        existing.updatedAt = new Date();
        await existing.save();
        return res.json({
          success: true,
          message: `Fingerprint updated for ${roomId}`,
          fingerprint: existing,
        });
      } else {
        // Create new
        const newFingerprint = await WifiFingerprint.create({
          roomId,
          fingerprint,
          numScans,
          numAPs,
        });
        return res.json({
          success: true,
          message: `Fingerprint created for ${roomId}`,
          fingerprint: newFingerprint,
        });
      }
    } catch (err) {
      console.error("Upload fingerprint error:", err);
      res.status(500).json({ success: false, message: "Failed to upload fingerprint" });
    }
  }
);

router.delete(
  "/wifi-fingerprints/:roomId",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { roomId } = req.params;
      await WifiFingerprint.deleteOne({ roomId });
      res.json({ success: true, message: `Fingerprint deleted for ${roomId}` });
    } catch (err) {
      console.error("Delete fingerprint error:", err);
      res.status(500).json({ success: false, message: "Failed to delete fingerprint" });
    }
  }
);


// Example: admin can list all users later
// router.get("/users", protect, requireRole("admin"), ...)

export default router;



