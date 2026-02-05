import Notification from '../models/Notification.js';
import Student from '../models/Student.js';

// Create notification(s)
export const createNotification = async (req, res) => {
  try {
    const { userIds, userId, role, title, message, type, refId } = req.body;

    // Support both single and bulk creation
    if (userIds && Array.isArray(userIds)) {
      // Bulk create for multiple users
      const notifications = await Notification.createForUsers(userIds, {
        role,
        title,
        message,
        type,
        refId
      });

      return res.status(201).json({
        success: true,
        message: `${notifications.length} notifications created`,
        count: notifications.length
      });
    } else if (userId) {
      // Single notification
      const notification = new Notification({
        userId,
        role,
        title,
        message,
        type,
        refId
      });

      await notification.save();

      return res.status(201).json({
        success: true,
        message: 'Notification created',
        notification
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either userId or userIds array is required'
      });
    }
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message
    });
  }
};

// Get all notifications for a user
export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const total = await Notification.countDocuments({ userId });

    res.status(200).json({
      success: true,
      notifications,
      total,
      hasMore: total > parseInt(skip) + notifications.length
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// Get unread notification count
export const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;

    const count = await Notification.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markAsRead();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await Notification.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all as read',
      error: error.message
    });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndDelete(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

// Helper: Create attendance notification for students
export const createAttendanceNotification = async (classSection, attendanceId, subject, facultyName) => {
  try {
    // Get all students in the class
    const students = await Student.find({ 
      classSection: classSection 
    }).select('_id');

    if (students.length === 0) {
      console.log('No students found for class:', classSection);
      return;
    }

    const userIds = students.map(student => student._id.toString());

    const notificationData = {
      role: 'student',
      title: '📝 New Attendance Session',
      message: `${facultyName} started attendance for ${subject} (${classSection})`,
      type: 'attendance',
      refId: attendanceId
    };

    await Notification.createForUsers(userIds, notificationData);

    console.log(`✅ Created ${userIds.length} attendance notifications for ${classSection}`);
    return userIds.length;
  } catch (error) {
    console.error('Error creating attendance notification:', error);
    throw error;
  }
};

// Broadcast message to specific class
export const broadcastToClass = async (req, res) => {
  try {
    const { className, title, message, facultyName, type = 'announcement' } = req.body;

    // ============================================
    // DEBUG: Log incoming request
    // ============================================
    console.log('\n=== BROADCAST TO CLASS REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('className:', className);
    console.log('title:', title);
    console.log('message:', message);
    console.log('facultyName:', facultyName);
    console.log('===================================\n');

    if (!className || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'className, title, and message are required'
      });
    }

    // ============================================
    // STRATEGY 1: Exact match on className field
    // ============================================
    console.log(`[Strategy 1] Exact match: "${className}"`);
    let students = await Student.find({ 
      className: className 
    }).select('_id name className department');
    console.log(`[Strategy 1] Found ${students.length} students`);

    // ============================================
    // STRATEGY 2: Case-insensitive regex match
    // ============================================
    if (students.length === 0) {
      console.log(`[Strategy 2] Case-insensitive regex match`);
      const regex = new RegExp(`^${className.trim()}$`, 'i');
      students = await Student.find({ 
        className: { $regex: regex }
      }).select('_id name className department');
      console.log(`[Strategy 2] Found ${students.length} students`);
    }

    // ============================================
    // STRATEGY 3: Try with hyphen instead of space
    // ============================================
    if (students.length === 0 && className.includes(' ')) {
      const classNameWithHyphen = className.replace(/\s+/g, '-');
      console.log(`[Strategy 3] Trying hyphen format: "${classNameWithHyphen}"`);
      students = await Student.find({ 
        className: classNameWithHyphen 
      }).select('_id name className department');
      console.log(`[Strategy 3] Found ${students.length} students`);
    }

    // ============================================
    // STRATEGY 4: Try with space instead of hyphen
    // ============================================
    if (students.length === 0 && className.includes('-')) {
      const classNameWithSpace = className.replace(/-/g, ' ');
      console.log(`[Strategy 4] Trying space format: "${classNameWithSpace}"`);
      students = await Student.find({ 
        className: classNameWithSpace 
      }).select('_id name className department');
      console.log(`[Strategy 4] Found ${students.length} students`);
    }

    // ============================================
    // STRATEGY 5: Partial match on department
    // ============================================
    if (students.length === 0) {
      const parts = className.trim().split(/[\s-]+/);
      if (parts.length >= 1) {
        const dept = parts[0];
        console.log(`[Strategy 5] Department match: "${dept}"`);
        students = await Student.find({ 
          department: new RegExp(`^${dept}$`, 'i')
        }).select('_id name className department');
        console.log(`[Strategy 5] Found ${students.length} students`);
        
        if (students.length > 0) {
          console.log(`[Strategy 5] ⚠️  Sending to ALL ${dept} students (className not matched)`);
        }
      }
    }

    // ============================================
    // NO STUDENTS FOUND - Return detailed error
    // ============================================
    if (students.length === 0) {
      const allClasses = await Student.distinct('className');
      const allDepts = await Student.distinct('department');
      const totalStudents = await Student.countDocuments();
      
      console.log('\n=== DEBUG: NO STUDENTS FOUND ===');
      console.log('Total students in DB:', totalStudents);
      console.log('Available classNames:', allClasses);
      console.log('Available departments:', allDepts);
      console.log('================================\n');
      
      if (totalStudents === 0) {
        return res.status(404).json({
          success: false,
          message: 'No students found in the database. Please add students first.'
        });
      }
      
      const availableClasses = allClasses.filter(c => c && c.trim());
      return res.status(404).json({
        success: false,
        message: `No students found for "${className}".`,
        debug: {
          searchedFor: className,
          totalStudents: totalStudents,
          availableClasses: availableClasses.length > 0 ? availableClasses : null,
          availableDepartments: allDepts.length > 0 ? allDepts : null
        }
      });
    }

    // ============================================
    // SUCCESS - Create notifications
    // ============================================
    console.log(`\n✅ SUCCESS: Sending to ${students.length} students`);
    console.log('Student details:', students.map(s => ({
      name: s.name,
      className: s.className,
      department: s.department
    })));
    
    const userIds = students.map(student => student._id.toString());

    const notificationData = {
      role: 'student',
      title: `📢 ${title}`,
      message: `${message}${facultyName ? ` - ${facultyName}` : ''}`,
      type: type,
      refId: null
    };

    await Notification.createForUsers(userIds, notificationData);

    console.log(`✅ Notifications created successfully\n`);

    res.status(200).json({
      success: true,
      message: `Message sent to ${students.length} students in ${className}`,
      count: students.length,
      className: className,
      students: students.map(s => s.name)
    });
  } catch (error) {
    console.error('\n❌ ERROR in broadcastToClass:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to send message to class',
      error: error.message
    });
  }
};

// Broadcast message to all students and faculty (Admin only)
export const broadcastToAll = async (req, res) => {
  try {
    const { title, message, senderName, type = 'announcement' } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'title and message are required'
      });
    }

    // Get all students
    const students = await Student.find({}).select('_id');
    const studentIds = students.map(s => s._id.toString());

    // Get all faculty (you'll need to import Faculty model)
    // For now, just sending to students
    
    const notificationData = {
      role: 'student',
      title: `📢 ${title}`,
      message: `${message}${senderName ? ` - ${senderName}` : ''}`,
      type: type,
      refId: null
    };

    // Create notifications for all students
    await Notification.createForUsers(studentIds, notificationData);

    res.status(200).json({
      success: true,
      message: `Message broadcast to ${studentIds.length} users`,
      count: studentIds.length
    });
  } catch (error) {
    console.error('Broadcast to all error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to broadcast message',
      error: error.message
    });
  }
};

export default {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createAttendanceNotification,
  broadcastToClass,
  broadcastToAll
};

