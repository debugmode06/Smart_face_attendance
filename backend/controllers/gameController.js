import GameHistory from "../models/GameHistory.js";
import User from "../models/User.js";
import missionsRandom from "../data/missionsRandom.js";

const gameCache = new Map();

/* XP ENGINE */
function xpForDifficulty(d) {
  if (d === "easy") return 10;
  if (d === "medium") return 20;
  return 40;
}

/* ADAPTIVE DIFFICULTY */
async function getAdaptiveDifficulty(userId, gameId) {
  const history = await GameHistory.find({ userId, gameId })
    .sort({ createdAt: -1 })
    .limit(5);

  if (history.length < 2) return "easy";

  const recent = history.map((h) => (h.correct ? 1 : 0));
  const avg = recent.reduce((a, b) => a + b, 0) / recent.length;

  if (avg >= 0.8) return "hard";
  if (avg >= 0.4) return "medium";
  return "easy";
}

/* MAIN CONTROLLER – RANDOM MISSION MODE */
export const generateGameQuestion = async (req, res) => {
  try {
    const userId = req.user._id;
    const { gameId } = req.body;

    if (!gameId) {
      return res.status(400).json({ message: "gameId is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // NO MORE INTEREST LOGIC → RANDOM MISSION
    const randomIndex = Math.floor(Math.random() * missionsRandom.length);
    const mission = missionsRandom[randomIndex];

    const cacheKey = `${gameId}::${mission.title}`;
    const cached = gameCache.get(cacheKey);
    if (cached) {
      await new Promise((r) => setTimeout(r, 500));
      return res.json(cached);
    }

    const difficulty = await getAdaptiveDifficulty(userId, gameId);
    const xp = xpForDifficulty(difficulty);

    const learningPath = {
      gameId,
      title: mission.title,
      description: mission.description,
      type: "learning_path",
      difficulty,
      xp,
      interest: mission.interest,
      steps: mission.steps,
    };

    await new Promise((r) => setTimeout(r, 900));

    gameCache.set(cacheKey, learningPath);

    await GameHistory.create({
      userId,
      gameId,
      question: learningPath.title,
      difficulty,
      xp,
      correct: null,
    });

    return res.json(learningPath);
  } catch (err) {
    console.error("❌ Learning Path Engine ERROR:", err);
    return res
      .status(500)
      .json({ message: "Learning path engine error (random mode)" });
  }
};
