// backend/controllers/adminTimetableController.js
import ClassTimetable from "../models/ClassTimetable.js";
import User from "../models/User.js";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const DEFAULT_PERIODS = [
  { period: 1, start: "09:00", end: "09:50" },
  { period: 2, start: "09:50", end: "10:40" },
  { period: 3, start: "10:50", end: "11:40" },
  { period: 4, start: "11:40", end: "12:30" },
  { period: 5, start: "13:30", end: "14:20" },
  { period: 6, start: "14:20", end: "15:10" },
];

// 🔹 Dropdown meta: faculty + subjects
export const getTimetableMeta = async (req, res) => {
  try {
    const faculty = await User.find({ role: "faculty" }).select("name subject _id");

    const subjects = [
      ...new Set(
        faculty
          .map((f) => f.subject)
          .filter(Boolean)
      ),
    ];

    res.json({ faculty, subjects });
  } catch (err) {
    console.error("Timetable meta error:", err);
    res.status(500).json({ message: "Failed to load timetable meta" });
  }
};

// 🔹 Get full weekly timetable for a class (all days)
export const getClassTimetable = async (req, res) => {
  try {
    const { className } = req.params;

    if (!className) {
      return res.status(400).json({ message: "className is required" });
    }

    const docs = await ClassTimetable.find({ className }).lean();

    const dayMap = {};
    docs.forEach((d) => {
      dayMap[d.day] = d.periods || [];
    });

    const days = DAYS.map((day) => {
      const existing = dayMap[day];

      if (existing && existing.length > 0) {
        return { day, periods: existing };
      }

      // No timetable yet for this day → default skeleton
      return {
        day,
        periods: DEFAULT_PERIODS.map((p) => ({
          ...p,
          subject: "",
          faculty: null,
          isFreePeriod: true,
          teacherAbsent: false,
          substituteFaculty: null,
        })),
      };
    });

    res.json({ className, days });
  } catch (err) {
    console.error("Get class timetable error:", err);
    res.status(500).json({ message: "Failed to load timetable" });
  }
};

// 🔹 Save weekly timetable for a class (with conflict detection)
export const saveClassTimetable = async (req, res) => {
  try {
    const { className, days } = req.body;

    if (!className || !Array.isArray(days)) {
      return res
        .status(400)
        .json({ message: "className and days[] are required" });
    }

    // Load all other class timetables for conflict detection
    const existing = await ClassTimetable.find({
      className: { $ne: className },
      day: { $in: days.map((d) => d.day) },
    }).lean();

    const occupied = {}; // key = day|period|facultyId → array of other classes

    existing.forEach((doc) => {
      (doc.periods || []).forEach((p) => {
        if (!p.faculty || p.isFreePeriod || p.teacherAbsent) return;
        const key = `${doc.day}|${p.period}|${p.faculty.toString()}`;
        if (!occupied[key]) occupied[key] = [];
        occupied[key].push(doc.className);
      });
    });

    const conflicts = [];

    for (const dayEntry of days) {
      for (const p of dayEntry.periods || []) {
        if (!p.faculty || p.isFreePeriod || p.teacherAbsent) continue;

        const key = `${dayEntry.day}|${p.period}|${p.faculty.toString()}`;
        if (occupied[key] && occupied[key].length > 0) {
          conflicts.push({
            day: dayEntry.day,
            period: p.period,
            faculty: p.faculty,
            otherClasses: occupied[key],
          });
        }
      }
    }

    if (conflicts.length > 0) {
      return res.status(400).json({
        message: "Timetable conflicts detected",
        conflicts,
      });
    }

    // No conflicts → upsert per day
    for (const dayEntry of days) {
      await ClassTimetable.findOneAndUpdate(
        { className, day: dayEntry.day },
        {
          className,
          day: dayEntry.day,
          periods: dayEntry.periods || [],
        },
        { upsert: true, new: true }
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Save class timetable error:", err);
    res.status(500).json({ message: "Failed to save timetable" });
  }
};

// 🔹 Duplicate timetable from one class to another
export const duplicateTimetable = async (req, res) => {
  try {
    const { fromClassName, toClassName } = req.body;

    if (!fromClassName || !toClassName) {
      return res
        .status(400)
        .json({ message: "fromClassName and toClassName are required" });
    }

    if (fromClassName === toClassName) {
      return res
        .status(400)
        .json({ message: "Source and target class cannot be same" });
    }

    const sourceDocs = await ClassTimetable.find({
      className: fromClassName,
    }).lean();

    if (!sourceDocs.length) {
      return res.status(404).json({ message: "No timetable for source class" });
    }

    // Remove existing target timetables
    await ClassTimetable.deleteMany({ className: toClassName });

    // Clone
    const clones = sourceDocs.map((doc) => ({
      className: toClassName,
      day: doc.day,
      periods: doc.periods || [],
    }));

    await ClassTimetable.insertMany(clones);

    res.json({ success: true });
  } catch (err) {
    console.error("Duplicate timetable error:", err);
    res.status(500).json({ message: "Failed to duplicate timetable" });
  }
};
