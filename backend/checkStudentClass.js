// Quick script to check student className and active sessions
import "./config/loadEnv.js";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import AttendanceSession from "./models/AttendanceSession.js";

async function checkData() {
  try {
    await connectDB();
    
    console.log("\n=== CHECKING STUDENTS ===");
    const students = await User.find({ role: "student" }).select("name email className");
    console.log(`Found ${students.length} students:\n`);
    students.forEach((s, i) => {
      console.log(`${i + 1}. Name: ${s.name}`);
      console.log(`   Email: ${s.email}`);
      console.log(`   ClassName: "${s.className}" ${!s.className ? "⚠️ NOT SET!" : ""}`);
      console.log();
    });
    
    console.log("\n=== CHECKING ACTIVE SESSIONS ===");
    const sessions = await AttendanceSession.find({ status: "active" });
    console.log(`Found ${sessions.length} active sessions:\n`);
    sessions.forEach((s, i) => {
      console.log(`${i + 1}. Class: "${s.className}"`);
      console.log(`   Subject: ${s.subject}`);
      console.log(`   Period: ${s.period}`);
      console.log(`   Faculty: ${s.facultyName}`);
      console.log(`   Students in session: ${s.totalStudents}`);
      console.log(`   Expires: ${s.expiresAt}`);
      console.log();
    });
    
    // Check for className mismatches
    console.log("\n=== CHECKING FOR MISMATCHES ===");
    const uniqueStudentClasses = [...new Set(students.map(s => s.className).filter(Boolean))];
    const uniqueSessionClasses = [...new Set(sessions.map(s => s.className))];
    
    console.log("Student classes in DB:", uniqueStudentClasses);
    console.log("Session classes:", uniqueSessionClasses);
    
    const mismatches = uniqueSessionClasses.filter(sc => !uniqueStudentClasses.includes(sc));
    if (mismatches.length > 0) {
      console.log("\n⚠️ MISMATCH FOUND!");
      console.log("These session classes don't match any student classes:", mismatches);
      console.log("\nSuggested fixes:");
      mismatches.forEach(sc => {
        const similar = uniqueStudentClasses.find(stc => 
          stc.toLowerCase().replace(/[^a-z0-9]/g, '') === 
          sc.toLowerCase().replace(/[^a-z0-9]/g, '')
        );
        if (similar) {
          console.log(`- Change session "${sc}" to "${similar}" OR update students from "${similar}" to "${sc}"`);
        }
      });
    } else {
      console.log("✅ All classes match!");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkData();

