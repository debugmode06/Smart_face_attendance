import express from "express";
import Timetable from "../models/Timetable.js";
import User from "../models/User.js";

const router = express.Router();

// GET student timetable for TODAY
router.get("/timetable", async (req, res) => {
  try {
    const studentId = req.user.id;

    // Find the current student
    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const today = new Date().toISOString().split("T")[0];

    // Load timetable for student department & year
    const periods = await Timetable.find({
      date: today,
      department: student.department,
      year: student.year
    }).lean();

    // Apply dynamic suggestions
    const enhanced = periods.map((p) => {
      if (p.isFreePeriod) {
        return {
          ...p,
          subject: null,
          suggestion: "Use this free period to revise difficult subjects."
        };
      }
      return p;
    });

    return res.json({ periods: enhanced });
  } catch (err) {
    console.error("Timetable Error:", err);
    return res.status(500).json({ message: "Error loading timetable" });
  }
});

export default router;
