import Timetable from "../models/Timetable.js";
import User from "../models/User.js";

export const seedWeeklyTimetable = async (req, res) => {
  try {
    // Remove existing timetable first (optional)
    await Timetable.deleteMany({});

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // Get all faculty
    const faculty = await User.find({ role: "faculty" });

    if (faculty.length === 0) {
      return res.status(400).json({ message: "No faculty found. Add teachers first." });
    }

    const periods = [
      { period: 1, start: "09:00", end: "09:50" },
      { period: 2, start: "09:50", end: "10:40" },
      { period: 3, start: "10:40", end: "11:30" },
      { period: 4, start: "11:30", end: "12:20" },
      { period: 5, start: "01:20", end: "02:10" },
      { period: 6, start: "02:10", end: "03:00" }
    ];

    const entries = [];

    for (const day of days) {
      for (const p of periods) {
        // Pick a RANDOM teacher
        const teacher = faculty[Math.floor(Math.random() * faculty.length)];

        entries.push({
          day,
          period: p.period,
          start: p.start,
          end: p.end,
          teacherId: teacher._id,
          subject: teacher.subject || "General Studies",
          department: "CSE",
          year: 1,
          isFreePeriod: false,
          teacherAbsent: false
        });
      }
    }

    await Timetable.insertMany(entries);

    res.json({ message: "Weekly timetable seeded successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Timetable seeding failed" });
  }
};
