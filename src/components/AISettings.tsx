import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Brain, 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  TestTube, 
  Save,
  RotateCcw,
  Activity,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { AIServiceConfig, AIUsageMetrics, AIConfigValidationResult } from '../types/aiConfig';
import { aiConfigManager } from '../utils/aiConfigManager';

interface AISettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AISettings: React.FC<AISettingsProps> = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [config, setConfig] = useState<AIServiceConfig | null>(null);
  const [usageMetrics, setUsageMetrics] = useState<AIUsageMetrics | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadConfiguration();
      loadUsageMetrics();
    }
  }, [isOpen]);

  const loadConfiguration = async () => {
    try {
      const currentConfig = aiConfigManager.getConfig();
      setConfig(currentConfig);
    } catch (error) {
      console.error('Failed to load AI configuration:', error);
    }
  };

  const loadUsageMetrics = async () => {
    try {
      const metrics = aiConfigManager.getUsageMetrics();
      setUsageMetrics(metrics);
    } catch (error) {
      console.error('Failed to load usage metrics:', error);
    }
  };

  const handleConfigChange = (updates: Partial<AIServiceConfig>) => {
    if (config) {
      setConfig({ ...config, ...updates });
      setHasUnsavedChanges(true);
    }
  };

  const handleSaveConfiguration = async () => {
    if (!config) return;
    
    setIsLoading(true);
    try {
      const validation = await aiConfigManager.updateConfig(config);
      if (validation.isValid) {
        setHasUnsavedChanges(false);
        setTestResult({ success: true, message: 'Configuration saved successfully' });
      } else {
        setTestResult({ success: false, message: validation.errors.join(', ') });
      }
    } catch (error) {
      setTestResult({ success: false, message: 'Failed to save configuration' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConfiguration = async () => {
    if (!config) return;
    
    setIsTesting(true);
    try {
      const result = await aiConfigManager.testConfiguration(config);
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, message: 'Configuration test failed' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleResetToDefaults = () => {
    const defaultConfig = aiConfigManager.getDefaultConfig();
    setConfig(defaultConfig);
    setHasUnsavedChanges(true);
  };

  if (!isOpen || !config) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className={`rounded-2xl border w-full max-w-4xl max-h-[90vh] overflow-hidden transition-colors duration-300 ${
        isDark 
          ? 'bg-gray-900 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI Configuration</h2>
                <p className="text-blue-100">Manage AI service settings and preferences</p>
              </div>
            </div>
            {hasUnsavedChanges && (
              <div className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm">
                Unsaved changes
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex border-b transition-colors duration-300 ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          {[
            { id: 'general', label: 'General', icon: Settings },
            { id: 'features', label: 'Features', icon: Brain },
            { id: 'performance', label: 'Performance', icon: Activity },
            { id: 'usage', label: 'Usage & Costs', icon: DollarSign }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                  activeTab === tab.id
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : isDark 
                      ? 'text-gray-400 hover:text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* API Configuration */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>API Configuration</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Gemini API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={config.apiKey || ''}
                        onChange={(e) => handleConfigChange({ apiKey: e.target.value })}
                        className={`w-full px-3 py-2 pr-10 border rounded-lg transition-colors duration-300 ${
                          isDark 
                            ? 'bg-gray-800 border-gray-700 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="Enter your Gemini API key"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                          isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Region
                      </label>
                      <select
                        value={config.region}
                        onChange={(e) => handleConfigChange({ region: e.target.value as any })}
                        className={`w-full px-3 py-2 border rounded-lg transition-colors duration-300 ${
                          isDark 
                            ? 'bg-gray-800 border-gray-700 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="global">Global</option>
                        <option value="africa">Africa</option>
                        <option value="ghana">Ghana</option>
                        <option value="nigeria">Nigeria</option>
                        <option value="kenya">Kenya</option>
                        <option value="south-africa">South Africa</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Language
                      </label>
                      <select
                        value={config.language}
                        onChange={(e) => handleConfigChange({ language: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg transition-colors duration-300 ${
                          isDark 
                            ? 'bg-gray-800 border-gray-700 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="en">English</option>
                        <option value="fr">French</option>
                        <option value="sw">Swahili</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Test Configuration */}
              <div className={`p-4 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Test Configuration</h4>
                  <button
                    onClick={handleTestConfiguration}
                    disabled={isTesting}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm transition-colors flex items-center space-x-2"
                  >
                    <TestTube className="w-4 h-4" />
                    <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                  </button>
                </div>
                
                {testResult && (
                  <div className={`flex items-center space-x-2 text-sm ${
                    testResult.success ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {testResult.success ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-6">
              <h3 className={`text-lg font-semibold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>AI Features</h3>
              
              {Object.entries(config.features).map(([feature, enabled]) => {
                const featureConfig = {
                  fraudDetection: { icon: Shield, label: 'Fraud Detection', description: 'AI-powered fraud analysis and prevention' },
                  creditScoring: { icon: TrendingUp, label: 'Credit Scoring', description: 'Enhanced credit assessment using AI' },
                  securityAnalysis: { icon: AlertTriangle, label: 'Security Analysis', description: 'Device and transaction security analysis' },
                  generalInsights: { icon: Brain, label: 'General Insights', description: 'AI-powered business insights and recommendations' }
                }[feature];

                if (!featureConfig) return null;

                const IconComponent = featureConfig.icon;

                return (
                  <div key={feature} className={`flex items-center justify-between p-4 rounded-lg transition-colors duration-300 ${
                    isDark ? 'bg-gray-800' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <IconComponent className={`w-5 h-5 ${enabled ? 'text-green-400' : 'text-gray-400'}`} />
                      <div>
                        <p className={`font-medium ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>{featureConfig.label}</p>
                        <p className={`text-sm ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>{featureConfig.description}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => handleConfigChange({
                          features: { ...config.features, [feature]: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <h3 className={`text-lg font-semibold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Performance Settings</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Max Retries
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={config.maxRetries}
                    onChange={(e) => handleConfigChange({ maxRetries: parseInt(e.target.value) })}
                    className={`w-full px-3 py-2 border rounded-lg transition-colors duration-300 ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Timeout (ms)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    max="60000"
                    step="1000"
                    value={config.analysisTimeout}
                    onChange={(e) => handleConfigChange({ analysisTimeout: parseInt(e.target.value) })}
                    className={`w-full px-3 py-2 border rounded-lg transition-colors duration-300 ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Cache Size
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={config.maxCacheSize}
                    onChange={(e) => handleConfigChange({ maxCacheSize: parseInt(e.target.value) })}
                    className={`w-full px-3 py-2 border rounded-lg transition-colors duration-300 ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Confidence Threshold (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={config.defaultConfidenceThreshold}
                    onChange={(e) => handleConfigChange({ defaultConfidenceThreshold: parseInt(e.target.value) })}
                    className={`w-full px-3 py-2 border rounded-lg transition-colors duration-300 ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              {/* Toggle Settings */}
              <div className="space-y-4">
                {[
                  { key: 'cacheResults', label: 'Enable Caching', description: 'Cache AI responses to improve performance' },
                  { key: 'enableRealTimeAnalysis', label: 'Real-time Analysis', description: 'Enable real-time AI analysis' },
                  { key: 'circuitBreakerEnabled', label: 'Circuit Breaker', description: 'Automatically disable AI when errors occur' },
                  { key: 'batchProcessingEnabled', label: 'Batch Processing', description: 'Process multiple requests in batches' }
                ].map((setting) => (
                  <div key={setting.key} className={`flex items-center justify-between p-4 rounded-lg transition-colors duration-300 ${
                    isDark ? 'bg-gray-800' : 'bg-gray-50'
                  }`}>
                    <div>
                      <p className={`font-medium ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>{setting.label}</p>
                      <p className={`text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>{setting.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config[setting.key as keyof AIServiceConfig] as boolean}
                        onChange={(e) => handleConfigChange({ [setting.key]: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'usage' && usageMetrics && (
            <div className="space-y-6">
              <h3 className={`text-lg font-semibold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Usage Statistics</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${
                  isDark ? 'bg-gray-800' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    <span className={`font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>Total Requests</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-400">{usageMetrics.totalRequests.toLocaleString()}</p>
                </div>

                <div className={`p-4 rounded-lg ${
                  isDark ? 'bg-gray-800' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className={`font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>Success Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-green-400">
                    {((usageMetrics.successfulRequests / usageMetrics.totalRequests) * 100).toFixed(1)}%
                  </p>
                </div>

                <div className={`p-4 rounded-lg ${
                  isDark ? 'bg-gray-800' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-yellow-400" />
                    <span className={`font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>Avg Response Time</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-400">{usageMetrics.averageResponseTime}ms</p>
                </div>

                <div className={`p-4 rounded-lg ${
                  isDark ? 'bg-gray-800' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="w-5 h-5 text-purple-400" />
                    <span className={`font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>Estimated Cost</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-400">${usageMetrics.estimatedCost.toFixed(2)}</p>
                </div>
              </div>

              {/* Feature Usage Breakdown */}
              <div>
                <h4 className={`font-medium mb-3 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Feature Usage</h4>
                <div className="space-y-2">
                  {[
                    { key: 'fraudAnalysisCount', label: 'Fraud Detection', color: 'text-red-400' },
                    { key: 'creditScoringCount', label: 'Credit Scoring', color: 'text-green-400' },
                    { key: 'securityAnalysisCount', label: 'Security Analysis', color: 'text-yellow-400' },
                    { key: 'generalInsightsCount', label: 'General Insights', color: 'text-blue-400' }
                  ].map((feature) => (
                    <div key={feature.key} className="flex justify-between items-center">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{feature.label}</span>
                      <span className={`font-medium ${feature.color}`}>
                        {usageMetrics[feature.key as keyof AIUsageMetrics]?.toLocaleString() || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`border-t p-6 flex justify-between transition-colors duration-300 ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex space-x-3">
            <button
              onClick={handleResetToDefaults}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                isDark 
                  ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset to Defaults</span>
            </button>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className={`px-6 py-2 rounded-lg transition-colors ${
                isDark 
                  ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveConfiguration}
              disabled={!hasUnsavedChanges || isLoading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};