// backend/models/Attendance.js
import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    className: { type: String, required: true },
    date: { type: Date, required: true },
    day: { type: String, required: true },

    period: { type: Number, required: true },
    subject: { type: String, required: true },

    methods: {
      wifi: { type: Boolean, default: false },

      // 🔥 KEEP BLUETOOTH (for old records)
      bluetooth: { type: Boolean, default: false },

      // 🔥 NEW FIELD FOR GEOLOCATION
      location: { type: Boolean, default: false },

      face: { type: Boolean, default: false },
      qr: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Optional: prevent duplicate attendance for same period
attendanceSchema.index({ student: 1, date: 1, period: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
