// backend/controllers/adminClassController.js
import User from "../models/User.js";

export const getClassStats = async (req, res) => {
  try {
    // Get all students
    const students = await User.find({ role: "student" }).select(
      "name email department year className"
    );

    const map = {};

    students.forEach((s) => {
      const key = s.className || "Unassigned";

      if (!map[key]) {
        map[key] = {
          _id: key,              // for React key & dropdowns
          className: key,
          strength: 0,
          students: [],
        };
      }

      map[key].students.push(s);
      map[key].strength += 1;
    });

    const classes = Object.values(map).sort((a, b) =>
      a.className.localeCompare(b.className)
    );

    return res.json({ classes });
  } catch (err) {
    console.error("Get class stats error:", err);
    return res.status(500).json({ message: "Failed to load classes" });
  }
};
