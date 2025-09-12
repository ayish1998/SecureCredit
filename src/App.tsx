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
import { SecurityAnalysis } from "./utils/fingerprint";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { FraudDetectionProvider } from "./contexts/FraudDetectionContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { AuthModal } from "./components/auth/AuthModal";
import { UserProfile } from "./components/UserProfile";
import { EnhancedNotifications } from "./components/EnhancedNotifications";
import { EnhancedFraudCenter } from "./components/EnhancedFraudCenter";
import { EnhancedCreditScoring } from "./components/EnhancedCreditScoring";
import { EnhancedSecurityDashboard } from "./components/EnhancedSecurityDashboard";
import { ModernDashboard } from "./components/ModernDashboard";

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

  // If not authenticated, show enhanced landing page
  if (!isAuthenticated) {
    return (
      <>
        <div
          className={`min-h-screen relative overflow-hidden transition-all duration-500 ${
            isDark
              ? "bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 text-white"
              : "bg-gradient-to-br from-blue-50 via-white to-purple-50/30 text-gray-900"
          }`}
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 animate-float ${
              isDark ? 'bg-blue-500' : 'bg-blue-400'
            }`}></div>
            <div className={`absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-10 animate-float delay-1000 ${
              isDark ? 'bg-purple-500' : 'bg-purple-400'
            }`}></div>
            <div className={`absolute top-1/2 right-1/3 w-32 h-32 rounded-full opacity-10 animate-bounce-gentle ${
              isDark ? 'bg-green-500' : 'bg-green-400'
            }`}></div>
          </div>

          <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
            <div className="text-center space-y-12 max-w-4xl mx-auto">
              {/* Logo and Brand */}
              <div className="space-y-6 animate-fade-in">
                <div className="relative mx-auto">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl animate-glow">
                    <Shield className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                
                <div>
                  <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-6 animate-gradient">
                    SecureCredit
                  </h1>
                  <p className="text-lg md:text-xl font-medium text-gradient-primary mb-4">
                    AI-Powered Financial Security Platform
                  </p>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up">
                <div className={`p-6 rounded-2xl backdrop-blur-xl border transition-all duration-300 hover-lift ${
                  isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80 border-gray-200/50'
                }`}>
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gradient-danger mb-2">Fraud Detection</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Advanced AI algorithms detect and prevent fraud in real-time across Africa's mobile money networks
                  </p>
                </div>

                <div className={`p-6 rounded-2xl backdrop-blur-xl border transition-all duration-300 hover-lift ${
                  isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80 border-gray-200/50'
                }`}>
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gradient-success mb-2">Credit Scoring</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    AI-enhanced credit assessment using alternative data sources for accurate financial profiling
                  </p>
                </div>

                <div className={`p-6 rounded-2xl backdrop-blur-xl border transition-all duration-300 hover-lift ${
                  isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80 border-gray-200/50'
                }`}>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gradient-primary mb-2">Security Intelligence</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Comprehensive security monitoring and threat intelligence for financial institutions
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-slide-up">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gradient-primary mb-2">98.7%</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Fraud Prevention</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gradient-success mb-2">2.8M+</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Transactions Secured</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gradient-warning mb-2">15+</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>African Countries</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gradient-danger mb-2">24/7</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>AI Monitoring</div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="space-y-6 animate-scale-in">
                <p className={`text-lg max-w-3xl mx-auto ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}>
                  Join the future of financial security in Africa. Our AI-powered platform protects millions of transactions daily while enabling financial inclusion across the continent.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="btn-primary text-lg px-8 py-4 shadow-2xl hover:shadow-blue-500/25"
                  >
                    <span>Get Started</span>
                    <Zap className="w-5 h-5 ml-2" />
                  </button>
                  
                  <button
                    onClick={toggleTheme}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className={`flex justify-center items-center space-x-8 pt-8 border-t ${
                isDark ? 'border-gray-700/50' : 'border-gray-200/50'
              }`}>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Bank-Grade Security
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    AI-Powered
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-blue-400" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Africa-Focused
                  </span>
                </div>
              </div>
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
      className={`min-h-screen flex transition-all duration-500 ease-in-out ${
        isDark 
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white" 
          : "bg-gradient-to-br from-gray-50 via-white to-blue-50/30 text-gray-900"
      }`}
    >
      {/* Desktop Sidebar */}
      <div
        className={`hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 transition-all duration-500 ease-in-out backdrop-blur-xl ${
          isDark
            ? "bg-gray-800/95 border-gray-700/50 shadow-2xl shadow-blue-500/10"
            : "bg-white/95 border-gray-200/50 shadow-2xl shadow-gray-900/10"
        } border-r`}
      >
        {/* Sidebar Header */}
        <div className={`flex items-center h-16 flex-shrink-0 px-4 border-b ${
          isDark ? 'border-gray-700/50' : 'border-gray-200/50'
        }`}>
          <div className="relative w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
            <Shield className="w-6 h-6 text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <div className="ml-3">
            <h1
              className={`text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent`}
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
        <nav className="mt-6 flex-1 px-3 space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl w-full transition-all duration-300 transform hover:scale-[1.02] ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                    : isDark
                    ? "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                    : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
                }`}
              >
                <div className={`p-1.5 rounded-lg mr-3 ${
                  isActive 
                    ? "bg-white/20" 
                    : isDark 
                    ? "bg-gray-600/30 group-hover:bg-gray-600/50" 
                    : "bg-gray-200/50 group-hover:bg-gray-300/50"
                }`}>
                  <IconComponent
                    className={`h-5 w-5 ${
                      isActive
                        ? "text-white"
                        : isDark
                        ? "text-gray-400 group-hover:text-gray-300"
                        : "text-gray-500 group-hover:text-gray-600"
                    }`}
                  />
                </div>
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
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
          className={`flex h-16 flex-shrink-0 items-center gap-x-4 border-b px-4 shadow-lg backdrop-blur-xl sm:gap-x-6 sm:px-6 ${
            isDark
              ? "bg-gray-800/95 border-gray-700/50"
              : "bg-white/95 border-gray-200/50"
          }`}
        >
          <button
            ref={mobileMenuButtonRef}
            type="button"
            className={`-m-2.5 p-2.5 rounded-md transition-colors duration-200 ${
              isDark 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' 
                : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
            } md:hidden`}
            onClick={() => setShowMobileSidebar(true)}
            aria-label="Open sidebar"
            aria-expanded={showMobileSidebar}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="relative w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <Shield className="w-5 h-5 text-white" />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <h1
                className={`text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent`}
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
                    <div className={`flex items-center justify-between px-3 py-3 text-sm font-semibold leading-6 border-t ${
                      isDark ? "border-gray-700" : "border-gray-200"
                    }`}>
                      <div className="flex items-center gap-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <span className={isDark ? "text-white" : "text-gray-900"}>
                          {user?.firstName} {user?.lastName}
                        </span>
                      </div>
                      <button
                        onClick={logout}
                        className={`p-2 rounded-lg transition-colors ${
                          isDark
                            ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                            : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                        }`}
                        title="Sign Out"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
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
        <div className={`border-b transition-all duration-500 ${
          isDark 
            ? 'bg-gradient-to-r from-gray-800/50 via-blue-900/20 to-purple-900/20 border-gray-700/50' 
            : 'bg-gradient-to-r from-blue-50/80 via-white to-purple-50/80 border-gray-200/50'
        }`}>
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
            <div className="flex items-center space-x-3">
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                isDark ? 'bg-green-400' : 'bg-green-500'
              }`}></div>
              <p className={`text-sm sm:text-base ${
                isDark ? 'text-blue-300' : 'text-blue-700'
              }`}>
                Welcome back,{" "}
                <span className="font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  {user?.firstName}
                </span>! Your account is secure and ready.
              </p>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                isDark 
                  ? 'bg-green-400/20 text-green-300' 
                  : 'bg-green-100 text-green-700'
              }`}>
                ✓ Secure
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className={`flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 transition-all duration-500 relative overflow-hidden ${
          isDark 
            ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
            : 'bg-gradient-to-br from-gray-50 via-white to-blue-50/30'
        }`}>
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-5 animate-pulse ${
              isDark ? 'bg-blue-500' : 'bg-blue-400'
            }`}></div>
            <div className={`absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full opacity-5 animate-pulse delay-1000 ${
              isDark ? 'bg-purple-500' : 'bg-purple-400'
            }`}></div>
          </div>
          
          <div className="relative z-10">
            <Routes>
              <Route path="/" element={<ModernDashboard 
                fraudStats={fraudStats} 
                recentAlerts={recentAlerts} 
                onNavigate={handleNavClick}
                onShowNotifications={() => setShowNotifications(true)}
              />} />
              <Route path="/dashboard" element={<ModernDashboard 
                fraudStats={fraudStats} 
                recentAlerts={recentAlerts} 
                onNavigate={handleNavClick}
                onShowNotifications={() => setShowNotifications(true)}
              />} />
              <Route path="/fraud" element={<EnhancedFraudCenter />} />
              <Route path="/credit" element={<EnhancedCreditScoring />} />
              <Route path="/security" element={<EnhancedSecurityDashboard />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Modals */}
      <UserProfile
        isOpen={showUserProfile}
        onClose={() => setShowUserProfile(false)}
      />
      <EnhancedNotifications
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
