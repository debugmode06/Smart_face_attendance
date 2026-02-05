/**
 * ROLLBACK SCRIPT: Restore original class/section fields
 * 
 * Use this if migration causes issues
 * Run: node backend/migrations/rollbackStudentClassSection.js
 */

import mongoose from 'mongoose';
import '../config/loadEnv.js';

const MONGODB_URI = process.env.MONGODB_URI;

async function rollbackMigration() {
  try {
    console.log('🔄 Starting Rollback of classSection Migration');
    console.log('==============================================\n');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    const studentsCollection = db.collection('students');
    
    // Find all students with migration backup
    const studentsWithBackup = await studentsCollection.find({
      '_migration': { $exists: true }
    }).toArray();
    
    console.log(`📊 Found ${studentsWithBackup.length} students with backup data\n`);
    
    if (studentsWithBackup.length === 0) {
      console.log('⚠️  No students with backup data found. Nothing to rollback.');
      await mongoose.disconnect();
      return;
    }
    
    // Rollback each student
    for (const student of studentsWithBackup) {
      const backup = student._migration;
      
      const restore = {
        $unset: {
          _migration: "",
          classSection: ""
        }
      };
      
      // Restore old values if they existed
      if (backup.oldClassName) {
        restore.$set = restore.$set || {};
        restore.$set.className = backup.oldClassName;
      }
      if (backup.oldClass) {
        restore.$set = restore.$set || {};
        restore.$set.class = backup.oldClass;
      }
      if (backup.oldSection) {
        restore.$set = restore.$set || {};
        restore.$set.section = backup.oldSection;
      }
      if (backup.oldClassSection) {
        restore.$set = restore.$set || {};
        restore.$set.classSection = backup.oldClassSection;
      }
      
      await studentsCollection.updateOne(
        { _id: student._id },
        restore
      );
      
      console.log(`✓ Restored ${student.email}`);
    }
    
    console.log('\n✅ ROLLBACK COMPLETE!');
    console.log('==============================================');
    
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('\n❌ ROLLBACK FAILED:', error);
    console.error(error.stack);
    await mongoose.disconnect();
    process.exit(1);
  }
}

rollbackMigration();
