// controllers/AttendanceSessionController.js
import AttendanceSession from "../models/AttendanceSession.js";
import User from "../models/User.js";
import ExcelJS from "exceljs";

// ============= FACULTY CONTROLLERS =============

// Start a new attendance session
export const startSession = async (req, res) => {
  try {
    const facultyId = req.user._id;
    const {
      className,
      subject,
      period,
      startTime,
      endTime,
      timeLimit, // in minutes
    } = req.body;

    // Validation
    if (!className || !subject || !period || !startTime || !endTime || !timeLimit) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if there's already an active session for this faculty
    const existingSession = await AttendanceSession.findOne({
      facultyId,
      status: "active",
    });

    if (existingSession) {
      return res.status(400).json({
        message: "You already have an active attendance session. Please complete or expire it first.",
      });
    }

    // Get faculty details
    const faculty = await User.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    // Get all students in this class
    const students = await User.find({
      role: "student",
      className: className,
    }).select("name registerNo");

    // Calculate expiry time
    const expiresAt = new Date(Date.now() + timeLimit * 60 * 1000);

    // Get current day
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const day = days[new Date().getDay()];

    // Create new session
    const session = await AttendanceSession.create({
      facultyId,
      facultyName: faculty.name,
      className,
      subject,
      period,
      date: new Date(),
      day,
      startTime,
      endTime,
      timeLimit,
      expiresAt,
      studentsMarked: students.map((student) => ({
        studentId: student._id,
        studentName: student.name,
        registerNo: student.registerNo,
        status: "absent", // default
      })),
      totalStudents: students.length,
      absentCount: students.length, // initially all absent
    });

    res.status(201).json({
      message: "Attendance session started successfully",
      session,
    });
  } catch (error) {
    console.error("Start session error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get active session for faculty
export const getActiveSession = async (req, res) => {
  try {
    const facultyId = req.user._id;

    const session = await AttendanceSession.findOne({
      facultyId,
      status: { $in: ["active", "expired"] },
    }).sort({ createdAt: -1 });

    if (!session) {
      return res.status(404).json({ message: "No active session found" });
    }

    // Check if session has expired
    if (session.status === "active" && new Date() > session.expiresAt) {
      session.status = "expired";
      await session.save();
    }

    res.json({ session });
  } catch (error) {
    console.error("Get active session error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Extend time (excuse time)
export const extendTime = async (req, res) => {
  try {
    const { sessionId, additionalMinutes } = req.body;

    if (!sessionId || !additionalMinutes) {
      return res.status(400).json({ message: "Session ID and additional minutes are required" });
    }

    const session = await AttendanceSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.status !== "active" && session.status !== "expired") {
      return res.status(400).json({ message: "Cannot extend time for this session" });
    }

    // Extend the expiry time
    session.expiresAt = new Date(session.expiresAt.getTime() + additionalMinutes * 60 * 1000);
    session.excuseTimeAdded += additionalMinutes;
    session.status = "active"; // reactivate if expired

    await session.save();

    res.json({
      message: `Time extended by ${additionalMinutes} minutes`,
      session,
    });
  } catch (error) {
    console.error("Extend time error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Confirm and complete session
export const confirmSession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    const session = await AttendanceSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Mark all remaining students as absent
    session.studentsMarked.forEach((student) => {
      if (student.status === "absent" && !student.markedAt) {
        student.markedAt = new Date();
      }
    });

    // Update counts
    const presentCount = session.studentsMarked.filter((s) => s.status === "present").length;
    const lateCount = session.studentsMarked.filter((s) => s.status === "late").length;
    const absentCount = session.totalStudents - presentCount - lateCount;

    session.presentCount = presentCount;
    session.lateCount = lateCount;
    session.absentCount = absentCount;
    session.status = "confirmed";
    session.confirmedAt = new Date();

    await session.save();

    res.json({
      message: "Session confirmed and completed",
      session,
    });
  } catch (error) {
    console.error("Confirm session error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Generate Excel report
export const generateExcelReport = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await AttendanceSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Attendance Report");

    // Add header information
    worksheet.mergeCells("A1:G1");
    worksheet.getCell("A1").value = "ATTENDANCE REPORT";
    worksheet.getCell("A1").font = { size: 16, bold: true };
    worksheet.getCell("A1").alignment = { horizontal: "center" };

    worksheet.mergeCells("A2:G2");
    worksheet.getCell("A2").value = `Faculty: ${session.facultyName} | Subject: ${session.subject} | Class: ${session.className}`;
    worksheet.getCell("A2").font = { size: 12 };
    worksheet.getCell("A2").alignment = { horizontal: "center" };

    worksheet.mergeCells("A3:G3");
    worksheet.getCell("A3").value = `Period: ${session.period} | Date: ${new Date(session.date).toLocaleDateString()} | Day: ${session.day}`;
    worksheet.getCell("A3").font = { size: 11 };
    worksheet.getCell("A3").alignment = { horizontal: "center" };

    worksheet.mergeCells("A4:G4");
    worksheet.getCell("A4").value = `Time: ${session.startTime} - ${session.endTime} | Time Limit: ${session.timeLimit + session.excuseTimeAdded} minutes`;
    worksheet.getCell("A4").font = { size: 11 };
    worksheet.getCell("A4").alignment = { horizontal: "center" };

    // Add empty row
    worksheet.addRow([]);

    // Add column headers
    const headerRow = worksheet.addRow([
      "S.No",
      "Name",
      "Register Number",
      "Status",
      "Timestamp",
      "WiFi Verified",
      "Face Verified",
    ]);
    headerRow.font = { bold: true };
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4472C4" },
      };
      cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
      cell.alignment = { horizontal: "center" };
    });

    // Add student data
    session.studentsMarked.forEach((student, index) => {
      const row = worksheet.addRow([
        index + 1,
        student.studentName,
        student.registerNo,
        student.status.toUpperCase(),
        student.markedAt ? new Date(student.markedAt).toLocaleString() : "N/A",
        student.wifiVerified ? "Yes" : "No",
        student.faceVerified ? "Yes" : "No",
      ]);

      // Color code status
      const statusCell = row.getCell(4);
      if (student.status === "present") {
        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF70AD47" },
        };
      } else if (student.status === "absent") {
        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFF0000" },
        };
      } else if (student.status === "late") {
        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFC000" },
        };
      }
      statusCell.font = { color: { argb: "FFFFFFFF" }, bold: true };
      statusCell.alignment = { horizontal: "center" };
    });

    // Add summary
    worksheet.addRow([]);
    const summaryRow = worksheet.addRow([
      "SUMMARY:",
      `Total: ${session.totalStudents}`,
      `Present: ${session.presentCount}`,
      `Late: ${session.lateCount}`,
      `Absent: ${session.absentCount}`,
    ]);
    summaryRow.font = { bold: true };

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      column.width = 20;
    });

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Attendance_${session.className}_${session.subject}_${new Date(session.date).toISOString().split("T")[0]}.xlsx`
    );

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Generate Excel error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ============= STUDENT CONTROLLERS =============

// Get active session for student (by class)
export const getStudentActiveSession = async (req, res) => {
  try {
    const studentId = req.user._id;
    const student = await User.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    console.log(`[Student Active Session] Student: ${student.name}, Class: ${student.className}`);

    // Find active session for this student's class
    const session = await AttendanceSession.findOne({
      className: student.className,
      status: "active",
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    console.log(`[Student Active Session] Found session:`, session ? `Yes (ID: ${session._id})` : "No");

    if (!session) {
      // Return 200 with null session instead of 404
      return res.status(200).json({ 
        session: null,
        message: "No active attendance session",
        studentClass: student.className,
      });
    }

    // Find student's record in this session
    const studentRecord = session.studentsMarked.find(
      (s) => s.studentId.toString() === studentId.toString()
    );

    res.json({
      session,
      studentRecord,
      timeRemaining: Math.max(0, Math.floor((session.expiresAt - new Date()) / 1000)), // in seconds
    });
  } catch (error) {
    console.error("Get student active session error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Mark attendance (after WiFi and Face verification)
export const markAttendance = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { sessionId, wifiVerified, faceVerified } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    // WiFi verification is now optional (disabled for now)
    // Only require face verification
    if (!faceVerified) {
      return res.status(400).json({
        message: "Face verification must be completed",
      });
    }

    const session = await AttendanceSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Check if session is active
    if (session.status !== "active") {
      return res.status(400).json({ message: "This session is no longer active" });
    }

    // Check if time has expired
    if (new Date() > session.expiresAt) {
      session.status = "expired";
      await session.save();
      return res.status(400).json({ message: "Time limit expired" });
    }

    // Find student record
    const studentRecord = session.studentsMarked.find(
      (s) => s.studentId.toString() === studentId.toString()
    );

    if (!studentRecord) {
      return res.status(404).json({ message: "Student not found in this session" });
    }

    // Check if already marked
    if (studentRecord.status === "present") {
      return res.status(400).json({ message: "Attendance already marked" });
    }

    // Mark attendance
    studentRecord.status = "present";
    studentRecord.markedAt = new Date();
    studentRecord.wifiVerified = wifiVerified || false; // Optional
    studentRecord.faceVerified = faceVerified;

    // Update counts
    session.presentCount += 1;
    session.absentCount -= 1;

    await session.save();

    res.json({
      message: "Attendance marked successfully",
      studentRecord,
    });
  } catch (error) {
    console.error("Mark attendance error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get faculty session history
export const getSessionHistory = async (req, res) => {
  try {
    const facultyId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const sessions = await AttendanceSession.find({ facultyId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await AttendanceSession.countDocuments({ facultyId });

    res.json({
      sessions,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error("Get session history error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

