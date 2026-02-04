// models/AttendanceSession.js
import mongoose from "mongoose";

const attendanceSessionSchema = new mongoose.Schema(
  {
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    facultyName: {
      type: String,
      required: true,
    },
    className: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    period: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    day: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    timeLimit: {
      type: Number, // in minutes
      required: true,
      default: 10,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    excuseTimeAdded: {
      type: Number, // additional minutes added
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "expired", "confirmed", "completed"],
      default: "active",
    },
    confirmedAt: {
      type: Date,
    },
    studentsMarked: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        studentName: String,
        registerNo: String,
        status: {
          type: String,
          enum: ["present", "absent", "late"],
          default: "absent",
        },
        markedAt: Date,
        wifiVerified: {
          type: Boolean,
          default: false,
        },
        faceVerified: {
          type: Boolean,
          default: false,
        },
      },
    ],
    totalStudents: {
      type: Number,
      default: 0,
    },
    presentCount: {
      type: Number,
      default: 0,
    },
    absentCount: {
      type: Number,
      default: 0,
    },
    lateCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for faster queries
attendanceSessionSchema.index({ facultyId: 1, status: 1 });
attendanceSessionSchema.index({ className: 1, date: 1 });
attendanceSessionSchema.index({ expiresAt: 1 });

const AttendanceSession = mongoose.model("AttendanceSession", attendanceSessionSchema);

// Drop old token index if it exists (cleanup from previous schema)
AttendanceSession.collection.dropIndex("token_1").catch(() => {
  // Index doesn't exist, that's fine
});

export default AttendanceSession;


