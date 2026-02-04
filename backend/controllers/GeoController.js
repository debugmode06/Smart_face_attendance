export const checkGeoAuth = async (req, res) => {
  try {
    // ✅ FIX: accept both naming styles
    const lat = Number(req.body.lat ?? req.body.latitude);
    const lon = Number(req.body.lon ?? req.body.longitude);
    const accuracy = Number(req.body.accuracy);

    if (!lat || !lon) {
      return res.status(400).json({
        message: "Location missing ❌",
        received: req.body,
      });
    }

    // Campus center
    const CAMPUS_LAT = 11.240505;
    const CAMPUS_LON = 79.723102;

    const MAX_RADIUS_METERS = 350;

    const toRad = (x) => (x * Math.PI) / 180;

    const R = 6371000;
    const dLat = toRad(lat - CAMPUS_LAT);
    const dLon = toRad(lon - CAMPUS_LON);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(CAMPUS_LAT)) *
        Math.cos(toRad(lat)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    console.log("USER LAT:", lat);
    console.log("USER LON:", lon);
    console.log("Distance:", Math.round(distance), "m");
    console.log("Accuracy:", accuracy);

    if (distance <= MAX_RADIUS_METERS) {
      return res.json({
        success: true,
        message: "Inside campus ✔",
        distance: Math.round(distance),
      });
    }

    return res.status(403).json({
      success: false,
      message: "You are outside campus zone ❌",
      distance: Math.round(distance),
    });
  } catch (err) {
    console.error("Geo Auth Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during geo verification",
    });
  }
};

