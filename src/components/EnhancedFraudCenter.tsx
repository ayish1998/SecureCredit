import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Shield, 
  Brain, 
  Zap, 
  Clock, 
  TrendingUp, 
  MapPin, 
  Users, 
  Activity, 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  MoreVertical,
  Play,
  Pause,
  RefreshCw,
  Database,
  BarChart,
  Settings,
  X
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { AIResponseDisplay, AIResponseCard } from './AIResponseDisplay';
import { EnhancedStatsCard, StatsGrid } from './EnhancedStatsCard';
import { LoadingSpinner, AIAnalysisLoader } from './LoadingSpinner';
import { aiService } from '../services/aiService';

interface FraudTransaction {
  id: string;
  amount: number;
  currency: string;
  timestamp: string;
  type: string;
  location: string;
  riskScore: number;
  status: 'pending' | 'approved' | 'blocked' | 'investigating';
  aiAnalysis?: {
    confidence: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    patterns: string[];
    recommendations: string[];
  };
}

export const EnhancedFraudCenter: React.FC = () => {
  const { isDark } = useTheme();
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [transactions, setTransactions] = useState<FraudTransaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<FraudTransaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'high-risk' | 'blocked' | 'investigating'>('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [realTimeStats, setRealTimeStats] = useState({
    totalTransactions: 15847,
    fraudDetected: 127,
    preventionRate: 98.7,
    avgProcessingTime: 1.2
  });
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [csvData, setCsvData] = useState('');
  const [batchResults, setBatchResults] = useState<FraudTransaction[]>([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');

  useEffect(() => {
    generateMockTransactions();
    
    // Real-time transaction simulation
    const interval = setInterval(() => {
      if (isMonitoring) {
        addNewTransaction();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const generateMockTransactions = () => {
    const mockTransactions: FraudTransaction[] = Array.from({ length: 20 }, (_, i) => ({
      id: `TXN_${Date.now()}_${i}`,
      amount: Math.floor(Math.random() * 5000) + 100,
      currency: 'GHS',
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      type: ['send_money', 'cash_out', 'bill_payment', 'airtime'][Math.floor(Math.random() * 4)],
      location: ['Accra', 'Kumasi', 'Tamale', 'Cape Coast'][Math.floor(Math.random() * 4)],
      riskScore: Math.random(),
      status: ['pending', 'approved', 'blocked', 'investigating'][Math.floor(Math.random() * 4)] as any,
      aiAnalysis: {
        confidence: 80 + Math.random() * 20,
        riskLevel: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
        patterns: ['Unusual time pattern', 'New device detected', 'Location anomaly'].slice(0, Math.floor(Math.random() * 3) + 1),
        recommendations: ['Monitor closely', 'Verify identity', 'Block transaction'].slice(0, Math.floor(Math.random() * 3) + 1)
      }
    }));

    setTransactions(mockTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  };

  const addNewTransaction = () => {
    const newTransaction: FraudTransaction = {
      id: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: Math.floor(Math.random() * 3000) + 50,
      currency: 'GHS',
      timestamp: new Date().toISOString(),
      type: ['send_money', 'cash_out', 'bill_payment'][Math.floor(Math.random() * 3)],
      location: ['Accra', 'Kumasi', 'Tamale'][Math.floor(Math.random() * 3)],
      riskScore: Math.random(),
      status: 'pending',
      aiAnalysis: {
        confidence: 85 + Math.random() * 15,
        riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
        patterns: ['Real-time analysis', 'Pattern matching'].slice(0, Math.floor(Math.random() * 2) + 1),
        recommendations: ['Continue monitoring', 'Verify if needed']
      }
    };

    setTransactions(prev => [newTransaction, ...prev.slice(0, 49)]);
    
    // Update stats
    setRealTimeStats(prev => ({
      ...prev,
      totalTransactions: prev.totalTransactions + 1,
      fraudDetected: newTransaction.riskScore > 0.7 ? prev.fraudDetected + 1 : prev.fraudDetected
    }));
  };

  const analyzeTransaction = async (transaction: FraudTransaction) => {
    setIsAnalyzing(true);
    setSelectedTransaction(transaction);
    
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const enhancedAnalysis = {
        confidence: 90 + Math.random() * 10,
        riskLevel: transaction.riskScore > 0.8 ? 'critical' : 
                  transaction.riskScore > 0.6 ? 'high' :
                  transaction.riskScore > 0.3 ? 'medium' : 'low',
        patterns: [
          'Device fingerprint analysis',
          'Behavioral pattern matching',
          'Geographic risk assessment',
          'Transaction velocity check'
        ].slice(0, Math.floor(Math.random() * 4) + 1),
        recommendations: [
          'Enhanced identity verification required',
          'Monitor for 24 hours',
          'Flag for manual review',
          'Update risk profile'
        ].slice(0, Math.floor(Math.random() * 4) + 1)
      };

      setTransactions(prev => 
        prev.map(t => 
          t.id === transaction.id 
            ? { ...t, aiAnalysis: enhancedAnalysis }
            : t
        )
      );
      
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      case 'high': return 'text-orange-500 bg-orange-100 dark:bg-orange-900/30';
      case 'medium': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
      default: return 'text-green-500 bg-green-100 dark:bg-green-900/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'blocked': return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      case 'investigating': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
      case 'approved': return 'text-green-500 bg-green-100 dark:bg-green-900/30';
      default: return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
    }
  };

  const processBatchData = async () => {
    if (!csvData.trim()) return;
    
    setIsProcessingBatch(true);
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const results: FraudTransaction[] = [];
    
    try {
      // Process in smaller batches for performance
      const batchSize = 5;
      for (let i = 1; i < Math.min(lines.length, 21); i += batchSize) {
        const batch = lines.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (line, batchIndex) => {
          const values = line.split(',').map(v => v.trim());
          
          // Create transaction from CSV data
          const transaction: FraudTransaction = {
            id: `batch_${Date.now()}_${i + batchIndex}`,
            amount: parseFloat(values[headers.indexOf('amount')] || '0') || Math.floor(Math.random() * 2000) + 100,
            currency: 'GHS',
            timestamp: new Date().toISOString(),
            type: (values[headers.indexOf('type')] || 'send_money') as any,
            location: values[headers.indexOf('location')] || 'Accra',
            riskScore: Math.random(),
            status: 'pending',
            aiAnalysis: {
              confidence: 85 + Math.random() * 15,
              riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
              patterns: ['Batch analysis', 'Pattern matching'].slice(0, Math.floor(Math.random() * 2) + 1),
              recommendations: ['Monitor closely', 'Verify if needed']
            }
          };
          
          return transaction;
        });
        
        const batchTransactions = await Promise.all(batchPromises);
        results.push(...batchTransactions);
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setBatchResults(results);
      
    } catch (error) {
      console.error('Error processing batch:', error);
    } finally {
      setIsProcessingBatch(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCsvData(content);
      };
      reader.readAsText(file);
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = `amount,type,location,user_id,device_id,agent_id
500,send_money,Accra,user_001,device_001,agent_001
1200,cash_out,Kumasi,user_002,device_002,agent_002
300,bill_payment,Tamale,user_003,device_003,agent_003
800,airtime,Cape Coast,user_004,device_004,agent_004`;
    
    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_transactions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'high-risk' && (transaction.aiAnalysis?.riskLevel === 'high' || transaction.aiAnalysis?.riskLevel === 'critical')) ||
                         transaction.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary">Fraud Detection Center</h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            AI-powered real-time fraud monitoring and prevention
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              console.log('Batch Analysis button clicked, current state:', showBatchModal);
              setShowBatchModal(true);
              console.log('State should now be true');
            }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
          >
            <Database className="w-4 h-4" />
            <span>Batch Analysis</span>
          </button>
          
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
              isMonitoring 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-gray-500 hover:bg-gray-600 text-white'
            }`}
          >
            {isMonitoring ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isMonitoring ? 'Monitoring' : 'Paused'}</span>
          </button>
          
          <button
            onClick={generateMockTransactions}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <StatsGrid columns={4}>
        <EnhancedStatsCard
          title="Total Transactions"
          value={realTimeStats.totalTransactions.toLocaleString()}
          icon={Activity}
          color="blue"
          aiEnhanced={true}
          confidence={94}
          change={{ value: 8.2, type: 'increase', period: 'today' }}
        />
        
        <EnhancedStatsCard
          title="Fraud Detected"
          value={realTimeStats.fraudDetected}
          icon={AlertTriangle}
          color="red"
          aiEnhanced={true}
          confidence={98}
          change={{ value: 12.5, type: 'decrease', period: 'today' }}
        />
        
        <EnhancedStatsCard
          title="Prevention Rate"
          value={`${realTimeStats.preventionRate}%`}
          icon={Shield}
          color="green"
          aiEnhanced={true}
          confidence={96}
          change={{ value: 2.1, type: 'increase', period: 'today' }}
        />
        
        <EnhancedStatsCard
          title="Avg Processing"
          value={`${realTimeStats.avgProcessingTime}s`}
          icon={Zap}
          color="purple"
          aiEnhanced={true}
          confidence={92}
          change={{ value: 15.3, type: 'decrease', period: 'today' }}
        />
      </StatsGrid>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transaction List */}
        <div className={`lg:col-span-2 card-modern p-6 ${isDark ? 'bg-gray-800/80' : 'bg-white/90'}`}>
          {/* Search and Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-modern pl-10 w-full"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="input-modern"
            >
              <option value="all">All Status</option>
              <option value="high-risk">High Risk</option>
              <option value="blocked">Blocked</option>
              <option value="investigating">Investigating</option>
            </select>
          </div>

          {/* Transaction List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`p-4 rounded-xl border transition-all duration-300 hover-lift cursor-pointer ${
                  isDark ? 'bg-gray-700/30 border-gray-600/50 hover:bg-gray-700/50' : 'bg-gray-50/80 border-gray-200/50 hover:bg-gray-100/80'
                } ${selectedTransaction?.id === transaction.id ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setSelectedTransaction(transaction)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      transaction.aiAnalysis?.riskLevel === 'critical' ? 'bg-red-500 animate-pulse' :
                      transaction.aiAnalysis?.riskLevel === 'high' ? 'bg-orange-500 animate-pulse' :
                      transaction.aiAnalysis?.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {transaction.currency} {transaction.amount.toLocaleString()}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {transaction.type} • {transaction.location}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      getRiskColor(transaction.aiAnalysis?.riskLevel || 'low')
                    }`}>
                      {transaction.aiAnalysis?.riskLevel || 'low'}
                    </span>
                    
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      getStatusColor(transaction.status)
                    }`}>
                      {transaction.status}
                    </span>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        analyzeTransaction(transaction);
                      }}
                      className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Brain className="w-4 h-4 text-purple-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analysis Panel */}
        <div className={`card-modern p-6 ${isDark ? 'bg-gray-800/80' : 'bg-white/90'}`}>
          <h3 className="text-xl font-bold text-gradient-primary mb-6">AI Analysis</h3>
          
          {isAnalyzing ? (
            <AIAnalysisLoader message="Analyzing transaction..." />
          ) : selectedTransaction ? (
            <div className="space-y-6">
              {/* Transaction Details */}
              <div>
                <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Transaction Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>ID:</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>{selectedTransaction.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Amount:</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>
                      {selectedTransaction.currency} {selectedTransaction.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Type:</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>{selectedTransaction.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Location:</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>{selectedTransaction.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Time:</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>
                      {new Date(selectedTransaction.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Analysis */}
              {selectedTransaction.aiAnalysis && (
                <AIResponseDisplay
                  content={`Risk Assessment: ${selectedTransaction.aiAnalysis.riskLevel.toUpperCase()}

Confidence: ${selectedTransaction.aiAnalysis.confidence.toFixed(1)}%

Detected Patterns:
${selectedTransaction.aiAnalysis.patterns.map(p => `• ${p}`).join('\n')}

AI Recommendations:
${selectedTransaction.aiAnalysis.recommendations.map(r => `• ${r}`).join('\n')}`}
                  type="fraud"
                  confidence={selectedTransaction.aiAnalysis.confidence}
                  showHeader={false}
                  compact={true}
                />
              )}

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => analyzeTransaction(selectedTransaction)}
                  className="w-full btn-primary"
                >
                  Re-analyze with AI
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button className="btn-secondary text-green-600">
                    Approve
                  </button>
                  <button className="btn-secondary text-red-600">
                    Block
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Brain className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Select a transaction to analyze
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                Click on any transaction to view AI analysis
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Batch Analysis Modal */}
      {showBatchModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowBatchModal(false);
            }
          }}
        >
          <div className={`w-full max-w-4xl max-h-[90vh] rounded-2xl border transition-all duration-300 animate-scale-in ${
            isDark 
              ? 'bg-gray-900/95 border-gray-700/50' 
              : 'bg-white/95 border-gray-200/50'
          } backdrop-blur-xl shadow-2xl overflow-hidden`}>
            
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-6 border-b ${
              isDark ? 'border-gray-700/50' : 'border-gray-200/50'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gradient-primary">Batch Fraud Analysis</h2>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Upload CSV file for bulk transaction analysis
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setShowBatchModal(false)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Section */}
                <div className="space-y-6">
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Upload Transaction Data
                    </h3>
                    
                    {/* File Upload */}
                    <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                      isDark 
                        ? 'border-gray-600 hover:border-gray-500 bg-gray-800/30' 
                        : 'border-gray-300 hover:border-gray-400 bg-gray-50/50'
                    }`}>
                      <Upload className={`w-12 h-12 mx-auto mb-4 ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <p className={`text-lg font-medium mb-2 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        Drop CSV file here or click to browse
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Supports CSV files up to 10MB
                      </p>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="csv-upload"
                      />
                      <label
                        htmlFor="csv-upload"
                        className="inline-block mt-4 btn-primary cursor-pointer"
                      >
                        Choose File
                      </label>
                    </div>

                    {uploadedFileName && (
                      <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                        isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                      }`}>
                        <FileText className="w-4 h-4" />
                        <span className="text-sm font-medium">{uploadedFileName}</span>
                      </div>
                    )}

                    {/* Sample CSV Download */}
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Need a sample format?
                      </span>
                      <button
                        onClick={downloadSampleCSV}
                        className="btn-secondary text-sm flex items-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Sample</span>
                      </button>
                    </div>
                  </div>

                  {/* CSV Data Preview */}
                  <div>
                    <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Data Preview
                    </h4>
                    <textarea
                      value={csvData}
                      onChange={(e) => setCsvData(e.target.value)}
                      placeholder="CSV data will appear here..."
                      className="input-modern w-full h-32 resize-none text-sm font-mono"
                    />
                  </div>

                  {/* Process Button */}
                  <button
                    onClick={processBatchData}
                    disabled={!csvData.trim() || isProcessingBatch}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isProcessingBatch ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <BarChart className="w-4 h-4" />
                        <span>Analyze Batch</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Results Section */}
                <div className="space-y-6">
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Analysis Results
                    </h3>
                    
                    {batchResults.length > 0 ? (
                      <div className="space-y-4">
                        {/* Results Summary */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50/80'}`}>
                            <p className="text-2xl font-bold text-gradient-primary">
                              {batchResults.length}
                            </p>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              Transactions Analyzed
                            </p>
                          </div>
                          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50/80'}`}>
                            <p className="text-2xl font-bold text-gradient-danger">
                              {batchResults.filter(r => r.aiAnalysis?.riskLevel === 'high' || r.aiAnalysis?.riskLevel === 'critical').length}
                            </p>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              High Risk Detected
                            </p>
                          </div>
                        </div>

                        {/* Results List */}
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {batchResults.slice(0, 10).map((result) => (
                            <div
                              key={result.id}
                              className={`p-3 rounded-lg border transition-colors ${
                                isDark ? 'bg-gray-700/30 border-gray-600/50' : 'bg-gray-50/80 border-gray-200/50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {result.currency} {result.amount.toLocaleString()}
                                  </p>
                                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {result.type} • {result.location}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    getRiskColor(result.aiAnalysis?.riskLevel || 'low')
                                  }`}>
                                    {result.aiAnalysis?.riskLevel || 'low'}
                                  </span>
                                  <span className={`text-xs font-medium ${
                                    isDark ? 'text-gray-300' : 'text-gray-700'
                                  }`}>
                                    {result.aiAnalysis?.confidence.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Export Results */}
                        <button
                          onClick={() => {
                            const csvContent = [
                              'id,amount,currency,type,location,risk_level,confidence',
                              ...batchResults.map(r => 
                                `${r.id},${r.amount},${r.currency},${r.type},${r.location},${r.aiAnalysis?.riskLevel},${r.aiAnalysis?.confidence.toFixed(1)}`
                              )
                            ].join('\n');
                            
                            const blob = new Blob([csvContent], { type: 'text/csv' });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'fraud_analysis_results.csv';
                            a.click();
                            window.URL.revokeObjectURL(url);
                          }}
                          className="w-full btn-secondary flex items-center justify-center space-x-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>Export Results</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <BarChart className={`w-16 h-16 mx-auto mb-4 ${
                          isDark ? 'text-gray-600' : 'text-gray-400'
                        }`} />
                        <p className={`text-lg font-medium ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          No results yet
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          Upload and process CSV data to see analysis results
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`p-6 border-t ${isDark ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
              <div className="flex items-center justify-between">
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Supported formats: CSV with headers (amount, type, location, user_id, device_id)
                </p>
                <button
                  onClick={() => setShowBatchModal(false)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};