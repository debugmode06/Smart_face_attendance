// backend/routes/authRoutes.js
import express from "express";
import { loginUser } from "../controllers/authController.js";
import { seedDatabase } from "../controllers/seedController.js";


const router = express.Router();

// POST /api/auth/login
router.post("/login", loginUser);
router.get("/seed", seedDatabase);
router.get("/check", (req, res) => {
  res.json({ message: "Auth routes working!" });
});



export default router;
