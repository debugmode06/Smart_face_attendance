import QRCode from "qrcode";
import AttendanceQR from "../models/AttendanceQR.js";

// Generate New QR every time (for demo)
export const getCurrentQR = async (req, res) => {
  try {
    let qrRecord = await AttendanceQR.findOne();

    if (!qrRecord) {
      qrRecord = await AttendanceQR.create({
        qrCode: "WELCOME-QR",
        expiresAt: Date.now() + 30000,
      });
    }

    // Refresh QR every time
    const newCode = "QR-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    qrRecord.qrCode = newCode;
    qrRecord.expiresAt = Date.now() + 30000; // expires in 30s
    await qrRecord.save();

    return res.json({
      qrCode: qrRecord.qrCode,
      expiresIn: Math.max(0, Math.floor((qrRecord.expiresAt - Date.now()) / 1000))
    });
  } catch (err) {
    console.error("QR ERROR:", err);
    res.status(500).json({ message: "QR generation failed" });
  }
};
