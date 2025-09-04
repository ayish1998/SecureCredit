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
  Loader,
  Brain,
  Cpu,
  Network,
  Bug,
  ShieldCheck
} from 'lucide-react';
import { geolocationService, LocationData, LocationRisk } from '../utils/geolocation';
import { useTheme } from '../contexts/ThemeContext';
import { aiService } from '../services/aiService';
import { transformSecurityForAI } from '../utils/aiDataTransformer';
import { SecurityAssessment } from '../types/ai';

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

interface AISecurityEvent extends SecurityEvent {
  aiAnalysis?: SecurityAssessment;
  aiThreatLevel?: number;
  aiConfidence?: number;
  aiRecommendations?: string[];
  vulnerabilities?: string[];
  mitigationSteps?: string[];
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
  const [securityEvents, setSecurityEvents] = useState<AISecurityEvent[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [showDeviceDetails, setShowDeviceDetails] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceInfo | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationRisk, setLocationRisk] = useState<LocationRisk | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  
  // AI Service state
  const [isAiInitialized, setIsAiInitialized] = useState(false);
  const [aiServiceStatus, setAiServiceStatus] = useState<any>(null);
  const [aiAnalysisHistory, setAiAnalysisHistory] = useState<SecurityAssessment[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAiInsights, setShowAiInsights] = useState(true);
  const [analyzingEventId, setAnalyzingEventId] = useState<string | null>(null);

  useEffect(() => {
    // Initialize AI service and security monitoring
    initializeAIService();
    
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

    const sampleEvents: AISecurityEvent[] = [
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

  const initializeAIService = async () => {
    try {
      await aiService.initialize({
        enableFallback: true,
        cacheResults: true,
      });
      
      setIsAiInitialized(true);
      setAiServiceStatus(aiService.getStatus());
      
      // Perform initial AI analysis on existing events
      performBulkSecurityAnalysis();
    } catch (error) {
      console.error('Failed to initialize AI service for security:', error);
      setIsAiInitialized(false);
    }
  };

  const performBulkSecurityAnalysis = async () => {
    // Analyze existing security events with AI
    const eventsToAnalyze = securityEvents.filter(event => !event.aiAnalysis);
    
    for (const event of eventsToAnalyze.slice(0, 3)) { // Analyze first 3 events
      await performEnhancedSecurityAnalysis(event);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
    }
  };

  const performEnhancedSecurityAnalysis = async (event: SecurityEvent) => {
    setIsAnalyzing(true);
    setAnalyzingEventId(event.id);
    
    try {
      let aiAnalysis: SecurityAssessment | null = null;
      
      // If AI service is available, get enhanced analysis
      if (isAiInitialized) {
        try {
          const securityData = {
            deviceFingerprint: event.device || `device_${event.id}`,
            loginPatterns: [
              {
                timestamp: event.timestamp,
                location: event.location || 'Unknown',
                device: event.device || 'Unknown',
                success: event.type !== 'blocked',
                ipAddress: generateMockIP(),
              }
            ],
            locationHistory: event.location ? [
              {
                city: event.location.split(',')[0] || 'Unknown',
                country: event.location.split(',')[1]?.trim() || 'Unknown',
                timestamp: event.timestamp,
                frequency: 1,
              }
            ] : [],
            behaviorMetrics: {
              sessionDuration: Math.random() * 1800 + 300, // 5-35 minutes
              typingSpeed: Math.random() * 50 + 30,
            },
            securityEvents: [
              {
                type: event.type,
                severity: event.severity,
                timestamp: event.timestamp,
                resolved: false,
                description: event.message,
              }
            ],
            riskIndicators: generateRiskIndicators(event),
          };

          const transformedData = transformSecurityForAI(securityData);
          aiAnalysis = await aiService.analyzeSecurityPattern(transformedData, {
            userId: 'current_user',
            priority: event.severity === 'high' ? 'high' : 'medium',
            analysisType: 'security'
          });
          
          // Add to AI analysis history
          setAiAnalysisHistory(prev => [aiAnalysis!, ...prev.slice(0, 19)]); // Keep last 20
          
        } catch (aiError) {
          console.error('AI security analysis failed, using fallback:', aiError);
        }
      }
      
      // Create enhanced security event
      const enhancedEvent: AISecurityEvent = {
        ...event,
        aiAnalysis,
        aiThreatLevel: aiAnalysis?.threatLevel,
        aiConfidence: aiAnalysis?.confidence,
        aiRecommendations: aiAnalysis?.recommendations,
        vulnerabilities: aiAnalysis?.vulnerabilities,
        mitigationSteps: aiAnalysis?.mitigationSteps,
      };
      
      // Use AI analysis for final severity if available and confident
      if (aiAnalysis && aiAnalysis.confidence > 80) {
        if (aiAnalysis.threatLevel > 70) {
          enhancedEvent.severity = 'high';
        } else if (aiAnalysis.threatLevel > 40) {
          enhancedEvent.severity = 'medium';
        } else {
          enhancedEvent.severity = 'low';
        }
        
        enhancedEvent.message = `AI Enhanced: ${aiAnalysis.reasoning.substring(0, 100)}...`;
      }
      
      // Update the event in the list
      setSecurityEvents(prev => 
        prev.map(e => e.id === event.id ? enhancedEvent : e)
      );
      
    } catch (error) {
      console.error('Error in enhanced security analysis:', error);
    } finally {
      setIsAnalyzing(false);
      setAnalyzingEventId(null);
    }
  };

  const generateRiskIndicators = (event: SecurityEvent): string[] => {
    const indicators: string[] = [];
    
    if (event.type === 'blocked') {
      indicators.push('blocked_attempt');
    }
    
    if (event.type === 'location_change') {
      indicators.push('location_change');
    }
    
    if (event.severity === 'high') {
      indicators.push('high_severity');
    }
    
    if (event.location === 'Unknown') {
      indicators.push('unknown_location');
    }
    
    if (event.device === 'Unknown Device') {
      indicators.push('unknown_device');
    }
    
    return indicators;
  };

  const generateMockIP = (): string => {
    return `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  };

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
    
    try {
      // Simulate comprehensive security scan with AI enhancement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a new security event for AI analysis
      const newEvent: SecurityEvent = {
        id: `scan_${Date.now()}`,
        type: Math.random() > 0.7 ? 'suspicious' : 'verified',
        message: 'Security scan detected activity',
        timestamp: 'Just now',
        severity: Math.random() > 0.8 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low',
        location: currentLocation ? `${currentLocation.city}, ${currentLocation.country}` : 'Current Location',
        device: 'Current Device'
      };
      
      // Add the new event and analyze it with AI
      setSecurityEvents(prev => [newEvent, ...prev.slice(0, 9)]);
      
      // Perform AI analysis on the new event
      if (isAiInitialized) {
        await performEnhancedSecurityAnalysis(newEvent);
      }
      
      // Update metrics with some randomization and AI influence
      const aiInfluence = isAiInitialized ? 1.2 : 1.0; // AI provides better accuracy
      
      setSecurityMetrics(prev => ({
        deviceTrust: Math.max(70, Math.min(100, prev.deviceTrust + (Math.random() - 0.5) * 10 * aiInfluence)),
        locationRisk: Math.max(0, Math.min(50, prev.locationRisk + (Math.random() - 0.5) * 10)),
        networkSecurity: Math.max(80, Math.min(100, prev.networkSecurity + (Math.random() - 0.5) * 5 * aiInfluence)),
        behaviorScore: Math.max(60, Math.min(100, prev.behaviorScore + (Math.random() - 0.5) * 15 * aiInfluence)),
        overallRisk: Math.random() > 0.8 ? 'medium' : 'low'
      }));
      
      // Refresh location data
      if (locationPermission === 'granted') {
        const location = await geolocationService.getCurrentLocation();
        setCurrentLocation(location);
        const risk = geolocationService.analyzeLocationRisk(location);
        setLocationRisk(risk);
      }
      
      // Update AI service status
      if (isAiInitialized) {
        setAiServiceStatus(aiService.getStatus());
      }
      
    } catch (error) {
      console.error('Security scan error:', error);
    } finally {
      setIsScanning(false);
    }
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
            onClick={() => setShowAiInsights(!showAiInsights)}
            className={`${showAiInsights ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'} text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2`}
            title="Toggle AI insights display"
          >
            <Brain className="w-4 h-4" />
            <span>AI Insights</span>
          </button>
          
          <button
            onClick={runSecurityScan}
            disabled={isScanning}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Security Scan'}</span>
          </button>
          
          {/* AI Status Indicators */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isAiInitialized ? 'bg-blue-400' : 'bg-orange-400'}`}></div>
              <span className={`text-sm ${textSecondary}`}>
                AI {isAiInitialized ? 'Ready' : 'Fallback'}
              </span>
            </div>
            {isAnalyzing && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <span className={`text-sm ${textSecondary}`}>
                  Analyzing...
                </span>
              </div>
            )}
          </div>
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

      {/* AI Security Intelligence */}
      {showAiInsights && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Service Status */}
          <div className={cardClass}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center space-x-2 ${textPrimary}`}>
              <Brain className="w-5 h-5 text-blue-400" />
              <span>AI Security Intelligence</span>
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${textSecondary}`}>AI Service Status</span>
                <div className="flex items-center space-x-2">
                  {isAiInitialized ? (
                    <ShieldCheck className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                  )}
                  <span className={`text-sm font-medium ${
                    isAiInitialized ? 'text-green-400' : 'text-orange-400'
                  }`}>
                    {isAiInitialized ? 'Active' : 'Fallback Mode'}
                  </span>
                </div>
              </div>
              
              {aiServiceStatus && (
                <>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${textSecondary}`}>Threat Detection</span>
                    <span className={`text-sm font-medium ${
                      aiServiceStatus.aiAvailable ? 'text-green-400' : 'text-orange-400'
                    }`}>
                      {aiServiceStatus.aiAvailable ? 'Enhanced' : 'Basic'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${textSecondary}`}>Analysis Cache</span>
                    <span className={`text-sm font-medium ${textPrimary}`}>
                      {aiServiceStatus.cacheSize} items
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${textSecondary}`}>AI Enhanced Events</span>
                    <span className={`text-sm font-medium ${textPrimary}`}>
                      {securityEvents.filter(e => e.aiAnalysis).length}
                    </span>
                  </div>
                </>
              )}
              
              <div className="pt-2 border-t border-gray-700">
                <button
                  onClick={() => setAiServiceStatus(aiService.getStatus())}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Refresh Status
                </button>
              </div>
            </div>
          </div>

          {/* Recent AI Security Analysis */}
          <div className={cardClass}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center space-x-2 ${textPrimary}`}>
              <Activity className="w-5 h-5 text-purple-400" />
              <span>Recent AI Analysis</span>
            </h3>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {aiAnalysisHistory.length === 0 ? (
                <p className={`text-center py-4 text-sm ${textSecondary}`}>No AI analysis yet</p>
              ) : (
                aiAnalysisHistory.slice(0, 5).map((analysis, index) => (
                  <div key={index} className={`p-3 rounded-lg transition-colors duration-300 ${
                    isDark 
                      ? 'bg-gray-700/50' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${
                        analysis.riskLevel === 'low' ? 'bg-green-500/20 text-green-400' :
                        analysis.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        analysis.riskLevel === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {analysis.riskLevel}
                      </span>
                      <span className={`text-xs ${textSecondary}`}>
                        {analysis.confidence}% confident
                      </span>
                    </div>
                    <p className={`text-sm mb-1 ${textPrimary}`}>
                      Threat Level: {analysis.threatLevel}%
                    </p>
                    <p className={`text-xs ${textSecondary}`}>
                      {analysis.reasoning.substring(0, 80)}...
                    </p>
                    {analysis.vulnerabilities && analysis.vulnerabilities.length > 0 && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {analysis.vulnerabilities.slice(0, 2).map((vuln, idx) => (
                            <span key={idx} className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                              {vuln.substring(0, 15)}...
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

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
            {securityEvents.map((event) => {
              const aiEvent = event as AISecurityEvent;
              return (
                <div key={event.id} className={`p-3 rounded-lg transition-colors duration-300 ${
                  isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}>
                  <div className="flex items-start space-x-3">
                    {getEventIcon(event.type)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className={`text-sm ${textPrimary}`}>{event.message}</p>
                        {aiEvent.aiAnalysis && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded font-medium">
                            AI Enhanced
                          </span>
                        )}
                        {analyzingEventId === event.id && (
                          <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`text-xs ${textSecondary}`}>{event.timestamp}</span>
                        <span className={`text-xs ${textSecondary}`}>•</span>
                        <span className={`text-xs ${textSecondary}`}>{event.location}</span>
                      </div>
                      
                      {/* AI Recommendations */}
                      {aiEvent.aiRecommendations && aiEvent.aiRecommendations.length > 0 && (
                        <div className="mb-2">
                          <p className={`text-xs mb-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                            AI Recommendations:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {aiEvent.aiRecommendations.slice(0, 2).map((rec, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                                {rec.substring(0, 20)}...
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Vulnerabilities */}
                      {aiEvent.vulnerabilities && aiEvent.vulnerabilities.length > 0 && (
                        <div className="mb-2">
                          <p className={`text-xs mb-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                            Vulnerabilities:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {aiEvent.vulnerabilities.slice(0, 2).map((vuln, index) => (
                              <span key={index} className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                                {vuln.substring(0, 15)}...
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        event.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                        event.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {event.severity}
                      </span>
                      {aiEvent.aiThreatLevel && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          aiEvent.aiThreatLevel > 70 ? 'bg-red-500/20 text-red-400' :
                          aiEvent.aiThreatLevel > 50 ? 'bg-orange-500/20 text-orange-400' :
                          aiEvent.aiThreatLevel > 30 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          AI: {aiEvent.aiThreatLevel}%
                        </span>
                      )}
                      {aiEvent.aiConfidence && (
                        <span className={`text-xs ${textSecondary}`}>
                          {aiEvent.aiConfidence}% conf.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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