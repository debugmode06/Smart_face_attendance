// Fix className mismatch
import "./config/loadEnv.js";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import AttendanceSession from "./models/AttendanceSession.js";

async function fixClassName() {
  try {
    await connectDB();
    
    console.log("\n🔧 FIXING className MISMATCH\n");
    
    // Option 1: Update students from "CSE-B" to "CSE B"
    console.log("Option 1: Updating students from 'CSE-B' to 'CSE B'...");
    const result1 = await User.updateMany(
      { role: "student", className: "CSE-B" },
      { $set: { className: "CSE B" } }
    );
    console.log(`✅ Updated ${result1.modifiedCount} students\n`);
    
    // Option 2: Update active session from "CSE B" to "CSE-B"
    console.log("Option 2: Updating active session from 'CSE B' to 'CSE-B'...");
    const result2 = await AttendanceSession.updateMany(
      { status: "active", className: "CSE B" },
      { $set: { className: "CSE-B" } }
    );
    console.log(`✅ Updated ${result2.modifiedCount} active sessions\n`);
    
    // Since we did Option 1, let's revert Option 2
    console.log("Reverting Option 2 to keep consistency...");
    await AttendanceSession.updateMany(
      { status: "active", className: "CSE-B" },
      { $set: { className: "CSE B" } }
    );
    
    // Now update the session to find students with new className
    console.log("\n📊 Updating session student list...");
    const session = await AttendanceSession.findOne({ status: "active" });
    if (session) {
      const students = await User.find({
        role: "student",
        className: session.className
      }).select("name registerNo");
      
      session.studentsMarked = students.map(student => ({
        studentId: student._id,
        studentName: student.name,
        registerNo: student.registerNo,
        status: "absent"
      }));
      session.totalStudents = students.length;
      session.absentCount = students.length;
      
      await session.save();
      console.log(`✅ Session now has ${students.length} students\n`);
    }
    
    // Verify fix
    console.log("\n✅ VERIFICATION:");
    const studentsAfter = await User.find({ role: "student" }).select("name className");
    const sessionsAfter = await AttendanceSession.find({ status: "active" }).select("className totalStudents");
    
    console.log("\nStudents:");
    studentsAfter.forEach(s => console.log(`  - ${s.name}: "${s.className}"`));
    
    console.log("\nActive Sessions:");
    sessionsAfter.forEach(s => console.log(`  - Class: "${s.className}", Students: ${s.totalStudents}`));
    
    console.log("\n🎉 Fix complete! Students should now see the session.");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

fixClassName();
