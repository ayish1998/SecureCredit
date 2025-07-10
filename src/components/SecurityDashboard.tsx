import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Smartphone, Monitor, Tablet, Eye, Clock, TrendingUp } from 'lucide-react';
import { fingerprintService, DeviceFingerprint, SecurityAnalysis } from '../utils/fingerprint';

interface SecurityDashboardProps {
  onSecurityUpdate?: (analysis: SecurityAnalysis) => void;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ onSecurityUpdate }) => {
  const [fingerprint, setFingerprint] = useState<DeviceFingerprint | null>(null);
  const [securityAnalysis, setSecurityAnalysis] = useState<SecurityAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);

  useEffect(() => {
    initializeSecurity();
    
    // Set up real-time updates
    if (realTimeUpdates) {
      const interval = setInterval(() => {
        updateSecurityMetrics();
      }, 5000); // Update every 5 seconds
      
      return () => clearInterval(interval);
    }
  }, []);

  const updateSecurityMetrics = async () => {
    if (!fingerprint) return;
    
    try {
      // Simulate real-time security updates
      const updatedAnalysis = fingerprintService.analyzeSecurityRisk(fingerprint);
      
      // Add some variation to simulate real-time changes
      updatedAnalysis.trustScore = Math.max(0, Math.min(100, 
        updatedAnalysis.trustScore + (Math.random() - 0.5) * 10
      ));
      
      // Update device history
      updatedAnalysis.deviceHistory.transactionCount += Math.floor(Math.random() * 3);
      updatedAnalysis.deviceHistory.lastSeen = new Date();
      
      setSecurityAnalysis(updatedAnalysis);
      
      if (onSecurityUpdate) {
        onSecurityUpdate(updatedAnalysis);
      }
    } catch (err) {
      console.error('Failed to update security metrics:', err);
    }
  };

  const initializeSecurity = async () => {
    try {
      setLoading(true);
      setError(null);

      // Generate device fingerprint
      const fp = await fingerprintService.generateFingerprint();
      setFingerprint(fp);

      // Analyze security risks
      const analysis = fingerprintService.analyzeSecurityRisk(fp);
      setSecurityAnalysis(analysis);

      // Store fingerprint
      await fingerprintService.storeFingerprint(fp);

      // Notify parent component
      if (onSecurityUpdate) {
        onSecurityUpdate(analysis);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Security initialization failed');
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="w-5 h-5" />;
      case 'tablet': return <Tablet className="w-5 h-5" />;
      default: return <Monitor className="w-5 h-5" />;
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'critical': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-300">Initializing security analysis...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-red-500/50">
        <div className="flex items-center space-x-2 text-red-400">
          <AlertTriangle className="w-5 h-5" />
          <span>Security Error: {error}</span>
        </div>
        <button 
          onClick={initializeSecurity}
          className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors"
        >
          Retry Security Check
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Security Overview */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <span>Device Security Analysis</span>
          </h3>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="realTimeUpdates"
                checked={realTimeUpdates}
                onChange={(e) => setRealTimeUpdates(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded"
              />
              <label htmlFor="realTimeUpdates" className="text-sm text-gray-300">
                Real-time updates
              </label>
            </div>
            <button 
              onClick={initializeSecurity}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {fingerprint && securityAnalysis && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Device Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-300">Device Information</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Device Type</span>
                  <div className="flex items-center space-x-2 text-white">
                    {getDeviceIcon(fingerprint.deviceType)}
                    <span className="capitalize">{fingerprint.deviceType}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Fingerprint ID</span>
                  <span className="text-sm font-mono text-white">
                    {fingerprint.visitorId.substring(0, 8)}...
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Confidence</span>
                  <span className="text-sm text-white">
                    {(fingerprint.confidence * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Platform</span>
                  <span className="text-sm text-white">{fingerprint.components.platform}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Screen Resolution</span>
                  <span className="text-sm text-white">{fingerprint.components.screenResolution}</span>
                </div>
              </div>
            </div>

            {/* Security Analysis */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-300">Security Assessment</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Risk Level</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${getRiskColor(securityAnalysis.riskLevel)}`}>
                    {securityAnalysis.riskLevel}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Trust Score</span>
                  <span className="text-sm text-white">{securityAnalysis.trustScore}/100</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Risk Score</span>
                  <span className="text-sm text-white">{fingerprint.riskScore}/100</span>
                </div>

                {/* Trust Score Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Trust Level</span>
                    <span>{securityAnalysis.trustScore}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        securityAnalysis.trustScore > 80 ? 'bg-green-500' :
                        securityAnalysis.trustScore > 60 ? 'bg-yellow-500' :
                        securityAnalysis.trustScore > 40 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${securityAnalysis.trustScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Risk Factors & Recommendations */}
      {securityAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Risk Factors */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h4 className="font-medium text-gray-300 mb-4 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span>Risk Factors</span>
            </h4>
            
            {securityAnalysis.riskFactors.length > 0 ? (
              <ul className="space-y-2">
                {securityAnalysis.riskFactors.map((factor, index) => (
                  <li key={index} className="text-sm text-gray-300 flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center space-x-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">No significant risk factors detected</span>
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h4 className="font-medium text-gray-300 mb-4 flex items-center space-x-2">
              <Eye className="w-4 h-4 text-blue-400" />
              <span>Security Recommendations</span>
            </h4>
            
            {securityAnalysis.recommendations.length > 0 ? (
              <ul className="space-y-2">
                {securityAnalysis.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-sm text-gray-300 flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center space-x-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Standard security measures sufficient</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Device History */}
      {securityAnalysis && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h4 className="font-medium text-gray-300 mb-4 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <span>Device History</span>
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-white">
                {securityAnalysis.deviceHistory.transactionCount}
              </div>
              <div className="text-xs text-gray-400">Total Transactions</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-red-400">
                {securityAnalysis.deviceHistory.flaggedActivities}
              </div>
              <div className="text-xs text-gray-400">Flagged Activities</div>
            </div>
            
            <div className="text-center">
              <div className="text-xs sm:text-sm font-medium text-white">
                {securityAnalysis.deviceHistory.firstSeen.toLocaleDateString()}
              </div>
              <div className="text-xs text-gray-400">First Seen</div>
            </div>
            
            <div className="text-center">
              <div className="text-xs sm:text-sm font-medium text-white">
                {securityAnalysis.deviceHistory.lastSeen.toLocaleDateString()}
              </div>
              <div className="text-xs text-gray-400">Last Seen</div>
            </div>
          </div>
          
          {/* Real-time Status Indicator */}
          {realTimeUpdates && (
            <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Real-time monitoring active</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};