import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" });
    res.json({ students });
  } catch (err) {
    console.error("Get students error:", err);
    res.status(500).json({ message: "Failed to load students" });
  }
};

export const createStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      department,
      year,
      className,
      classAdvisorId,
      interests,
    } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const student = await User.create({
      name,
      email,
      password: hashed,
      role: "student",
      department,
      year,
      className,
      classAdvisorId,
      interests: interests?.split(",").map((x) => x.trim()) || [],
    });

    res.json({ student });
  } catch (err) {
    console.error("Create student error:", err);
    res.status(500).json({ message: "Failed to create student" });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      name,
      email,
      password,
      department,
      year,
      className,
      classAdvisorId,
      interests,
    } = req.body;

    const update = {
      name,
      email,
      department,
      year,
      className,
      classAdvisorId,
      interests: interests?.split(",").map((x) => x.trim()) || [],
    };

    if (password && password.trim() !== "") {
      update.password = await bcrypt.hash(password, 10);
    }

    const student = await User.findByIdAndUpdate(id, update, {
      new: true,
    });

    res.json({ student });
  } catch (err) {
    console.error("Update student error:", err);
    res.status(500).json({ message: "Failed to update student" });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const id = req.params.id;

    await User.findByIdAndDelete(id);

    res.json({ success: true });
  } catch (err) {
    console.error("Delete student error:", err);
    res.status(500).json({ message: "Failed to delete student" });
  }
};
