import express from "express";
import StudentProfile from "../models/StudentProfile.js";

const router = express.Router();

// SAVE OR UPDATE PROFILE
router.post("/save", async (req, res) => {
  try {
    const { studentId, data } = req.body;

    const existing = await StudentProfile.findOne({ studentId });

    if (existing) {
      const updated = await StudentProfile.findOneAndUpdate(
        { studentId },
        { $set: data },
        { new: true }
      );
      return res.json(updated);
    }

    const created = await StudentProfile.create({
      studentId,
      ...data,
    });

    res.json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save profile" });
  }
});

// GET PROFILE BY STUDENT ID
router.get("/:studentId", async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({
      studentId: req.params.studentId,
    });

    res.json(profile || {}); // return empty if not found
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

export default router;
