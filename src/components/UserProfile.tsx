import React, { useState } from 'react';
import { User, Settings, LogOut, Shield, Bell, CreditCard, Activity, Brain } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { AISettings } from './AISettings';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [showAISettings, setShowAISettings] = useState(false);

  if (!isOpen || !user) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className={`rounded-2xl border w-full max-w-2xl max-h-[90vh] overflow-hidden transition-colors duration-300 ${
        isDark 
          ? 'bg-gray-900 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-blue-100">{user.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  user.isVerified 
                    ? 'bg-green-500/20 text-green-300' 
                    : 'bg-yellow-500/20 text-yellow-300'
                }`}>
                  {user.isVerified ? 'Verified' : 'Unverified'}
                </span>
                <span className="px-2 py-1 text-xs bg-white/20 text-white rounded-full capitalize">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={`flex border-b transition-colors duration-300 ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : isDark 
                  ? 'text-gray-400 hover:text-white' 
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'security'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : isDark 
                  ? 'text-gray-400 hover:text-white' 
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Security
          </button>
          <button
            onClick={() => setActiveTab('ai-settings')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'ai-settings'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : isDark 
                  ? 'text-gray-400 hover:text-white' 
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            AI Settings
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'activity'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : isDark 
                  ? 'text-gray-400 hover:text-white' 
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Activity
          </button>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    First Name
                  </label>
                  <input
                    type="text"
                    value={user.firstName}
                    className={`w-full px-3 py-2 border rounded-lg transition-colors duration-300 ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-white' 
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                    readOnly
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={user.lastName}
                    className={`w-full px-3 py-2 border rounded-lg transition-colors duration-300 ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-white' 
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                    readOnly
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={user.email}
                  className={`w-full px-3 py-2 border rounded-lg transition-colors duration-300 ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 text-white' 
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                  readOnly
                />
              </div>

              {user.phone && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={user.phone}
                    className={`w-full px-3 py-2 border rounded-lg transition-colors duration-300 ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-white' 
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                    readOnly
                  />
                </div>
              )}

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Country
                </label>
                <input
                  type="text"
                  value={user.country}
                  className={`w-full px-3 py-2 border rounded-lg transition-colors duration-300 ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 text-white' 
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                  readOnly
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Member Since
                </label>
                <input
                  type="text"
                  value={new Date(user.createdAt).toLocaleDateString()}
                  className={`w-full px-3 py-2 border rounded-lg transition-colors duration-300 ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 text-white' 
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                  readOnly
                />
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className={`flex items-center justify-between p-4 rounded-lg transition-colors duration-300 ${
                isDark ? 'bg-gray-800' : 'bg-gray-50'
              }`}>
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-green-400" />
                  <div>
                    <p className={`font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>Two-Factor Authentication</p>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>Add an extra layer of security</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                  Enable
                </button>
              </div>

              <div className={`flex items-center justify-between p-4 rounded-lg transition-colors duration-300 ${
                isDark ? 'bg-gray-800' : 'bg-gray-50'
              }`}>
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className={`font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>Security Notifications</p>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>Get alerts for suspicious activity</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors">
                  Enabled
                </button>
              </div>

              <div className={`flex items-center justify-between p-4 rounded-lg transition-colors duration-300 ${
                isDark ? 'bg-gray-800' : 'bg-gray-50'
              }`}>
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className={`font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>Device Management</p>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>Manage trusted devices</p>
                  </div>
                </div>
                <button className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  isDark 
                    ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}>
                  Manage
                </button>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-yellow-400 text-sm">
                  <strong>Security Tip:</strong> Regularly review your account activity and enable two-factor authentication for enhanced security.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'ai-settings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className={`font-medium ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>AI Configuration</h4>
                <button
                  onClick={() => setShowAISettings(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors flex items-center space-x-2"
                >
                  <Brain className="w-4 h-4" />
                  <span>Open AI Settings</span>
                </button>
              </div>
              
              <div className={`p-4 rounded-lg transition-colors duration-300 ${
                isDark ? 'bg-gray-800' : 'bg-gray-50'
              }`}>
                <p className={`text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Configure AI service settings, manage API keys, monitor usage, and control AI features. 
                  Access advanced configuration options to optimize AI performance for your needs.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg transition-colors duration-300 ${
                  isDark ? 'bg-gray-800' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center space-x-3 mb-2">
                    <Shield className="w-5 h-5 text-green-400" />
                    <span className={`font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>Fraud Detection</span>
                  </div>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>AI-powered fraud analysis</p>
                </div>

                <div className={`p-4 rounded-lg transition-colors duration-300 ${
                  isDark ? 'bg-gray-800' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center space-x-3 mb-2">
                    <CreditCard className="w-5 h-5 text-blue-400" />
                    <span className={`font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>Credit Scoring</span>
                  </div>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Enhanced credit assessment</p>
                </div>

                <div className={`p-4 rounded-lg transition-colors duration-300 ${
                  isDark ? 'bg-gray-800' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center space-x-3 mb-2">
                    <Shield className="w-5 h-5 text-yellow-400" />
                    <span className={`font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>Security Analysis</span>
                  </div>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Device security monitoring</p>
                </div>

                <div className={`p-4 rounded-lg transition-colors duration-300 ${
                  isDark ? 'bg-gray-800' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center space-x-3 mb-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <span className={`font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>General Insights</span>
                  </div>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Business intelligence</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <div className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-300 ${
                isDark ? 'bg-gray-800' : 'bg-gray-50'
              }`}>
                <Activity className="w-5 h-5 text-green-400" />
                <div>
                  <p className={`text-sm ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Successful login</p>
                  <p className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                  </p>
                </div>
              </div>

              <div className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-300 ${
                isDark ? 'bg-gray-800' : 'bg-gray-50'
              }`}>
                <Shield className="w-5 h-5 text-blue-400" />
                <div>
                  <p className={`text-sm ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Security scan completed</p>
                  <p className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>2 hours ago</p>
                </div>
              </div>

              <div className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-300 ${
                isDark ? 'bg-gray-800' : 'bg-gray-50'
              }`}>
                <CreditCard className="w-5 h-5 text-purple-400" />
                <div>
                  <p className={`text-sm ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Credit score updated</p>
                  <p className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>1 day ago</p>
                </div>
              </div>
            </div>
          )}


        </div>

        <div className={`border-t p-6 flex justify-between transition-colors duration-300 ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg transition-colors ${
              isDark 
                ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
            }`}
          >
            Close
          </button>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* AI Settings Modal */}
      <AISettings
        isOpen={showAISettings}
        onClose={() => setShowAISettings(false)}
      />
    </div>
  );
};