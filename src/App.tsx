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
  const mobileMenuButtonRef = React.useRef<HTMLButtonElement>(null);
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

  // Handle keyboard events and focus management for mobile sidebar
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showMobileSidebar) {
        closeMobileSidebar();
      }
    };

    if (showMobileSidebar) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when sidebar is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showMobileSidebar]);

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
    // Close mobile sidebar when navigation item is selected
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

  const closeMobileSidebar = () => {
    setShowMobileSidebar(false);
    // Return focus to the menu button when closing
    setTimeout(() => {
      mobileMenuButtonRef.current?.focus();
    }, 100);
  };
  return (
    <div
      className={`min-h-screen flex transition-colors duration-300 ${
        isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Desktop Sidebar */}
      <div
        className={`hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 transition-colors duration-300 ${
          isDark
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200 shadow-lg"
        } border-r`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="ml-3">
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

        {/* Navigation */}
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full transition-colors ${
                  activeTab === item.id
                    ? "bg-blue-600 text-white"
                    : isDark
                    ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <IconComponent
                  className={`mr-3 flex-shrink-0 h-6 w-6 ${
                    activeTab === item.id
                      ? "text-white"
                      : isDark
                      ? "text-gray-400 group-hover:text-gray-300"
                      : "text-gray-400 group-hover:text-gray-500"
                  }`}
                />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className={`flex-shrink-0 flex border-t p-4 ${
          isDark ? "border-gray-700" : "border-gray-200"
        }`}>
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="ml-3 flex-1">
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
              <div className="flex items-center">
                <button
                  onClick={logout}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isDark
                      ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                      : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                  }`}
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40">
        <div
          className={`flex h-16 flex-shrink-0 items-center gap-x-4 border-b px-4 shadow-sm sm:gap-x-6 sm:px-6 ${
            isDark
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <button
            ref={mobileMenuButtonRef}
            type="button"
            className={`-m-2.5 p-2.5 rounded-md transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              isDark ? "text-gray-400 hover:text-gray-300" : "text-gray-700 hover:text-gray-900"
            } md:hidden`}
            onClick={() => setShowMobileSidebar(true)}
            aria-label="Open sidebar"
            aria-expanded={showMobileSidebar}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1
                className={`text-lg font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                SecureCredit
              </h1>
            </div>
            <div className="flex flex-1 justify-end">
              <div className="flex items-center gap-x-4 lg:gap-x-6">
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

                {/* Notifications */}
                <button
                  onClick={() => setShowNotifications(true)}
                  className={`relative p-2 rounded-lg transition-colors ${
                    isDark
                      ? "hover:bg-gray-700 text-gray-300"
                      : "hover:bg-gray-100 text-gray-600"
                  }`}
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                </button>

                {/* User Profile */}
                <button
                  onClick={() => setShowUserProfile(true)}
                  className={`flex items-center gap-x-3 px-3 py-2 text-sm font-semibold leading-6 rounded-lg transition-colors ${
                    isDark 
                      ? "text-white hover:bg-gray-700" 
                      : "text-gray-900 hover:bg-gray-100"
                  }`}
                  title="User Profile"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden lg:block">
                    {user?.firstName} {user?.lastName}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Mobile Sidebar */}
      <div className={`relative z-50 lg:hidden transition-opacity duration-300 ${
        showMobileSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        {/* Backdrop overlay with click-outside-to-close */}
        <div 
          className={`fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ${
            showMobileSidebar ? 'opacity-100' : 'opacity-0'
          }`} 
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
        
        <div className="fixed inset-0 flex">
          <div
            className={`relative mr-16 flex w-full max-w-xs flex-1 transform transition-transform duration-300 ease-in-out ${
              showMobileSidebar ? 'translate-x-0' : '-translate-x-full'
            } ${isDark ? "bg-gray-800" : "bg-white"} shadow-xl`}
          >
            {/* Close button */}
            <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
              <button
                type="button"
                className="-m-2.5 p-2.5 rounded-md hover:bg-gray-900/20 transition-colors duration-200"
                onClick={closeMobileSidebar}
                aria-label="Close sidebar"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-2">
              {/* Sidebar Header */}
              <div className="flex h-16 shrink-0 items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div className="ml-3">
                  <h1
                    className={`text-lg font-bold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    SecureCredit
                  </h1>
                </div>
              </div>
              
              {/* Navigation */}
              <nav className="flex flex-1 flex-col">
                <ul className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul className="-mx-2 space-y-1">
                      {navigationItems.map((item) => {
                        const IconComponent = item.icon;
                        return (
                          <li key={item.id}>
                            <button
                              onClick={() => handleNavClick(item.id)}
                              className={`group flex items-center gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold w-full transition-colors duration-200 min-h-[44px] ${
                                activeTab === item.id
                                  ? "bg-blue-600 text-white"
                                  : isDark
                                  ? "text-gray-300 hover:text-white hover:bg-gray-700"
                                  : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                              }`}
                            >
                              <IconComponent className="h-6 w-6 shrink-0" />
                              {item.label}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                  
                  {/* User section at bottom */}
                  <li className="mt-auto">
                    <div className={`flex items-center gap-x-4 px-3 py-3 text-sm font-semibold leading-6 border-t ${
                      isDark ? "border-gray-700" : "border-gray-200"
                    }`}>
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className={isDark ? "text-white" : "text-gray-900"}>
                        {user?.firstName} {user?.lastName}
                      </span>
                    </div>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 md:pl-64">
        {/* Mobile spacing for fixed header */}
        <div className="md:hidden h-16"></div>
        
        {/* Desktop Header */}
        <div className="hidden md:block">
          <div
            className={`sticky top-0 z-30 flex h-16 flex-shrink-0 items-center gap-x-4 border-b px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex flex-1 justify-end">
              <div className="flex items-center gap-x-4 lg:gap-x-6">
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

                {/* Notifications */}
                <button
                  onClick={() => setShowNotifications(true)}
                  className={`relative p-2 rounded-lg transition-colors ${
                    isDark
                      ? "hover:bg-gray-700 text-gray-300"
                      : "hover:bg-gray-100 text-gray-600"
                  }`}
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                </button>

                {/* User Profile */}
                <button
                  onClick={() => setShowUserProfile(true)}
                  className={`flex items-center gap-x-3 px-3 py-2 text-sm font-semibold leading-6 rounded-lg transition-colors ${
                    isDark 
                      ? "text-white hover:bg-gray-700" 
                      : "text-gray-900 hover:bg-gray-100"
                  }`}
                  title="User Profile"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden lg:block">
                    {user?.firstName} {user?.lastName}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Welcome Message */}
        <div className={`border-b transition-colors duration-300 ${
          isDark 
            ? 'bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-gray-700' 
            : 'bg-gradient-to-r from-blue-50 to-purple-50 border-gray-200'
        }`}>
          <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
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
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <Routes>
            <Route path="/" element={<Dashboard 
              fraudStats={fraudStats} 
              recentAlerts={recentAlerts} 
              onNavigate={handleNavClick}
              onShowNotifications={() => setShowNotifications(true)}
            />} />
            <Route path="/dashboard" element={<Dashboard 
              fraudStats={fraudStats} 
              recentAlerts={recentAlerts} 
              onNavigate={handleNavClick}
              onShowNotifications={() => setShowNotifications(true)}
            />} />
            <Route path="/fraud" element={<FraudDetectionCenter />} />
            <Route path="/credit" element={<EnhancedCreditScoring />} />
            <Route path="/security" element={<EnhancedSecurityDashboard />} />
          </Routes>
        </main>
      </div>

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
