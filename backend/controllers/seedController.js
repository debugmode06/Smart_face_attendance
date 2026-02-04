import User from "../models/User.js";
import StudentStats from "../models/StudentStats.js";
import ClassTimetable from "../models/ClassTimetable.js";

export const seedDatabase = async (req, res) => {
  try {
    console.log("🔥 Resetting database...");

    await User.deleteMany({});
    await StudentStats.deleteMany({});
    await ClassTimetable.deleteMany({});

    const CLASS = "CSE-A";

    // 1) ADMIN
    const admin = await User.create({
      name: "System Admin",
      email: "admin@test.com",
      password: "admin123",
      role: "admin",
      department: "CSE",
    });

    // 2) FACULTY (6)
    const facultyData = [
      { name: "Dr. Arjun Kumar", email: "f1@test.com", subject: "Maths" },
      { name: "Dr. Priya Sharma", email: "f2@test.com", subject: "Physics" },
      { name: "Dr. Vivek Rao", email: "f3@test.com", subject: "Chemistry" },
      { name: "Dr. Neha Singh", email: "f4@test.com", subject: "English" },
      { name: "Dr. Karan Patel", email: "f5@test.com", subject: "Programming" },
      { name: "Dr. Meera Iyer", email: "f6@test.com", subject: "Lab" },
    ];

    const faculty = await User.insertMany(
      facultyData.map((f) => ({
        ...f,
        password: "faculty123",
        role: "faculty",
        department: "CSE",
      }))
    );

    const facultyBySubject = {};
    faculty.forEach((f) => {
      facultyBySubject[f.subject] = f;
    });

    // 3) STUDENTS (5) — all in CSE-A
    const studentData = [
      { name: "Student One", email: "s1@test.com" },
      { name: "Student Two", email: "s2@test.com" },
      { name: "Student Three", email: "s3@test.com" },
      { name: "Student Four", email: "s4@test.com" },
      { name: "Student Five", email: "s5@test.com" },
    ];

    const students = await User.insertMany(
      studentData.map((s) => ({
        ...s,
        password: "student123",
        role: "student",
        className: CLASS,
        department: "CSE",
        year: 1,
      }))
    );

    await StudentStats.insertMany(
      students.map((s) => ({
        user: s._id,
        attendancePercent: 0,
        assignmentsPending: 0,
        upcomingExams: 0,
        announcements: [],
      }))
    );

    // 4) CLASS TIMETABLE (CSE-A, Mon–Sat, 6 periods)
    const timeSlots = [
      { period: 1, start: "09:00", end: "09:50" },
      { period: 2, start: "09:50", end: "10:40" },
      { period: 3, start: "10:50", end: "11:40" },
      { period: 4, start: "11:40", end: "12:30" },
      { period: 5, start: "13:30", end: "14:20" },
      { period: 6, start: "14:20", end: "15:10" },
    ];

    const dayPlan = {
      Monday:    ["Maths", "Physics", "Chemistry", "English", "Programming", "Lab"],
      Tuesday:   ["Physics", "Maths", "English", "Chemistry", "Programming", "Lab"],
      Wednesday: ["Chemistry", "Maths", "Physics", "English", "Programming", "Lab"],
      Thursday:  ["Maths", "Chemistry", "English", "Physics", "Programming", "Lab"],
      Friday:    ["Physics", "English", "Maths", "Chemistry", "Programming", "Lab"],
      Saturday:  ["English", "Maths", "Chemistry", "Physics", "Programming", "Lab"],
    };

    const classTimetables = [];

    Object.keys(dayPlan).forEach((day) => {
      const subjects = dayPlan[day];
      const periods = timeSlots.map((slot, idx) => {
        const subject = subjects[idx];
        const teacher = facultyBySubject[subject];

        return {
          period: slot.period,
          start: slot.start,
          end: slot.end,
          subject,
          faculty: teacher ? teacher._id : null,
          isFreePeriod: false,
          teacherAbsent: false,
          substituteFaculty: null,
        };
      });

      classTimetables.push({
        className: CLASS,
        day,
        periods,
      });
    });

    await ClassTimetable.insertMany(classTimetables);

    console.log("✅ Class-based timetable seeded.");

    return res.json({
      message: "Seeded: 1 admin, 6 faculty, 5 students, class timetable CSE-A",
      admin: { email: admin.email, password: "admin123" },
      faculty: faculty.map((f) => ({
        name: f.name,
        subject: f.subject,
        email: f.email,
        password: "faculty123",
      })),
      students: students.map((s) => ({
        name: s.name,
        email: s.email,
        password: "student123",
      })),
    });
  } catch (err) {
    console.error("❌ Seed error:", err);
    return res.status(500).json({ message: "Seed failed" });
  }
};
