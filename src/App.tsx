import React, { useState } from 'react';
import { Shield, Brain, TrendingUp, AlertTriangle, CheckCircle, Users, Globe, BarChart3, Lock, Zap, Bell, User, LogOut } from 'lucide-react';
import { SecurityDashboard } from './components/SecurityDashboard';
import { SecurityAnalysis } from './utils/fingerprint';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { UserProfile } from './components/UserProfile';
import { RealTimeNotifications } from './components/RealTimeNotifications';
import { FraudDetectionCenter } from './components/FraudDetectionCenter';
import { CreditScoringDashboard } from './components/CreditScoringDashboard';

const AppContent: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [securityAnalysis, setSecurityAnalysis] = useState<SecurityAnalysis | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // If not authenticated, show auth modal
  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
          <div className="text-center space-y-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
                SecureCredit
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl">
                AI-powered fraud detection and credit assessment platform for Africa's mobile money ecosystem
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-8 rounded-lg transition-all duration-200"
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
    riskScore: 23
  };

  const recentAlerts = [
    { id: 1, type: 'high', message: 'Unusual transaction pattern detected', time: '2 min ago', amount: '$2,450' },
    { id: 2, type: 'medium', message: 'New device login from Ghana', time: '5 min ago', amount: '$150' },
    { id: 3, type: 'low', message: 'Velocity check triggered', time: '8 min ago', amount: '$75' }
  ];

  const creditScores = [
    { name: 'Kwame Asante', score: 745, risk: 'Low', trend: 'up' },
    { name: 'Amina Okafor', score: 620, risk: 'Medium', trend: 'stable' },
    { name: 'Fatima Diallo', score: 580, risk: 'Medium', trend: 'down' },
    { name: 'John Mwangi', score: 820, risk: 'Low', trend: 'up' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-white">SecureCredit</h1>
                <p className="text-xs text-gray-400">AI-Powered Financial Security</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <nav className="hidden md:flex space-x-4 lg:space-x-6">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium transition-colors ${
                  activeTab === 'dashboard' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('fraud')}
                className={`px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium transition-colors ${
                  activeTab === 'fraud' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                Fraud Detection
              </button>
              <button
                onClick={() => setActiveTab('credit')}
                className={`px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium transition-colors ${
                  activeTab === 'credit' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                Credit Scoring
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium transition-colors ${
                  activeTab === 'security' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                Device Security
              </button>
            </nav>
              
              {/* Mobile Navigation */}
              <div className="md:hidden">
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                  className="bg-gray-700 text-white text-sm rounded-lg px-2 py-1 border border-gray-600"
                >
                  <option value="dashboard">Dashboard</option>
                  <option value="fraud">Fraud Detection</option>
                  <option value="credit">Credit Scoring</option>
                  <option value="security">Device Security</option>
                </select>
              </div>
              
              {/* User Actions */}
              <div className="flex items-center space-x-1 sm:space-x-3 border-l border-gray-700 pl-2 sm:pl-4">
                <div className="hidden sm:block">
                <button
                  onClick={() => setShowNotifications(true)}
                  className="relative p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5 text-gray-300" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                </button>
                </div>
                
                <button
                  onClick={() => setShowUserProfile(true)}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-xs lg:text-sm font-medium text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                  </div>
                </button>
                
                <button
                  onClick={logout}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-4">
          <p className="text-blue-300">
            Welcome back, <span className="font-semibold">{user?.firstName}</span>! Your account is secure and ready.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Securing Africa's Financial Future
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                AI-powered fraud detection and credit assessment platform specifically designed for African mobile money systems
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Transactions</p>
                    <p className="text-2xl font-bold text-white">{fraudStats.totalTransactions.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Fraud Detected</p>
                    <p className="text-2xl font-bold text-red-400">{fraudStats.fraudDetected.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Prevention Rate</p>
                    <p className="text-2xl font-bold text-green-400">{fraudStats.fraudPrevented}%</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Risk Score</p>
                    <p className="text-2xl font-bold text-yellow-400">{fraudStats.riskScore}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI-Powered Detection</h3>
                <p className="text-gray-400">Machine learning algorithms analyze transaction patterns to identify fraudulent activities in real-time.</p>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Credit Scoring</h3>
                <p className="text-gray-400">Intelligent credit assessment for unbanked populations using mobile money transaction history.</p>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Cybersecurity</h3>
                <p className="text-gray-400">Advanced security measures protect user data and prevent unauthorized access.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fraud' && (
          <FraudDetectionCenter />
        )}

        {activeTab === 'credit' && (
          <CreditScoringDashboard />
        )}

        {activeTab === 'security' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Device Security & Fingerprinting</h2>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full animate-pulse ${
                  securityAnalysis?.riskLevel === 'low' ? 'bg-green-400' :
                  securityAnalysis?.riskLevel === 'medium' ? 'bg-yellow-400' :
                  securityAnalysis?.riskLevel === 'high' ? 'bg-orange-400' :
                  securityAnalysis?.riskLevel === 'critical' ? 'bg-red-400' : 'bg-gray-400'
                }`}></div>
                <span className="text-sm text-gray-400">
                  Security Status: {securityAnalysis?.riskLevel?.toUpperCase() || 'CHECKING'}
                </span>
              </div>
            </div>

            <SecurityDashboard onSecurityUpdate={setSecurityAnalysis} />

            {/* Enhanced Security Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Device Fingerprinting</h3>
                <p className="text-gray-400 mb-4">Advanced browser fingerprinting technology identifies unique device characteristics for fraud prevention.</p>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Hardware configuration analysis</li>
                  <li>• Browser environment detection</li>
                  <li>• Behavioral pattern recognition</li>
                  <li>• Real-time risk assessment</li>
                </ul>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI-Powered Analysis</h3>
                <p className="text-gray-400 mb-4">Machine learning algorithms analyze device patterns to detect suspicious activities and potential threats.</p>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Anomaly detection algorithms</li>
                  <li>• Behavioral analytics</li>
                  <li>• Risk scoring models</li>
                  <li>• Predictive threat assessment</li>
                </ul>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Privacy Protection</h3>
                <p className="text-gray-400 mb-4">All fingerprinting is done client-side with privacy-first approach, ensuring user data protection.</p>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Client-side processing only</li>
                  <li>• No personal data collection</li>
                  <li>• GDPR compliant methods</li>
                  <li>• Transparent security measures</li>
                </ul>
              </div>
            </div>

            {/* Security Metrics */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Security Performance Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">99.7%</div>
                  <div className="text-sm text-gray-400">Device Recognition</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">95.3%</div>
                  <div className="text-sm text-gray-400">Fraud Prevention</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">0.1%</div>
                  <div className="text-sm text-gray-400">False Positives</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">&lt;50ms</div>
                  <div className="text-sm text-gray-400">Analysis Time</div>
                </div>
              </div>
            </div>
          </div>
        )}
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
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;