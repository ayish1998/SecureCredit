import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { AIUsageMetrics } from '../types/aiConfig';
import { aiConfigManager } from '../utils/aiConfigManager';

interface AIUsageMonitorProps {
  className?: string;
}

export const AIUsageMonitor: React.FC<AIUsageMonitorProps> = ({ className = '' }) => {
  const { isDark } = useTheme();
  const [metrics, setMetrics] = useState<AIUsageMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadMetrics();
    
    // Set up periodic refresh
    const interval = setInterval(loadMetrics, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    try {
      const currentMetrics = aiConfigManager.getUsageMetrics();
      setMetrics(currentMetrics);
    } catch (error) {
      console.error('Failed to load usage metrics:', error);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await loadMetrics();
    setIsLoading(false);
  };

  const handleResetMetrics = () => {
    if (confirm('Are you sure you want to reset all usage metrics? This action cannot be undone.')) {
      aiConfigManager.resetUsageMetrics();
      loadMetrics();
    }
  };

  if (!metrics) {
    return (
      <div className={`${className} animate-pulse`}>
        <div className={`h-32 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
      </div>
    );
  }

  const successRate = metrics.totalRequests > 0 
    ? ((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(1)
    : '0';

  const cacheHitRate = metrics.cacheHitRate.toFixed(1);

  return (
    <div className={`${className} space-y-4`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>AI Usage Monitor</h3>
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            } ${isLoading ? 'animate-spin' : ''}`}
            title="Refresh metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetMetrics}
            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
              isDark 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg ${
          isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <span className={`text-sm font-medium ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>Total Requests</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">
            {metrics.totalRequests.toLocaleString()}
          </p>
        </div>

        <div className={`p-4 rounded-lg ${
          isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className={`text-sm font-medium ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>Success Rate</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{successRate}%</p>
        </div>

        <div className={`p-4 rounded-lg ${
          isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className={`text-sm font-medium ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>Avg Response</span>
          </div>
          <p className="text-2xl font-bold text-yellow-400">
            {Math.round(metrics.averageResponseTime)}ms
          </p>
        </div>

        <div className={`p-4 rounded-lg ${
          isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="w-5 h-5 text-purple-400" />
            <span className={`text-sm font-medium ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>Est. Cost</span>
          </div>
          <p className="text-2xl font-bold text-purple-400">
            ${metrics.estimatedCost.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Feature Usage Breakdown */}
      <div className={`p-4 rounded-lg ${
        isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'
      }`}>
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="w-5 h-5 text-indigo-400" />
          <h4 className={`font-medium ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Feature Usage</h4>
        </div>
        
        <div className="space-y-3">
          {[
            { 
              key: 'fraudAnalysisCount', 
              label: 'Fraud Detection', 
              color: 'bg-red-500',
              count: metrics.fraudAnalysisCount 
            },
            { 
              key: 'creditScoringCount', 
              label: 'Credit Scoring', 
              color: 'bg-green-500',
              count: metrics.creditScoringCount 
            },
            { 
              key: 'securityAnalysisCount', 
              label: 'Security Analysis', 
              color: 'bg-yellow-500',
              count: metrics.securityAnalysisCount 
            },
            { 
              key: 'generalInsightsCount', 
              label: 'General Insights', 
              color: 'bg-blue-500',
              count: metrics.generalInsightsCount 
            }
          ].map((feature) => {
            const percentage = metrics.totalRequests > 0 
              ? (feature.count / metrics.totalRequests) * 100 
              : 0;
            
            return (
              <div key={feature.key} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>{feature.label}</span>
                  <span className={`text-sm font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {feature.count.toLocaleString()} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full ${
                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div 
                    className={`h-2 rounded-full ${feature.color}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`p-4 rounded-lg ${
          isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'
        }`}>
          <h4 className={`font-medium mb-3 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Performance Health</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>Error Rate</span>
              <div className="flex items-center space-x-2">
                {metrics.errorRate < 5 ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : metrics.errorRate < 15 ? (
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
                <span className={`text-sm font-medium ${
                  metrics.errorRate < 5 ? 'text-green-400' :
                  metrics.errorRate < 15 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {metrics.errorRate.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className={`text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>Cache Hit Rate</span>
              <div className="flex items-center space-x-2">
                {metrics.cacheHitRate > 70 ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : metrics.cacheHitRate > 40 ? (
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
                <span className={`text-sm font-medium ${
                  metrics.cacheHitRate > 70 ? 'text-green-400' :
                  metrics.cacheHitRate > 40 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {cacheHitRate}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className={`text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>Avg Response Time</span>
              <div className="flex items-center space-x-2">
                {metrics.averageResponseTime < 2000 ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : metrics.averageResponseTime < 5000 ? (
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
                <span className={`text-sm font-medium ${
                  metrics.averageResponseTime < 2000 ? 'text-green-400' :
                  metrics.averageResponseTime < 5000 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {Math.round(metrics.averageResponseTime)}ms
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${
          isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'
        }`}>
          <h4 className={`font-medium mb-3 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Cost Analysis</h4>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className={`text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>Cost per Request</span>
              <span className={`text-sm font-medium ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                ${metrics.costPerRequest.toFixed(4)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className={`text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>Total Estimated Cost</span>
              <span className={`text-sm font-medium ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                ${metrics.estimatedCost.toFixed(2)}
              </span>
            </div>

            {metrics.monthlyBudget && (
              <div className="flex justify-between">
                <span className={`text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>Budget Usage</span>
                <span className={`text-sm font-medium ${
                  (metrics.estimatedCost / metrics.monthlyBudget) > 0.8 ? 'text-red-400' :
                  (metrics.estimatedCost / metrics.monthlyBudget) > 0.6 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {((metrics.estimatedCost / metrics.monthlyBudget) * 100).toFixed(1)}%
                </span>
              </div>
            )}

            <div className={`text-xs ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Last reset: {new Date(metrics.lastResetDate).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};