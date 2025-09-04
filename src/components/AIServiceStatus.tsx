import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  X,
  Shield,
  Zap,
  Activity,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { AIErrorHandler, ErrorNotification } from '../utils/aiErrorHandler';
import { aiService } from '../services/aiService';

interface AIServiceStatusProps {
  showNotifications?: boolean;
  compact?: boolean;
}

export const AIServiceStatus: React.FC<AIServiceStatusProps> = ({
  showNotifications = true,
  compact = false
}) => {
  const { isDark } = useTheme();
  const [notifications, setNotifications] = useState<ErrorNotification[]>([]);
  const [circuitBreakerStatus, setCircuitBreakerStatus] = useState<any>(null);
  const [serviceStatus, setServiceStatus] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Subscribe to notifications
    const unsubscribe = AIErrorHandler.subscribeToNotifications(setNotifications);
    
    // Initial status check
    updateStatus();
    
    // Set up periodic status updates
    const interval = setInterval(updateStatus, 10000); // Every 10 seconds
    
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const updateStatus = () => {
    setCircuitBreakerStatus(AIErrorHandler.getCircuitBreakerStatus());
    setServiceStatus(aiService.getStatus());
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Test the AI service
      await aiService.testService();
      updateStatus();
    } catch (error) {
      console.error('Service test failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleResetCircuitBreaker = () => {
    AIErrorHandler.resetCircuitBreaker();
    updateStatus();
  };

  const handleDismissNotification = (id: string) => {
    AIErrorHandler.dismissNotification(id);
  };

  const handleClearAllNotifications = () => {
    AIErrorHandler.clearAllNotifications();
  };

  const getServiceStatusIcon = () => {
    if (!serviceStatus) return <Clock className="w-5 h-5 text-gray-400" />;
    
    if (circuitBreakerStatus?.isOpen) {
      return <XCircle className="w-5 h-5 text-red-400" />;
    }
    
    if (serviceStatus.aiAvailable && serviceStatus.initialized) {
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    }
    
    if (serviceStatus.initialized) {
      return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    }
    
    return <XCircle className="w-5 h-5 text-red-400" />;
  };

  const getServiceStatusText = () => {
    if (!serviceStatus) return 'Checking...';
    
    if (circuitBreakerStatus?.isOpen) {
      return 'Service Disabled';
    }
    
    if (serviceStatus.aiAvailable && serviceStatus.initialized) {
      return 'AI Active';
    }
    
    if (serviceStatus.initialized) {
      return 'Fallback Mode';
    }
    
    return 'Service Down';
  };

  const getServiceStatusColor = () => {
    if (!serviceStatus) return 'text-gray-400';
    
    if (circuitBreakerStatus?.isOpen) {
      return 'text-red-400';
    }
    
    if (serviceStatus.aiAvailable && serviceStatus.initialized) {
      return 'text-green-400';
    }
    
    if (serviceStatus.initialized) {
      return 'text-yellow-400';
    }
    
    return 'text-red-400';
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        {getServiceStatusIcon()}
        <span className={`text-sm font-medium ${getServiceStatusColor()}`}>
          {getServiceStatusText()}
        </span>
        {notifications.filter(n => !n.dismissed).length > 0 && (
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Service Status Card */}
      <div className={`rounded-xl p-6 border transition-colors duration-300 ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              circuitBreakerStatus?.isOpen ? 'bg-red-500/20' :
              serviceStatus?.aiAvailable ? 'bg-green-500/20' : 'bg-yellow-500/20'
            }`}>
              {circuitBreakerStatus?.isOpen ? (
                <WifiOff className="w-6 h-6 text-red-400" />
              ) : serviceStatus?.aiAvailable ? (
                <Wifi className="w-6 h-6 text-green-400" />
              ) : (
                <Shield className="w-6 h-6 text-yellow-400" />
              )}
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>AI Service Status</h3>
              <p className={`text-sm ${getServiceStatusColor()}`}>
                {getServiceStatusText()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'hover:bg-gray-700 text-gray-400' 
                  : 'hover:bg-gray-100 text-gray-600'
              } disabled:opacity-50`}
              title="Refresh status"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            
            {circuitBreakerStatus?.isOpen && (
              <button
                onClick={handleResetCircuitBreaker}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                title="Reset circuit breaker"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Service Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-lg font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {serviceStatus?.initialized ? 'Yes' : 'No'}
            </div>
            <div className={`text-xs ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Initialized</div>
          </div>
          
          <div className="text-center">
            <div className={`text-lg font-bold ${
              serviceStatus?.aiAvailable ? 'text-green-400' : 'text-red-400'
            }`}>
              {serviceStatus?.aiAvailable ? 'Online' : 'Offline'}
            </div>
            <div className={`text-xs ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>AI Engine</div>
          </div>
          
          <div className="text-center">
            <div className={`text-lg font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {serviceStatus?.cacheSize || 0}
            </div>
            <div className={`text-xs ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Cache Items</div>
          </div>
          
          <div className="text-center">
            <div className={`text-lg font-bold ${
              circuitBreakerStatus?.failures > 0 ? 'text-red-400' : 'text-green-400'
            }`}>
              {circuitBreakerStatus?.failures || 0}
            </div>
            <div className={`text-xs ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Failures</div>
          </div>
        </div>

        {/* Circuit Breaker Status */}
        {circuitBreakerStatus && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-gray-400" />
                <span className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Circuit Breaker:</span>
                <span className={`text-sm font-medium ${
                  circuitBreakerStatus.state === 'closed' ? 'text-green-400' :
                  circuitBreakerStatus.state === 'half-open' ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {circuitBreakerStatus.state.toUpperCase()}
                </span>
              </div>
              
              {circuitBreakerStatus.timeUntilRetry && circuitBreakerStatus.timeUntilRetry > 0 && (
                <span className={`text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Retry in {Math.ceil(circuitBreakerStatus.timeUntilRetry / 1000)}s
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notifications */}
      {showNotifications && notifications.filter(n => !n.dismissed).length > 0 && (
        <div className={`rounded-xl p-6 border transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Service Notifications</h3>
            
            <button
              onClick={handleClearAllNotifications}
              className={`text-sm ${
                isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'
              } transition-colors`}
            >
              Clear All
            </button>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {notifications
              .filter(n => !n.dismissed)
              .slice(0, 5)
              .map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border ${
                    notification.type === 'error' ? 'border-red-500/20 bg-red-500/10' :
                    notification.type === 'warning' ? 'border-yellow-500/20 bg-yellow-500/10' :
                    'border-blue-500/20 bg-blue-500/10'
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {notification.type === 'error' ? (
                      <XCircle className="w-5 h-5 text-red-400" />
                    ) : notification.type === 'warning' ? (
                      <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-blue-400" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-medium ${
                      notification.type === 'error' ? 'text-red-400' :
                      notification.type === 'warning' ? 'text-yellow-400' :
                      'text-blue-400'
                    }`}>
                      {notification.title}
                    </h4>
                    <p className={`text-sm mt-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {notification.message}
                    </p>
                    <p className={`text-xs mt-1 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleDismissNotification(notification.id)}
                    className={`flex-shrink-0 p-1 rounded transition-colors ${
                      isDark 
                        ? 'hover:bg-gray-700 text-gray-400' 
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};