// backend/routes/facultyRoutes.js
import express from "express";
import { protect } from "../middleware/AuthMiddleware.js";

// Import ONLY the functions that actually exist
import { getFacultyDashboard } from "../controllers/FacultyController.js";

const router = express.Router();

// Faculty dashboard route
router.get("/dashboard", protect, getFacultyDashboard);

// You can add more faculty routes here later
// Example:
// router.get("/profile", protect, getFacultyProfile);

export default router;
