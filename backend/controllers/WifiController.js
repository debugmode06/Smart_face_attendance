export const checkWifiAuth = (req, res) => {
  try {
    console.log("=== WIFI AUTH CHECK START ===");

    // IP (for debugging only – NOT for rejecting)
    const ip =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.ip;

    const cleanIP = (ip || "").replace("::ffff:", "");
    console.log("Client IP =", cleanIP);

    // APPROVED HOTSPOTS
    const allowedSSIDs = [
      "Sujith's Phone",
      "OPPO Hotspot",
      "AndroidAP",
      "realme 9 Pro+",
      "REALME hotspot",
      "Vidyatra WiFi"
    ];

    // SSID from frontend (optional)
    const clientSSID = req.headers["x-wifi-ssid"];

    // If frontend sends SSID → use strict check
    if (clientSSID) {
      console.log("Received SSID =", clientSSID);

      if (!allowedSSIDs.includes(clientSSID)) {
        return res.json({
          success: false,
          message: `Connected to ${clientSSID}, not an approved hotspot ❌`,
          ip: cleanIP,
        });
      }

      return res.json({
        success: true,
        message: `WiFi Verified ✔ Connected to ${clientSSID}`,
        ip: cleanIP,
      });
    }

    // If SSID unavailable → fallback allow
    console.log("SSID NOT PROVIDED → fallback allow mode.");

    return res.json({
      success: true,
      message: "WiFi Verified ✔ (fallback mode)",
      ip: cleanIP,
    });

  } catch (err) {
    console.error("WIFI CHECK ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "WiFi verification failed ❌",
    });
  }
};
