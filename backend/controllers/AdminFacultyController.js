import User from "../models/User.js";
import bcrypt from "bcryptjs";

// GET ALL FACULTY
export const getFaculty = async (req, res) => {
  try {
    const faculty = await User.find({ role: "faculty" });
    res.json({ faculty });
  } catch (err) {
    console.error("Get faculty error:", err);
    res.status(500).json({ message: "Failed to load faculty" });
  }
};

// CREATE FACULTY
export const createFaculty = async (req, res) => {
  try {
    const { name, email, password, department, className, subject } = req.body;

    if (!subject) {
      return res.status(400).json({ message: "Subject is required for faculty" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const faculty = await User.create({
      name,
      email,
      password: hashed,
      department,
      role: "faculty",
      className: className || null,
      subject   // ✅ FIXED — this was missing
    });

    res.json({ faculty });
  } catch (err) {
    console.error("Create faculty error:", err);
    res.status(500).json({ message: "Failed to create faculty" });
  }
};

// UPDATE FACULTY
export const updateFaculty = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, email, password, department, className, subject } = req.body;

    const update = {
      name,
      email,
      department,
      className: className || null,
      subject   // ✅ FIXED — was missing earlier
    };

    if (password && password.trim() !== "") {
      update.password = await bcrypt.hash(password, 10);
    }

    const faculty = await User.findByIdAndUpdate(id, update, { new: true });

    res.json({ faculty });
  } catch (err) {
    console.error("Update faculty error:", err);
    res.status(500).json({ message: "Failed to update faculty" });
  }
};

// DELETE FACULTY
export const deleteFaculty = async (req, res) => {
  try {
    const id = req.params.id;

    await User.findByIdAndDelete(id);

    res.json({ success: true });
  } catch (err) {
    console.error("Delete faculty error:", err);
    res.status(500).json({ message: "Failed to delete faculty" });
  }
};
