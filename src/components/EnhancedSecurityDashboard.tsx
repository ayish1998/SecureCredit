import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  Smartphone, 
  Globe, 
  Lock, 
  Unlock,
  MapPin,
  Clock,
  Wifi,
  Monitor,
  Fingerprint,
  Activity,
  Zap,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Navigation,
  Satellite,
  Radio
} from 'lucide-react';
import { geolocationService } from '../utils/geolocation';
import { useTheme } from '../contexts/ThemeContext';

interface SecurityMetrics {
  deviceTrust: number;
  locationRisk: number;
  networkSecurity: number;
  behaviorScore: number;
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
}

interface DeviceInfo {
  id: string;
  type: string;
  os: string;
  browser: string;
  lastSeen: string;
  location: string;
  trustScore: number;
  isActive: boolean;
  riskFactors: string[];
}

interface SecurityEvent {
  id: string;
  type: 'login' | 'suspicious' | 'blocked' | 'verified';
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  location: string;
  device: string;
}

interface LocationInfo {
  city: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  isp: string;
  timezone: string;
  lastUpdated: string;
}

export const EnhancedSecurityDashboard: React.FC = () => {
  const { isDark } = useTheme();
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    deviceTrust: 85,
    locationRisk: 15,
    networkSecurity: 92,
    behaviorScore: 78,
    overallRisk: 'low'
  });

  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [showDeviceDetails, setShowDeviceDetails] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceInfo | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationInfo | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [locationHistory, setLocationHistory] = useState<LocationInfo[]>([]);

  useEffect(() => {
    // Start real-time location tracking
    const initializeLocation = async () => {
      try {
        setIsLocationLoading(true);
        
        // Simulate location detection with realistic data
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const mockLocation: LocationInfo = {
          city: 'Accra',
          country: 'Ghana',
          region: 'Greater Accra Region',
          latitude: 5.6037,
          longitude: -0.1870,
          accuracy: 50,
          isp: 'MTN Ghana',
          timezone: 'GMT+0',
          lastUpdated: new Date().toISOString()
        };
        
        setCurrentLocation(mockLocation);
        setLocationHistory(prev => [mockLocation, ...prev.slice(0, 9)]);
        
        // Update security metrics based on location
        setSecurityMetrics(prev => ({
          ...prev,
          locationRisk: mockLocation.accuracy && mockLocation.accuracy > 1000 ? 25 : 10
        }));
        
      } catch (error) {
        console.error('Failed to get location:', error);
        
        // Fallback location
        const fallbackLocation: LocationInfo = {
          city: 'Unknown',
          country: 'Unknown',
          region: 'Unknown',
          latitude: 0,
          longitude: 0,
          accuracy: undefined,
          isp: 'Unknown ISP',
          timezone: 'Unknown',
          lastUpdated: new Date().toISOString()
        };
        
        setCurrentLocation(fallbackLocation);
      } finally {
        setIsLocationLoading(false);
      }
    };

    initializeLocation();

    // Simulate periodic location updates (optional)
    const locationUpdateInterval = setInterval(() => {
      if (currentLocation) {
        // Simulate minor location changes
        const updatedLocation: LocationInfo = {
          ...currentLocation,
          accuracy: Math.floor(Math.random() * 100) + 20,
          lastUpdated: new Date().toISOString()
        };
        
        setCurrentLocation(updatedLocation);
      }
    }, 30000); // Update every 30 seconds

    // Initialize with sample data
    const sampleDevices: DeviceInfo[] = [
      {
        id: '1',
        type: 'Mobile',
        os: 'Android 13',
        browser: 'Chrome 120',
        lastSeen: '2 minutes ago',
        location: 'Accra, Ghana',
        trustScore: 95,
        isActive: true,
        riskFactors: []
      },
      {
        id: '2',
        type: 'Desktop',
        os: 'Windows 11',
        browser: 'Edge 120',
        lastSeen: '1 hour ago',
        location: 'Lagos, Nigeria',
        trustScore: 78,
        isActive: false,
        riskFactors: ['New location', 'Different timezone']
      },
      {
        id: '3',
        type: 'Tablet',
        os: 'iOS 17',
        browser: 'Safari 17',
        lastSeen: '3 days ago',
        location: 'Nairobi, Kenya',
        trustScore: 45,
        isActive: false,
        riskFactors: ['Unusual device', 'VPN detected', 'Multiple failed attempts']
      }
    ];

    const sampleEvents: SecurityEvent[] = [
      {
        id: '1',
        type: 'verified',
        message: 'Successful login from trusted device',
        timestamp: '2 minutes ago',
        severity: 'low',
        location: 'Accra, Ghana',
        device: 'Android Mobile'
      },
      {
        id: '2',
        type: 'suspicious',
        message: 'Login attempt from new location',
        timestamp: '1 hour ago',
        severity: 'medium',
        location: 'Lagos, Nigeria',
        device: 'Windows Desktop'
      },
      {
        id: '3',
        type: 'blocked',
        message: 'Blocked suspicious login attempt',
        timestamp: '3 hours ago',
        severity: 'high',
        location: 'Unknown',
        device: 'Unknown Device'
      },
      {
        id: '4',
        type: 'login',
        message: 'Regular login from known device',
        timestamp: '5 hours ago',
        severity: 'low',
        location: 'Accra, Ghana',
        device: 'Android Mobile'
      }
    ];

    setDevices(sampleDevices);
    setSecurityEvents(sampleEvents);

    return () => {
      clearInterval(locationUpdateInterval);
    };
  }, []);

  const runSecurityScan = async () => {
    setIsScanning(true);
    
    // Simulate security scan
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Update metrics with some randomization
    setSecurityMetrics(prev => ({
      deviceTrust: Math.max(70, Math.min(100, prev.deviceTrust + (Math.random() - 0.5) * 10)),
      locationRisk: Math.max(0, Math.min(50, prev.locationRisk + (Math.random() - 0.5) * 10)),
      networkSecurity: Math.max(80, Math.min(100, prev.networkSecurity + (Math.random() - 0.5) * 5)),
      behaviorScore: Math.max(60, Math.min(100, prev.behaviorScore + (Math.random() - 0.5) * 15)),
      overallRisk: Math.random() > 0.8 ? 'medium' : 'low'
    }));
    
    setIsScanning(false);
  };

  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'mobile': return <Smartphone className="w-5 h-5" />;
      case 'desktop': return <Monitor className="w-5 h-5" />;
      case 'tablet': return <Smartphone className="w-5 h-5" />;
      default: return <Monitor className="w-5 h-5" />;
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'verified': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'suspicious': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'blocked': return <Shield className="w-5 h-5 text-red-400" />;
      case 'login': return <Lock className="w-5 h-5 text-blue-400" />;
      default: return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'critical': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Security Dashboard</h2>
          <p className={`${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>Advanced device security and threat monitoring</p>
        </div>
        
        <button
          onClick={runSecurityScan}
          disabled={isScanning}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Scanning...' : 'Security Scan'}</span>
        </button>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`rounded-xl p-6 border transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(securityMetrics.overallRisk)}`}>
              {securityMetrics.overallRisk.toUpperCase()}
            </span>
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Overall Security</h3>
          <div className="flex items-center space-x-2">
            <div className={`flex-1 rounded-full h-2 ${
              isDark ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div 
                className={`h-2 rounded-full ${
                  securityMetrics.overallRisk === 'low' ? 'bg-green-400' :
                  securityMetrics.overallRisk === 'medium' ? 'bg-yellow-400' :
                  securityMetrics.overallRisk === 'high' ? 'bg-orange-400' : 'bg-red-400'
                }`}
                style={{ width: `${100 - (securityMetrics.locationRisk + (securityMetrics.overallRisk === 'medium' ? 20 : 0))}%` }}
              ></div>
            </div>
            <span className={`text-sm font-medium ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {100 - (securityMetrics.locationRisk + (securityMetrics.overallRisk === 'medium' ? 20 : 0))}%
            </span>
          </div>
        </div>

        <div className={`rounded-xl p-6 border transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Fingerprint className="w-6 h-6 text-green-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Device Trust</h3>
          <div className="flex items-center space-x-2">
            <div className={`flex-1 rounded-full h-2 ${
              isDark ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div 
                className="bg-green-400 h-2 rounded-full"
                style={{ width: `${securityMetrics.deviceTrust}%` }}
              ></div>
            </div>
            <span className={`text-sm font-medium ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>{securityMetrics.deviceTrust}%</span>
          </div>
        </div>

        <div className={`rounded-xl p-6 border transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Wifi className="w-6 h-6 text-purple-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Network Security</h3>
          <div className="flex items-center space-x-2">
            <div className={`flex-1 rounded-full h-2 ${
              isDark ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div 
                className="bg-purple-400 h-2 rounded-full"
                style={{ width: `${securityMetrics.networkSecurity}%` }}
              ></div>
            </div>
            <span className={`text-sm font-medium ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>{securityMetrics.networkSecurity}%</span>
          </div>
        </div>

        <div className={`rounded-xl p-6 border transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-yellow-400" />
            </div>
            <TrendingDown className="w-5 h-5 text-red-400" />
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Behavior Score</h3>
          <div className="flex items-center space-x-2">
            <div className={`flex-1 rounded-full h-2 ${
              isDark ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div 
                className="bg-yellow-400 h-2 rounded-full"
                style={{ width: `${securityMetrics.behaviorScore}%` }}
              ></div>
            </div>
            <span className={`text-sm font-medium ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>{securityMetrics.behaviorScore}%</span>
          </div>
        </div>
      </div>

      {/* Real-time Location Tracking */}
      <div className={`rounded-xl p-6 border transition-colors duration-300 ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Real-time Location</h3>
          <div className="flex items-center space-x-2">
            {isLocationLoading ? (
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            ) : (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            )}
            <span className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {isLocationLoading ? 'Detecting...' : 'Live'}
            </span>
          </div>
        </div>

        {currentLocation ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Current Location</p>
                  <p className={`font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {currentLocation.city}, {currentLocation.country}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Region</p>
                  <p className={`font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{currentLocation.region}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Satellite className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Coordinates</p>
                  <p className={`font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <Radio className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>ISP</p>
                  <p className={`font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{currentLocation.isp}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Timezone</p>
                  <p className={`font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{currentLocation.timezone}</p>
                </div>
              </div>

              {currentLocation.accuracy && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                    <Navigation className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>Accuracy</p>
                    <p className={`font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      ±{Math.round(currentLocation.accuracy)}m
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className={`${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Detecting your location...</p>
            </div>
          </div>
        )}
      </div>

      {/* Devices and Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registered Devices */}
        <div className={`rounded-xl p-6 border transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Registered Devices</h3>
            <span className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>{devices.length} devices</span>
          </div>
          
          <div className="space-y-3">
            {devices.map((device) => (
              <div 
                key={device.id} 
                className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
                  isDark 
                    ? 'bg-gray-700/50 hover:bg-gray-700' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => {
                  setSelectedDevice(device);
                  setShowDeviceDetails(true);
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${device.isActive ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
                    {getDeviceIcon(device.type)}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>{device.type} - {device.os}</p>
                    <p className={`text-xs ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>{device.location} • {device.lastSeen}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${getTrustScoreColor(device.trustScore)}`}>
                    {device.trustScore}%
                  </span>
                  <div className={`w-2 h-2 rounded-full ${device.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Events */}
        <div className={`rounded-xl p-6 border transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Recent Security Events</h3>
            <span className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Last 24 hours</span>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {securityEvents.map((event) => (
              <div key={event.id} className={`flex items-start space-x-3 p-3 rounded-lg transition-colors duration-300 ${
                isDark 
                  ? 'bg-gray-700/50' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}>
                {getEventIcon(event.type)}
                <div className="flex-1">
                  <p className={`text-sm ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{event.message}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-xs ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>{event.timestamp}</span>
                    <span className={`text-xs ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>•</span>
                    <span className={`text-xs ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>{event.location}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  event.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                  event.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {event.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Device Details Modal */}
      {showDeviceDetails && selectedDevice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl border w-full max-w-2xl transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-900 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className={`p-6 border-b transition-colors duration-300 ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    {getDeviceIcon(selectedDevice.type)}
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>{selectedDevice.type} Device</h3>
                    <p className={`${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>{selectedDevice.os} • {selectedDevice.browser}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeviceDetails(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark 
                      ? 'hover:bg-gray-800 text-gray-400' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <span className="text-xl">×</span>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className={`text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Trust Score</h4>
                  <div className="flex items-center space-x-2">
                    <div className={`flex-1 rounded-full h-3 ${
                      isDark ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <div 
                        className={`h-3 rounded-full ${getTrustScoreColor(selectedDevice.trustScore).replace('text-', 'bg-')}`}
                        style={{ width: `${selectedDevice.trustScore}%` }}
                      ></div>
                    </div>
                    <span className={`text-lg font-bold ${getTrustScoreColor(selectedDevice.trustScore)}`}>
                      {selectedDevice.trustScore}%
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className={`text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Status</h4>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${selectedDevice.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    <span className={`${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>{selectedDevice.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className={`text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Location</h4>
                  <div className="flex items-center space-x-2">
                    <MapPin className={`w-4 h-4 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`} />
                    <span className={`${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>{selectedDevice.location}</span>
                  </div>
                </div>

                <div>
                  <h4 className={`text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Last Seen</h4>
                  <div className="flex items-center space-x-2">
                    <Clock className={`w-4 h-4 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`} />
                    <span className={`${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>{selectedDevice.lastSeen}</span>
                  </div>
                </div>

                {selectedDevice.riskFactors.length > 0 && (
                  <div>
                    <h4 className={`text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>Risk Factors</h4>
                    <div className="space-y-2">
                      {selectedDevice.riskFactors.map((factor, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-400" />
                          <span className={`text-sm ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};