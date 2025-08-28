import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Smartphone, 
  Globe, 
  Lock,
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
  Radio,
  Eye,
  EyeOff,
  Signal,
  Loader
} from 'lucide-react';
import { geolocationService, LocationData, LocationRisk } from '../utils/geolocation';
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
  realTimeLocation?: LocationData;
  locationRisk?: LocationRisk;
}

interface SecurityEvent {
  id: string;
  type: 'login' | 'suspicious' | 'blocked' | 'verified' | 'location_change';
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  location: string;
  device: string;
}

export const FinalEnhancedSecurityDashboard: React.FC = () => {
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
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationRisk, setLocationRisk] = useState<LocationRisk | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  useEffect(() => {
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
        type: 'location_change',
        message: 'Location changed from Accra to Lagos',
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
      }
    ];

    setDevices(sampleDevices);
    setSecurityEvents(sampleEvents);

    // Start real-time location tracking
    initializeLocationTracking();

    return () => {
      geolocationService.stopWatching();
    };
  }, []);

  const initializeLocationTracking = async () => {
    setIsLocationLoading(true);
    
    try {
      // Check permission status
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setLocationPermission(permission.state);
        
        permission.addEventListener('change', () => {
          setLocationPermission(permission.state);
        });
      }

      // Get current location
      const location = await geolocationService.getCurrentLocation();
      setCurrentLocation(location);

      // Analyze location risk
      const risk = geolocationService.analyzeLocationRisk(location);
      setLocationRisk(risk);

      // Update security metrics based on location risk
      setSecurityMetrics(prev => ({
        ...prev,
        locationRisk: risk.riskScore,
        overallRisk: risk.riskLevel
      }));

      // Start watching for location changes
      geolocationService.startWatching();
      
      // Listen for location updates
      const unsubscribe = geolocationService.onLocationUpdate((newLocation) => {
        setCurrentLocation(newLocation);
        const newRisk = geolocationService.analyzeLocationRisk(newLocation);
        setLocationRisk(newRisk);
        
        // Add location change event
        if (newLocation.city !== currentLocation?.city) {
          const event: SecurityEvent = {
            id: `loc_${Date.now()}`,
            type: 'location_change',
            message: `Location changed to ${newLocation.city}, ${newLocation.country}`,
            timestamp: 'Just now',
            severity: newRisk.riskLevel === 'high' ? 'high' : 'medium',
            location: `${newLocation.city}, ${newLocation.country}`,
            device: 'Current Device'
          };
          
          setSecurityEvents(prev => [event, ...prev.slice(0, 9)]);
        }
      });

      return unsubscribe;
    } catch (error) {
      console.error('Location tracking error:', error);
    } finally {
      setIsLocationLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    setIsLocationLoading(true);
    try {
      await initializeLocationTracking();
    } catch (error) {
      console.error('Permission request failed:', error);
    } finally {
      setIsLocationLoading(false);
    }
  };

  const runSecurityScan = async () => {
    setIsScanning(true);
    
    // Simulate comprehensive security scan
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Update metrics with some randomization
    setSecurityMetrics(prev => ({
      deviceTrust: Math.max(70, Math.min(100, prev.deviceTrust + (Math.random() - 0.5) * 10)),
      locationRisk: Math.max(0, Math.min(50, prev.locationRisk + (Math.random() - 0.5) * 10)),
      networkSecurity: Math.max(80, Math.min(100, prev.networkSecurity + (Math.random() - 0.5) * 5)),
      behaviorScore: Math.max(60, Math.min(100, prev.behaviorScore + (Math.random() - 0.5) * 15)),
      overallRisk: Math.random() > 0.8 ? 'medium' : 'low'
    }));
    
    // Refresh location data
    if (locationPermission === 'granted') {
      const location = await geolocationService.getCurrentLocation();
      setCurrentLocation(location);
      const risk = geolocationService.analyzeLocationRisk(location);
      setLocationRisk(risk);
    }
    
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
      case 'location_change': return <Navigation className="w-5 h-5 text-purple-400" />;
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

  const cardClass = `rounded-xl p-6 border transition-colors duration-300 ${
    isDark 
      ? 'bg-gray-800 border-gray-700' 
      : 'bg-white border-gray-200 shadow-sm'
  }`;

  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const textTertiary = isDark ? 'text-gray-300' : 'text-gray-700';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${textPrimary}`}>Security Dashboard</h2>
          <p className={textSecondary}>Advanced device security and real-time threat monitoring</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {locationPermission === 'prompt' && (
            <button
              onClick={requestLocationPermission}
              disabled={isLocationLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {isLocationLoading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
              <span>Enable Location</span>
            </button>
          )}
          
          <button
            onClick={runSecurityScan}
            disabled={isScanning}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Security Scan'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Location Status */}
      {currentLocation && (
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Navigation className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${textPrimary}`}>Real-time Location</h3>
                <p className={textSecondary}>
                  {currentLocation.city}, {currentLocation.country} • {currentLocation.source.toUpperCase()}
                </p>
              </div>
            </div>
            
            {locationRisk && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(locationRisk.riskLevel)}`}>
                {locationRisk.riskLevel.toUpperCase()} RISK
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className={`text-sm ${textTertiary}`}>Coordinates</p>
                <p className={`text-sm font-medium ${textPrimary}`}>
                  {currentLocation.latitude?.toFixed(4)}, {currentLocation.longitude?.toFixed(4)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className={`text-sm ${textTertiary}`}>Timezone</p>
                <p className={`text-sm font-medium ${textPrimary}`}>{currentLocation.timezone}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Signal className="w-5 h-5 text-gray-400" />
              <div>
                <p className={`text-sm ${textTertiary}`}>ISP</p>
                <p className={`text-sm font-medium ${textPrimary}`}>{currentLocation.isp || 'Unknown'}</p>
              </div>
            </div>
          </div>

          {locationRisk && locationRisk.factors.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className={`text-sm font-medium ${textTertiary} mb-2`}>Risk Factors:</p>
              <div className="flex flex-wrap gap-2">
                {locationRisk.factors.map((factor, index) => (
                  <span key={index} className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(securityMetrics.overallRisk)}`}>
              {securityMetrics.overallRisk.toUpperCase()}
            </span>
          </div>
          <h3 className={`text-lg font-semibold ${textPrimary} mb-2`}>Overall Security</h3>
          <div className="flex items-center space-x-2">
            <div className={`flex-1 rounded-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div 
                className={`h-2 rounded-full ${
                  securityMetrics.overallRisk === 'low' ? 'bg-green-400' :
                  securityMetrics.overallRisk === 'medium' ? 'bg-yellow-400' :
                  securityMetrics.overallRisk === 'high' ? 'bg-orange-400' : 'bg-red-400'
                }`}
                style={{ width: `${100 - (securityMetrics.locationRisk + (securityMetrics.overallRisk === 'medium' ? 20 : 0))}%` }}
              ></div>
            </div>
            <span className={`text-sm font-medium ${textPrimary}`}>
              {100 - (securityMetrics.locationRisk + (securityMetrics.overallRisk === 'medium' ? 20 : 0))}%
            </span>
          </div>
        </div>

        <div className={cardClass}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Fingerprint className="w-6 h-6 text-green-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <h3 className={`text-lg font-semibold ${textPrimary} mb-2`}>Device Trust</h3>
          <div className="flex items-center space-x-2">
            <div className={`flex-1 rounded-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div 
                className="bg-green-400 h-2 rounded-full"
                style={{ width: `${securityMetrics.deviceTrust}%` }}
              ></div>
            </div>
            <span className={`text-sm font-medium ${textPrimary}`}>{securityMetrics.deviceTrust}%</span>
          </div>
        </div>

        <div className={cardClass}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Wifi className="w-6 h-6 text-purple-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <h3 className={`text-lg font-semibold ${textPrimary} mb-2`}>Network Security</h3>
          <div className="flex items-center space-x-2">
            <div className={`flex-1 rounded-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div 
                className="bg-purple-400 h-2 rounded-full"
                style={{ width: `${securityMetrics.networkSecurity}%` }}
              ></div>
            </div>
            <span className={`text-sm font-medium ${textPrimary}`}>{securityMetrics.networkSecurity}%</span>
          </div>
        </div>

        <div className={cardClass}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-yellow-400" />
            </div>
            <TrendingDown className="w-5 h-5 text-red-400" />
          </div>
          <h3 className={`text-lg font-semibold ${textPrimary} mb-2`}>Behavior Score</h3>
          <div className="flex items-center space-x-2">
            <div className={`flex-1 rounded-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div 
                className="bg-yellow-400 h-2 rounded-full"
                style={{ width: `${securityMetrics.behaviorScore}%` }}
              ></div>
            </div>
            <span className={`text-sm font-medium ${textPrimary}`}>{securityMetrics.behaviorScore}%</span>
          </div>
        </div>
      </div>

      {/* Devices and Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registered Devices */}
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${textPrimary}`}>Registered Devices</h3>
            <span className={textSecondary}>{devices.length} devices</span>
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
                    <p className={`text-sm font-medium ${textPrimary}`}>{device.type} - {device.os}</p>
                    <p className={`text-xs ${textSecondary}`}>{device.location} • {device.lastSeen}</p>
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
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${textPrimary}`}>Recent Security Events</h3>
            <span className={textSecondary}>Last 24 hours</span>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {securityEvents.map((event) => (
              <div key={event.id} className={`flex items-start space-x-3 p-3 rounded-lg ${
                isDark ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}>
                {getEventIcon(event.type)}
                <div className="flex-1">
                  <p className={`text-sm ${textPrimary}`}>{event.message}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-xs ${textSecondary}`}>{event.timestamp}</span>
                    <span className={`text-xs ${textSecondary}`}>•</span>
                    <span className={`text-xs ${textSecondary}`}>{event.location}</span>
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
          <div className={`rounded-2xl border w-full max-w-2xl ${
            isDark 
              ? 'bg-gray-900 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    {getDeviceIcon(selectedDevice.type)}
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${textPrimary}`}>{selectedDevice.type} Device</h3>
                    <p className={textSecondary}>{selectedDevice.os} • {selectedDevice.browser}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeviceDetails(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                  }`}
                >
                  <span className={`text-xl ${textSecondary}`}>×</span>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className={`text-sm font-medium ${textSecondary} mb-2`}>Trust Score</h4>
                  <div className="flex items-center space-x-2">
                    <div className={`flex-1 rounded-full h-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
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
                  <h4 className={`text-sm font-medium ${textSecondary} mb-2`}>Status</h4>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${selectedDevice.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    <span className={textPrimary}>{selectedDevice.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className={`text-sm font-medium ${textSecondary} mb-2`}>Location</h4>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className={textPrimary}>{selectedDevice.location}</span>
                  </div>
                </div>

                <div>
                  <h4 className={`text-sm font-medium ${textSecondary} mb-2`}>Last Seen</h4>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className={textPrimary}>{selectedDevice.lastSeen}</span>
                  </div>
                </div>

                {selectedDevice.riskFactors.length > 0 && (
                  <div>
                    <h4 className={`text-sm font-medium ${textSecondary} mb-2`}>Risk Factors</h4>
                    <div className="space-y-2">
                      {selectedDevice.riskFactors.map((factor, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-400" />
                          <span className={`text-sm ${textPrimary}`}>{factor}</span>
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