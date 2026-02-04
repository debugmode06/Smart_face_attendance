import User from "../models/User.js";
import StudentProfile from "../models/StudentProfile.js";

export const getFacultyDashboard = async (req, res) => {
  try {
    // Get logged-in faculty info
    const facultyId = req.user._id;
    const faculty = await User.findById(facultyId);
    
    if (!faculty || faculty.role !== "faculty") {
      return res.status(403).json({ error: "Access denied" });
    }

    // Faculty info
    const facultyName = faculty.name || "Faculty";
    const subjectName = faculty.subject || "Subject";

    // Fetch all students
    const students = await User.find({ role: "student" });

    // Fetch all student profiles (contains CGPA)
    const studentProfiles = await StudentProfile.find({});
    const profileMap = new Map();
    studentProfiles.forEach((profile) => {
      profileMap.set(profile.studentId, profile);
    });

    // Total students
    const totalStudents = students.length;

    // Get unique classes and departments
    const classesSet = new Set();
    const departmentsSet = new Set();
    students.forEach((s) => {
      if (s.className) classesSet.add(s.className);
      if (s.department) departmentsSet.add(s.department);
    });
    const classes = Array.from(classesSet);
    const departments = Array.from(departmentsSet);

    // Gender counts
    const genderCounts = {
      male: students.filter((s) => s.gender === "M").length,
      female: students.filter((s) => s.gender === "F").length,
      other: students.filter((s) => s.gender !== "M" && s.gender !== "F").length,
    };

    // Helper function to get CGPA from profile
    const getCgpa = (student) => {
      const profile = profileMap.get(student._id.toString());
      if (profile?.academic?.cgpa) {
        const cgpa = parseFloat(profile.academic.cgpa);
        return isNaN(cgpa) ? 7.5 : cgpa; // Default fallback
      }
      return 7.5; // Default CGPA if not found
    };

    // Calculate average CGPA across all students
    const cgpaValues = students.map(getCgpa);
    const avgCgpa = cgpaValues.length
      ? (cgpaValues.reduce((sum, val) => sum + val, 0) / cgpaValues.length).toFixed(2)
      : "7.50";

    // Average subject mark (using CGPA * 10 as placeholder)
    const avgSubjectMark = (parseFloat(avgCgpa) * 10).toFixed(2);

    // Class-wise statistics
    const classStats = classes.map((className) => {
      const classStudents = students.filter((s) => s.className === className);
      const classCgpas = classStudents.map(getCgpa);
      const avgCgpa = classCgpas.length
        ? classCgpas.reduce((sum, val) => sum + val, 0) / classCgpas.length
        : 7.5;
      const avgSubjectMark = avgCgpa * 10;
      
      return {
        className,
        avgCgpa: parseFloat(avgCgpa.toFixed(2)),
        avgSubjectMark: parseFloat(avgSubjectMark.toFixed(2)),
        studentCount: classStudents.length,
      };
    });

    // Marks overview by class (highest/lowest/average)
    const marksOverview = classes.map((className) => {
      const classStudents = students.filter((s) => s.className === className);
      const marks = classStudents.map((s) => getCgpa(s) * 10);
      
      return {
        className,
        highest: marks.length ? parseFloat(Math.max(...marks).toFixed(2)) : 0,
        lowest: marks.length ? parseFloat(Math.min(...marks).toFixed(2)) : 0,
        average: marks.length ? parseFloat((marks.reduce((a, b) => a + b, 0) / marks.length).toFixed(2)) : 0,
      };
    });

    // Trends by class (same as classStats for now)
    const trendsByClass = classStats.map((cs) => ({
      className: cs.className,
      avgCgpa: cs.avgCgpa,
    }));

    // Results by class (pass percentage calculation)
    const resultsByClass = classStats.map((cs) => ({
      className: cs.className,
      passPercentage: parseFloat(Math.min(100, cs.avgCgpa * 10).toFixed(2)),
    }));

    res.json({
      facultyName,
      subjectName,
      totalStudents,
      avgSubjectMark: parseFloat(avgSubjectMark),
      avgCgpa: parseFloat(avgCgpa),
      genderCounts,
      classes,
      departments,
      classStats,
      marksOverview,
      trendsByClass,
      resultsByClass,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Server error" });
  }
};


