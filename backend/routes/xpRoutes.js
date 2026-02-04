import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/AuthMiddleware.js";

const router = express.Router();

// GET XP
router.get("/xp", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      totalXP: user.totalXP,
      completedGames: user.completedGames,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "XP fetch error" });
  }
});

// GAIN XP
router.post("/gain-xp", authMiddleware, async (req, res) => {
  try {
    const { gameId } = req.body;

    const user = await User.findOne({ email: req.user.email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const xpRewards = {
      sdlc: 20,
      usecase: 20,
      mcq_quiz: 20,

      bug: 30,
      logic_flow: 30,
      network_fix: 30,

      api_debug: 40,
      db_query: 40,
      cyber_spot: 40,
    };

    const rewardXP = xpRewards[gameId] || 10;

    const alreadyCompleted = user.completedGames.includes(gameId);

    if (!alreadyCompleted) {
      user.totalXP += rewardXP;
      user.completedGames.push(gameId);
      await user.save();
    }

    res.json({
      newTotalXP: user.totalXP,
      awardedXP: alreadyCompleted ? 0 : rewardXP,
      completedGames: user.completedGames,
      alreadyCompleted,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "XP update error" });
  }
});

export default router;
