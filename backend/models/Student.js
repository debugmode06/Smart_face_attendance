// backend/models/Student.js
import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "student",
    },

    department: {
      type: String, // Example: "CSE"
      required: true,
    },

    year: {
      type: Number, // Example: 1, 2, 3, 4
      required: true,
    },

    className: {
      type: String, // Example: "CSE-A", "CSE-B"
      required: true,
    },

    interests: {
      type: [String],
      default: [],
    },

    /* ⭐⭐⭐ ADDED XP SYSTEM FIELDS ⭐⭐⭐ */
    totalXP: {
      type: Number,
      default: 0,
    },

    completedGames: {
      type: [String], // ["sdlc", "bug", "usecase"]
      default: [],
    },
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);
export default Student;
