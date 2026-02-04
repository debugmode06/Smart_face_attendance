// backend/routes/facultyProfile.js
import express from "express";
import FacultyProfile from "../models/FacultyProfile.js";
import User from "../models/User.js";
import protect from "../middleware/AuthMiddleware.js";
import { requireRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

// GET CURRENT LOGGED-IN FACULTY PROFILE
router.get("/", protect, requireRole("faculty"), async (req, res) => {
  try {
    const facultyId = req.user._id;
    
    // Get basic user info
    const user = await User.findById(facultyId).select("name email subject");
    
    if (!user) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    // Get extended profile if exists
    const profile = await FacultyProfile.findOne({ facultyId: facultyId.toString() });

    // Merge user and profile data
    const response = {
      _id: user._id,
      name: user.name,
      email: user.email,
      subject: user.subject,
      ...profile?.toObject(),
    };

    res.json(response);
  } catch (err) {
    console.error("Get faculty profile error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// SAVE OR UPDATE PROFILE
router.post("/save", async (req, res) => {
  try {
    const { facultyId, data } = req.body;

    const existing = await FacultyProfile.findOne({ facultyId });

    if (existing) {
      const updated = await FacultyProfile.findOneAndUpdate(
        { facultyId },
        { $set: data },
        { new: true }
      );
      return res.json(updated);
    }

    const created = await FacultyProfile.create({
      facultyId,
      ...data
    });

    res.json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save profile" });
  }
});

// GET PROFILE BY FACULTY ID
router.get("/:facultyId", async (req, res) => {
  try {
    const profile = await FacultyProfile.findOne({
      facultyId: req.params.facultyId
    });

    res.json(profile || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// VERY IMPORTANT!!!
export default router;


