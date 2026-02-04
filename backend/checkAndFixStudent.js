// Check and fix student className
import "./config/loadEnv.js";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";

async function checkAndFixStudent() {
  try {
    await connectDB();
    console.log("\n🔍 Checking student Mohan...\n");

    const student = await User.findOne({ name: "Mohan", role: "student" });
    
    if (!student) {
      console.log("❌ Student Mohan not found!");
      process.exit(1);
    }

    console.log("Student found:");
    console.log(`  Name: ${student.name}`);
    console.log(`  Email: ${student.email}`);
    console.log(`  ClassName: ${student.className || "❌ NOT SET"}`);

    if (!student.className) {
      console.log("\n🔧 Fixing: Setting className to 'CSE B'...");
      student.className = "CSE B";
      await student.save();
      console.log("✅ Updated! className is now: CSE B\n");
    } else {
      console.log("✅ className is already set!\n");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkAndFixStudent();


