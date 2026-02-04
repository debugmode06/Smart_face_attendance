import User from "../models/User.js";
import ClassTimetable from "../models/ClassTimetable.js";

export const getDashboardStats = async (req, res) => {
  try {
    console.log("➡️ Dashboard API Hit");

    const students = await User.countDocuments({ role: "student" });
    console.log("Students Count:", students);

    const faculty = await User.countDocuments({ role: "faculty" });
    console.log("Faculty Count:", faculty);

    const classes = await ClassTimetable.distinct("className");
    console.log("Classes Found:", classes);

    const activities = [
      {
        message: "New student added to CSE-A",
        time: "2 minutes ago",
        action: "ADD",
      },
    ];

    return res.json({
      stats: {
        students,
        faculty,
        classes: classes.length,
      },
      activities,
    });

  } catch (err) {
    console.error("❌ Dashboard stats error:", err);

    // fallback
    return res.json({
      stats: { students: 0, faculty: 0, classes: 0 },
      activities: [],
    });
  }
};
