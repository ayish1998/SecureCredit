import React, { useState, useEffect } from 'react';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Users,
  BarChart3,
  Lock,
  Bell,
  Shield,
  Activity,
  Zap,
  RefreshCw,
  Eye,
  ShieldCheck,
  Cpu,
  Network,
  Globe,
  Clock,
  DollarSign
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { AIResponseDisplay, AIResponseCard } from './AIResponseDisplay';
import { EnhancedStatsCard, StatsGrid } from './EnhancedStatsCard';
import { LoadingSpinner, AIAnalysisLoader } from './LoadingSpinner';
import { aiService } from '../services/aiService';
import { AIAnalysisResponse, FraudAnalysis, CreditEnhancement, SecurityAssessment } from '../types/ai';

interface ModernDashboardProps {
  fraudStats: {
    totalTransactions: number;
    fraudDetected: number;
    fraudPrevented: number;
    riskScore: number;
  };
  recentAlerts: Array<{
    id: number;
    type: string;
    message: string;
    time: string;
    amount: string;
  }>;
  onNavigate: (tab: string) => void;
  onShowNotifications: () => void;
}

interface AIInsightSummary {
  type: 'fraud' | 'credit' | 'security';
  title: string;
  value: string | number;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  lastUpdated: string;
  analysis?: FraudAnalysis | CreditEnhancement | SecurityAssessment;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  recommendations?: string[];
}

export const ModernDashboard: React.FC<ModernDashboardProps> = ({
  fraudStats,
  recentAlerts,
  onNavigate,
  onShowNotifications,
}) => {
  const { isDark } = useTheme();
  
  // AI Service state
  const [isAiInitialized, setIsAiInitialized] = useState(false);
  const [aiInsights, setAiInsights] = useState<AIInsightSummary[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    activeUsers: 12847,
    systemHealth: 99.2,
    apiLatency: 145,
    threatLevel: 'low' as 'low' | 'medium' | 'high'
  });

  useEffect(() => {
    initializeAIService();
    
    // Real-time metrics update
    const metricsInterval = setInterval(() => {
      setRealTimeMetrics(prev => ({
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 20) - 10,
        systemHealth: Math.max(95, Math.min(100, prev.systemHealth + (Math.random() - 0.5) * 2)),
        apiLatency: Math.max(100, Math.min(300, prev.apiLatency + Math.floor(Math.random() * 20) - 10)),
        threatLevel: Math.random() > 0.95 ? 'medium' : 'low'
      }));
    }, 5000);

    return () => clearInterval(metricsInterval);
  }, []);

  const initializeAIService = async () => {
    try {
      await aiService.initialize({
        enableFallback: true,
        cacheResults: true,
      });
      
      setIsAiInitialized(true);
      await generateAIInsights();
      
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
      setIsAiInitialized(false);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const generateAIInsights = async () => {
    try {
      // Mock AI insights with realistic data
      const insights: AIInsightSummary[] = [
        {
          type: 'fraud',
          title: 'Fraud Prevention Rate',
          value: '98.7%',
          trend: 'up',
          confidence: 94.2,
          lastUpdated: 'Just now',
          riskLevel: 'low',
          recommendations: [
            'Continue monitoring transaction patterns',
            'Enhance device fingerprinting accuracy',
            'Update fraud detection models weekly'
          ]
        },
        {
          type: 'credit',
          title: 'Credit Assessment Accuracy',
          value: '96.3%',
          trend: 'stable',
          confidence: 91.8,
          lastUpdated: '2 minutes ago',
          riskLevel: 'low',
          recommendations: [
            'Integrate more alternative data sources',
            'Improve income verification processes',
            'Enhance credit history analysis'
          ]
        },
        {
          type: 'security',
          title: 'Security Threat Level',
          value: 'Low',
          trend: 'down',
          confidence: 97.1,
          lastUpdated: '5 minutes ago',
          riskLevel: 'low',
          recommendations: [
            'Maintain current security protocols',
            'Regular security audits scheduled',
            'Monitor for emerging threat patterns'
          ]
        }
      ];

      setAiInsights(insights);
      
    } catch (error) {
      console.error('Error generating AI insights:', error);
    }
  };

  const refreshInsights = async () => {
    setIsLoadingInsights(true);
    await generateAIInsights();
    setIsLoadingInsights(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center space-y-6 mb-12">
        <div className="relative">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gradient-primary mb-4">
            Securing Africa's Financial Future
          </h1>
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
        </div>
        <p className={`text-lg md:text-xl max-w-4xl mx-auto leading-relaxed ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          AI-powered fraud detection and credit assessment platform specifically designed for African mobile money systems
        </p>
        
        {/* Real-time Status Indicators */}
        <div className="flex justify-center space-x-8 mt-8">
          <div className="flex items-center space-x-2">
            <div className="status-online"></div>
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {realTimeMetrics.activeUsers.toLocaleString()} Active Users
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="status-online"></div>
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {realTimeMetrics.systemHealth.toFixed(1)}% System Health
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={realTimeMetrics.apiLatency < 200 ? "status-online" : "status-warning"}></div>
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {realTimeMetrics.apiLatency}ms API Response
            </span>
          </div>
        </div>
      </div>

      {/* AI Intelligence Center */}
      <div className={`card-modern p-8 ${isDark ? 'bg-gray-800/80' : 'bg-white/90'} backdrop-blur-xl`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center animate-glow">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gradient-primary">AI Intelligence Center</h2>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Real-time AI analysis and insights powered by advanced machine learning
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl ${
              isDark ? 'bg-green-500/20 border border-green-500/30' : 'bg-green-100 border border-green-200'
            }`}>
              <div className="status-online"></div>
              <span className={`text-sm font-medium ${
                isDark ? 'text-green-400' : 'text-green-700'
              }`}>
                AI Active
              </span>
            </div>
            
            <button
              onClick={refreshInsights}
              disabled={isLoadingInsights}
              className="btn-secondary flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingInsights ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* AI Insights Grid */}
        {isLoadingInsights ? (
          <AIAnalysisLoader message="Generating AI insights..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {aiInsights.map((insight, index) => {
              const content = [
                `Analysis Result: ${insight.value}`,
                '',
                `Risk Assessment: ${insight.riskLevel?.toUpperCase() || 'UNKNOWN'}`,
                `AI Confidence: ${insight.confidence.toFixed(1)}%`,
                `Last Updated: ${insight.lastUpdated}`,
                '',
                'AI Recommendations:',
                ...(insight.recommendations || []).map(rec => `• ${rec}`)
              ].join('\n');
              
              return (
                <AIResponseDisplay
                  key={index}
                  content={content}
                  type={insight.type}
                  confidence={insight.confidence}
                  showHeader={true}
                  compact={false}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Enhanced Stats Grid */}
      <StatsGrid columns={4}>
        <EnhancedStatsCard
          title="Total Transactions"
          value={fraudStats.totalTransactions}
          icon={BarChart3}
          color="blue"
          aiEnhanced={true}
          confidence={94}
          change={{ value: 12.5, type: 'increase', period: 'last month' }}
          trend={[65, 78, 82, 88, 92, 89, 95]}
          onClick={() => onNavigate('dashboard')}
        />
        
        <EnhancedStatsCard
          title="Fraud Detected"
          value={fraudStats.fraudDetected}
          icon={AlertTriangle}
          color="red"
          aiEnhanced={true}
          confidence={98}
          change={{ value: 8.2, type: 'decrease', period: 'last month' }}
          trend={[45, 52, 48, 41, 38, 35, 32]}
          onClick={() => onNavigate('fraud')}
        />
        
        <EnhancedStatsCard
          title="Prevention Rate"
          value={`${fraudStats.fraudPrevented}%`}
          icon={CheckCircle}
          color="green"
          aiEnhanced={true}
          confidence={96}
          change={{ value: 3.1, type: 'increase', period: 'last month' }}
          trend={[88, 91, 93, 95, 97, 98, 98]}
          onClick={() => onNavigate('security')}
        />
        
        <EnhancedStatsCard
          title="Risk Score"
          value={fraudStats.riskScore}
          icon={TrendingUp}
          color="yellow"
          aiEnhanced={true}
          confidence={87}
          change={{ value: 15.3, type: 'decrease', period: 'last month' }}
          trend={[35, 32, 28, 25, 23, 21, 23]}
          onClick={() => onNavigate('credit')}
        />
      </StatsGrid>

      {/* Real-time Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transaction Feed */}
        <div className={`lg:col-span-2 card-modern p-6 ${isDark ? 'bg-gray-800/80' : 'bg-white/90'}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gradient-primary">Live Transaction Feed</h3>
            <div className="flex items-center space-x-2">
              <div className="status-online"></div>
              <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Real-time
              </span>
            </div>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className={`p-4 rounded-xl border transition-all duration-300 hover-lift ${
                isDark ? 'bg-gray-700/30 border-gray-600/50' : 'bg-gray-50/80 border-gray-200/50'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`w-3 h-3 rounded-full mt-2 ${
                      alert.type === 'high' ? 'bg-red-400 animate-pulse' : 
                      alert.type === 'medium' ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'
                    }`}></div>
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {alert.message}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {alert.time}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    alert.type === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    alert.type === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {alert.amount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className={`card-modern p-6 ${isDark ? 'bg-gray-800/80' : 'bg-white/90'}`}>
          <h3 className="text-xl font-bold text-gradient-primary mb-6">System Status</h3>
          
          <div className="space-y-6">
            {/* AI Service Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Brain className="w-5 h-5 text-purple-500" />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  AI Service
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="status-online"></div>
                <span className="text-sm text-green-400 font-medium">Active</span>
              </div>
            </div>

            {/* Fraud Detection */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-red-500" />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Fraud Detection
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="status-online"></div>
                <span className="text-sm text-green-400 font-medium">98.7%</span>
              </div>
            </div>

            {/* Credit Scoring */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Credit Scoring
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="status-online"></div>
                <span className="text-sm text-green-400 font-medium">96.3%</span>
              </div>
            </div>

            {/* Security Monitoring */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Lock className="w-5 h-5 text-blue-500" />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Security Monitor
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="status-online"></div>
                <span className="text-sm text-green-400 font-medium">Secure</span>
              </div>
            </div>

            {/* API Performance */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  API Performance
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={realTimeMetrics.apiLatency < 200 ? "status-online" : "status-warning"}></div>
                <span className={`text-sm font-medium ${
                  realTimeMetrics.apiLatency < 200 ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {realTimeMetrics.apiLatency}ms
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 space-y-3">
            <button
              onClick={() => onNavigate('fraud')}
              className="w-full btn-secondary text-left"
            >
              <div className="flex items-center justify-between">
                <span>View Fraud Center</span>
                <AlertTriangle className="w-4 h-4" />
              </div>
            </button>
            
            <button
              onClick={() => onNavigate('security')}
              className="w-full btn-secondary text-left"
            >
              <div className="flex items-center justify-between">
                <span>Security Dashboard</span>
                <Shield className="w-4 h-4" />
              </div>
            </button>
            
            <button
              onClick={onShowNotifications}
              className="w-full btn-secondary text-left"
            >
              <div className="flex items-center justify-between">
                <span>View Notifications</span>
                <Bell className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className={`card-modern p-6 ${isDark ? 'bg-gray-800/80' : 'bg-white/90'}`}>
        <h3 className="text-xl font-bold text-gradient-primary mb-6">Performance Analytics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <p className="text-2xl font-bold text-gradient-primary">{realTimeMetrics.activeUsers.toLocaleString()}</p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Active Users</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <p className="text-2xl font-bold text-gradient-success">{realTimeMetrics.systemHealth.toFixed(1)}%</p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>System Health</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <p className="text-2xl font-bold text-gradient-warning">{realTimeMetrics.apiLatency}ms</p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>API Latency</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <p className="text-2xl font-bold text-gradient-danger capitalize">{realTimeMetrics.threatLevel}</p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Threat Level</p>
          </div>
        </div>
      </div>
    </div>
  );
};