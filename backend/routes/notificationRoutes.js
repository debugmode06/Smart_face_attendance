import express from 'express';
const router = express.Router();
import notificationController from '../controllers/NotificationController.js';
import authMiddleware from '../middleware/AuthMiddleware.js';

// All routes require authentication
router.use(authMiddleware);

// Create notification(s)
router.post('/create', notificationController.createNotification);

// Get all notifications for a user
router.get('/:userId', notificationController.getNotifications);

// Get unread count
router.get('/unread/:userId', notificationController.getUnreadCount);

// Mark notification as read
router.post('/read/:notificationId', notificationController.markAsRead);

// Mark all as read
router.post('/read-all/:userId', notificationController.markAllAsRead);

// Delete notification
router.delete('/:notificationId', notificationController.deleteNotification);

export default router;

