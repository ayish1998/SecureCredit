import React, { useState, useEffect } from 'react';
import {
  Shield,
  Smartphone,
  Monitor,
  Wifi,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Eye,
  Settings,
  RefreshCw,
  Filter,
  Download,
  MoreVertical
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface DeviceAnalysis {
  trustScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  deviceConsistency: number;
  lastSeen: Date;
  fingerprintStability: number;
  suspiciousActivityCount: number;
  securityFlags: string[];
  recommendations: string[];
}

interface DeviceFingerprint {
  deviceId: string;
  userAgent: string;
  screenResolution: string;
  platform: string;
  ipAddress: string;
  timezone: string;
  language: string;
  hardwareConcurrency: number;
  deviceMemory?: number;
  touchSupport: boolean;
  canvas: string;
  webgl: string;
}

interface DeviceChangeEvent {
  timestamp: Date;
  changeType: 'HARDWARE' | 'SOFTWARE' | 'NETWORK' | 'BEHAVIOR';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  component: string;
  description: string;
  riskImpact: number;
}

const DeviceIntelligenceDashboard: React.FC = () => {
  const { isDark } = useTheme();
  const [selectedUserId, setSelectedUserId] = useState<string>('user-123');
  const [deviceAnalysis, setDeviceAnalysis] = useState<DeviceAnalysis | null>(null);
  const [deviceFingerprint, setDeviceFingerprint] = useState<DeviceFingerprint | null>(null);
  const [changeEvents, setChangeEvents] = useState<DeviceChangeEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'fingerprint' | 'timeline' | 'network'>('overview');

  useEffect(() => {
    loadDeviceIntelligence();
  }, [selectedUserId]);

  const loadDeviceIntelligence = async () => {
    setIsLoading(true);
    
    // Simulate API calls - replace with actual service calls
    setTimeout(() => {
      setDeviceAnalysis({
        trustScore: 85,
        riskLevel: 'LOW',
        deviceConsistency: 92,
        lastSeen: new Date(),
        fingerprintStability: 88,
        suspiciousActivityCount: 0,
        securityFlags: [],
        recommendations: ['Device appears secure', 'Continue monitoring']
      });

      setDeviceFingerprint({
        deviceId: 'fp_abc123def456',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        screenResolution: '1920x1080',
        platform: 'Win32',
        ipAddress: '192.168.1.100',
        timezone: 'America/New_York',
        language: 'en-US',
        hardwareConcurrency: 8,
        deviceMemory: 8,
        touchSupport: false,
        canvas: 'canvas_hash_abc123',
        webgl: 'webgl_hash_def456'
      });

      setChangeEvents([
        {
          timestamp: new Date(Date.now() - 86400000),
          changeType: 'SOFTWARE',
          severity: 'LOW',
          component: 'Browser Version',
          description: 'Browser updated from Chrome 118 to Chrome 119',
          riskImpact: 5
        },
        {
          timestamp: new Date(Date.now() - 172800000),
          changeType: 'NETWORK',
          severity: 'MEDIUM',
          component: 'IP Address',
          description: 'IP address changed from 192.168.1.99 to 192.168.1.100',
          riskImpact: 15
        }
      ]);

      setIsLoading(false);
    }, 1000);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW': return 'text-green-400 bg-green-400/10';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-400/10';
      case 'HIGH': return 'text-orange-400 bg-orange-400/10';
      case 'CRITICAL': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'LOW': return 'text-green-400';
      case 'MEDIUM': return 'text-yellow-400';
      case 'HIGH': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getChangeTypeIcon = (changeType: string) => {
    switch (changeType) {
      case 'HARDWARE': return <Monitor className="w-4 h-4" />;
      case 'SOFTWARE': return <Settings className="w-4 h-4" />;
      case 'NETWORK': return <Wifi className="w-4 h-4" />;
      case 'BEHAVIOR': return <Activity className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen p-6 transition-colors duration-300 ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Device Intelligence</h1>
            <p className={`mt-2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Comprehensive device security analysis and fingerprinting</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={loadDeviceIntelligence}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            
            <button className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? 'hover:bg-gray-800 text-gray-400' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}>
              <Filter className="w-5 h-5" />
            </button>
            
            <button className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? 'hover:bg-gray-800 text-gray-400' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}>
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Device Trust Score */}
        <div className={`rounded-xl p-6 border transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Device Trust</p>
                <p className={`text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>{deviceAnalysis?.trustScore}%</p>
              </div>
            </div>
            <div className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(deviceAnalysis?.riskLevel || 'LOW')}`}>
              {deviceAnalysis?.riskLevel}
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-green-400">+2% from last week</span>
          </div>
        </div>

        {/* Device Consistency */}
        <div className={`rounded-xl p-6 border transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Consistency</p>
                <p className={`text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>{deviceAnalysis?.deviceConsistency}%</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Stable patterns</span>
          </div>
        </div>

        {/* Fingerprint Stability */}
        <div className={`rounded-xl p-6 border transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Eye className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Fingerprint Stability</p>
                <p className={`text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>{deviceAnalysis?.fingerprintStability}%</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Last seen: Just now</span>
          </div>
        </div>

        {/* Security Alerts */}
        <div className={`rounded-xl p-6 border transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Security Alerts</p>
                <p className={`text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>{deviceAnalysis?.suspiciousActivityCount}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-green-400">All clear</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={`border-b mb-6 ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Shield },
            { id: 'fingerprint', label: 'Device Fingerprint', icon: Smartphone },
            { id: 'timeline', label: 'Change Timeline', icon: Clock },
            { id: 'network', label: 'Network Analysis', icon: Wifi }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : `border-transparent ${
                      isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                    }`
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Security Recommendations */}
            <div className={`rounded-xl p-6 border transition-colors duration-300 ${
              isDark 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Security Recommendations</h3>
              
              <div className="space-y-3">
                {deviceAnalysis?.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className={`text-sm ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Flags */}
            <div className={`rounded-xl p-6 border transition-colors duration-300 ${
              isDark 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Security Flags</h3>
              
              {deviceAnalysis?.securityFlags.length === 0 ? (
                <div className="flex items-center space-x-3 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">No security concerns detected</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {deviceAnalysis?.securityFlags.map((flag, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                      <span className={`text-sm ${
 