// backend/routes/wifiVerifyRoutes.js

import express from "express";
import { protect } from "../middleware/AuthMiddleware.js";
import { verifyWifiML, getAvailableRooms } from "../controllers/WifiVerifyController.js";

const router = express.Router();

/**
 * Wi-Fi ML Verification Routes
 * 
 * All routes are protected by authentication middleware.
 */

/**
 * POST /api/wifi-ml/verify
 * 
 * Verify Wi-Fi location using ML (KNN)
 * 
 * Requires authentication.
 */
router.post("/verify", protect, verifyWifiML);

/**
 * GET /api/wifi-ml/rooms
 * 
 * Get all available room fingerprints
 * 
 * Requires authentication.
 */
router.get("/rooms", protect, getAvailableRooms);

/**
 * GET /api/wifi-ml/health
 * 
 * Health check endpoint (no auth required for testing)
 */
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Wi-Fi ML service is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;


