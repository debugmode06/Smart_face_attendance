/**
 * ONE-TIME MIGRATION: Consolidate all class/section fields into classSection
 * 
 * This migration:
 * 1. Finds all students with className, class, section, or classSection fields
 * 2. Normalizes values to standard format: "DEPT SECTION" (e.g., "CSE B")
 * 3. Sets classSection as the canonical field
 * 4. Backs up old values before migrating
 * 5. Validates results
 * 
 * Run once: node backend/migrations/migrateStudentClassSection.js
 */

import mongoose from 'mongoose';
import '../config/loadEnv.js';

const MONGODB_URI = process.env.MONGODB_URI;

// Normalize class section value to standard format
function normalizeClassSection(value, department) {
  if (!value) return null;
  
  // Convert to string and trim
  let normalized = String(value).trim().toUpperCase();
  
  // Handle various formats:
  // "CSE-B" → "CSE B"
  // "cse b" → "CSE B"
  // "CSE_B" → "CSE B"
  // "CSEB" → "CSE B" (if department is known)
  normalized = normalized.replace(/[-_]/g, ' ');
  
  // Ensure single space between parts
  normalized = normalized.replace(/\s+/g, ' ');
  
  // If no space found and department is known, try to split
  if (!normalized.includes(' ') && department) {
    const dept = department.toUpperCase();
    if (normalized.startsWith(dept)) {
      const section = normalized.substring(dept.length).trim();
      if (section) {
        normalized = `${dept} ${section}`;
      }
    }
  }
  
  return normalized;
}

async function migrateStudents() {
  try {
    console.log('🚀 Starting Student classSection Migration');
    console.log('==========================================\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    const studentsCollection = db.collection('students');
    
    // Get all students
    const allStudents = await studentsCollection.find({}).toArray();
    console.log(`📊 Found ${allStudents.length} total students\n`);
    
    if (allStudents.length === 0) {
      console.log('⚠️  No students found in database. Nothing to migrate.');
      await mongoose.disconnect();
      return;
    }
    
    // Analyze current state
    let withClassSection = 0;
    let withClassName = 0;
    let withClass = 0;
    let withSection = 0;
    let withNone = 0;
    
    allStudents.forEach(student => {
      if (student.classSection) withClassSection++;
      if (student.className) withClassName++;
      if (student.class) withClass++;
      if (student.section) withSection++;
      if (!student.classSection && !student.className && !student.class && !student.section) {
        withNone++;
      }
    });
    
    console.log('📈 Current Field Usage:');
    console.log(`   classSection: ${withClassSection}`);
    console.log(`   className:    ${withClassName}`);
    console.log(`   class:        ${withClass}`);
    console.log(`   section:      ${withSection}`);
    console.log(`   none:         ${withNone}\n`);
    
    // Migration logic
    const updates = [];
    const migrationLog = [];
    
    for (const student of allStudents) {
      const oldData = {
        _id: student._id,
        classSection: student.classSection,
        className: student.className,
        class: student.class,
        section: student.section,
        department: student.department
      };
      
      // Determine source value (priority order)
      let sourceValue = student.classSection 
        || student.className 
        || student.class 
        || (student.section ? `${student.department} ${student.section}` : null);
      
      if (!sourceValue) {
        console.log(`⚠️  Student ${student.email} has no class information - SKIPPING`);
        migrationLog.push({
          email: student.email,
          status: 'SKIPPED',
          reason: 'No class information found'
        });
        continue;
      }
      
      // Normalize the value
      const normalizedClassSection = normalizeClassSection(sourceValue, student.department);
      
      if (!normalizedClassSection) {
        console.log(`⚠️  Could not normalize class for ${student.email} - SKIPPING`);
        migrationLog.push({
          email: student.email,
          status: 'SKIPPED',
          reason: 'Normalization failed',
          oldData
        });
        continue;
      }
      
      // Prepare update
      const update = {
        $set: {
          classSection: normalizedClassSection,
          // Backup old values for rollback
          _migration: {
            date: new Date(),
            oldClassSection: student.classSection,
            oldClassName: student.className,
            oldClass: student.class,
            oldSection: student.section
          }
        },
        $unset: {
          className: "",
          class: "",
          section: ""
        }
      };
      
      updates.push({
        filter: { _id: student._id },
        update: update
      });
      
      migrationLog.push({
        email: student.email,
        name: student.name,
        status: 'MIGRATED',
        from: sourceValue,
        to: normalizedClassSection,
        oldData
      });
      
      console.log(`✓ ${student.email}: "${sourceValue}" → "${normalizedClassSection}"`);
    }
    
    console.log(`\n📝 Prepared ${updates.length} updates`);
    
    // Execute migration
    if (updates.length > 0) {
      console.log('\n🔄 Executing migration...');
      
      for (const { filter, update } of updates) {
        await studentsCollection.updateOne(filter, update);
      }
      
      console.log('✅ Migration completed successfully!');
    }
    
    // Verify results
    console.log('\n🔍 Verifying migration...');
    const afterMigration = await studentsCollection.find({}).toArray();
    
    const withClassSectionAfter = afterMigration.filter(s => s.classSection).length;
    const withOldFieldsAfter = afterMigration.filter(s => s.className || s.class || s.section).length;
    
    console.log(`\n📊 After Migration:`);
    console.log(`   Students with classSection: ${withClassSectionAfter}`);
    console.log(`   Students with old fields:   ${withOldFieldsAfter}`);
    
    // Show distinct classSection values
    const distinctClasses = await studentsCollection.distinct('classSection');
    console.log(`\n📚 Distinct classSection values:`);
    distinctClasses.forEach(cls => {
      console.log(`   - "${cls}"`);
    });
    
    // Save migration log
    console.log('\n💾 Saving migration log...');
    const logsCollection = db.collection('migration_logs');
    await logsCollection.insertOne({
      migration: 'studentClassSection',
      date: new Date(),
      totalStudents: allStudents.length,
      migrated: updates.length,
      skipped: allStudents.length - updates.length,
      details: migrationLog
    });
    
    console.log('\n✅ MIGRATION COMPLETE!');
    console.log('==========================================');
    
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error);
    console.error(error.stack);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run migration
migrateStudents();
