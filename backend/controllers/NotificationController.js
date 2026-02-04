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

export default {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createAttendanceNotification
};

