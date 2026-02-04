import mongoose from "mongoose";

const GameHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  gameId: String,
  question: String,
  difficulty: String,
  xp: Number,
  correct: Boolean,
}, { timestamps: true });

export default mongoose.model("GameHistory", GameHistorySchema);
