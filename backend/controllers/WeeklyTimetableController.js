import Timetable from "../models/Timetable.js";
import User from "../models/User.js";

export const generateWeeklyTimetable = async (req, res) => {
  try {
    // Clear old timetable
    await Timetable.deleteMany({});

    const faculty = await User.find({ role: "faculty" });

    if (faculty.length === 0)
      return res.status(400).json({ message: "No faculty found" });

    const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const timeSlots = [
      { start: "09:00", end: "09:50" },
      { start: "09:50", end: "10:40" },
      { start: "10:40", end: "11:30" },
      { start: "11:30", end: "12:20" },
      { start: "01:30", end: "02:20" },
      { start: "02:20", end: "03:10" }
    ];

    const department = "CSE";
    const year = 1;

    let weeklyData = [];

    weekDays.forEach(day => {
      for (let i = 0; i < 6; i++) {
        const teacher = faculty[i % faculty.length];

        weeklyData.push({
          day,
          period: i + 1,
          start: timeSlots[i].start,
          end: timeSlots[i].end,
          subject: teacher.subject,
          teacherId: teacher._id,
          department,
          year
        });
      }
    });

    await Timetable.insertMany(weeklyData);

    res.json({
      message: "Weekly timetable generated",
      data: weeklyData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating weekly timetable" });
  }
};
