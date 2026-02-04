// backend/controllers/StudentTimetableController.js
import ClassTimetable from "../models/ClassTimetable.js";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const getTodayTimetable = async (req, res) => {
  try {
    let todayName = DAYS[new Date().getDay()];

    // If today is Sunday, show Monday timetable (Sunday is holiday)
    if (todayName === "Sunday") {
      todayName = "Monday";
    }

    const className = req.user.className; // "CSE-A"

    const timetable = await ClassTimetable.findOne({
      className,
      day: todayName,
    }).populate("periods.faculty periods.substituteFaculty");

    if (!timetable) {
      return res.json({ day: todayName, periods: [] });
    }

    const periods = timetable.periods.map((p) => ({
      period: p.period,
      subjectCode: p.subjectCode,
      subject: p.subject,
      start: p.start,
      end: p.end,
      isFreePeriod: p.isFreePeriod,
      teacherAbsent: p.teacherAbsent,
      facultyName: p.facultyName || // Use direct facultyName if exists
        (p.substituteFaculty
          ? p.substituteFaculty.name + " (Substitute)"
          : p.faculty
          ? p.faculty.name
          : "TBA"),
    }));

    return res.json({
      day: timetable.day,
      periods,
    });
  } catch (err) {
    console.error("Student Timetable Error:", err);
    return res
      .status(500)
      .json({ message: "Error loading student timetable" });
  }
};

// Get timetable for a specific day
export const getTimetableByDay = async (req, res) => {
  try {
    const { day } = req.query; // Get day from query parameter
    
    if (!day || !DAYS.includes(day)) {
      return res.status(400).json({ message: "Invalid day parameter" });
    }

    let requestedDay = day;
    
    // If Sunday is requested, show Monday timetable (Sunday is holiday)
    if (requestedDay === "Sunday") {
      requestedDay = "Monday";
    }

    const className = req.user.className;

    const timetable = await ClassTimetable.findOne({
      className,
      day: requestedDay,
    }).populate("periods.faculty periods.substituteFaculty");

    if (!timetable) {
      return res.json({ day: requestedDay, periods: [] });
    }

    const periods = timetable.periods.map((p) => ({
      period: p.period,
      subjectCode: p.subjectCode,
      subject: p.subject,
      start: p.start,
      end: p.end,
      isFreePeriod: p.isFreePeriod,
      teacherAbsent: p.teacherAbsent,
      facultyName: p.facultyName ||
        (p.substituteFaculty
          ? p.substituteFaculty.name + " (Substitute)"
          : p.faculty
          ? p.faculty.name
          : "TBA"),
    }));

    return res.json({
      day: timetable.day,
      periods,
    });
  } catch (err) {
    console.error("Student Timetable By Day Error:", err);
    return res
      .status(500)
      .json({ message: "Error loading timetable for specific day" });
  }
};
