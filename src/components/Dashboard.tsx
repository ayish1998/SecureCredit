import React from 'react';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Users,
  BarChart3,
  Lock,
  Bell,
  Shield,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface DashboardProps {
  fraudStats: {
    totalTransactions: number;
    fraudDetected: number;
    fraudPrevented: number;
    riskScore: number;
  };
  recentAlerts: Array<{
    id: number;
    type: string;
    message: string;
    time: string;
    amount: string;
  }>;
  onNavigate: (tab: string) => void;
  onShowNotifications: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  fraudStats,
  recentAlerts,
  onNavigate,
  onShowNotifications,
}) => {
  const { isDark } = useTheme();

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12 px-4 sm:px-0">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2 sm:mb-4">
          Securing Africa's Financial Future
        </h2>
        <p className={`text-base sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          AI-powered fraud detection and credit assessment platform
          specifically designed for African mobile money systems
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className={`rounded-xl p-4 sm:p-6 border transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className={`text-xs sm:text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Total Transactions</p>
              <p className={`text-lg sm:text-xl lg:text-2xl font-bold truncate ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {fraudStats.totalTransactions.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-4 sm:p-6 border transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className={`text-xs sm:text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Fraud Detected</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-400 truncate">
                {fraudStats.fraudDetected.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-4 sm:p-6 border transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className={`text-xs sm:text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Prevention Rate</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-400 truncate">
                {fraudStats.fraudPrevented}%
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-4 sm:p-6 border transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className={`text-xs sm:text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Risk Score</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-400 truncate">
                {fraudStats.riskScore}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>
      
{/* Real-time Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className={`lg:col-span-2 rounded-xl p-4 sm:p-6 border transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-base sm:text-lg font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Live Transaction Feed</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className={`text-xs sm:text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Live</span>
            </div>
          </div>
          <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 overflow-y-auto">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className={`flex items-start sm:items-center justify-between p-2 sm:p-3 rounded-lg transition-colors duration-300 ${
                isDark 
                  ? 'bg-gray-700/50' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}>
                <div className="flex items-start sm:items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 sm:mt-0 ${
                    alert.type === 'high' ? 'bg-red-400' : 
                    alert.type === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                  }`}></div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs sm:text-sm leading-tight ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>{alert.message}</p>
                    <p className={`text-xs ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>{alert.time}</p>
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-medium text-blue-400 flex-shrink-0 ml-2">{alert.amount}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-xl p-6 border transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Geographic Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>🇬🇭 Ghana</span>
              <div className="flex items-center space-x-2">
                <div className={`w-16 h-2 rounded-full overflow-hidden ${
                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div className="w-3/4 h-full bg-blue-400 rounded-full"></div>
                </div>
                <span className={`text-sm ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>34%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>🇳🇬 Nigeria</span>
              <div className="flex items-center space-x-2">
                <div className={`w-16 h-2 rounded-full overflow-hidden ${
                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div className="w-2/3 h-full bg-green-400 rounded-full"></div>
                </div>
                <span className={`text-sm ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>28%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>🇰🇪 Kenya</span>
              <div className="flex items-center space-x-2">
                <div className={`w-16 h-2 rounded-full overflow-hidden ${
                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div className="w-1/2 h-full bg-purple-400 rounded-full"></div>
                </div>
                <span className={`text-sm ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>22%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>🇿🇦 South Africa</span>
              <div className="flex items-center space-x-2">
                <div className={`w-16 h-2 rounded-full overflow-hidden ${
                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div className="w-1/3 h-full bg-yellow-400 rounded-full"></div>
                </div>
                <span className={`text-sm ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>16%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
        <div className={`rounded-xl p-6 border transition-all duration-300 group ${
          isDark 
            ? 'bg-gray-800 border-gray-700 hover:border-blue-500/50' 
            : 'bg-white border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md'
        }`}>
          <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
            <Brain className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className={`text-xl font-semibold mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            AI-Powered Detection
          </h3>
          <p className={`mb-4 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Machine learning algorithms analyze transaction patterns to
            identify fraudulent activities in real-time.
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Accuracy</span>
            <span className="text-green-400 font-medium">98.2%</span>
          </div>
        </div>

        <div className={`rounded-xl p-6 border transition-all duration-300 group ${
          isDark 
            ? 'bg-gray-800 border-gray-700 hover:border-purple-500/50' 
            : 'bg-white border-gray-200 hover:border-purple-300 shadow-sm hover:shadow-md'
        }`}>
          <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors">
            <Users className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className={`text-xl font-semibold mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Credit Scoring</h3>
          <p className={`mb-4 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Intelligent credit assessment for unbanked populations using
            mobile money transaction history.
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Users Served</span>
            <span className="text-purple-400 font-medium">200M+</span>
          </div>
        </div>

        <div className={`rounded-xl p-6 border transition-all duration-300 group ${
          isDark 
            ? 'bg-gray-800 border-gray-700 hover:border-green-500/50' 
            : 'bg-white border-gray-200 hover:border-green-300 shadow-sm hover:shadow-md'
        }`}>
          <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-500/30 transition-colors">
            <Lock className="w-6 h-6 text-green-400" />
          </div>
          <h3 className={`text-xl font-semibold mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Cybersecurity</h3>
          <p className={`mb-4 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Advanced security measures protect user data and prevent
            unauthorized access.
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Uptime</span>
            <span className="text-green-400 font-medium">99.9%</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`rounded-xl p-6 border transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-blue-500/20' 
          : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => onNavigate('fraud')}
            className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
              isDark 
                ? 'bg-gray-800/50 hover:bg-gray-700/50' 
                : 'bg-white/70 hover:bg-white shadow-sm hover:shadow-md'
            }`}
          >
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className={`text-sm ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Check Fraud</span>
          </button>
          <button 
            onClick={() => onNavigate('credit')}
            className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
              isDark 
                ? 'bg-gray-800/50 hover:bg-gray-700/50' 
                : 'bg-white/70 hover:bg-white shadow-sm hover:shadow-md'
            }`}
          >
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className={`text-sm ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Score Credit</span>
          </button>
          <button 
            onClick={() => onNavigate('security')}
            className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
              isDark 
                ? 'bg-gray-800/50 hover:bg-gray-700/50' 
                : 'bg-white/70 hover:bg-white shadow-sm hover:shadow-md'
            }`}
          >
            <Shield className="w-5 h-5 text-blue-400" />
            <span className={`text-sm ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Device Check</span>
          </button>
          <button 
            onClick={onShowNotifications}
            className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
              isDark 
                ? 'bg-gray-800/50 hover:bg-gray-700/50' 
                : 'bg-white/70 hover:bg-white shadow-sm hover:shadow-md'
            }`}
          >
            <Bell className="w-5 h-5 text-yellow-400" />
            <span className={`text-sm ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>View Alerts</span>
          </button>
        </div>
      </div>
    </div>
  );
};