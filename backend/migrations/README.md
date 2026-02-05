# Student classSection Migration Guide

## 🎯 Purpose
Permanently fix class-based queries by consolidating all class/section fields into a single canonical field: `classSection`.

---

## 📋 Pre-Migration Checklist

1. **Backup Database**
   ```bash
   mongodump --uri="YOUR_MONGODB_URI" --out=./backup-$(date +%Y%m%d)
   ```

2. **Check Current State**
   ```bash
   # In MongoDB shell:
   db.students.find({}, {name: 1, email: 1, className: 1, class: 1, section: 1, classSection: 1, department: 1})
   ```

3. **Count Students**
   ```bash
   db.students.countDocuments()
   ```

---

## 🚀 Migration Steps

### Step 1: Run Migration Script
```bash
cd backend
node migrations/migrateStudentClassSection.js
```

**Expected Output:**
```
🚀 Starting Student classSection Migration
==========================================

✅ Connected to MongoDB

📊 Found 50 total students

📈 Current Field Usage:
   classSection: 0
   className:    50
   class:        0
   section:      0
   none:         0

✓ student1@hit.edu.in: "CSE-B" → "CSE B"
✓ student2@hit.edu.in: "IT A" → "IT A"
...

📝 Prepared 50 updates

🔄 Executing migration...
✅ Migration completed successfully!

🔍 Verifying migration...

📊 After Migration:
   Students with classSection: 50
   Students with old fields:   0

📚 Distinct classSection values:
   - "CSE A"
   - "CSE B"
   - "CSE C"
   - "IT A"
   - "IT B"

💾 Saving migration log...

✅ MIGRATION COMPLETE!
==========================================
```

### Step 2: Verify Results
```bash
# Check MongoDB
db.students.distinct('classSection')

# Should return: ["CSE A", "CSE B", "CSE C", "IT A", "IT B", ...]
```

### Step 3: Deploy Code
```bash
git add .
git commit -m "Migrate to classSection canonical field"
git push
```

### Step 4: Test API
```bash
# Test endpoint
curl -X GET https://your-backend.onrender.com/api/dev/students-debug

# Test messaging
curl -X POST https://your-backend.onrender.com/api/notifications/broadcast-to-class \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "classSection": "CSE B",
    "title": "Test",
    "message": "Testing after migration"
  }'
```

---

## 🔙 Rollback (If Needed)

If something goes wrong:

```bash
node migrations/rollbackStudentClassSection.js
```

This will restore all original field values from the backup stored in `_migration` field.

---

## 📊 What Changed

### Before Migration
```javascript
// Multiple inconsistent fields
{
  className: "CSE-B",    // Some students
  class: "CSE",          // Other students  
  section: "B",          // Other students
  classSection: null     // Most students
}
```

### After Migration
```javascript
// Single canonical field
{
  classSection: "CSE B", // ALL students
  department: "CSE",     // Unchanged
  year: 2                // Unchanged
  // className, class, section: REMOVED
}
```

---

## ✅ Post-Migration Benefits

1. **Single Query**: `Student.find({ classSection: "CSE B" })`
2. **No Fallbacks**: No more $or queries or multiple tries
3. **Schema Validation**: Rejects invalid formats
4. **Auto-Normalization**: Pre-save hook ensures consistency
5. **Fast Queries**: Indexed for performance
6. **Future-Proof**: All features use same field

---

## 🧪 Testing Checklist

After migration, test these features:

- [ ] Faculty broadcast messaging
- [ ] Attendance notifications
- [ ] Dashboard student counts
- [ ] Class-based reports
- [ ] Student profile display
- [ ] Admin student management

---

## 🔧 Troubleshooting

### Issue: "Validation failed: classSection is required"
**Solution**: Run migration script. All students need classSection field.

### Issue: "No students found in classSection 'CSE B'"
**Solution**: Check exact format in database:
```bash
db.students.distinct('classSection')
```
Match frontend dropdown exactly.

### Issue: Migration fails midway
**Solution**: Run rollback, fix issue, run migration again:
```bash
node migrations/rollbackStudentClassSection.js
# Fix issue
node migrations/migrateStudentClassSection.js
```

---

## 📝 Migration Log

Check `migration_logs` collection for details:
```javascript
db.migration_logs.find({ migration: 'studentClassSection' })
```

Contains:
- Total students migrated
- Skipped students
- Detailed transformation log
- Original values (for rollback)
