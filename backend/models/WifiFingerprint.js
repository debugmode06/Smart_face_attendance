// backend/models/WifiFingerprint.js
import mongoose from "mongoose";

const wifiFingerprintSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    fingerprint: {
      type: mongoose.Schema.Types.Mixed, // Use Mixed to handle both Map and Object formats
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "wifi_fingerprints", // Explicitly set collection name to match MongoDB
  }
);



const WifiFingerprint = mongoose.model("WifiFingerprint", wifiFingerprintSchema);

export default WifiFingerprint;

