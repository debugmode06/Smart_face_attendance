import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import api from '../utils/axios';

export default function NotificationBell({ userId, onNotificationClick }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  // Poll for unread count every 5 seconds
  useEffect(() => {
    if (!userId) return;

    const fetchUnreadCount = async () => {
      try {
        const response = await api.get(`/notifications/unread/${userId}`);
        if (response.data.success) {
          setUnreadCount(response.data.unreadCount);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    // Initial fetch
    fetchUnreadCount();

    // Poll every 5 seconds
    const interval = setInterval(fetchUnreadCount, 5000);

    return () => clearInterval(interval);
  }, [userId]);

  // Fetch notifications when dropdown opens
  const fetchNotifications = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/notifications/${userId}?limit=20`);
      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown && notifications.length === 0) {
      fetchNotifications();
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      if (!notification.read) {
        await api.post(`/notifications/read/${notification._id}`);
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        // Update local state
        setNotifications(prev =>
          prev.map(n =>
            n._id === notification._id ? { ...n, read: true } : n
          )
        );
      }

      // Handle redirect based on notification type
      if (onNotificationClick) {
        onNotificationClick(notification);
      }

      setShowDropdown(false);
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.post(`/notifications/read-all/${userId}`);
      setUnreadCount(0);
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'attendance':
        return '📝';
      case 'assignment':
        return '📚';
      case 'assessment':
        return '📊';
      case 'announcement':
        return '📢';
      case 'alert':
        return '⚠️';
      default:
        return '🔔';
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={handleBellClick}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
      >
        <Bell className="w-6 h-6" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />

          {/* Notification Panel - iOS Style */}
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl z-50 max-h-[600px] overflow-hidden flex flex-col" 
               style={{ 
                 backgroundColor: '#f2f2f7',
                 fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif'
               }}>
            {/* Header - iOS Style */}
            <div className="px-5 pt-5 pb-3" style={{ backgroundColor: '#f2f2f7' }}>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-2xl font-semibold" style={{ color: '#000', letterSpacing: '-0.5px' }}>
                  Notifications
                </h3>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm font-medium transition-opacity hover:opacity-70"
                  style={{ color: '#007AFF' }}
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List - iOS Cards */}
            <div className="overflow-y-auto flex-1 px-3 pb-3">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-10 h-10 border-3 rounded-full animate-spin" 
                       style={{ borderColor: '#007AFF', borderTopColor: 'transparent', borderWidth: '3px' }}></div>
                  <p className="mt-3 text-sm" style={{ color: '#8e8e93' }}>Loading...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3" 
                       style={{ backgroundColor: '#e5e5ea' }}>
                    <Bell className="w-8 h-8" style={{ color: '#8e8e93' }} />
                  </div>
                  <p className="text-sm font-medium" style={{ color: '#8e8e93' }}>No Notifications</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <button
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification)}
                      className="w-full rounded-xl transition-all duration-200 hover:scale-[0.98] active:scale-95"
                      style={{
                        backgroundColor: '#fff',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                      }}
                    >
                      <div className="flex gap-3 p-4">
                        {/* App Icon - iOS Style */}
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                               style={{
                                 backgroundColor: notification.read ? '#f2f2f7' : '#007AFF15',
                                 boxShadow: notification.read ? 'none' : '0 2px 8px rgba(0, 122, 255, 0.15)'
                               }}>
                            {getNotificationIcon(notification.type)}
                          </div>
                        </div>

                        {/* Content - iOS Style */}
                        <div className="flex-1 min-w-0 text-left">
                          {/* Title */}
                          <p className="text-sm font-semibold mb-0.5" 
                             style={{ 
                               color: '#000',
                               letterSpacing: '-0.2px',
                               lineHeight: '1.3'
                             }}>
                            {notification.title}
                          </p>
                          
                          {/* Message */}
                          <p className="text-sm mb-1 line-clamp-2" 
                             style={{ 
                               color: '#3c3c43',
                               lineHeight: '1.4'
                             }}>
                            {notification.message}
                          </p>
                          
                          {/* Timestamp - iOS Style */}
                          <p className="text-xs" 
                             style={{ 
                               color: '#8e8e93',
                               fontWeight: '500'
                             }}>
                            {getTimeAgo(notification.createdAt)}
                          </p>
                        </div>

                        {/* Unread Indicator - iOS Blue Dot */}
                        {!notification.read && (
                          <div className="flex-shrink-0 flex items-start pt-1">
                            <div className="w-2.5 h-2.5 rounded-full" 
                                 style={{ backgroundColor: '#007AFF' }}></div>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer - iOS Style */}
            {notifications.length > 0 && (
              <div className="px-3 pb-3 pt-1">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    // Navigate to full notifications page if exists
                  }}
                  className="w-full text-center py-3 rounded-xl font-medium text-sm transition-all duration-200 hover:opacity-70"
                  style={{
                    backgroundColor: '#fff',
                    color: '#007AFF',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
                  }}
                >
                  View All Notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
