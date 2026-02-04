// Verify timetable data exists
import "./config/loadEnv.js";
import { connectDB } from "./config/db.js";
import ClassTimetable from "./models/ClassTimetable.js";

async function verifyData() {
  try {
    await connectDB();
    console.log("\n📊 Checking ClassTimetable data...\n");

    const allTimetables = await ClassTimetable.find({ className: "CSE B" });
    
    console.log(`Found ${allTimetables.length} timetable documents for CSE B\n`);
    
    allTimetables.forEach((tt) => {
      console.log(`  ${tt.day}: ${tt.periods.length} periods`);
    });

    if (allTimetables.length > 0) {
      console.log("\n📋 Sample: Monday periods:");
      const monday = allTimetables.find(t => t.day === "Monday");
      if (monday) {
        monday.periods.forEach((p, idx) => {
          console.log(`    P${p.period}: ${p.subject} (${p.start}-${p.end}) - ${p.facultyName || 'TBA'}`);
        });
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

verifyData();
