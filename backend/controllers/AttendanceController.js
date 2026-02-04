// backend/controllers/AttendanceController.js

import Attendance from "../models/Attendance.js";
import ClassTimetable from "../models/ClassTimetable.js";
import User from "../models/User.js";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// ---------- QR SYSTEM ----------
let currentQR = null;
let qrExpiry = 0;

// Generate a new QR every 30 seconds
export const generateQR = () => {
  currentQR = Math.random().toString(36).substring(2, 10).toUpperCase();
  qrExpiry = Date.now() + 30000;
};

// Auto-generate first QR
generateQR();
setInterval(generateQR, 30000);

// ---------- UTIL ----------
function timeStringToMinutes(str) {
  const [h, m] = str.split(":").map(Number);
  return h * 60 + m;
}

function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

// ============================================================
// MARK ATTENDANCE
// ============================================================

export const markStudentAttendance = async (req, res) => {
  try {
    const { wifiVerified, geoVerified, faceVerified, qrVerified } = req.body;

    // Check WiFi location first - student must be inside classroom
    if (!wifiVerified && !geoVerified && !qrVerified) {
      return res.status(403).json({
        message: "You are not inside the classroom. Please connect to classroom WiFi or scan QR code.",
        outsideClass: true,
      });
    }

    // If WiFi/location verified, require face verification
    if ((wifiVerified || geoVerified) && !faceVerified) {
      return res.status(400).json({
        message: "Face verification required. Please enable your camera for face recognition.",
        requiresFace: true,
      });
    }

    // VALIDATION PATHS
    const ok =
      (wifiVerified && faceVerified) ||
      (geoVerified && faceVerified) ||
      qrVerified;

    if (!ok) {
      return res.status(400).json({
        message:
          "Verification failed. Use Wi-Fi+Face, Location+Face, or valid QR.",
      });
    }

    const user = req.user;
    const className = user.className;

    // ---------- GET TODAY ----------
    let todayName = DAYS[new Date().getDay()];
    if (todayName === "Saturday" || todayName === "Sunday") todayName = "Monday";

    // ---------- GET TIMETABLE ----------
    const timetable = await ClassTimetable.findOne({
      className,
      day: todayName,
    });

    if (!timetable) {
      return res.json({
        message: "Demo Mode: Attendance marked ✔",
        demoMode: true,
      });
    }

    // ---------- DETECT CURRENT PERIOD ----------
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    let currentPeriod = null;
    let demoMode = false;

    for (const p of timetable.periods) {
      const start = timeStringToMinutes(p.start);
      const end = timeStringToMinutes(p.end);

      if (nowMinutes >= start && nowMinutes <= end) {
        currentPeriod = p;
        break;
      }
    }

    if (!currentPeriod) {
      currentPeriod = timetable.periods[0];
      demoMode = true;
    }

    // ---------- CHECK IF ALREADY MARKED ----------
    const { start, end } = getTodayRange();

    const exists = await Attendance.findOne({
      student: user._id,
      period: currentPeriod.period,
      date: { $gte: start, $lte: end },
    });

    if (exists) {
      return res.status(400).json({
        message: `Attendance already marked for period ${currentPeriod.period}.`,
      });
    }

    // ---------- SAVE ----------
    const attendance = await Attendance.create({
      student: user._id,
      className,
      date: now,
      day: todayName,
      period: currentPeriod.period,
      subject: currentPeriod.subject,
      methods: {
        wifi: !!wifiVerified,
        bluetooth: false,
        location: !!geoVerified,
        face: !!faceVerified,
        qr: !!qrVerified,
      },
    });

    return res.json({
      message: `Attendance marked for period ${attendance.period} (${attendance.subject}).`,
      period: attendance.period,
      subject: attendance.subject,
      demoMode,
    });
  } catch (err) {
    console.error("Mark attendance error:", err);
    return res
      .status(500)
      .json({ message: "Server error marking attendance" });
  }
};

// ============================================================
// LIVE QR ENDPOINT
// ============================================================

export const getLiveQR = (req, res) => {
  const remaining = Math.max(0, Math.floor((qrExpiry - Date.now()) / 1000));

  return res.json({
    qrCode: currentQR,
    expiresIn: remaining,
  });
};

// ============================================================
// WIFI VERIFICATION
// ============================================================

export const verifyWifiConnection = (req, res) => {
  try {
    console.log("=== WIFI AUTH CHECK START ===");

    // Browser always sends this → works behind Vite proxy too
    const hostHeader = req.headers.host || "";
    console.log("Host Header =", hostHeader);

    // Extract the base IP without port
    const hostIP = hostHeader.split(":")[0];  // e.g. "172.28.29.117"

    // Allowed WiFi IP ranges - modify these to match your network
    const allowedPrefixes = [
      "192.168.1.",    // Your specific WiFi network (change this)
      "192.168.43.",   // Android hotspot
      "192.168.137.",  // Windows hotspot
      "10.0.0.",       // Alternative router range
    ];

    const isAllowed = allowedPrefixes.some(prefix =>
      hostIP.startsWith(prefix)
    );

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: "Not connected to allowed Wi-Fi ❌",
      });
    }

    return res.json({
      success: true,
      message: "Wi-Fi Verified ✔",
    });

  } catch (err) {
    console.error("Wi-Fi check error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error verifying Wi-Fi",
    });
  }
};



  

// ============================================================
// ACTIVE CLASS PRESENT STUDENTS
// ============================================================

export const getPresentStudentsForCurrentPeriod = async (req, res) => {
  try {
    const facultyId = req.user._id;
    const todayName = DAYS[new Date().getDay()];

    const timetables = await ClassTimetable.find({ day: todayName });

    let activeClass = null;
    let currentPeriod = null;

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    for (const tt of timetables) {
      for (const p of tt.periods) {
        const start = timeStringToMinutes(p.start);
        const end = timeStringToMinutes(p.end);

        const teaches =
          p.faculty?.toString() === facultyId.toString() ||
          p.substituteFaculty?.toString() === facultyId.toString();

        if (teaches && nowMinutes >= start && nowMinutes <= end) {
          activeClass = tt.className;
          currentPeriod = p.period;
          break;
        }
      }
      if (activeClass) break;
    }

    if (!activeClass) {
      return res
        .status(400)
        .json({ message: "No active class to check attendance." });
    }

    const { start, end } = getTodayRange();

    const records = await Attendance.find({
      className: activeClass,
      period: currentPeriod,
      date: { $gte: start, $lte: end },
    }).populate("student");

    const students = records.map((r) => ({
      name: r.student.name,
      roll: r.student.roll || "",
      period: r.period,
    }));

    return res.json({
      className: activeClass,
      period: currentPeriod,
      students,
    });
  } catch (err) {
    console.error("Present students error:", err);
    return res.status(500).json({
      message: "Error loading present students",
    });
  }
};


