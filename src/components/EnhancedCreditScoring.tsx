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
  Smartphone
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

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

export const EnhancedCreditScoring: React.FC = () => {
  const { isDark } = useTheme();
  const [creditProfiles, setCreditProfiles] = useState<CreditProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [selectedProfile, setSelectedProfile] = useState<CreditProfile | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [newProfile, setNewProfile] = useState<Partial<CreditProfile>>({
    name: '',
    phone: '',
    email: '',
    monthlyIncome: 0,
    location: '',
    mobileMoneyProvider: 'MTN Mobile Money'
  });

  useEffect(() => {
    // Initialize with comprehensive sample data covering all risk categories
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

  const analyzeProfile = async (profile: CreditProfile) => {
    setIsAnalyzing(true);
    setSelectedProfile(profile);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const insights: AIInsight[] = [
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
    setIsAnalyzing(false);
    setShowDetailModal(true);
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
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Search profiles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-300 ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
          
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className={`px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-300 ${
              isDark 
                ? 'bg-gray-800 border-gray-700 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">All Risk Levels</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
            <option value="No Score">No Score</option>
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
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

      {/* Credit Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfiles.map((profile) => (
          <div key={profile.id} className={`rounded-xl p-6 border transition-all duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-700 hover:border-blue-500/50' 
              : 'bg-white border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">{profile.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className={`font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{profile.name}</h3>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>{profile.location}</p>
                </div>
              </div>
              {getTrendIcon(profile.trend)}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Credit Score</span>
                <span className={`text-lg font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>{profile.score}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Risk Level</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(profile.risk)}`}>
                  {profile.risk}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Monthly Income</span>
                <span className={`text-sm ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>${profile.monthlyIncome}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Payment History</span>
                <span className="text-sm text-green-400">{profile.paymentHistory}%</span>
              </div>
            </div>

            <div className={`mt-4 pt-4 border-t transition-colors duration-300 ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={() => analyzeProfile(profile)}
                disabled={isAnalyzing}
                className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>AI Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
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
    </div>
  );
};