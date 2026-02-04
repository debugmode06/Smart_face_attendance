// backend/models/Assessment.js
import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // MUST HAVE UNIQUE ID

    text: { type: String, required: true },

    type: {
      type: String,
      enum: ["mcq", "paragraph", "short"],
      default: "mcq",
    },

    marks: { type: Number, default: 1 },

    options: [{ type: String }],

    correctOptionIndex: { type: Number },

    required: { type: Boolean, default: true },
  },
  { id: true } // allow auto _id to work
);

const assessmentSchema = new mongoose.Schema(
  {
    facultyId: { type: String, required: true },
    title: { type: String, required: true },
    className: { type: String, required: true },

    dueDate: { type: Date, required: true },

    instructions: { type: String },

    questions: [questionSchema], // now each question has _id
  },
  { timestamps: true }
);

const Assessment = mongoose.model("Assessment", assessmentSchema);
export default Assessment;
