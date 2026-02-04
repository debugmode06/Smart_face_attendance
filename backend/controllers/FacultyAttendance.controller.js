import Attendance from "../models/Attendance.js";
import User from "../models/User.js";
import ClassTimetable from "../models/ClassTimetable.js";

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function todayName() {
  let d = DAYS[new Date().getDay()];
  return (d === "Sunday" || d === "Saturday") ? "Monday" : d;
}

function todayRange() {
  const start = new Date(); start.setHours(0,0,0,0);
  const end = new Date(); end.setHours(23,59,59,999);
  return { start, end };
}

function toMinutes(t) {
  const [h,m] = t.split(":"); 
  return Number(h)*60 + Number(m);
}

export const getFacultyAttendanceForDay = async (req, res) => {
  try {
    const facultyId = req.user._id.toString();
    const day = todayName();
    const { start, end } = todayRange();

    const tts = await ClassTimetable.find({ day });

    let className = null;
    let timetable = null;

    for (const tt of tts) {
      const teaches = tt.periods.some(
        p => p.faculty?.toString() === facultyId 
          || p.substituteFaculty?.toString() === facultyId
      );

      if (teaches) {
        className = tt.className;
        timetable = tt;
        break;
      }
    }

    if (!timetable) {
      return res.json({
        className: null,
        periods: [],
        message: "You are not teaching any class today."
      });
    }

    const allStudents = await User.find({
      role:"student",
      className
    }).select("name roll");

    const fullDay = [];

    for (const p of timetable.periods) {
      const rec = await Attendance.find({
        className,
        period: p.period,
        date: { $gte:start, $lte:end }
      }).populate("student","name roll");

      const present = rec.map(r => ({
        name: r.student?.name,
        roll: r.student?.roll
      }));

      const presentIds = new Set(rec.map(r => r.student?._id?.toString()));

      const absent = allStudents.filter(
        s => !presentIds.has(s._id.toString())
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
        absentStudents: absent
      });
    }

    res.json({
      className,
      periods: fullDay
    });

  } catch (err) {
    console.error("getFacultyAttendanceForDay ERROR:", err);
    res.status(500).json({ message:"Server error" });
  }
};

