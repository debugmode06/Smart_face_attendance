// Seed ClassTimetable with CSE subjects from timetable image
import "./config/loadEnv.js";
import { connectDB } from "./config/db.js";
import ClassTimetable from "./models/ClassTimetable.js";
import User from "./models/User.js";

async function seedClassTimetable() {
  try {
    await connectDB();
    console.log("\n🌱 Seeding ClassTimetable...\n");

    // Find faculty by name
    const faculty = {
      vijayalakshmi: await User.findOne({ name: /Vijayalakshmi/i }),
      ganesan: await User.findOne({ name: /Ganesan/i }),
      jameer: await User.findOne({ name: /Jameer/i }),
      suresh: await User.findOne({ name: /Suresh/i }),
      ramasamy: await User.findOne({ name: /Ramasamy/i }),
      bhuvanesh: await User.findOne({ name: /Bhuvanesh/i }),
      umarani: await User.findOne({ name: /Uma.*Rani/i }),
      suganthi: await User.findOne({ name: /Suganthi/i }),
      sathish: await User.findOne({ name: /Sathish/i }),
      banupriya: await User.findOne({ name: /Banupriya/i }),
    };

    console.log("Found faculty:");
    Object.entries(faculty).forEach(([key, value]) => {
      console.log(`  ${key}: ${value ? value.name : '❌ NOT FOUND'}`);
    });

    // Clear existing timetable for CSE B
    await ClassTimetable.deleteMany({ className: "CSE B" });
    console.log("\n✅ Cleared existing CSE B timetable\n");

    // Monday Schedule (7 periods) - From actual timetable image
    const mondayPeriods = [
      {
        period: 1,
        subjectCode: "24IT404",
        subject: "Database Management Systems",
        start: "09:15",
        end: "10:05",
        faculty: faculty.ganesan?._id,
        facultyName: "Mr.A.Ganesan,AP/CSE",
        isFreePeriod: false,
      },
      {
        period: 2,
        subjectCode: "24CS404",
        subject: "Operating Systems",
        start: "10:05",
        end: "10:55",
        faculty: faculty.ramasamy?._id,
        facultyName: "Dr.S.Ramasamy,ASP/CSE",
        isFreePeriod: false,
      },
      {
        period: 3,
        subjectCode: "24CS403",
        subject: "Analysis of Algorithms",
        start: "11:15",
        end: "12:05",
        faculty: faculty.jameer?._id,
        facultyName: "Dr.A.Jameer Basha, Prof & Head",
        isFreePeriod: false,
      },
      {
        period: 4,
        subjectCode: "24MA207",
        subject: "Probability and Queuing Theory",
        start: "12:05",
        end: "12:55",
        faculty: faculty.vijayalakshmi?._id,
        facultyName: "Dr.V.Vijayalakshmi,AP/CSE",
        isFreePeriod: false,
      },
      {
        period: 5,
        subjectCode: "24MC806",
        subject: "Environmental Sciences and Sustainability",
        start: "14:00",
        end: "14:50",
        faculty: faculty.umarani?._id,
        facultyName: "Ms.Uma Rani AP/S&H",
        isFreePeriod: false,
      },
      {
        period: 6,
        subjectCode: "24AD402",
        subject: "Foundation of Data science",
        start: "14:50",
        end: "15:40",
        faculty: faculty.suresh?._id,
        facultyName: "Mr.Suresh Kumar AP/CSE",
        isFreePeriod: false,
      },
      {
        period: 7,
        subjectCode: "TWM",
        subject: "Tutor ward meeting",
        start: "15:40",
        end: "16:30",
        faculty: faculty.suganthi?._id,
        facultyName: "Ms.D.Suganthi, AP/CSE",
        isFreePeriod: false,
      },
    ];

    // Tuesday Schedule (7 periods) - From actual timetable image
    const tuesdayPeriods = [
      {
        period: 1,
        subjectCode: "24CS403",
        subject: "Analysis of Algorithms",
        start: "09:15",
        end: "10:05",
        faculty: faculty.jameer?._id,
        facultyName: "Dr.A.Jameer Basha, Prof & Head",
        isFreePeriod: false,
      },
      {
        period: 2,
        subjectCode: "24AD402",
        subject: "Foundation of Data science",
        start: "10:05",
        end: "10:55",
        faculty: faculty.suresh?._id,
        facultyName: "Mr.Suresh Kumar AP/CSE",
        isFreePeriod: false,
      },
      {
        period: 3,
        subjectCode: "24CS405",
        subject: "Web Programming - II",
        start: "11:15",
        end: "12:05",
        faculty: faculty.sathish?._id,
        facultyName: "Mr.S.Sathish Kumar,AP/CSE",
        isFreePeriod: false,
      },
      {
        period: 4,
        subjectCode: "24CS405",
        subject: "Web Programming - II (continued)",
        start: "12:05",
        end: "12:55",
        faculty: faculty.sathish?._id,
        facultyName: "Mr.S.Sathish Kumar,AP/CSE",
        isFreePeriod: false,
      },
      {
        period: 5,
        subjectCode: "24TP704",
        subject: "Soft Skills and Aptitude - IV",
        start: "14:00",
        end: "14:50",
        faculty: faculty.bhuvanesh?._id,
        facultyName: "Mr.M.Bhuvanesh/Placement",
        isFreePeriod: false,
      },
      {
        period: 6,
        subjectCode: "24TP704",
        subject: "Soft Skills and Aptitude - IV (continued)",
        start: "14:50",
        end: "15:40",
        faculty: faculty.bhuvanesh?._id,
        facultyName: "Mr.M.Bhuvanesh/Placement",
        isFreePeriod: false,
      },
      {
        period: 7,
        subjectCode: "24MA207",
        subject: "Probability and Queuing Theory",
        start: "15:40",
        end: "16:30",
        faculty: faculty.vijayalakshmi?._id,
        facultyName: "Dr.V.Vijayalakshmi,AP/CSE",
        isFreePeriod: false,
      },
    ];

    // Wednesday (7 periods) - From actual timetable image
    const wednesdayPeriods = [
      {
        period: 1,
        subjectCode: "24MA207",
        subject: "Probability and Queuing Theory",
        start: "09:15",
        end: "10:05",
        faculty: faculty.vijayalakshmi?._id,
        facultyName: "Dr.V.Vijayalakshmi,AP/CSE",
        isFreePeriod: false,
      },
      {
        period: 2,
        subjectCode: "24CS403",
        subject: "Analysis of Algorithms",
        start: "10:05",
        end: "10:55",
        faculty: faculty.jameer?._id,
        facultyName: "Dr.A.Jameer Basha, Prof & Head",
        isFreePeriod: false,
      },
      {
        period: 3,
        subjectCode: "24TP704",
        subject: "Soft Skills and Aptitude - IV",
        start: "11:15",
        end: "12:05",
        faculty: faculty.bhuvanesh?._id,
        facultyName: "Mr.M.Bhuvanesh/Placement",
        isFreePeriod: false,
      },
      {
        period: 4,
        subjectCode: "24TP704",
        subject: "Soft Skills and Aptitude - IV (continued)",
        start: "12:05",
        end: "12:55",
        faculty: faculty.bhuvanesh?._id,
        facultyName: "Mr.M.Bhuvanesh/Placement",
        isFreePeriod: false,
      },
      {
        period: 5,
        subjectCode: "LIB",
        subject: "Library",
        start: "14:00",
        end: "14:50",
        faculty: faculty.suganthi?._id,
        facultyName: "Ms.D.Suganthi, AP/CSE",
        isFreePeriod: false,
      },
      {
        period: 6,
        subjectCode: "24CS404",
        subject: "Operating Systems",
        start: "14:50",
        end: "15:40",
        faculty: faculty.ramasamy?._id,
        facultyName: "Dr.S.Ramasamy,ASP/CSE",
        isFreePeriod: false,
      },
      {
        period: 7,
        subjectCode: "24CS404",
        subject: "Operating Systems (continued)",
        start: "15:40",
        end: "16:30",
        faculty: faculty.ramasamy?._id,
        facultyName: "Dr.S.Ramasamy,ASP/CSE",
        isFreePeriod: false,
      },
    ];

    // Thursday (7 periods) - From actual timetable image
    const thursdayPeriods = [
      {
        period: 1,
        subjectCode: "24CS404",
        subject: "Operating Systems",
        start: "09:15",
        end: "10:05",
        faculty: faculty.ramasamy?._id,
        facultyName: "Dr.S.Ramasamy,ASP/CSE",
        isFreePeriod: false,
      },
      {
        period: 2,
        subjectCode: "24AD402",
        subject: "Foundation of Data science",
        start: "10:05",
        end: "10:55",
        faculty: faculty.suresh?._id,
        facultyName: "Mr.Suresh Kumar AP/CSE",
        isFreePeriod: false,
      },
      {
        period: 3,
        subjectCode: "24CS701",
        subject: "Operating Systems Laboratory",
        start: "11:15",
        end: "12:05",
        faculty: faculty.ramasamy?._id,
        facultyName: "Dr.S.Ramasamy,ASP/CSE",
        isFreePeriod: false,
      },
      {
        period: 4,
        subjectCode: "24CS701",
        subject: "Operating Systems Laboratory (continued)",
        start: "12:05",
        end: "12:55",
        faculty: faculty.ramasamy?._id,
        facultyName: "Dr.S.Ramasamy,ASP/CSE",
        isFreePeriod: false,
      },
      {
        period: 5,
        subjectCode: "24IT404",
        subject: "Database Management Systems",
        start: "14:00",
        end: "14:50",
        faculty: faculty.ganesan?._id,
        facultyName: "Mr.A.Ganesan,AP/CSE",
        isFreePeriod: false,
      },
      {
        period: 6,
        subjectCode: "24CS403",
        subject: "Analysis of Algorithms",
        start: "14:50",
        end: "15:40",
        faculty: faculty.jameer?._id,
        facultyName: "Dr.A.Jameer Basha, Prof & Head",
        isFreePeriod: false,
      },
      {
        period: 7,
        subjectCode: "24AD402",
        subject: "Foundation of Data science",
        start: "15:40",
        end: "16:30",
        faculty: faculty.suresh?._id,
        facultyName: "Mr.Suresh Kumar AP/CSE",
        isFreePeriod: false,
      },
    ];

    // Friday (7 periods) - From actual timetable image
    const fridayPeriods = [
      {
        period: 1,
        subjectCode: "24IT406",
        subject: "Database Management System Laboratory",
        start: "09:15",
        end: "10:05",
        faculty: faculty.ganesan?._id,
        facultyName: "Mr.A.Ganesan,AP/CSE",
        isFreePeriod: false,
      },
      {
        period: 2,
        subjectCode: "24IT406",
        subject: "Database Management System Laboratory (continued)",
        start: "10:05",
        end: "10:55",
        faculty: faculty.ganesan?._id,
        facultyName: "Mr.A.Ganesan,AP/CSE",
        isFreePeriod: false,
      },
      {
        period: 3,
        subjectCode: "24MA207",
        subject: "Probability and Queuing Theory",
        start: "11:15",
        end: "12:05",
        faculty: faculty.vijayalakshmi?._id,
        facultyName: "Dr.V.Vijayalakshmi,AP/CSE",
        isFreePeriod: false,
      },
      {
        period: 4,
        subjectCode: "24IT404",
        subject: "Database Management Systems",
        start: "12:05",
        end: "12:55",
        faculty: faculty.ganesan?._id,
        facultyName: "Mr.A.Ganesan,AP/CSE",
        isFreePeriod: false,
      },
      {
        period: 5,
        subjectCode: "24CS404",
        subject: "Operating Systems",
        start: "14:00",
        end: "14:50",
        faculty: faculty.ramasamy?._id,
        facultyName: "Dr.S.Ramasamy,ASP/CSE",
        isFreePeriod: false,
      },
      {
        period: 6,
        subjectCode: "24AD402",
        subject: "Foundation of Data science",
        start: "14:50",
        end: "15:40",
        faculty: faculty.suresh?._id,
        facultyName: "Mr.Suresh Kumar AP/CSE",
        isFreePeriod: false,
      },
      {
        period: 7,
        subjectCode: "SEM",
        subject: "SEMINAR",
        start: "15:40",
        end: "16:30",
        faculty: faculty.banupriya?._id,
        facultyName: "Ms.Banupriya.M, AP/CSE",
        isFreePeriod: false,
      },
    ];

    // Saturday (7 periods) - From actual timetable image
    const saturdayPeriods = [
      {
        period: 1,
        subjectCode: "24CS701",
        subject: "Operating Systems Laboratory",
        start: "09:15",
        end: "10:05",
        faculty: faculty.ramasamy?._id,
        facultyName: "Dr.S.Ramasamy,ASP/CSE",
        isFreePeriod: false,
      },
      {
        period: 2,
        subjectCode: "24CS701",
        subject: "Operating Systems Laboratory (continued)",
        start: "10:05",
        end: "10:55",
        faculty: faculty.ramasamy?._id,
        facultyName: "Dr.S.Ramasamy,ASP/CSE",
        isFreePeriod: false,
      },
      {
        period: 3,
        subjectCode: "24IT404",
        subject: "Database Management Systems",
        start: "11:15",
        end: "12:05",
        faculty: faculty.ganesan?._id,
        facultyName: "Mr.A.Ganesan,AP/CSE",
        isFreePeriod: false,
      },
      {
        period: 4,
        subjectCode: "24MA207",
        subject: "Probability and Queuing Theory",
        start: "12:05",
        end: "12:55",
        faculty: faculty.vijayalakshmi?._id,
        facultyName: "Dr.V.Vijayalakshmi,AP/CSE",
        isFreePeriod: false,
      },
      {
        period: 5,
        subjectCode: "24CS403",
        subject: "Analysis of Algorithms",
        start: "14:00",
        end: "14:50",
        faculty: faculty.jameer?._id,
        facultyName: "Dr.A.Jameer Basha, Prof & Head",
        isFreePeriod: false,
      },
      {
        period: 6,
        subjectCode: "24MC806",
        subject: "Environmental Sciences and Sustainability",
        start: "14:50",
        end: "15:40",
        faculty: faculty.umarani?._id,
        facultyName: "Ms.Uma Rani AP/S&H",
        isFreePeriod: false,
      },
      {
        period: 7,
        subjectCode: "24CS404",
        subject: "Operating Systems",
        start: "15:40",
        end: "16:30",
        faculty: faculty.ramasamy?._id,
        facultyName: "Dr.S.Ramasamy,ASP/CSE",
        isFreePeriod: false,
      },
    ];

    // Create timetable documents
    const timetables = [
      { className: "CSE B", day: "Monday", periods: mondayPeriods },
      { className: "CSE B", day: "Tuesday", periods: tuesdayPeriods },
      { className: "CSE B", day: "Wednesday", periods: wednesdayPeriods },
      { className: "CSE B", day: "Thursday", periods: thursdayPeriods },
      { className: "CSE B", day: "Friday", periods: fridayPeriods },
      { className: "CSE B", day: "Saturday", periods: saturdayPeriods },
    ];

    await ClassTimetable.insertMany(timetables);

    console.log("✅ Successfully seeded ClassTimetable for CSE B!\n");
    console.log("📅 Created timetables for:");
    console.log("   - Monday (7 periods)");
    console.log("   - Tuesday (7 periods)");
    console.log("   - Wednesday (7 periods)");
    console.log("   - Thursday (7 periods)");
    console.log("   - Friday (7 periods)");
    console.log("   - Saturday (7 periods)");
    console.log("\n✨ Done! Your schedule page should now show classes.\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding timetable:", error);
    process.exit(1);
  }
}

seedClassTimetable();
