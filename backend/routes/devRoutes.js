import express from 'express';
import Student from '../models/Student.js';

const router = express.Router();

// Get all students with their class info (for debugging)
router.get('/students-debug', async (req, res) => {
  try {
    const students = await Student.find()
      .select('name email className department year')
      .limit(20);
    
    const totalCount = await Student.countDocuments();
    const classNames = await Student.distinct('className');
    
    res.json({
      success: true,
      totalStudents: totalCount,
      availableClasses: classNames,
      sampleStudents: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
