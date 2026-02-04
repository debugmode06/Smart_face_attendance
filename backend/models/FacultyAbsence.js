import mongoose from "mongoose";

const facultyAbsenceSchema = new mongoose.Schema(
  {
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    date: { type: String, required: true },
    reason: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model("FacultyAbsence", facultyAbsenceSchema);
