import express from "express";
import { chatWithAI } from "../controllers/studentChatbotController.js";

const router = express.Router();

router.post("/chatbot", chatWithAI);

export default router;
