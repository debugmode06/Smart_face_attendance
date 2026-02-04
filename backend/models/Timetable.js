import mongoose from "mongoose";

const periodSchema = new mongoose.Schema({
  period: { type: Number, required: true }, // 1–6
  start: { type: String, required: true },
  end: { type: String, required: true },
  subject: { type: String, required: true },

  // Main teacher for this period
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  // When teacher is absent
  isFreePeriod: { type: Boolean, default: false },
  teacherAbsent: { type: Boolean, default: false },

  // If another faculty takes the period
  substituteFaculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
});

const timetableSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  day: { type: String, required: true }, // Monday, Tuesday...
  periods: [periodSchema],
});

export default mongoose.model("Timetable", timetableSchema);
