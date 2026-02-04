// backend/models/Assignment.js
import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    facultyId: { type: String, required: true },
    title: { type: String, required: true },

    // Which class this assignment is for, e.g. "CSE-A"
    className: { type: String, required: true },

    dueDate: { type: Date, required: true },

    description: { type: String },
    note: { type: String },

    // File stored in /uploads/assignments/...
    fileUrl: { type: String },
  },
  { timestamps: true }
);

const Assignment = mongoose.model("Assignment", assignmentSchema);
export default Assignment;
