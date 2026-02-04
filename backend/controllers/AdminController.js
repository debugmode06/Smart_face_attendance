import User from "../models/User.js";

// ADMIN: Fetch all students
export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" });
    return res.json({ students });
  } catch (err) {
    console.error("Admin getAllStudents error:", err);
    return res.status(500).json({ message: "Server error fetching students" });
  }
};
