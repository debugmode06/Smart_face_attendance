// backend/controllers/WifiVerifyController.js

import { verifyWifiLocation, getAllRoomFingerprints } from "../services/wifiVerificationService.js";

/**
 * Wi-Fi ML Verification Controller
 * 
 * This controller handles API requests for Wi-Fi fingerprint verification.
 * It does NOT contain ML logic - that's in the service layer.
 */

/**
 * Verify Wi-Fi location using ML (KNN)
 * 
 * POST /api/wifi-ml/verify
 * 
 * Request body:
 * {
 *   "expectedRoomId": "CSE-202",
 *   "networkContext": {
 *     "routerIP": "192.168.1.1",
 *     "networkID": "Vidyatra WiFi",
 *     "clientIP": "192.168.1.100"
 *   }
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "isInsideClass": true,
 *   "confidence": 87,
 *   "matchedRoom": "CSE-202",
 *   "expectedRoom": "CSE-202"
 * }
 */
export const verifyWifiML = async (req, res) => {
  try {
    const { expectedRoomId, networkContext } = req.body;

    // Validation
    if (!expectedRoomId) {
      return res.status(400).json({
        success: false,
        error: "expectedRoomId is required",
      });
    }

    // networkContext is optional - we can extract it from request headers

    // Extract network context from request (networkContext from body is optional)
    const context = {
      routerIP:
        networkContext?.routerIP ||
        req.headers["x-router-ip"] ||
        req.ip ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress,
      networkID:
        networkContext?.networkID ||
        networkContext?.ssid ||
        req.headers["x-wifi-ssid"] ||
        req.headers["x-network-id"],
      clientIP:
        networkContext?.clientIP ||
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.ip ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress,
    };

    // Call verification service
    const result = await verifyWifiLocation(context, expectedRoomId, {
      k: req.body.k || 3,
      minConfidence: req.body.minConfidence || 60,
      distanceMetric: req.body.distanceMetric || "euclidean",
    });

    // Return result
    if (result.success) {
      return res.status(200).json({
        success: true,
        isInsideClass: result.isInsideClass,
        confidence: result.confidence,
        matchedRoom: result.matchedRoom,
        expectedRoom: result.expectedRoom,
        avgDistance: result.avgDistance,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error || "Wi-Fi verification failed",
        confidence: result.confidence || 0,
        matchedRoom: result.matchedRoom || null,
      });
    }
  } catch (error) {
    console.error("Wi-Fi ML verification error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error during Wi-Fi verification",
      message: error.message,
    });
  }
};

/**
 * Get all available room fingerprints
 * 
 * GET /api/wifi-ml/rooms
 */
export const getAvailableRooms = async (req, res) => {
  try {
    const result = await getAllRoomFingerprints();

    if (result.success) {
      return res.status(200).json({
        success: true,
        rooms: result.rooms,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error || "Failed to fetch rooms",
      });
    }
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};


