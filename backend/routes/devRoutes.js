import express from 'express';
import Student from '../models/Student.js';

const router = express.Router();

// Get all students with their class info (for debugging)
router.get('/students-debug', async (req, res) => {
  try {
    const students = await Student.find()
      .select('name email className department year')
      .limit(50);
    
    const totalCount = await Student.countDocuments();
    const classNames = await Student.distinct('className');
    const departments = await Student.distinct('department');
    
    res.json({
      success: true,
      totalStudents: totalCount,
      availableClasses: classNames,
      availableDepartments: departments,
      students: students.map(s => ({
        name: s.name,
        email: s.email,
        className: s.className,
        department: s.department,
        year: s.year
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update student className (for quick fixes)
router.post('/update-student-class', async (req, res) => {
  try {
    const { email, className } = req.body;
    
    if (!email || !className) {
      return res.status(400).json({
        success: false,
        message: 'email and className are required'
      });
    }
    
    const student = await Student.findOneAndUpdate(
      { email },
      { className },
      { new: true }
    );
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Student className updated',
      student: {
        name: student.name,
        email: student.email,
        className: student.className
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
