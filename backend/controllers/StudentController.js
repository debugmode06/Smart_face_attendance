// backend/controllers/StudentController.js

import Attendance from "../models/Attendance.js";
import Assignment from "../models/Assignment.js";
import Assessment from "../models/Assessment.js";
import LeaveRequest from "../models/LeaveRequest.js";
import BroadcastMessage from "../models/BroadcastMessage.js";
import ClassTimetable from "../models/ClassTimetable.js"; // ✅ FIXED IMPORT
import User from "../models/User.js"; // ⭐ IMPORTANT: required to access faceEmbedding

export const getStudentDashboard = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const studentId = user._id;
    const className = user.className;

    /*
     * ---------------------------------------------------------
     * 1️⃣ TODAY'S ATTENDANCE (FIXED)
     * ---------------------------------------------------------
     */

    // Today's date range
    const todayStr = new Date().toISOString().split("T")[0];
    const startOfDay = new Date(todayStr + "T00:00:00");
    const endOfDay = new Date(todayStr + "T23:59:59");

    // Weekday = "Monday", "Tuesday", etc.
    const dayName = new Date().toLocaleDateString("en-US", {
      weekday: "long",
    });

    // Get today's timetable for this class
    const classTimetable = await ClassTimetable.findOne({
      className: className,
      day: dayName,
    });

    // Total expected periods today
    const totalPeriods = classTimetable?.periods?.length || 0;

    // Attendance records for today
    const todayAttendance = await Attendance.find({
      student: studentId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    // Present count
    const presentToday = todayAttendance.length;

    // Attendance percentage
    const attendancePercent =
      totalPeriods > 0
        ? Math.round((presentToday / totalPeriods) * 100)
        : 0;

    /*
     * ---------------------------------------------------------
     * 2️⃣ ASSIGNMENTS PENDING
     * ---------------------------------------------------------
     */

    let assignmentsPending = 0;

    if (className) {
      const allAssignments = await Assignment.find({ className });
      const now = new Date();

      assignmentsPending = allAssignments.filter((a) => {
        if (!a.dueDate) return false;
        return new Date(a.dueDate) >= now;
      }).length;
    }

    /*
     * ---------------------------------------------------------
     * 3️⃣ ASSESSMENTS COUNT
     * ---------------------------------------------------------
     */

    const assessmentCount = await Assessment.countDocuments({
      className,
    });

    /*
     * ---------------------------------------------------------
     * 4️⃣ LEAVE STATISTICS
     * ---------------------------------------------------------
     */

    const leaveRequests = await LeaveRequest.find({ studentId });

    const pendingLeave = leaveRequests.filter(
      (r) => r.status === "pending"
    ).length;

    const approvedLeave = leaveRequests.filter(
      (r) => r.status === "approved"
    ).length;

    /*
     * ---------------------------------------------------------
     * 5️⃣ ANNOUNCEMENTS
     * ---------------------------------------------------------
     */

    const recentBroadcasts = await BroadcastMessage.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("faculty", "name");

    const announcements = recentBroadcasts.map((b) => {
      const from = b.faculty?.name || "Faculty";
      return `${b.title} — ${from}`;
    });

    /*
     * ---------------------------------------------------------
     * 6️⃣ FACE DATA (IMPORTANT FIX)
     * ---------------------------------------------------------
     */

    // Fetch fresh user record to access faceEmbedding
    const freshUser = await User.findById(user._id);

    const faceRegistered =
      freshUser.faceEmbedding &&
      Array.isArray(freshUser.faceEmbedding) &&
      freshUser.faceEmbedding.length > 0;

    /*
     * ---------------------------------------------------------
     * 7️⃣ FINAL RESPONSE (FULL FIX)
     * ---------------------------------------------------------
     */

    return res.json({
      user: {
        ...freshUser._doc, // send full user data

        // ⭐ CRITICAL: this enables face popup on frontend
        faceRegistered: faceRegistered,

        // OPTIONAL: do NOT send embedding for security reasons
        // faceEmbedding: freshUser.faceEmbedding
      },

      stats: {
        attendancePercent,
        assignmentsPending,
        assessmentCount,
        pendingLeave,
        approvedLeave,
        announcements,
      },
    });

  } catch (err) {
    console.error("Dashboard error:", err);
    return res
      .status(500)
      .json({ message: "Server error loading dashboard" });
  }
};
