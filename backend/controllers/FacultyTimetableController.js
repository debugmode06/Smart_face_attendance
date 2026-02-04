// backend/controllers/FacultyTimetableController.js
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

// 1) Get today's classes for this faculty
export const getFacultyTodayTimetable = async (req, res) => {
  try {
    const facultyId = req.user._id.toString();

    // ⭐ FIX: Force Monday on weekend
    let todayName = DAYS[new Date().getDay()];
    if (todayName === "Saturday" || todayName === "Sunday") {
      todayName = "Monday";
    }

    const timetables = await ClassTimetable.find({ day: todayName });

    const classes = [];

    timetables.forEach((tt) => {
      tt.periods.forEach((p) => {
        const isMain = p.faculty && p.faculty.toString() === facultyId;
        const isSub =
          p.substituteFaculty && p.substituteFaculty.toString() === facultyId;

        if (isMain || isSub) {
          classes.push({
            className: tt.className,
            day: tt.day,
            period: p.period,
            subject: p.subject,
            start: p.start,
            end: p.end,
            isFreePeriod: p.isFreePeriod,
            teacherAbsent: p.teacherAbsent,
            isSubstitution: isSub,
          });
        }
      });
    });

    return res.json({ classes });
  } catch (err) {
    console.error("Faculty Timetable Error:", err);
    return res.status(500).json({ message: "Error loading faculty timetable" });
  }
};

// 2) Mark a period absent for this faculty
export const markFacultyPeriodAbsent = async (req, res) => {
  try {
    const facultyId = req.user._id.toString();
    const { period, day } = req.body;

    if (!period) {
      return res.status(400).json({ message: "Period number is required" });
    }

    // ⭐ FIX: use Monday on weekend
    let todayName = day || DAYS[new Date().getDay()];
    if (todayName === "Saturday" || todayName === "Sunday") {
      todayName = "Monday";
    }

    const result = await ClassTimetable.updateMany(
      {
        day: todayName,
        "periods.period": period,
        "periods.faculty": facultyId,
      },
      {
        $set: {
          "periods.$.isFreePeriod": true,
          "periods.$.teacherAbsent": true,
          "periods.$.substituteFaculty": null,
        },
      }
    );

    return res.json({
      message: "Period marked as free due to faculty absence",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("Mark period absent error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// 3) Get today's free periods
export const getTodayFreePeriods = async (req, res) => {
  try {
    // ⭐ FIX: use Monday on weekend
    let todayName = DAYS[new Date().getDay()];
    if (todayName === "Saturday" || todayName === "Sunday") {
      todayName = "Monday";
    }

    const anyTimetable = await ClassTimetable.findOne({ day: todayName });

    if (!anyTimetable) {
      return res.json({ freePeriods: [] });
    }

    const freePeriods = anyTimetable.periods
      .filter((p) => p.isFreePeriod)
      .map((p) => ({
        period: p.period,
        subject: p.subject,
        start: p.start,
        end: p.end,
      }));

    return res.json({ freePeriods });
  } catch (err) {
    console.error("Get free periods error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// 4) Faculty claims a free period
export const claimFreePeriod = async (req, res) => {
  try {
    const facultyId = req.user._id.toString();
    const { period, day } = req.body;

    if (!period) {
      return res.status(400).json({ message: "Period number is required" });
    }

    // ⭐ FIX: use Monday on weekend
    let todayName = day || DAYS[new Date().getDay()];
    if (todayName === "Saturday" || todayName === "Sunday") {
      todayName = "Monday";
    }

    const result = await ClassTimetable.updateMany(
      {
        day: todayName,
        "periods.period": period,
        "periods.isFreePeriod": true,
        "periods.substituteFaculty": null,
      },
      {
        $set: {
          "periods.$[p].substituteFaculty": facultyId,
          "periods.$[p].isFreePeriod": false,
        },
      },
      {
        arrayFilters: [{ "p.period": period }],
      }
    );

    return res.json({
      message: "You have been assigned to this free period",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("Claim free period error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
// 5) Get FULL WEEK timetable for this faculty
export const getFacultyWeeklyTimetable = async (req, res) => {
  try {
    const facultyId = req.user._id.toString();

    const DAYS = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    // Prepare weekly structure
    const weekly = {};
    DAYS.forEach((day) => {
      weekly[day] = Array(8).fill(null); // 8 periods for UI
    });

    // Fetch all classes where this faculty is main or substitute
    const tables = await ClassTimetable.find({
      $or: [
        { "periods.faculty": facultyId },
        { "periods.substituteFaculty": facultyId }
      ]
    });

    // Fill weekly structure
    tables.forEach((entry) => {
      const day = entry.day;

      entry.periods.forEach((p) => {
        const isTeaching =
          p.faculty?.toString() === facultyId ||
          p.substituteFaculty?.toString() === facultyId;

        if (isTeaching) {
          const idx = p.period - 1;

          weekly[day][idx] = {
            className: entry.className,
            period: p.period,
            subject: p.subject,
            start: p.start,
            end: p.end,
            teacherAbsent: p.teacherAbsent,
            isSubstitution: !!p.substituteFaculty,
          };
        }
      });
    });

    return res.json({ weekly });

  } catch (err) {
    console.error("Weekly timetable error:", err);
    return res.status(500).json({ message: "Error loading weekly timetable" });
  }
};
