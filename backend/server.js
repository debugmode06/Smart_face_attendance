// ======================================================
// LOAD ENV FIRST (VERY IMPORTANT)
// ======================================================
import "./config/loadEnv.js";   // <-- loads .env BEFORE everything else

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./config/db.js";

import facultyAttendanceRoutes from "./routes/facultyAttendance.routes.js";
import qrRoutes from "./routes/qrRoutes.js";

// ======================================================
// EXPRESS APP
// ======================================================
const app = express();
app.set("trust proxy", true);

// Connect DB
connectDB();

/* ------------------------------------------------------
   CORS (EXPRESS v5 SAFE)
------------------------------------------------------ */
const allowedOrigins = [
  'http://localhost:5173',
  'https://localhost:5173',
  'http://localhost:3000',
  'https://localhost:3000',
  'https://eduport.netlify.app',
  'https://vidyatra.netlify.app'
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('netlify.app')) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(null, true); // Allow all for now, remove in production
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || !origin || origin.includes('netlify.app')) {
    res.header("Access-Control-Allow-Origin", origin || "*");
  }
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// JSON parser
app.use(express.json());

/* ------------------------------------------------------
   STATIC FILES
------------------------------------------------------ */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ------------------------------------------------------
   ROUTES (ORDER IMPORTANT)
------------------------------------------------------ */

// AUTH
import authRoutes from "./routes/authRoutes.js";
app.use("/api/auth", authRoutes);

// ASSIGNMENTS
import assignmentRoutes from "./routes/assignmentRoutes.js";
app.use("/api", assignmentRoutes);

// QR + FACULTY ATTENDANCE
app.use("/api/student/qr", qrRoutes);
app.use("/api/faculty/attendance", facultyAttendanceRoutes);

// ASSESSMENTS
import studentAssessmentRoutes from "./routes/studentAssessmentRoutes.js";
import studentAssessmentSubmitRoutes from "./routes/studentAssessmentSubmitRoutes.js";
import facultyAssessmentRoutes from "./routes/facultyAssessmentRoutes.js";

app.use("/api/student-assessments", studentAssessmentRoutes);
app.use("/api/student/assessment", studentAssessmentSubmitRoutes);
app.use("/api/faculty/assessments", facultyAssessmentRoutes);

// STUDENT
import studentRoutes from "./routes/studentRoutes.js";
import studentProfileRoutes from "./routes/studentProfile.js";
import studentChatbotRoutes from "./routes/studentChatbotRoutes.js";

app.use("/api/student", studentRoutes);
app.use("/api/student/profile", studentProfileRoutes);
app.use("/api/student", studentChatbotRoutes);

// FACULTY
import facultyRoutes from "./routes/facultyRoutes.js";
import facultyProfileRoutes from "./routes/facultyProfile.js";

app.use("/api/faculty/profile", facultyProfileRoutes);
app.use("/api/faculty", facultyRoutes);

// ADMIN
import adminRoutes from "./routes/adminRoutes.js";
import adminStudentRoutes from "./routes/adminStudentRoutes.js";
import adminFacultyRoutes from "./routes/adminFacultyRoutes.js";

app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminStudentRoutes);
app.use("/api/admin", adminFacultyRoutes);

// OTHER ROUTES
import communicationRoutes from "./routes/communication.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import resumeRouter from "./routes/resume.js";

app.use("/api/communication", communicationRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/resume", resumeRouter);

// XP + Games
import xpRoutes from "./routes/xpRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";

app.use("/api/student", xpRoutes);
app.use("/api/games", gameRoutes);

// Wi-Fi ML Verification
import wifiVerifyRoutes from "./routes/wifiVerifyRoutes.js";
app.use("/api/wifi-ml", wifiVerifyRoutes);

// Attendance Session (Real-time)
import attendanceSessionRoutes from "./routes/attendanceSessionRoutes.js";
app.use("/api/attendance-session", attendanceSessionRoutes);

// Notifications
import notificationRoutes from "./routes/notificationRoutes.js";
app.use("/api/notifications", notificationRoutes);

import aiScenarios from "./games/aiScenarios.js";
app.use("/api/games/ai", aiScenarios);


/* ------------------------------------------------------
   ROOT
------------------------------------------------------ */
app.get("/", (req, res) => {
  res.send("VIDYATRA backend is running 🚀");
});

/* ------------------------------------------------------
   SERVER
------------------------------------------------------ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});


