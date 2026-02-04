// backend/routes/facultyRoutes.js
import express from "express";
import protect from "../middleware/AuthMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

import {
  getMyClassStudents,
  getPresentStudentsForFaculty,
  getFacultyAttendanceForDay,
} from "../controllers/FacultyAttendanceController.js";

import {
  getFacultyTodayTimetable,
  markFacultyPeriodAbsent,
  getTodayFreePeriods,
  claimFreePeriod,
  getFacultyWeeklyTimetable
} from "../controllers/FacultyTimetableController.js";

import { getFacultyDashboard } from "../controllers/facultyDashboardController.js";

const router = express.Router();

// Protect + Restrict to faculty
const protectFaculty = [protect, requireRole("faculty")];

/* ---------------------------------------------------------
   FACULTY DASHBOARD
---------------------------------------------------------- */
router.get("/dashboard", protectFaculty, getFacultyDashboard);

/* ---------------------------------------------------------
   FACULTY TIMETABLE ROUTES
---------------------------------------------------------- */
router.get("/timetable", protectFaculty, getFacultyTodayTimetable);
router.post("/timetable/mark-absent", protectFaculty, markFacultyPeriodAbsent);
router.get("/free-periods", protectFaculty, getTodayFreePeriods);
router.post("/timetable/claim", protectFaculty, claimFreePeriod);
router.get("/timetable/weekly", protectFaculty, getFacultyWeeklyTimetable);

/* ---------------------------------------------------------
   FACULTY ATTENDANCE ROUTES
---------------------------------------------------------- */
router.get("/students", protectFaculty, getMyClassStudents);
router.get("/attendance/current", protectFaculty, getPresentStudentsForFaculty);
router.get("/attendance/day", protectFaculty, getFacultyAttendanceForDay);

export default router;
