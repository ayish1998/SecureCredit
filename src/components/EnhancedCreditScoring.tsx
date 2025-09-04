import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  Download, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Search,
  Filter,
  BarChart3,
  PieChart,
  Zap,
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Smartphone,
  X,
  Brain,
  Activity,
  RefreshCw
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { DataAdapter } from '../utils/dataAdapter';
import { aiService } from '../services/aiService';
import { transformCreditForAI } from '../utils/aiDataTransformer';
import { CreditEnhancement } from '../types/ai';

interface CreditProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  score: number;
  risk: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'No Score';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
  transactionHistory: number;
  defaultHistory: number;
  monthlyIncome: number;
  location: string;
  mobileMoneyProvider: string;
  accountAge: number;
  creditUtilization: number;
  paymentHistory: number;
}

interface AIInsight {
  type: 'positive' | 'negative' | 'neutral';
  message: string;
  impact: number;
}

interface AIEnhancedProfile extends CreditProfile {
  aiAnalysis?: CreditEnhancement;
  aiEnhancedScore?: number;
  aiConfidence?: number;
  aiRecommendations?: string[];
  lastAiAnalysis?: string;
}

export const EnhancedCreditScoring: React.FC = () => {
  const { isDark } = useTheme();
  const [creditProfiles, setCreditProfiles] = useState<AIEnhancedProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [selectedProfile, setSelectedProfile] = useState<AIEnhancedProfile | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<AIEnhancedProfile | null>(null);
  const [analyzingProfileId, setAnalyzingProfileId] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [newProfile, setNewProfile] = useState<Partial<CreditProfile>>({
    name: '',
    phone: '',
    email: '',
    monthlyIncome: 0,
    location: '',
    mobileMoneyProvider: 'MTN Mobile Money'
  });
  
  // AI Service state
  const [isAiInitialized, setIsAiInitialized] = useState(false);
  const [aiServiceStatus, setAiServiceStatus] = useState<any>(null);
  const [aiAnalysisHistory, setAiAnalysisHistory] = useState<CreditEnhancement[]>([]);
  const [showAiInsights, setShowAiInsights] = useState(true);

  useEffect(() => {
    // Initialize AI service
    initializeAIService();
    
    // Generate initial credit profiles using sophisticated Ghanaian fraud dataset
    const initialProfiles = DataAdapter.generateCreditProfiles(12);
    setCreditProfiles(initialProfiles);

    // Add some static high-quality profiles for demo
    const sampleProfiles: CreditProfile[] = [
      // Excellent Credit (800+)
      {
        id: '1',
        name: 'John Mwangi',
        phone: '+254 70 123 4567',
        email: 'john.mwangi@gmail.com',
        score: 820,
        risk: 'Excellent',
        trend: 'up',
        lastUpdated: '2024-01-15',
        transactionHistory: 234,
        defaultHistory: 0,
        monthlyIncome: 3200,
        location: 'Nairobi, Kenya',
        mobileMoneyProvider: 'M-Pesa',
        accountAge: 48,
        creditUtilization: 25,
        paymentHistory: 100
      },
      {
        id: '2',
        name: 'Aisha Kone',
        phone: '+223 70 456 789',
        email: 'aisha.kone@gmail.com',
        score: 845,
        risk: 'Excellent',
        trend: 'up',
        lastUpdated: '2024-01-15',
        transactionHistory: 312,
        defaultHistory: 0,
        monthlyIncome: 4100,
        location: 'Bamako, Mali',
        mobileMoneyProvider: 'Orange Money',
        accountAge: 52,
        creditUtilization: 18,
        paymentHistory: 100
      },
      {
        id: '3',
        name: 'Samuel Osei',
        phone: '+233 24 789 012',
        email: 'samuel.osei@yahoo.com',
        score: 810,
        risk: 'Excellent',
        trend: 'stable',
        lastUpdated: '2024-01-14',
        transactionHistory: 198,
        defaultHistory: 0,
        monthlyIncome: 3800,
        location: 'Kumasi, Ghana',
        mobileMoneyProvider: 'MTN Mobile Money',
        accountAge: 44,
        creditUtilization: 22,
        paymentHistory: 98
      },

      // Good Credit (700-799)
      {
        id: '4',
        name: 'Kwame Asante',
        phone: '+233 24 123 4567',
        email: 'kwame.asante@gmail.com',
        score: 745,
        risk: 'Good',
        trend: 'up',
        lastUpdated: '2024-01-15',
        transactionHistory: 156,
        defaultHistory: 0,
        monthlyIncome: 2500,
        location: 'Accra, Ghana',
        mobileMoneyProvider: 'MTN Mobile Money',
        accountAge: 36,
        creditUtilization: 35,
        paymentHistory: 98
      },
      {
        id: '5',
        name: 'Grace Nyong',
        phone: '+237 67 234 567',
        email: 'grace.nyong@gmail.com',
        score: 720,
        risk: 'Good',
        trend: 'up',
        lastUpdated: '2024-01-14',
        transactionHistory: 142,
        defaultHistory: 1,
        monthlyIncome: 2200,
        location: 'Douala, Cameroon',
        mobileMoneyProvider: 'MTN Mobile Money',
        accountAge: 32,
        creditUtilization: 42,
        paymentHistory: 94
      },
      {
        id: '6',
        name: 'Ibrahim Traore',
        phone: '+226 70 345 678',
        email: 'ibrahim.traore@yahoo.com',
        score: 765,
        risk: 'Good',
        trend: 'stable',
        lastUpdated: '2024-01-13',
        transactionHistory: 178,
        defaultHistory: 0,
        monthlyIncome: 2800,
        location: 'Ouagadougou, Burkina Faso',
        mobileMoneyProvider: 'Orange Money',
        accountAge: 38,
        creditUtilization: 38,
        paymentHistory: 96
      },

      // Fair Credit (600-699)
      {
        id: '7',
        name: 'Amina Okafor',
        phone: '+234 80 987 6543',
        email: 'amina.okafor@yahoo.com',
        score: 620,
        risk: 'Fair',
        trend: 'stable',
        lastUpdated: '2024-01-14',
        transactionHistory: 89,
        defaultHistory: 1,
        monthlyIncome: 1800,
        location: 'Lagos, Nigeria',
        mobileMoneyProvider: 'Opay',
        accountAge: 24,
        creditUtilization: 65,
        paymentHistory: 85
      },
      {
        id: '8',
        name: 'Fatima Diallo',
        phone: '+221 77 555 1234',
        email: 'fatima.diallo@gmail.com',
        score: 650,
        risk: 'Fair',
        trend: 'up',
        lastUpdated: '2024-01-13',
        transactionHistory: 67,
        defaultHistory: 2,
        monthlyIncome: 1500,
        location: 'Dakar, Senegal',
        mobileMoneyProvider: 'Orange Money',
        accountAge: 18,
        creditUtilization: 72,
        paymentHistory: 78
      },
      {
        id: '9',
        name: 'Moses Banda',
        phone: '+260 97 678 901',
        email: 'moses.banda@gmail.com',
        score: 680,
        risk: 'Fair',
        trend: 'down',
        lastUpdated: '2024-01-12',
        transactionHistory: 95,
        defaultHistory: 2,
        monthlyIncome: 1600,
        location: 'Lusaka, Zambia',
        mobileMoneyProvider: 'MTN Mobile Money',
        accountAge: 22,
        creditUtilization: 68,
        paymentHistory: 82
      },

      // Poor Credit (500-599)
      {
        id: '10',
        name: 'Blessing Okoro',
        phone: '+234 81 456 789',
        email: 'blessing.okoro@yahoo.com',
        score: 520,
        risk: 'Poor',
        trend: 'down',
        lastUpdated: '2024-01-11',
        transactionHistory: 45,
        defaultHistory: 4,
        monthlyIncome: 900,
        location: 'Port Harcourt, Nigeria',
        mobileMoneyProvider: 'Opay',
        accountAge: 12,
        creditUtilization: 85,
        paymentHistory: 65
      },
      {
        id: '11',
        name: 'Joseph Mutua',
        phone: '+254 72 789 012',
        email: 'joseph.mutua@gmail.com',
        score: 580,
        risk: 'Poor',
        trend: 'stable',
        lastUpdated: '2024-01-10',
        transactionHistory: 38,
        defaultHistory: 3,
        monthlyIncome: 1100,
        location: 'Mombasa, Kenya',
        mobileMoneyProvider: 'Airtel Money',
        accountAge: 15,
        creditUtilization: 82,
        paymentHistory: 68
      },

      // No Score (New users)
      {
        id: '12',
        name: 'Mary Adjei',
        phone: '+233 26 890 123',
        email: 'mary.adjei@gmail.com',
        score: 0,
        risk: 'No Score',
        trend: 'stable',
        lastUpdated: '2024-01-15',
        transactionHistory: 3,
        defaultHistory: 0,
        monthlyIncome: 800,
        location: 'Tema, Ghana',
        mobileMoneyProvider: 'Vodafone Cash',
        accountAge: 2,
        creditUtilization: 0,
        paymentHistory: 0
      },
      {
        id: '13',
        name: 'Ahmed Hassan',
        phone: '+256 78 345 678',
        email: 'ahmed.hassan@yahoo.com',
        score: 0,
        risk: 'No Score',
        trend: 'stable',
        lastUpdated: '2024-01-14',
        transactionHistory: 1,
        defaultHistory: 0,
        monthlyIncome: 600,
        location: 'Kampala, Uganda',
        mobileMoneyProvider: 'MTN Mobile Money',
        accountAge: 1,
        creditUtilization: 0,
        paymentHistory: 0
      }
    ];
    setCreditProfiles(sampleProfiles);
  }, []);

  const initializeAIService = async () => {
    try {
      await aiService.initialize({
        enableFallback: true,
        cacheResults: true,
      });
      
      setIsAiInitialized(true);
      setAiServiceStatus(aiService.getStatus());
    } catch (error) {
      console.error('Failed to initialize AI service for credit scoring:', error);
      setIsAiInitialized(false);
    }
  };

  const analyzeProfile = async (profile: AIEnhancedProfile) => {
    setAnalyzingProfileId(profile.id);
    setSelectedProfile(profile);
    
    try {
      let aiAnalysis: CreditEnhancement | null = null;
      
      // If AI service is available, get enhanced analysis
      if (isAiInitialized) {
        try {
          const creditData = {
            creditScore: profile.score,
            income: profile.monthlyIncome,
            employmentStatus: 'employed', // Assume employed for demo
            creditHistory: [
              {
                type: 'mobile_money',
                status: 'active',
                balance: profile.monthlyIncome * 0.1,
                openDate: new Date(Date.now() - profile.accountAge * 30 * 24 * 60 * 60 * 1000).toISOString(),
              }
            ],
            existingDebts: profile.monthlyIncome * (profile.creditUtilization / 100),
            paymentHistory: Array.from({ length: Math.min(profile.transactionHistory, 12) }, (_, i) => ({
              amount: Math.random() * 200 + 50,
              date: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'completed',
              onTime: Math.random() > (100 - profile.paymentHistory) / 100,
            })),
            demographics: {
              region: profile.location.split(',')[1]?.trim() || 'Unknown',
              employmentSector: 'Technology',
              educationLevel: 'Secondary',
            }
          };

          const transformedData = transformCreditForAI(creditData);
          aiAnalysis = await aiService.enhanceCreditScoring(transformedData, {
            userId: profile.id,
            priority: profile.score < 600 ? 'high' : 'medium',
            analysisType: 'credit'
          });
          
          // Add to AI analysis history
          setAiAnalysisHistory(prev => [aiAnalysis!, ...prev.slice(0, 19)]); // Keep last 20
          
          // Update profile with AI analysis
          const updatedProfile: AIEnhancedProfile = {
            ...profile,
            aiAnalysis,
            aiEnhancedScore: aiAnalysis.enhancedScore,
            aiConfidence: aiAnalysis.confidence,
            aiRecommendations: aiAnalysis.recommendations,
            lastAiAnalysis: new Date().toISOString(),
          };
          
          // Update the profile in the list
          setCreditProfiles(prev => prev.map(p => p.id === profile.id ? updatedProfile : p));
          setSelectedProfile(updatedProfile);
          
        } catch (aiError) {
          console.error('AI analysis failed, using fallback:', aiError);
        }
      }
      
      // Generate insights from AI analysis or fallback to traditional analysis
      const insights: AIInsight[] = aiAnalysis ? [
        {
          type: aiAnalysis.enhancedScore > profile.score ? 'positive' : 'negative',
          message: `AI enhanced score: ${aiAnalysis.enhancedScore} (${aiAnalysis.enhancedScore > profile.score ? '+' : ''}${aiAnalysis.enhancedScore - profile.score} points)`,
          impact: aiAnalysis.enhancedScore - profile.score
        },
        {
          type: aiAnalysis.riskLevel === 'low' ? 'positive' : aiAnalysis.riskLevel === 'high' ? 'negative' : 'neutral',
          message: `AI risk assessment: ${aiAnalysis.riskLevel} risk with ${aiAnalysis.confidence}% confidence`,
          impact: aiAnalysis.riskLevel === 'low' ? 20 : aiAnalysis.riskLevel === 'high' ? -20 : 0
        },
        {
          type: 'neutral',
          message: aiAnalysis.reasoning,
          impact: 0
        },
        ...aiAnalysis.recommendations.slice(0, 2).map(rec => ({
          type: 'positive' as const,
          message: `Recommendation: ${rec}`,
          impact: 5
        }))
      ] : [
        // Fallback traditional insights
        {
          type: profile.paymentHistory > 90 ? 'positive' : 'negative',
          message: `Payment history of ${profile.paymentHistory}% ${profile.paymentHistory > 90 ? 'shows excellent reliability' : 'indicates some payment delays'}`,
          impact: profile.paymentHistory > 90 ? 25 : -15
        },
        {
          type: profile.creditUtilization < 50 ? 'positive' : 'negative',
          message: `Credit utilization at ${profile.creditUtilization}% ${profile.creditUtilization < 50 ? 'demonstrates good financial discipline' : 'suggests high debt burden'}`,
          impact: profile.creditUtilization < 50 ? 20 : -20
        },
        {
          type: profile.accountAge > 24 ? 'positive' : 'neutral',
          message: `Account age of ${profile.accountAge} months ${profile.accountAge > 24 ? 'shows established financial history' : 'indicates newer financial relationship'}`,
          impact: profile.accountAge > 24 ? 15 : 0
        },
        {
          type: profile.transactionHistory > 100 ? 'positive' : 'neutral',
          message: `${profile.transactionHistory} transactions ${profile.transactionHistory > 100 ? 'demonstrate active financial engagement' : 'show moderate activity'}`,
          impact: profile.transactionHistory > 100 ? 10 : 5
        }
      ];
      
      setAiInsights(insights);
      
    } catch (error) {
      console.error('Error in credit analysis:', error);
      
      // Fallback insights
      const fallbackInsights: AIInsight[] = [
        {
          type: 'neutral',
          message: 'Analysis completed using traditional scoring methods',
          impact: 0
        },
        {
          type: profile.score > 700 ? 'positive' : 'negative',
          message: `Current score of ${profile.score} indicates ${profile.score > 700 ? 'good' : 'fair'} creditworthiness`,
          impact: profile.score > 700 ? 10 : -10
        }
      ];
      
      setAiInsights(fallbackInsights);
    } finally {
      setAnalyzingProfileId(null);
      setShowDetailModal(true);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Excellent': return 'text-green-400 bg-green-500/20';
      case 'Good': return 'text-blue-400 bg-blue-500/20';
      case 'Fair': return 'text-yellow-400 bg-yellow-500/20';
      case 'Poor': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const filteredProfiles = creditProfiles.filter(profile => {
    const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.phone.includes(searchTerm) ||
                         profile.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRisk === 'all' || profile.risk === filterRisk;
    return matchesSearch && matchesFilter;
  });

  const addNewProfile = () => {
    if (!newProfile.name || !newProfile.phone || !newProfile.email) {
      alert('Please fill in all required fields');
      return;
    }

    const profile: CreditProfile = {
      id: Date.now().toString(),
      name: newProfile.name,
      phone: newProfile.phone,
      email: newProfile.email,
      score: 0, // New users start with no score
      risk: 'No Score',
      trend: 'stable',
      lastUpdated: new Date().toISOString().split('T')[0],
      transactionHistory: 0,
      defaultHistory: 0,
      monthlyIncome: newProfile.monthlyIncome || 0,
      location: newProfile.location || '',
      mobileMoneyProvider: newProfile.mobileMoneyProvider || 'MTN Mobile Money',
      accountAge: 0,
      creditUtilization: 0,
      paymentHistory: 0
    };

    setCreditProfiles(prev => [profile, ...prev]);
    setNewProfile({
      name: '',
      phone: '',
      email: '',
      monthlyIncome: 0,
      location: '',
      mobileMoneyProvider: 'MTN Mobile Money'
    });
    setShowAddModal(false);
  };

  const averageScore = Math.round(creditProfiles.filter(p => p.score > 0).reduce((sum, p) => sum + p.score, 0) / creditProfiles.filter(p => p.score > 0).length) || 0;
  const riskDistribution = creditProfiles.reduce((acc, p) => {
    acc[p.risk] = (acc[p.risk] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>AI Credit Scoring</h2>
          <p className={`${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>Intelligent credit assessment for unbanked populations</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Search profiles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-300 ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-300 text-sm sm:text-base ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Risks</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
              <option value="No Score">No Score</option>
            </select>

            <button
              onClick={() => setShowAiInsights(!showAiInsights)}
              className={`${showAiInsights ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'} text-white font-medium py-2 px-3 sm:px-4 rounded-lg transition-colors flex items-center space-x-2 text-sm`}
              title="Toggle AI insights display"
            >
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">AI Insights</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline sm:hidden">Add</span>
              <span className="hidden sm:inline">Add User</span>
            </button>
          </div>
        </div>
        
        {/* AI Service Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isAiInitialized ? 'bg-green-400' : 'bg-orange-400'}`}></div>
              <span className={`text-xs sm:text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                AI Credit Analysis {isAiInitialized ? 'Active' : 'Fallback Mode'}
              </span>
            </div>
            {analyzingProfileId && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <span className={`text-xs sm:text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Analyzing...
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setAiServiceStatus(aiService.getStatus())}
            className={`text-xs ${
              isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'
            } transition-colors flex items-center space-x-1`}
            title="Refresh AI service status"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`rounded-xl p-6 border transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Total Profiles</p>
              <p className={`text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>{creditProfiles.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className={`rounded-xl p-6 border transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Average Score</p>
              <p className={`text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>{averageScore}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className={`rounded-xl p-6 border transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>High Risk</p>
              <p className="text-2xl font-bold text-red-400">{riskDistribution['Poor'] || 0}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className={`rounded-xl p-6 border transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Excellent Credit</p>
              <p className="text-2xl font-bold text-green-400">{riskDistribution['Excellent'] || 0}</p>
            </div>
            <Star className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* AI Service Status and Insights */}
      {showAiInsights && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* AI Service Status */}
          <div className={`rounded-xl p-6 border transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center space-x-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <Brain className="w-5 h-5 text-blue-400" />
              <span>AI Credit Analysis Status</span>
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Service Status</span>
                <div className="flex items-center space-x-2">
                  {isAiInitialized ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-orange-400" />
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
                    <span className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>AI Available</span>
                    <span className={`text-sm font-medium ${
                      aiServiceStatus.aiAvailable ? 'text-green-400' : 'text-orange-400'
                    }`}>
                      {aiServiceStatus.aiAvailable ? 'Yes' : 'No'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>Cache Size</span>
                    <span className={`text-sm font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {aiServiceStatus.cacheSize} items
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>Enhanced Profiles</span>
                    <span className={`text-sm font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {creditProfiles.filter(p => p.aiAnalysis).length}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Recent AI Analysis */}
          <div className={`rounded-xl p-6 border transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center space-x-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <Activity className="w-5 h-5 text-purple-400" />
              <span>Recent AI Analysis</span>
            </h3>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {aiAnalysisHistory.length === 0 ? (
                <p className={`text-center py-4 text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>No AI analysis yet</p>
              ) : (
                aiAnalysisHistory.slice(0, 5).map((analysis, index) => (
                  <div key={index} className={`p-3 rounded-lg transition-colors duration-300 ${
                    isDark 
                      ? 'bg-gray-700/50' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${getRiskColor(analysis.riskLevel === 'low' ? 'Excellent' : analysis.riskLevel === 'medium' ? 'Good' : 'Poor')}`}>
                        {analysis.riskLevel}
                      </span>
                      <span className={`text-xs ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {analysis.confidence}% confident
                      </span>
                    </div>
                    <p className={`text-sm mb-1 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Enhanced Score: {analysis.enhancedScore}
                    </p>
                    <p className={`text-xs ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {analysis.reasoning.substring(0, 80)}...
                    </p>
                    {analysis.recommendations && analysis.recommendations.length > 0 && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {analysis.recommendations.slice(0, 2).map((rec, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                              {rec.substring(0, 15)}...
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

      {/* Credit Profiles List */}
      <div className={`rounded-xl border transition-colors duration-300 ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200 shadow-sm'
      }`}>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredProfiles.map((profile) => (
            <div key={profile.id} className={`p-6 transition-colors duration-300 hover:bg-opacity-50 ${
              isDark 
                ? 'hover:bg-gray-700' 
                : 'hover:bg-gray-50'
            }`}>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                {/* User Info */}
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold">{profile.name.charAt(0)}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className={`font-semibold truncate ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>{profile.name}</h3>
                      {getTrendIcon(profile.trend)}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm space-y-1 sm:space-y-0">
                      <span className={`${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>{profile.location}</span>
                      <span className={`${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>{profile.phone}</span>
                      <span className={`${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>{profile.email}</span>
                    </div>
                  </div>
                </div>

                {/* Credit Info */}
                <div className="flex items-center justify-between lg:justify-end lg:space-x-6 flex-shrink-0">
                  <div className="text-center">
                    <div className={`text-lg font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>{profile.score}</div>
                    {profile.aiEnhancedScore && profile.aiEnhancedScore !== profile.score && (
                      <div className={`text-sm font-medium ${
                        profile.aiEnhancedScore > profile.score ? 'text-green-400' : 'text-red-400'
                      }`}>
                        AI: {profile.aiEnhancedScore}
                      </div>
                    )}
                    <div className={`text-xs ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>Score</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(profile.risk)}`}>
                      {profile.risk}
                    </div>
                    {profile.aiAnalysis && (
                      <div className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded mt-1 font-medium">
                        AI Enhanced
                      </div>
                    )}
                    <div className={`text-xs mt-1 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>Risk</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-sm font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>${profile.monthlyIncome}</div>
                    <div className={`text-xs ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>Income</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm font-medium text-green-400">{profile.paymentHistory}%</div>
                    <div className={`text-xs ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>Payment</div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 mt-4 lg:mt-0">
                    <button
                      onClick={() => analyzeProfile(profile)}
                      disabled={analyzingProfileId === profile.id}
                      className={`flex items-center space-x-1 px-3 py-2 ${
                        profile.aiAnalysis ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                      } disabled:bg-gray-600 text-white rounded-lg transition-colors text-sm`}
                    >
                      {analyzingProfileId === profile.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="hidden sm:inline">Analyzing...</span>
                        </>
                      ) : (
                        <>
                          {profile.aiAnalysis ? <CheckCircle className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                          <span className="hidden sm:inline">
                            {profile.aiAnalysis ? `${profile.aiConfidence}%` : 'AI Analysis'}
                          </span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => {
                        setEditingProfile(profile);
                        setShowEditModal(true);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark 
                          ? 'hover:bg-gray-700 text-gray-400' 
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                      title="Edit Profile"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this profile?')) {
                          setCreditProfiles(prev => prev.filter(p => p.id !== profile.id));
                        }
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark 
                          ? 'hover:bg-red-900/20 text-red-400' 
                          : 'hover:bg-red-50 text-red-600'
                      }`}
                      title="Delete Profile"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Analysis Modal */}
      {showDetailModal && selectedProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl border w-full max-w-4xl max-h-[90vh] overflow-hidden transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-900 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className={`p-6 border-b transition-colors duration-300 ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-bold">{selectedProfile.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>{selectedProfile.name}</h3>
                    <p className={`${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>{selectedProfile.location}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
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

            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Credit Score Breakdown */}
                <div className="space-y-4">
                  <h4 className={`text-lg font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Credit Score Breakdown</h4>
                  
                  <div className={`rounded-lg p-4 transition-colors duration-300 ${
                    isDark 
                      ? 'bg-gray-800' 
                      : 'bg-gray-50'
                  }`}>
                    <div className="text-center mb-4">
                      <div className={`text-4xl font-bold mb-2 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>{selectedProfile.score}</div>
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(selectedProfile.risk)}`}>
                        {selectedProfile.risk}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className={`${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>Payment History</span>
                          <span className={`${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>{selectedProfile.paymentHistory}%</span>
                        </div>
                        <div className={`w-full rounded-full h-2 ${
                          isDark ? 'bg-gray-700' : 'bg-gray-200'
                        }`}>
                          <div 
                            className="bg-green-400 h-2 rounded-full" 
                            style={{ width: `${selectedProfile.paymentHistory}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className={`${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>Credit Utilization</span>
                          <span className={`${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>{selectedProfile.creditUtilization}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${selectedProfile.creditUtilization > 50 ? 'bg-red-400' : 'bg-blue-400'}`}
                            style={{ width: `${selectedProfile.creditUtilization}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Account Age</span>
                          <span className="text-white">{selectedProfile.accountAge} months</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-purple-400 h-2 rounded-full" 
                            style={{ width: `${Math.min(selectedProfile.accountAge * 2, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Insights */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">AI Insights</h4>
                  
                  <div className="space-y-3">
                    {aiInsights.map((insight, index) => (
                      <div key={index} className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            insight.type === 'positive' ? 'bg-green-500/20' :
                            insight.type === 'negative' ? 'bg-red-500/20' : 'bg-gray-500/20'
                          }`}>
                            {insight.type === 'positive' ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : insight.type === 'negative' ? (
                              <AlertCircle className="w-4 h-4 text-red-400" />
                            ) : (
                              <Clock className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-white">{insight.message}</p>
                            <p className={`text-xs mt-1 ${
                              insight.impact > 0 ? 'text-green-400' : 
                              insight.impact < 0 ? 'text-red-400' : 'text-gray-400'
                            }`}>
                              Impact: {insight.impact > 0 ? '+' : ''}{insight.impact} points
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <h4 className="text-lg font-semibold text-white mb-4">Contact & Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-300">{selectedProfile.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-300">{selectedProfile.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-300">{selectedProfile.location}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-300">{selectedProfile.mobileMoneyProvider}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddModal(false);
            }
          }}
        >
          <div className={`rounded-2xl border w-full max-w-md max-h-[90vh] overflow-y-auto transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-900 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className={`p-6 border-b transition-colors duration-300 ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Add New User</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark 
                      ? 'hover:bg-gray-800 text-gray-400' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); addNewProfile(); }} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={newProfile.name || ''}
                    onChange={(e) => setNewProfile(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-300 ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newProfile.phone || ''}
                    onChange={(e) => setNewProfile(prev => ({ ...prev, phone: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-300 ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Enter phone number"
                    required
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
                  value={newProfile.email || ''}
                  onChange={(e) => setNewProfile(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-300 ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Monthly Income ($)
                  </label>
                  <input
                    type="number"
                    value={newProfile.monthlyIncome || ''}
                    onChange={(e) => setNewProfile(prev => ({ ...prev, monthlyIncome: Number(e.target.value) }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-300 ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Enter monthly income"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Location
                  </label>
                  <input
                    type="text"
                    value={newProfile.location || ''}
                    onChange={(e) => setNewProfile(prev => ({ ...prev, location: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-300 ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Enter location"
                    required
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Mobile Money Provider
                </label>
                <select
                  value={newProfile.mobileMoneyProvider || ''}
                  onChange={(e) => setNewProfile(prev => ({ ...prev, mobileMoneyProvider: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-300 ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  required
                >
                  <option value="">Select provider</option>
                  <option value="MTN Mobile Money">MTN Mobile Money</option>
                  <option value="Airtel Money">Airtel Money</option>
                  <option value="Orange Money">Orange Money</option>
                  <option value="Vodafone Cash">Vodafone Cash</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    isDark 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingProfile && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditModal(false);
              setEditingProfile(null);
            }
          }}
        >
          <div className={`rounded-2xl border w-full max-w-md transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-900 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className={`p-6 border-b transition-colors duration-300 ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Edit Profile</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingProfile(null);
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark 
                      ? 'hover:bg-gray-800 text-gray-400' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingProfile) {
                setCreditProfiles(prev => 
                  prev.map(p => p.id === editingProfile.id ? editingProfile : p)
                );
                setShowEditModal(false);
                setEditingProfile(null);
              }
            }}>
              <div className="p-6 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={editingProfile.name}
                    onChange={(e) => setEditingProfile({...editingProfile, name: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-300 ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={editingProfile.phone}
                    onChange={(e) => setEditingProfile({...editingProfile, phone: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-300 ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="+254 70 123 4567"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={editingProfile.email}
                    onChange={(e) => setEditingProfile({...editingProfile, email: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-300 ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="user@example.com"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Monthly Income ($)
                  </label>
                  <input
                    type="number"
                    value={editingProfile.monthlyIncome}
                    onChange={(e) => setEditingProfile({...editingProfile, monthlyIncome: parseInt(e.target.value) || 0})}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-300 ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="2500"
                    min="0"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Location
                  </label>
                  <input
                    type="text"
                    value={editingProfile.location}
                    onChange={(e) => setEditingProfile({...editingProfile, location: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-300 ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Nairobi, Kenya"
                  />
                </div>
              </div>

              <div className={`p-6 border-t flex space-x-3 transition-colors duration-300 ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingProfile(null);
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    isDark 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};