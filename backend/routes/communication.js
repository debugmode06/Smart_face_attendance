// backend/routes/communication.js
import express from "express";
import BroadcastMessage from "../models/BroadcastMessage.js";
import PrivateMessage from "../models/PrivateMessage.js";
import User from "../models/User.js";

const router = express.Router();

/* =====================================
      📢 1) BROADCAST MESSAGES
===================================== */

// CREATE BROADCAST (Faculty Only)
router.post("/broadcast", async (req, res) => {
  try {
    const { facultyId, title, body } = req.body;

    console.log("Broadcast Faculty ID:", facultyId);

    if (!facultyId) {
      return res.status(400).json({ message: "facultyId missing" });
    }

    const faculty = await User.findById(facultyId);
    if (!faculty || faculty.role !== "faculty") {
      return res.status(400).json({ message: "Invalid faculty ID" });
    }

    const newBroadcast = await BroadcastMessage.create({
      title,
      body,
      faculty: facultyId,
    });

    res.status(201).json(newBroadcast);
  } catch (err) {
    console.error("Broadcast Error:", err);
    res.status(500).json({ message: "Error creating broadcast" });
  }
});

// GET BROADCASTS FOR STUDENT
router.get("/broadcast/student", async (req, res) => {
  try {
    const broadcasts = await BroadcastMessage.find()
      .sort({ createdAt: -1 })
      .populate("faculty", "name email");

    res.json(broadcasts);
  } catch (err) {
    console.error("Fetch Broadcast Error:", err);
    res.status(500).json({ message: "Error fetching broadcasts" });
  }
});

/* =====================================
      👥 2) STUDENT LIST
===================================== */
router.get("/students", async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("_id name email department className");

    res.json(students);
  } catch (err) {
    console.error("Students Fetch Error:", err);
    res.status(500).json({ message: "Error fetching students" });
  }
});

/* =====================================
      💬 3) PRIVATE MESSAGES
===================================== */

// FACULTY → STUDENT
router.post("/private/faculty", async (req, res) => {
  try {
    const { facultyId, studentId, body } = req.body;

    console.log("PRIVATE FACULTY ID:", facultyId);

    if (!facultyId) return res.status(400).json({ message: "facultyId missing" });

    const newMsg = await PrivateMessage.create({
      from: facultyId,
      to: studentId,
      body,
    });

    res.status(201).json(newMsg);
  } catch (err) {
    console.error("Error sending private message:", err);
    res.status(500).json({ message: "Error sending private message" });
  }
});

// STUDENT → FACULTY
router.post("/private/student", async (req, res) => {
  try {
    const { studentId, facultyId, body } = req.body;

    const newMsg = await PrivateMessage.create({
      from: studentId,
      to: facultyId,
      body,
    });

    res.status(201).json(newMsg);
  } catch (err) {
    console.error("Error sending reply:", err);
    res.status(500).json({ message: "Error sending reply" });
  }
});

// GET all messages for student panel
router.get("/private/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    const messages = await PrivateMessage.find({
      $or: [{ from: studentId }, { to: studentId }],
    })
      .populate("from", "name role")
      .populate("to", "name role")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Fetch Student Messages Error:", err);
    res.status(500).json({ message: "Error fetching private messages" });
  }
});

// GET full conversation for faculty or student
router.get("/private/conversation", async (req, res) => {
  try {
    const { facultyId, studentId } = req.query;

    const messages = await PrivateMessage.find({
      $or: [
        { from: facultyId, to: studentId },
        { from: studentId, to: facultyId },
      ],
    })
      .populate("from", "name role")
      .populate("to", "name role")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Conversation Fetch Error:", err);
    res.status(500).json({ message: "Error fetching full conversation" });
  }
});

export default router;
