import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface EnhancedStatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon: LucideIcon;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo';
  trend?: number[];
  isLoading?: boolean;
  aiEnhanced?: boolean;
  confidence?: number;
  onClick?: () => void;
}

export const EnhancedStatsCard: React.FC<EnhancedStatsCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color,
  trend,
  isLoading = false,
  aiEnhanced = false,
  confidence,
  onClick
}) => {
  const { isDark } = useTheme();

  const colorClasses = {
    blue: {
      bg: 'from-blue-500 to-blue-600',
      light: 'bg-blue-500/10 border-blue-500/20',
      text: 'text-blue-400',
      icon: 'text-blue-500'
    },
    green: {
      bg: 'from-green-500 to-green-600',
      light: 'bg-green-500/10 border-green-500/20',
      text: 'text-green-400',
      icon: 'text-green-500'
    },
    red: {
      bg: 'from-red-500 to-red-600',
      light: 'bg-red-500/10 border-red-500/20',
      text: 'text-red-400',
      icon: 'text-red-500'
    },
    yellow: {
      bg: 'from-yellow-500 to-yellow-600',
      light: 'bg-yellow-500/10 border-yellow-500/20',
      text: 'text-yellow-400',
      icon: 'text-yellow-500'
    },
    purple: {
      bg: 'from-purple-500 to-purple-600',
      light: 'bg-purple-500/10 border-purple-500/20',
      text: 'text-purple-400',
      icon: 'text-purple-500'
    },
    indigo: {
      bg: 'from-indigo-500 to-indigo-600',
      light: 'bg-indigo-500/10 border-indigo-500/20',
      text: 'text-indigo-400',
      icon: 'text-indigo-500'
    }
  };

  const colors = colorClasses[color];

  if (isLoading) {
    return (
      <div className={`card-modern p-6 animate-pulse ${
        isDark ? 'bg-gray-800/50' : 'bg-white/50'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="w-24 h-4 bg-gray-300 dark:bg-gray-600 rounded loading-skeleton"></div>
          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-xl loading-skeleton"></div>
        </div>
        <div className="w-32 h-8 bg-gray-300 dark:bg-gray-600 rounded loading-skeleton mb-2"></div>
        <div className="w-20 h-4 bg-gray-300 dark:bg-gray-600 rounded loading-skeleton"></div>
      </div>
    );
  }

  return (
    <div 
      className={`card-modern p-6 relative overflow-hidden group ${
        onClick ? 'cursor-pointer' : ''
      } ${isDark ? 'bg-gray-800/80' : 'bg-white/90'}`}
      onClick={onClick}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors.bg} rounded-full transform translate-x-16 -translate-y-16`}></div>
      </div>

      {/* AI Enhancement Indicator */}
      {aiEnhanced && (
        <div className="absolute top-4 right-4">
          <div className={`w-3 h-3 rounded-full animate-pulse ${colors.text.replace('text-', 'bg-')}`}></div>
        </div>
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h3 className={`text-sm font-medium ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {title}
            </h3>
            {aiEnhanced && (
              <div className={`px-2 py-1 text-xs rounded-full ${colors.light} ${colors.text}`}>
                AI
              </div>
            )}
          </div>
          
          <div className={`p-3 rounded-xl ${colors.light} group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-6 h-6 ${colors.icon}`} />
          </div>
        </div>

        {/* Value */}
        <div className="mb-3">
          <p className={`text-3xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          } group-hover:scale-105 transition-transform duration-300`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>

        {/* Change Indicator */}
        {change && (
          <div className="flex items-center space-x-2 mb-3">
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
              change.type === 'increase' 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              <span>{change.type === 'increase' ? '↗' : '↘'}</span>
              <span>{Math.abs(change.value)}%</span>
            </div>
            <span className={`text-xs ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              vs {change.period}
            </span>
          </div>
        )}

        {/* Mini Trend Chart */}
        {trend && trend.length > 0 && (
          <div className="flex items-end space-x-1 h-8 mb-3">
            {trend.map((point, index) => (
              <div
                key={index}
                className={`w-2 bg-gradient-to-t ${colors.bg} rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
                style={{ 
                  height: `${Math.max(4, (point / Math.max(...trend)) * 32)}px`,
                  animationDelay: `${index * 0.1}s`
                }}
              ></div>
            ))}
          </div>
        )}

        {/* AI Confidence */}
        {aiEnhanced && confidence && (
          <div className="flex items-center justify-between">
            <span className={`text-xs ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              AI Confidence
            </span>
            <div className="flex items-center space-x-2">
              <div className={`w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden`}>
                <div 
                  className={`h-full bg-gradient-to-r ${colors.bg} transition-all duration-1000 ease-out`}
                  style={{ width: `${confidence}%` }}
                ></div>
              </div>
              <span className={`text-xs font-medium ${colors.text}`}>
                {confidence}%
              </span>
            </div>
          </div>
        )}

        {/* Hover Effect Overlay */}
        {onClick && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        )}
      </div>
    </div>
  );
};

// Specialized AI Stats Card
export const AIStatsCard: React.FC<{
  title: string;
  value: string | number;
  confidence: number;
  processingTime?: number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  onClick?: () => void;
}> = ({ title, value, confidence, processingTime, icon, color, onClick }) => {
  const { isDark } = useTheme();

  return (
    <EnhancedStatsCard
      title={title}
      value={value}
      icon={icon}
      color={color}
      aiEnhanced={true}
      confidence={confidence}
      onClick={onClick}
    />
  );
};

// Grid Layout for Stats Cards
export const StatsGrid: React.FC<{ 
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}> = ({ children, columns = 4, className = '' }) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-6 ${className}`}>
      {children}
    </div>
  );
};