import mongoose from "mongoose";

const LeaveSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    type: { type: String, enum: ["leave", "od", "permission"], required: true },

    fromDate: { type: Date },
    toDate: { type: Date },
    date: { type: Date },

    reason: String,
    notes: String,

    eventName: String,
    organizer: String,

    attachmentUrl: String,

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectReason: String,
  },
  { timestamps: true }
);

export default mongoose.model("LeaveRequest", LeaveSchema);
