// backend/models/Student.js
import mongoose from "mongoose";

/**
 * CANONICAL FIELD: classSection
 * Format: "DEPARTMENT SECTION" (e.g., "CSE B", "IT A")
 * 
 * This replaces className, class, and section fields.
 * All queries MUST use classSection.
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
    classSection: {
      type: String, // Example: "CSE B", "IT A", "ECE C"
      required: true,
      uppercase: true,
      trim: true,
      validate: {
        validator: function(v) {
          // Must match pattern: "DEPT SECTION" (e.g., "CSE B")
          return /^[A-Z]{2,5}\s[A-Z]$/.test(v);
        },
        message: props => `${props.value} is not a valid classSection! Format: "DEPT SECTION" (e.g., "CSE B")`
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

// Pre-save hook to normalize classSection
studentSchema.pre('save', function(next) {
  if (this.classSection) {
    // Normalize: trim, uppercase, single space
    this.classSection = this.classSection
      .trim()
      .toUpperCase()
      .replace(/\s+/g, ' ');
  }
  next();
});

// Index for fast class-based queries
studentSchema.index({ classSection: 1 });
studentSchema.index({ department: 1, classSection: 1 });

const Student = mongoose.model("Student", studentSchema);
export default Student;


