// backend/models/StudentStats.js
import mongoose from "mongoose";

const studentStatsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    attendancePercent: { type: Number, default: 0 },
    assignmentsPending: { type: Number, default: 0 },
    upcomingExams: { type: Number, default: 0 },
    announcements: [{ type: String }],
  },
  { timestamps: true }
);

const StudentStats = mongoose.model("StudentStats", studentStatsSchema);

export default StudentStats;
