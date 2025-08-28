import React, { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, CheckCircle, Info, TrendingUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface RealTimeNotificationsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RealTimeNotifications: React.FC<RealTimeNotificationsProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Simulate real-time notifications
    const interval = setInterval(() => {
      const notificationTypes = [
        {
          type: 'warning' as const,
          title: 'Suspicious Activity Detected',
          message: 'Unusual login attempt from new device in Lagos, Nigeria',
        },
        {
          type: 'success' as const,
          title: 'Transaction Verified',
          message: 'Mobile money transfer of ₦15,000 successfully processed',
        },
        {
          type: 'info' as const,
          title: 'Credit Score Updated',
          message: 'Your credit score has increased by 12 points to 745',
        },
        {
          type: 'error' as const,
          title: 'Fraud Alert',
          message: 'Potential fraudulent transaction blocked - ₦50,000',
        },
      ];

      const randomNotification = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
      
      const newNotification: Notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...randomNotification,
        timestamp: new Date(),
        read: false,
      };

      setNotifications(prev => [newNotification, ...prev.slice(0, 19)]); // Keep only 20 notifications
    }, 15000); // New notification every 15 seconds

    // Initial notifications
    const initialNotifications: Notification[] = [
      {
        id: '1',
        type: 'success',
        title: 'Welcome to SecureCredit',
        message: 'Your account has been successfully created and verified',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false,
      },
      {
        id: '2',
        type: 'info',
        title: 'Security Scan Complete',
        message: 'Device fingerprinting completed - Risk level: Low',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        read: true,
      },
    ];

    setNotifications(initialNotifications);

    return () => clearInterval(interval);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      default: return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20 p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">Notifications</h2>
              {unreadCount > 0 && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-800 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-800/50 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-blue-500/5 border-l-2 border-l-blue-500' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${
                          !notification.read ? 'text-white' : 'text-gray-300'
                        }`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {notification.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-4">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Real-time updates enabled</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};