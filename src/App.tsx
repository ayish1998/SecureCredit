import React, { useState } from "react";
import {
  Shield,
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Users,
  Globe,
  BarChart3,
  Lock,
  Zap,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { SecurityDashboard } from "./components/SecurityDashboard";
import { SecurityAnalysis } from "./utils/fingerprint";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { FraudDetectionProvider } from "./contexts/FraudDetectionContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { AuthModal } from "./components/auth/AuthModal";
import { UserProfile } from "./components/UserProfile";
import { RealTimeNotifications } from "./components/RealTimeNotifications";
import { FraudDetectionCenter } from "./components/FraudDetectionCenter";
import { EnhancedCreditScoring } from "./components/EnhancedCreditScoring";
import { EnhancedSecurityDashboard } from "./components/EnhancedSecurityDashboard";

const AppContent: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [securityAnalysis, setSecurityAnalysis] =
    useState<SecurityAnalysis | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // If not authenticated, show auth modal
  if (!isAuthenticated) {
    return (
      <>
        <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-900 text-white' 
            : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900'
        }`}>
          <div className="text-center space-y-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
                SecureCredit
              </h1>
              <p className={`text-xl mb-8 max-w-2xl ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                AI-powered fraud detection and credit assessment platform for
                Africa's mobile money ecosystem
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </>
    );
  }

  // Main authenticated app

  const fraudStats = {
    totalTransactions: 2847293,
    fraudDetected: 1247,
    fraudPrevented: 98.2,
    riskScore: 23,
  };

  const recentAlerts = [
    {
      id: 1,
      type: "high",
      message: "Unusual transaction pattern detected",
      time: "2 min ago",
      amount: "$2,450",
    },
    {
      id: 2,
      type: "medium",
      message: "New device login from Ghana",
      time: "5 min ago",
      amount: "$150",
    },
    {
      id: 3,
      type: "low",
      message: "Velocity check triggered",
      time: "8 min ago",
      amount: "$75",
    },
  ];

  const creditScores = [
    { name: "Kwame Asante", score: 745, risk: "Low", trend: "up" },
    { name: "Amina Okafor", score: 620, risk: "Medium", trend: "stable" },
    { name: "Fatima Diallo", score: 580, risk: "Medium", trend: "down" },
    { name: "John Mwangi", score: 820, risk: "Low", trend: "up" },
  ];

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "fraud", label: "Fraud Detection", icon: AlertTriangle },
    { id: "credit", label: "Credit Scoring", icon: TrendingUp },
    { id: "security", label: "Device Security", icon: Shield },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setShowMobileSidebar(false);
  };
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gray-900 text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header */}
      <header className={`transition-colors duration-300 border-b ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileSidebar(true)}
                className={`md:hidden p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'hover:bg-gray-700 text-white' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  SecureCredit
                </h1>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  AI-Powered Financial Security
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <nav className="hidden md:flex space-x-4 lg:space-x-6">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium transition-colors ${
                      activeTab === item.id
                        ? "bg-blue-600 text-white"
                        : isDark 
                          ? "text-gray-300 hover:text-white hover:bg-gray-700"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              {/* User Actions */}
              <div className={`flex items-center space-x-1 sm:space-x-3 border-l pl-2 sm:pl-4 ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}>
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark 
                      ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                  title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <div className="hidden sm:block">
                  <button
                    onClick={() => setShowNotifications(true)}
                    className={`relative p-2 rounded-lg transition-colors ${
                      isDark 
                        ? 'hover:bg-gray-700 text-gray-300' 
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  </button>
                </div>

                <button
                  onClick={() => setShowUserProfile(true)}
                  className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                    isDark 
                      ? 'hover:bg-gray-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className={`text-xs lg:text-sm font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className={`text-xs capitalize ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {user?.role}
                    </p>
                  </div>
                </button>

                <button
                  onClick={logout}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark 
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMobileSidebar(false)}
          ></div>

          {/* Sidebar */}
          <div className={`fixed left-0 top-0 h-full w-80 border-r transform transition-all duration-300 ease-in-out ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            {/* Sidebar Header */}
            <div className={`flex items-center justify-between p-4 border-b transition-colors duration-300 ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-lg font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>SecureCredit</h1>
                  <p className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    AI-Powered Financial Security
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMobileSidebar(false)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'hover:bg-gray-700 text-gray-400' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="p-4 space-y-2">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? "bg-blue-600 text-white"
                        : isDark 
                          ? "text-gray-300 hover:text-white hover:bg-gray-700"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* User Section */}
            <div className={`absolute bottom-0 left-0 right-0 p-4 border-t transition-colors duration-300 ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className={`text-xs capitalize ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {user?.role}
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setShowNotifications(true);
                    setShowMobileSidebar(false);
                  }}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg transition-colors ${
                    isDark 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <Bell className={`w-4 h-4 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`} />
                  <span className={`text-sm ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>Notifications</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserProfile(true);
                    setShowMobileSidebar(false);
                  }}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg transition-colors ${
                    isDark 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <User className={`w-4 h-4 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`} />
                  <span className={`text-sm ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>Profile</span>
                </button>
              </div>

              <button
                onClick={logout}
                className="w-full mt-2 flex items-center justify-center space-x-2 py-2 px-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 text-white" />
                <span className="text-sm text-white">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Welcome Message */}
      <div className={`border-b transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-gray-700' 
          : 'bg-gradient-to-r from-blue-50 to-purple-50 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-4">
          <p className={`${
            isDark ? 'text-blue-300' : 'text-blue-700'
          }`}>
            Welcome back,{" "}
            <span className="font-semibold">{user?.firstName}</span>! Your
            account is secure and ready.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
                Securing Africa's Financial Future
              </h2>
               <p className={`text-xl max-w-3xl mx-auto ${
                 isDark ? 'text-gray-300' : 'text-gray-600'
               }`}>
                AI-powered fraud detection and credit assessment platform
                specifically designed for African mobile money systems
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <div className={`rounded-xl p-6 border transition-colors duration-300 ${
                isDark 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>Total Transactions</p>
                    <p className={`text-2xl font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {fraudStats.totalTransactions.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </div>

              <div className={`rounded-xl p-6 border transition-colors duration-300 ${
                isDark 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>Fraud Detected</p>
                    <p className="text-2xl font-bold text-red-400">
                      {fraudStats.fraudDetected.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                  </div>
                </div>
              </div>

              <div className={`rounded-xl p-6 border transition-colors duration-300 ${
                isDark 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>Prevention Rate</p>
                    <p className="text-2xl font-bold text-green-400">
                      {fraudStats.fraudPrevented}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>

              <div className={`rounded-xl p-6 border transition-colors duration-300 ${
                isDark 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>Risk Score</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {fraudStats.riskScore}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className={`lg:col-span-2 rounded-xl p-6 border transition-colors duration-300 ${
                isDark 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Live Transaction Feed</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>Live</span>
                  </div>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {recentAlerts.map((alert) => (
                    <div key={alert.id} className={`flex items-center justify-between p-3 rounded-lg transition-colors duration-300 ${
                      isDark 
                        ? 'bg-gray-700/50' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          alert.type === 'high' ? 'bg-red-400' : 
                          alert.type === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                        }`}></div>
                        <div>
                          <p className={`text-sm ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>{alert.message}</p>
                          <p className={`text-xs ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>{alert.time}</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-blue-400">{alert.amount}</span>
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
                  onClick={() => setActiveTab('fraud')}
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
                  onClick={() => setActiveTab('credit')}
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
                  onClick={() => setActiveTab('security')}
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
                  onClick={() => setShowNotifications(true)}
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
        )}

        {activeTab === "fraud" && <FraudDetectionCenter />}

        {activeTab === "credit" && <EnhancedCreditScoring />}

        {activeTab === "security" && <EnhancedSecurityDashboard />}
      </main>

      {/* Modals */}
      <UserProfile
        isOpen={showUserProfile}
        onClose={() => setShowUserProfile(false)}
      />
      <RealTimeNotifications
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FraudDetectionProvider>
          <AppContent />
        </FraudDetectionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
