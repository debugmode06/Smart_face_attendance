// backend/models/Student.js
import mongoose from "mongoose";

/**
 * CANONICAL FIELD: className
 * Format: "DEPARTMENT SECTION" (e.g., "CSE B", "CSE-C")
 * 
 * This is the single source of truth for class/section identification.
 * All queries MUST use className.
 */

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "student",
    },

    department: {
      type: String, // Example: "CSE", "IT", "ECE"
      required: true,
      uppercase: true,
      trim: true
    },

    year: {
      type: Number, // Example: 1, 2, 3, 4
      required: true,
      min: 1,
      max: 4
    },

    // ============================================
    // CANONICAL FIELD FOR CLASS/SECTION
    // ============================================
    className: {
      type: String, // Example: "CSE B", "CSE-C", "IT A"
      required: true,
      trim: true,
      validate: {
        validator: function(v) {
          // Accept formats: "CSE B", "CSE-B", "CSE A", etc.
          return /^[A-Z]{2,5}[\s-][A-Z]$/i.test(v);
        },
        message: props => `${props.value} is not a valid className! Format: "DEPT SECTION" (e.g., "CSE B" or "CSE-B")`
      }
    },

    interests: {
      type: [String],
      default: [],
    },

    /* ⭐⭐⭐ ADDED XP SYSTEM FIELDS ⭐⭐⭐ */
    totalXP: {
      type: Number,
      default: 0,
    },

    completedGames: {
      type: [String], // ["sdlc", "bug", "usecase"]
      default: [],
    },
  },
  { 
    timestamps: true,
    strict: true // Reject fields not in schema
  }
);

// Pre-save hook to normalize className
studentSchema.pre('save', function(next) {
  if (this.className) {
    // Normalize: trim and ensure consistent spacing
    this.className = this.className.trim();
  }
  next();
});

// Index for fast class-based queries
studentSchema.index({ className: 1 });
studentSchema.index({ department: 1, className: 1 });

const Student = mongoose.model("Student", studentSchema);
export default Student;


