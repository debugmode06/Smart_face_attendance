import Attendance from "../models/Attendance.js";
import User from "../models/User.js";
import ClassTimetable from "../models/ClassTimetable.js";

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function getTodayName() {
  let day = DAYS[new Date().getDay()];
  if (day === "Saturday" || day === "Sunday") day = "Monday";
  return day;
}

function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function timeToMinutes(t) {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/* ----------------------------------------------------------
   1) Get all students of faculty’s class
----------------------------------------------------------- */
export const getMyClassStudents = async (req, res) => {
  try {
    const className = req.user.className;
    if (!className) {
      return res.json({ className: null, totalStudents: 0, students: [] });
    }

    const students = await User.find({
      role: "student",
      className,
    }).select("name roll");

    return res.json({
      className,
      totalStudents: students.length,
      students,
    });
  } catch (err) {
    console.error("getMyClassStudents ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ----------------------------------------------------------
   2) Get students present in CURRENT period
----------------------------------------------------------- */
export const getPresentStudentsForFaculty = async (req, res) => {
  try {
    const facultyId = req.user._id.toString();
    const today = getTodayName();
    const { start, end } = getTodayRange();

    const timetables = await ClassTimetable.find({ day: today });

    let activeClass = null;
    let currentPeriod = null;

    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();

    for (const tt of timetables) {
      for (const p of tt.periods) {
        if (!p.start || !p.end) continue;

        const s = timeToMinutes(p.start);
        const e = timeToMinutes(p.end);

        const teaching =
          p.faculty?.toString() === facultyId ||
          p.substituteFaculty?.toString() === facultyId;

        if (teaching && nowMin >= s && nowMin <= e) {
          activeClass = tt.className;
          currentPeriod = p.period;
          break;
        }
      }
      if (activeClass) break;
    }

    // Fallback DEMO
    if (!activeClass) {
      activeClass = timetables[0]?.className;
      currentPeriod = timetables[0]?.periods[0]?.period;
    }

    if (!activeClass) {
      return res.json({
        className: null,
        period: null,
        students: [],
        presentCount: 0,
        totalStudents: 0,
      });
    }

    const records = await Attendance.find({
      className: activeClass,
      period: currentPeriod,
      date: { $gte: start, $lte: end },
    }).populate("student", "name roll");

    const present = records.map((r) => ({
      name: r.student.name,
      roll: r.student.roll,
    }));

    const totalStudents = await User.countDocuments({
      role: "student",
      className: activeClass,
    });

    return res.json({
      className: activeClass,
      period: currentPeriod,
      students: present,
      presentCount: present.length,
      totalStudents,
    });
  } catch (err) {
    console.error("getPresentStudentsForFaculty ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ----------------------------------------------------------
   3) FULL DAY — All periods with present & absent
----------------------------------------------------------- */
export const getFacultyAttendanceForDay = async (req, res) => {
  try {
    const facultyId = req.user._id.toString();
    const today = getTodayName();
    const { start, end } = getTodayRange();

    const ttList = await ClassTimetable.find({ day: today });

    let className = null;
    let todaysTimetable = null;

    for (const tt of ttList) {
      const teaches = tt.periods.some(
        (p) =>
          p.faculty?.toString() === facultyId ||
          p.substituteFaculty?.toString() === facultyId
      );

      if (teaches) {
        className = tt.className;
        todaysTimetable = tt;
        break;
      }
    }

    if (!todaysTimetable) {
      return res.json({
        className: null,
        periods: [],
        message: "You are not teaching any class today.",
      });
    }

    const allStudents = await User.find({
      role: "student",
      className,
    }).select("name roll");

    const fullDay = [];

    for (const p of todaysTimetable.periods) {
      const records = await Attendance.find({
        className,
        period: p.period,
        date: { $gte: start, $lte: end },
      }).populate("student", "name roll");

      const present = records.map((r) => ({
        name: r.student.name,
        roll: r.student.roll,
      }));

      const presentIds = new Set(
        records.map((r) => r.student?._id?.toString())
      );

      const absent = allStudents.filter(
        (s) => !presentIds.has(s._id.toString())
      );

      fullDay.push({
        period: p.period,
        subject: p.subject,
        start: p.start,
        end: p.end,
        presentCount: present.length,
        absentCount: absent.length,
        totalStudents: allStudents.length,
        presentStudents: present,
        absentStudents: absent,
      });
    }

    return res.json({
      className,
      periods: fullDay,
    });
  } catch (err) {
    console.error("getFacultyAttendanceForDay ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
