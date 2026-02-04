import mongoose from "mongoose";

const AttendanceQRSchema = new mongoose.Schema({
  qrCode: { type: String, required: true },
  expiresAt: { type: Number, required: true }
});

export default mongoose.model("AttendanceQR", AttendanceQRSchema);
