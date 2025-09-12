import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  XCircle,
  Shield,
  TrendingUp,
  Brain,
  Clock,
  Filter,
  MoreVertical
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info' | 'ai';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  category: 'fraud' | 'credit' | 'security' | 'system' | 'ai';
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionUrl?: string;
  metadata?: any;
}

interface EnhancedNotificationsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EnhancedNotifications: React.FC<EnhancedNotificationsProps> = ({
  isOpen,
  onClose
}) => {
  const { isDark } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'ai' | 'fraud' | 'security'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (isOpen) {
      generateMockNotifications();
    }
  }, [isOpen]);

  const generateMockNotifications = () => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'ai',
        title: 'AI Analysis Complete',
        message: 'Fraud detection analysis completed with 94.2% confidence. 3 suspicious patterns detected.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false,
        category: 'ai',
        priority: 'high',
        metadata: { confidence: 94.2, patterns: 3 }
      },
      {
        id: '2',
        type: 'warning',
        title: 'High-Risk Transaction Detected',
        message: 'Transaction of GHS 2,500 from new device flagged for manual review.',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        read: false,
        category: 'fraud',
        priority: 'critical',
        actionUrl: '/fraud'
      },
      {
        id: '3',
        type: 'success',
        title: 'Credit Score Updated',
        message: 'AI-enhanced credit scoring improved accuracy by 12% this month.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: true,
        category: 'credit',
        priority: 'medium'
      },
      {
        id: '4',
        type: 'info',
        title: 'Security Scan Complete',
        message: 'Weekly security analysis completed. No threats detected.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: true,
        category: 'security',
        priority: 'low'
      },
      {
        id: '5',
        type: 'ai',
        title: 'Model Performance Update',
        message: 'AI fraud detection model retrained with 99.1% accuracy on latest dataset.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        read: false,
        category: 'ai',
        priority: 'medium'
      },
      {
        id: '6',
        type: 'error',
        title: 'API Rate Limit Warning',
        message: 'Approaching AI service rate limit. Consider upgrading plan.',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        read: false,
        category: 'system',
        priority: 'high'
      }
    ];

    setNotifications(mockNotifications);
  };

  const getNotificationIcon = (type: string, category: string) => {
    if (type === 'ai') return <Brain className="w-5 h-5 text-purple-500" />;
    if (category === 'fraud') return <Shield className="w-5 h-5 text-red-500" />;
    if (category === 'credit') return <TrendingUp className="w-5 h-5 text-green-500" />;
    
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10';
      case 'high': return 'border-l-orange-500 bg-orange-50/50 dark:bg-orange-900/10';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10';
      default: return 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10';
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

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.read;
    return notif.category === filter || notif.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 z-50 pt-20">
      <div className={`w-full max-w-2xl max-h-[80vh] rounded-2xl border transition-all duration-300 animate-slide-down ${
        isDark 
          ? 'bg-gray-900/95 border-gray-700/50' 
          : 'bg-white/95 border-gray-200/50'
      } backdrop-blur-xl shadow-2xl`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDark ? 'border-gray-700/50' : 'border-gray-200/50'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Bell className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
              {unreadCount > 0 && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {unreadCount}
                </div>
              )}
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Notifications
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {unreadCount} unread of {notifications.length} total
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Mark all read
              </button>
            )}
            
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className={`p-4 border-b ${isDark ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All' },
                { key: 'unread', label: 'Unread' },
                { key: 'ai', label: 'AI' },
                { key: 'fraud', label: 'Fraud' },
                { key: 'security', label: 'Security' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    filter === key
                      ? 'bg-blue-500 text-white'
                      : isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className={`w-12 h-12 mx-auto mb-4 ${
                isDark ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <p className={`text-lg font-medium ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                No notifications found
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 transition-all duration-200 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 border-l-4 ${
                    getPriorityColor(notification.priority)
                  } ${!notification.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type, notification.category)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`text-sm font-semibold ${
                            isDark ? 'text-white' : 'text-gray-900'
                          } ${!notification.read ? 'font-bold' : ''}`}>
                            {notification.title}
                            {!notification.read && (
                              <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full inline-block"></span>
                            )}
                          </h4>
                          <p className={`text-sm mt-1 ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center space-x-4 mt-2">
                            <div className={`flex items-center space-x-1 text-xs ${
                              isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              <Clock className="w-3 h-3" />
                              <span>{notification.timestamp.toLocaleTimeString()}</span>
                            </div>
                            
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              notification.priority === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                              notification.priority === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                              notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}>
                              {notification.priority}
                            </span>
                            
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {notification.category}
                            </span>
                          </div>
                          
                          {notification.actionUrl && (
                            <button className="mt-2 text-xs text-blue-500 hover:text-blue-600 font-medium">
                              View Details →
                            </button>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className={`p-1 rounded transition-colors ${
                                isDark 
                                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                                  : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                              }`}
                              title="Mark as read"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className={`p-1 rounded transition-colors ${
                              isDark 
                                ? 'hover:bg-gray-700 text-gray-400 hover:text-red-400' 
                                : 'hover:bg-gray-200 text-gray-500 hover:text-red-500'
                            }`}
                            title="Delete"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${isDark ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
          <div className="flex items-center justify-between">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Last updated: {new Date().toLocaleTimeString()}
            </p>
            <button
              onClick={onClose}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                isDark 
                  ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};