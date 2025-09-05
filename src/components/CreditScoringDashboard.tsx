import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, FileText, Download, Plus, Edit, Trash2, Eye, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface CreditProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  score: number;
  risk: 'Low' | 'Medium' | 'High';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
  transactionHistory: number;
  defaultHistory: number;
  monthlyIncome: number;
  location: string;
}

interface CreditReport {
  id: string;
  profileId: string;
  reportType: 'individual' | 'batch' | 'summary';
  generatedAt: string;
  status: 'generating' | 'completed' | 'failed';
  downloadUrl?: string;
}

export const CreditScoringDashboard: React.FC = () => {
  const { isDark } = useTheme();
  const [creditProfiles, setCreditProfiles] = useState<CreditProfile[]>([]);
  const [reports, setReports] = useState<CreditReport[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<CreditProfile | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [newProfile, setNewProfile] = useState<Partial<CreditProfile>>({
    name: '',
    phone: '',
    email: '',
    monthlyIncome: 0,
    location: ''
  });

  useEffect(() => {
    // Initialize with sample data
    const sampleProfiles: CreditProfile[] = [
      {
        id: '1',
        name: 'Kwame Asante',
        phone: '+233 24 123 4567',
        email: 'kwame.asante@email.com',
        score: 745,
        risk: 'Low',
        trend: 'up',
        lastUpdated: new Date().toISOString(),
        transactionHistory: 156,
        defaultHistory: 0,
        monthlyIncome: 2500,
        location: 'Accra, Ghana'
      },
      {
        id: '2',
        name: 'Amina Okafor',
        phone: '+234 80 987 6543',
        email: 'amina.okafor@email.com',
        score: 620,
        risk: 'Medium',
        trend: 'stable',
        lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        transactionHistory: 89,
        defaultHistory: 1,
        monthlyIncome: 1800,
        location: 'Lagos, Nigeria'
      },
      {
        id: '3',
        name: 'Fatima Diallo',
        phone: '+221 77 555 1234',
        email: 'fatima.diallo@email.com',
        score: 580,
        risk: 'Medium',
        trend: 'down',
        lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        transactionHistory: 67,
        defaultHistory: 2,
        monthlyIncome: 1200,
        location: 'Dakar, Senegal'
      },
      {
        id: '4',
        name: 'John Mwangi',
        phone: '+254 70 123 4567',
        email: 'john.mwangi@email.com',
        score: 820,
        risk: 'Low',
        trend: 'up',
        lastUpdated: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        transactionHistory: 234,
        defaultHistory: 0,
        monthlyIncome: 3200,
        location: 'Nairobi, Kenya'
      }
    ];
    
    setCreditProfiles(sampleProfiles);
  }, []);

  const calculateCreditScore = (profile: Partial<CreditProfile>): number => {
    // Simplified credit scoring algorithm
    let score = 300; // Base score
    
    // Income factor (0-200 points)
    const incomeScore = Math.min((profile.monthlyIncome || 0) / 5000 * 200, 200);
    score += incomeScore;
    
    // Transaction history factor (0-150 points)
    const transactionScore = Math.min((profile.transactionHistory || 0) / 200 * 150, 150);
    score += transactionScore;
    
    // Default history penalty (0-100 points deduction)
    const defaultPenalty = (profile.defaultHistory || 0) * 50;
    score -= defaultPenalty;
    
    // Random factor for demo (0-50 points)
    score += Math.random() * 50;
    
    return Math.max(300, Math.min(850, Math.round(score)));
  };

  const getRiskLevel = (score: number): 'Low' | 'Medium' | 'High' => {
    if (score >= 700) return 'Low';
    if (score >= 600) return 'Medium';
    return 'High';
  };

  const addProfile = async () => {
    if (!newProfile.name || !newProfile.phone) return;
    
    const score = calculateCreditScore(newProfile);
    const profile: CreditProfile = {
      id: Date.now().toString(),
      name: newProfile.name,
      phone: newProfile.phone,
      email: newProfile.email || '',
      score,
      risk: getRiskLevel(score),
      trend: 'stable',
      lastUpdated: new Date().toISOString(),
      transactionHistory: Math.floor(Math.random() * 100) + 10,
      defaultHistory: Math.floor(Math.random() * 3),
      monthlyIncome: newProfile.monthlyIncome || 0,
      location: newProfile.location || ''
    };
    
    setCreditProfiles(prev => [profile, ...prev]);
    setNewProfile({ name: '', phone: '', email: '', monthlyIncome: 0, location: '' });
    setShowAddModal(false);
  };

  const updateProfile = async () => {
    if (!editingProfile) return;
    
    const updatedScore = calculateCreditScore(editingProfile);
    const updatedProfile = {
      ...editingProfile,
      score: updatedScore,
      risk: getRiskLevel(updatedScore),
      lastUpdated: new Date().toISOString()
    };
    
    setCreditProfiles(prev => 
      prev.map(p => p.id === editingProfile.id ? updatedProfile : p)
    );
    setEditingProfile(null);
    setShowEditModal(false);
  };

  const deleteProfile = (id: string) => {
    setCreditProfiles(prev => prev.filter(p => p.id !== id));
    setSelectedProfiles(prev => prev.filter(pid => pid !== id));
  };

  const generateReport = async (type: 'individual' | 'batch' | 'summary') => {
    setIsGeneratingReport(true);
    
    const report: CreditReport = {
      id: Date.now().toString(),
      profileId: type === 'individual' ? selectedProfiles[0] : 'batch',
      reportType: type,
      generatedAt: new Date().toISOString(),
      status: 'generating'
    };
    
    setReports(prev => [report, ...prev]);
    
    // Simulate report generation
    setTimeout(() => {
      setReports(prev => 
        prev.map(r => 
          r.id === report.id 
            ? { ...r, status: 'completed', downloadUrl: `/reports/${report.id}.pdf` }
            : r
        )
      );
      setIsGeneratingReport(false);
    }, 3000);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-400 bg-green-500/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'High': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-400 transform rotate-180" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Credit Scoring Dashboard</h2>
          <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>AI-powered credit assessment for mobile money users</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Profile</span>
          </button>
          <button
            onClick={() => generateReport('summary')}
            disabled={isGeneratingReport}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>{isGeneratingReport ? 'Generating...' : 'Generate Report'}</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className={`rounded-xl p-4 sm:p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Profiles</p>
              <p className={`text-lg sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{creditProfiles.length}</p>
            </div>
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
          </div>
        </div>
        
        <div className={`rounded-xl p-4 sm:p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Avg Score</p>
              <p className={`text-lg sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {Math.round(creditProfiles.reduce((sum, p) => sum + p.score, 0) / creditProfiles.length || 0)}
              </p>
            </div>
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
          </div>
        </div>
        
        <div className={`rounded-xl p-4 sm:p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Low Risk</p>
              <p className="text-lg sm:text-2xl font-bold text-green-400">
                {creditProfiles.filter(p => p.risk === 'Low').length}
              </p>
            </div>
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
          </div>
        </div>
        
        <div className={`rounded-xl p-4 sm:p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>High Risk</p>
              <p className="text-lg sm:text-2xl font-bold text-red-400">
                {creditProfiles.filter(p => p.risk === 'High').length}
              </p>
            </div>
            <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Credit Profiles Table */}
      <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
        <div className={`p-4 sm:p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Credit Profiles</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              {selectedProfiles.length > 0 && (
                <button
                  onClick={() => generateReport('batch')}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
                >
                  Generate Batch Report ({selectedProfiles.length})
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={isDark ? 'bg-gray-700/50' : 'bg-gray-50'}>
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedProfiles.length === creditProfiles.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProfiles(creditProfiles.map(p => p.id));
                      } else {
                        setSelectedProfiles([]);
                      }
                    }}
                    className={`w-4 h-4 text-blue-600 rounded ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                </th>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Customer
                </th>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Score
                </th>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Risk
                </th>
                <th className={`hidden sm:table-cell px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Trend
                </th>
                <th className={`hidden lg:table-cell px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Income
                </th>
                <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={isDark ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}>
              {creditProfiles.map((profile) => (
                <tr key={profile.id} className={isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'}>
                  <td className="px-3 sm:px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedProfiles.includes(profile.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProfiles(prev => [...prev, profile.id]);
                        } else {
                          setSelectedProfiles(prev => prev.filter(id => id !== profile.id));
                        }
                      }}
                      className={`w-4 h-4 text-blue-600 rounded ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
                    />
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                        <span className="text-xs sm:text-sm font-medium text-white">
                          {profile.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{profile.name}</div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{profile.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{profile.score}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(profile.risk)}`}>
                      {profile.risk}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getTrendIcon(profile.trend)}
                      <span className={`text-sm ml-1 ${
                        profile.trend === 'up' ? 'text-green-400' :
                        profile.trend === 'down' ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {profile.trend === 'up' ? 'Improving' : 
                         profile.trend === 'down' ? 'Declining' : 'Stable'}
                      </span>
                    </div>
                  </td>
                  <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>₵{profile.monthlyIncome.toLocaleString()}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <button
                        onClick={() => generateReport('individual')}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingProfile(profile);
                          setShowEditModal(true);
                        }}
                        className="text-yellow-400 hover:text-yellow-300 p-1"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteProfile(profile.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Reports */}
      <div className={`rounded-xl p-4 sm:p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Reports</h3>
        <div className="space-y-3">
          {reports.length === 0 ? (
            <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No reports generated yet</p>
          ) : (
            reports.map((report) => (
              <div key={report.id} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {report.reportType.charAt(0).toUpperCase() + report.reportType.slice(1)} Report
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {new Date(report.generatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {report.status === 'generating' && (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-yellow-400 animate-spin" />
                      <span className="text-xs text-yellow-400">Generating...</span>
                    </div>
                  )}
                  {report.status === 'completed' && (
                    <button className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-1 px-3 rounded transition-colors flex items-center space-x-1">
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  )}
                  {report.status === 'failed' && (
                    <span className="text-xs text-red-400">Failed</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Profile Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl border w-full max-w-md ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200 shadow-xl'}`}>
            <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Add New Credit Profile</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
                <input
                  type="text"
                  value={newProfile.name}
                  onChange={(e) => setNewProfile(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Phone Number</label>
                <input
                  type="tel"
                  value={newProfile.phone}
                  onChange={(e) => setNewProfile(prev => ({ ...prev, phone: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="+233 XX XXX XXXX"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email (Optional)</label>
                <input
                  type="email"
                  value={newProfile.email}
                  onChange={(e) => setNewProfile(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Monthly Income (GHS)</label>
                <input
                  type="number"
                  value={newProfile.monthlyIncome}
                  onChange={(e) => setNewProfile(prev => ({ ...prev, monthlyIncome: Number(e.target.value) }))}
                  className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="0"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Location</label>
                <input
                  type="text"
                  value={newProfile.location}
                  onChange={(e) => setNewProfile(prev => ({ ...prev, location: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="City, Country"
                />
              </div>
            </div>
            <div className={`p-6 border-t flex justify-end space-x-3 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setShowAddModal(false)}
                className={`px-4 py-2 rounded-lg transition-colors ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
              >
                Cancel
              </button>
              <button
                onClick={addProfile}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Add Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && editingProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl border w-full max-w-md ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200 shadow-xl'}`}>
            <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Edit Credit Profile</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
                <input
                  type="text"
                  value={editingProfile.name}
                  onChange={(e) => setEditingProfile(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                  className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Phone Number</label>
                <input
                  type="tel"
                  value={editingProfile.phone}
                  onChange={(e) => setEditingProfile(prev => prev ? ({ ...prev, phone: e.target.value }) : null)}
                  className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Monthly Income (GHS)</label>
                <input
                  type="number"
                  value={editingProfile.monthlyIncome}
                  onChange={(e) => setEditingProfile(prev => prev ? ({ ...prev, monthlyIncome: Number(e.target.value) }) : null)}
                  className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Location</label>
                <input
                  type="text"
                  value={editingProfile.location}
                  onChange={(e) => setEditingProfile(prev => prev ? ({ ...prev, location: e.target.value }) : null)}
                  className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
            </div>
            <div className={`p-6 border-t flex justify-end space-x-3 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setShowEditModal(false)}
                className={`px-4 py-2 rounded-lg transition-colors ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
              >
                Cancel
              </button>
              <button
                onClick={updateProfile}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Update Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};