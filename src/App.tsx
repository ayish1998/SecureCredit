import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
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
import { DataAdapter } from "./utils/dataAdapter";
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
import { Dashboard } from "./components/Dashboard";

const AppContent: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [securityAnalysis, setSecurityAnalysis] =
    useState<SecurityAnalysis | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [recentAlerts, setRecentAlerts] = useState<unknown[]>([]);
  const [fraudStats, setFraudStats] = useState({
    totalTransactions: 2847293,
    fraudDetected: 1247,
    fraudPrevented: 98.2,
    riskScore: 23,
  });

  // Update activeTab based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") {
      setActiveTab("dashboard");
    } else if (path === "/fraud") {
      setActiveTab("fraud");
    } else if (path === "/credit") {
      setActiveTab("credit");
    } else if (path === "/security") {
      setActiveTab("security");
    }
  }, [location.pathname]);

  // Initialize and update sophisticated fraud data
  useEffect(() => {
    // Generate initial alerts using Ghanaian fraud patterns
    const initialAlerts = DataAdapter.generateRealtimeFraudAlerts(5);
    setRecentAlerts(initialAlerts);

    // Initialize fraud stats from dataset patterns
    const initialStats = DataAdapter.getSystemMetrics();
    setFraudStats({
      totalTransactions: initialStats.totalTransactions,
      fraudDetected: initialStats.fraudDetected,
      fraudPrevented: parseFloat(initialStats.fraudPrevented),
      riskScore: initialStats.riskScore,
    });

    // Update alerts every 12 seconds with realistic patterns
    const alertInterval = setInterval(() => {
      const newAlerts = DataAdapter.generateRealtimeFraudAlerts(1);
      if (newAlerts.length > 0) {
        setRecentAlerts(prev => [newAlerts[0], ...prev.slice(0, 4)]);
      }
      
      // Update fraud stats with realistic patterns
      if (Math.random() > 0.6) {
        const updatedStats = DataAdapter.getSystemMetrics();
        setFraudStats({
          totalTransactions: updatedStats.totalTransactions,
          fraudDetected: updatedStats.fraudDetected,
          fraudPrevented: parseFloat(updatedStats.fraudPrevented),
          riskScore: updatedStats.riskScore,
        });
      }
    }, 12000);

    return () => clearInterval(alertInterval);
  }, []);

  // If not authenticated, show auth modal
  if (!isAuthenticated) {
    return (
      <>
        <div
          className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
            isDark
              ? "bg-gray-900 text-white"
              : "bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900"
          }`}
        >
          <div className="text-center space-y-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
                SecureCredit
              </h1>
              <p
                className={`text-xl mb-8 max-w-2xl ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
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

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "fraud", label: "Fraud Detection", icon: AlertTriangle },
    { id: "credit", label: "Credit Scoring", icon: TrendingUp },
    { id: "security", label: "Device Security", icon: Shield },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setShowMobileSidebar(false);

    // Navigate to the appropriate route
    switch (tabId) {
      case "dashboard":
        navigate("/dashboard");
        break;
      case "fraud":
        navigate("/fraud");
        break;
      case "credit":
        navigate("/credit");
        break;
      case "security":
        navigate("/security");
        break;
      default:
        navigate("/dashboard");
    }
  };
  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header */}
      <header
        className={`transition-colors duration-300 border-b ${
          isDark
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200 shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileSidebar(true)}
                className={`md:hidden p-2 rounded-lg transition-colors ${
                  isDark
                    ? "hover:bg-gray-700 text-white"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1
                  className={`text-xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  SecureCredit
                </h1>
                <p
                  className={`text-xs ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
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
              <div
                className={`flex items-center space-x-1 sm:space-x-3 border-l pl-2 sm:pl-4 ${
                  isDark ? "border-gray-700" : "border-gray-200"
                }`}
              >
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark
                      ? "hover:bg-gray-700 text-gray-300 hover:text-white"
                      : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                  }`}
                  title={`Switch to ${isDark ? "light" : "dark"} mode`}
                >
                  {isDark ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </button>
                <div className="hidden sm:block">
                  <button
                    onClick={() => setShowNotifications(true)}
                    className={`relative p-2 rounded-lg transition-colors ${
                      isDark
                        ? "hover:bg-gray-700 text-gray-300"
                        : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  </button>
                </div>

                <button
                  onClick={() => setShowUserProfile(true)}
                  className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                    isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                  }`}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p
                      className={`text-xs lg:text-sm font-medium ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p
                      className={`text-xs capitalize ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {user?.role}
                    </p>
                  </div>
                </button>

                <button
                  onClick={logout}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark
                      ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                      : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
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
          <div
            className={`fixed left-0 top-0 h-full w-80 border-r transform transition-all duration-300 ease-in-out ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            {/* Sidebar Header */}
            <div
              className={`flex items-center justify-between p-4 border-b transition-colors duration-300 ${
                isDark ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1
                    className={`text-lg font-bold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    SecureCredit
                  </h1>
                  <p
                    className={`text-xs ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    AI-Powered Financial Security
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMobileSidebar(false)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark
                    ? "hover:bg-gray-700 text-gray-400"
                    : "hover:bg-gray-100 text-gray-600"
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
            <div
              className={`absolute bottom-0 left-0 right-0 p-4 border-t transition-colors duration-300 ${
                isDark ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p
                    className={`text-xs capitalize ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
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
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <Bell
                    className={`w-4 h-4 ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Notifications
                  </span>
                </button>

                <button
                  onClick={() => {
                    setShowUserProfile(true);
                    setShowMobileSidebar(false);
                  }}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg transition-colors ${
                    isDark
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <User
                    className={`w-4 h-4 ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Profile
                  </span>
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
      <div
        className={`border-b transition-colors duration-300 ${
          isDark
            ? "bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-gray-700"
            : "bg-gradient-to-r from-blue-50 to-purple-50 border-gray-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-4">
          <p className={`${isDark ? "text-blue-300" : "text-blue-700"}`}>
            Welcome back,{" "}
            <span className="font-semibold">{user?.firstName}</span>! Your
            account is secure and ready.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                fraudStats={fraudStats}
                recentAlerts={recentAlerts}
                onNavigate={handleNavClick}
                onShowNotifications={() => setShowNotifications(true)}
              />
            }
          />
          <Route
            path="/dashboard"
            element={
              <Dashboard
                fraudStats={fraudStats}
                recentAlerts={recentAlerts}
                onNavigate={handleNavClick}
                onShowNotifications={() => setShowNotifications(true)}
              />
            }
          />
          <Route path="/fraud" element={<FraudDetectionCenter />} />
          <Route path="/credit" element={<EnhancedCreditScoring />} />
          <Route path="/security" element={<EnhancedSecurityDashboard />} />
        </Routes>
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
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <FraudDetectionProvider>
            <AppContent />
          </FraudDetectionProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
