import mongoose from "mongoose";

const AssessmentSubmissionSchema = new mongoose.Schema(
  {
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment" },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // answers = { questionId: userAnswer }
    answers: { type: Object, required: true },

    // Teacher grading
    detailedMarks: { type: Object, default: {} },
    marks: { type: Number, default: null },

    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model(
  "AssessmentSubmission",
  AssessmentSubmissionSchema
);
