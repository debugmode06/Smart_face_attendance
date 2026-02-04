import express from "express";
import { seedWeeklyTimetable } from "../controllers/seedTimetableController.js";

const router = express.Router();

// UNPROTECTED route — only for development
router.get("/seed-timetable", seedWeeklyTimetable);

export default router;
