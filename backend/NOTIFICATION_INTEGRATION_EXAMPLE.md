# Notification System Integration Example

## How to Send Notifications When Faculty Starts Attendance

### Example Integration in Attendance Controller

```javascript
import { createAttendanceNotification } from '../controllers/NotificationController.js';

// In your attendance session creation function
export const startAttendanceSession = async (req, res) => {
  try {
    const { classSection, subject } = req.body;
    const facultyId = req.user._id;
    const facultyName = req.user.name;

    // Create attendance session
    const session = await AttendanceSession.create({
      classSection,
      subject,
      faculty: facultyId,
      startTime: new Date(),
      // ... other fields
    });

    // ✅ SEND NOTIFICATIONS TO ALL STUDENTS IN THE CLASS
    try {
      await createAttendanceNotification(
        classSection,           // e.g., "CSE-A"
        session._id.toString(), // attendance session ID
        subject,                // e.g., "Data Structures"
        facultyName            // e.g., "Dr. Smith"
      );
      console.log('📢 Notifications sent to students');
    } catch (notifError) {
      console.error('Notification error (non-critical):', notifError);
      // Don't fail the attendance creation if notifications fail
    }

    res.status(201).json({
      success: true,
      message: 'Attendance session started',
      session
    });

  } catch (error) {
    console.error('Error starting attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start attendance session'
    });
  }
};
```

## MongoDB Indexes

Run these commands in MongoDB shell to create indexes for optimal performance:

```javascript
use your_database_name;

// Create compound indexes
db.notifications.createIndex({ userId: 1, read: 1 });
db.notifications.createIndex({ userId: 1, createdAt: -1 });
db.notifications.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // Auto-delete after 30 days
```

## Testing the Notification System

### 1. Test Unread Count
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/notifications/unread/STUDENT_ID
```

### 2. Test Get Notifications
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/notifications/STUDENT_ID
```

### 3. Test Create Notification
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "STUDENT_ID",
    "role": "student",
    "title": "Test Notification",
    "message": "This is a test message",
    "type": "attendance",
    "refId": "test123"
  }' \
  http://localhost:5000/api/notifications/create
```

### 4. Test Mark as Read
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/notifications/read/NOTIFICATION_ID
```

## Frontend Usage

The NotificationBell component is already integrated in DashboardLayout.jsx:

```jsx
<NotificationBell 
  userId={user?._id || user?.id} 
  onNotificationClick={handleNotificationClick}
/>
```

It automatically:
- Polls every 5 seconds for unread count
- Shows red badge with count
- Displays notifications in dropdown
- Marks as read when clicked
- Redirects based on notification type

## Customization

### Add New Notification Types

Edit `backend/models/Notification.js`:

```javascript
type: {
  type: String,
  required: true,
  enum: ['attendance', 'announcement', 'alert', 'assignment', 'assessment', 'YOUR_NEW_TYPE'],
  default: 'announcement'
}
```

### Change Polling Interval

Edit `frontend/src/components/NotificationBell.jsx`:

```javascript
// Change from 5000ms (5 seconds) to desired interval
const interval = setInterval(fetchUnreadCount, 10000); // 10 seconds
```

### Add Push Notifications (FCM)

Future enhancement:
1. Add FCM token field to User model
2. Install firebase-admin in backend
3. Send push notification after creating DB notification
4. Register service worker in frontend

## Production Considerations

1. **Rate Limiting**: Add rate limiting to notification endpoints
2. **Caching**: Cache unread counts in Redis
3. **Batch Operations**: Use bulk inserts for mass notifications
4. **Database Cleanup**: Auto-delete old notifications (already configured with TTL index)
5. **WebSocket**: Replace polling with WebSocket for real-time updates

## Troubleshooting

### Notifications Not Showing
- Check if backend is running
- Verify authentication token is valid
- Check browser console for errors
- Verify userId is correctly passed to NotificationBell

### High Database Load
- Ensure indexes are created
- Consider implementing Redis cache
- Reduce polling frequency
- Implement WebSocket instead of polling

### Notifications Not Sending
- Check if students exist in class
- Verify classSection naming matches
- Check backend logs for errors
- Ensure Notification model is imported correctly
