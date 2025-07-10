import React, { useState } from 'react';
import { User, Settings, LogOut, Shield, Bell, CreditCard, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

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
      <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden">
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

        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'security'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Security
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'activity'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={user.firstName}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={user.lastName}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    readOnly
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user.email}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  readOnly
                />
              </div>

              {user.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={user.phone}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    readOnly
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={user.country}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Member Since
                </label>
                <input
                  type="text"
                  value={new Date(user.createdAt).toLocaleDateString()}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  readOnly
                />
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-white font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-400">Add an extra layer of security</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                  Enable
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-white font-medium">Security Notifications</p>
                    <p className="text-sm text-gray-400">Get alerts for suspicious activity</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors">
                  Enabled
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">Device Management</p>
                    <p className="text-sm text-gray-400">Manage trusted devices</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors">
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

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                <Activity className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-white text-sm">Successful login</p>
                  <p className="text-gray-400 text-xs">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                <Shield className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-white text-sm">Security scan completed</p>
                  <p className="text-gray-400 text-xs">2 hours ago</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                <CreditCard className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-white text-sm">Credit score updated</p>
                  <p className="text-gray-400 text-xs">1 day ago</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-700 p-6 flex justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
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
    </div>
  );
};