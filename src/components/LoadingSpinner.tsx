import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Brain, Zap, Shield, TrendingUp } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  type?: 'default' | 'ai' | 'pulse' | 'dots' | 'bars';
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  type = 'default',
  message,
  className = ''
}) => {
  const { isDark } = useTheme();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const containerSizeClasses = {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  if (type === 'ai') {
    return (
      <div className={`flex flex-col items-center justify-center ${containerSizeClasses[size]} ${className}`}>
        <div className="relative">
          {/* Rotating outer ring */}
          <div className={`${sizeClasses[size]} border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin`}>
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          
          {/* AI Brain icon in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-8 h-8'} text-blue-500 animate-pulse`} />
          </div>
          
          {/* Pulsing outer glow */}
          <div className={`absolute inset-0 ${sizeClasses[size]} bg-blue-500/20 rounded-full animate-ping`}></div>
        </div>
        
        {message && (
          <p className={`mt-3 text-sm font-medium text-center ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {message}
          </p>
        )}
      </div>
    );
  }

  if (type === 'pulse') {
    return (
      <div className={`flex flex-col items-center justify-center ${containerSizeClasses[size]} ${className}`}>
        <div className="flex space-x-2">
          <div className={`${sizeClasses[size]} bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse`}></div>
          <div className={`${sizeClasses[size]} bg-gradient-to-r from-purple-500 to-pink-600 rounded-full animate-pulse delay-75`}></div>
          <div className={`${sizeClasses[size]} bg-gradient-to-r from-pink-500 to-red-600 rounded-full animate-pulse delay-150`}></div>
        </div>
        
        {message && (
          <p className={`mt-3 text-sm font-medium text-center ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {message}
          </p>
        )}
      </div>
    );
  }

  if (type === 'dots') {
    return (
      <div className={`flex flex-col items-center justify-center ${containerSizeClasses[size]} ${className}`}>
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-5 h-5'} bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-bounce`}
              style={{ animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>
        
        {message && (
          <p className={`mt-3 text-sm font-medium text-center ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {message}
          </p>
        )}
      </div>
    );
  }

  if (type === 'bars') {
    return (
      <div className={`flex flex-col items-center justify-center ${containerSizeClasses[size]} ${className}`}>
        <div className="flex items-end space-x-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`${size === 'sm' ? 'w-1' : size === 'md' ? 'w-2' : size === 'lg' ? 'w-3' : 'w-4'} bg-gradient-to-t from-blue-500 to-purple-600 rounded-full animate-pulse`}
              style={{ 
                height: `${20 + (i * 5)}px`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1s'
              }}
            ></div>
          ))}
        </div>
        
        {message && (
          <p className={`mt-3 text-sm font-medium text-center ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {message}
          </p>
        )}
      </div>
    );
  }

  // Default spinner
  return (
    <div className={`flex flex-col items-center justify-center ${containerSizeClasses[size]} ${className}`}>
      <div className={`${sizeClasses[size]} border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin`}></div>
      
      {message && (
        <p className={`mt-3 text-sm font-medium text-center ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {message}
        </p>
      )}
    </div>
  );
};

// Specialized AI Analysis Loading Component
export const AIAnalysisLoader: React.FC<{ message?: string }> = ({ message = "AI is analyzing..." }) => {
  const { isDark } = useTheme();
  
  const icons = [Brain, Shield, TrendingUp, Zap];
  
  return (
    <div className={`flex flex-col items-center justify-center p-8 rounded-2xl ${
      isDark ? 'bg-gray-800/50' : 'bg-white/50'
    } backdrop-blur-xl border ${
      isDark ? 'border-gray-700/50' : 'border-gray-200/50'
    }`}>
      <div className="relative">
        {/* Rotating icons */}
        <div className="relative w-16 h-16">
          {icons.map((Icon, index) => (
            <div
              key={index}
              className="absolute inset-0 animate-spin"
              style={{ 
                animationDuration: '3s',
                animationDelay: `${index * 0.2}s`,
                transform: `rotate(${index * 90}deg)`
              }}
            >
              <Icon 
                className={`w-6 h-6 absolute top-0 left-1/2 transform -translate-x-1/2 ${
                  index === 0 ? 'text-blue-500' :
                  index === 1 ? 'text-green-500' :
                  index === 2 ? 'text-purple-500' : 'text-yellow-500'
                }`}
              />
            </div>
          ))}
        </div>
        
        {/* Center pulse */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <p className={`text-lg font-semibold text-gradient-primary`}>
          {message}
        </p>
        <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Processing with advanced AI algorithms
        </p>
      </div>
      
      {/* Progress dots */}
      <div className="flex space-x-2 mt-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
            style={{ animationDelay: `${i * 0.3}s` }}
          ></div>
        ))}
      </div>
    </div>
  );
};

// Skeleton Loading Component
export const SkeletonLoader: React.FC<{ 
  lines?: number; 
  className?: string;
  showAvatar?: boolean;
}> = ({ 
  lines = 3, 
  className = '',
  showAvatar = false 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {showAvatar && (
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full loading-skeleton"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded loading-skeleton mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded loading-skeleton w-2/3"></div>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`h-4 bg-gray-300 dark:bg-gray-600 rounded loading-skeleton ${
              i === lines - 1 ? 'w-3/4' : 'w-full'
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};