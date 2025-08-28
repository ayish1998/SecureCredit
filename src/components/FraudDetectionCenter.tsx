import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Brain, Zap, Clock, TrendingUp, MapPin, Users, Activity, Upload, FileText, Download } from 'lucide-react';
import { simpleFraudDetectionAI } from '../utils/simpleFraudDetection';
import { Transaction, FraudPrediction, FraudAlert } from '../types/fraud';

export const FraudDetectionCenter: React.FC = () => {
  const [realtimeAlerts, setRealtimeAlerts] = useState<FraudAlert[]>([]);
  const [recentPredictions, setRecentPredictions] = useState<FraudPrediction[]>([]);
  const [modelMetrics, setModelMetrics] = useState<any>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [testTransaction, setTestTransaction] = useState<Partial<Transaction>>({
    amount: 500,
    type: 'send_money',
    merchantCategory: 'unknown'
  });
  const [csvData, setCsvData] = useState<string>('');
  const [batchResults, setBatchResults] = useState<FraudPrediction[]>([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  useEffect(() => {
    // Initialize fraud monitoring
    setIsMonitoring(true);

    // Get model metrics
    setModelMetrics(simpleFraudDetectionAI.getModelMetrics());

    // Simulate real-time transactions for demo
    const interval = setInterval(() => {
      simulateTransaction();
    }, 5000); // Every 5 seconds

    return () => {
      clearInterval(interval);
    };
  }, []);

  const simulateTransaction = async () => {
    if (!isMonitoring) return;
    
    // Create more varied transaction scenarios
    const scenarios = [
      // Normal transaction (60% chance)
      () => ({
        id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: Math.random() * 500 + 20,
        currency: 'GHS',
        timestamp: new Date().toISOString(),
        type: ['send_money', 'bill_payment', 'airtime'][Math.floor(Math.random() * 3)] as any,
        location: ['Accra', 'Kumasi', 'Tamale'][Math.floor(Math.random() * 3)] + ', Ghana',
        merchantCategory: ['grocery', 'utilities', 'transport', 'telecom'][Math.floor(Math.random() * 4)],
        agentInfo: {
          id: `agent_${Math.floor(Math.random() * 100)}`,
          trustScore: 0.7 + Math.random() * 0.3,
          location: 'Accra'
        },
        deviceFingerprint: {
          deviceId: `device_${Math.floor(Math.random() * 1000)}`,
          isNewDevice: false,
          trustScore: 0.6 + Math.random() * 0.4
        },
        userProfile: {
          userId: `user_${Math.floor(Math.random() * 1000)}`,
          lastKnownLocation: 'Accra, Ghana',
          recentTransactions: [],
          riskProfile: 'low' as any
        },
        networkTrust: 0.7 + Math.random() * 0.3,
        pinAttempts: 1
      }),
      
      // Suspicious transaction (25% chance)
      () => ({
        id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: Math.random() * 1500 + 300,
        currency: 'GHS',
        timestamp: new Date().toISOString(),
        type: ['cash_out', 'send_money'][Math.floor(Math.random() * 2)] as any,
        location: ['Kumasi', 'Cape Coast', 'Ho'][Math.floor(Math.random() * 3)] + ', Ghana',
        merchantCategory: ['unknown', 'investment', 'agent'][Math.floor(Math.random() * 3)],
        agentInfo: {
          id: `agent_${Math.floor(Math.random() * 50)}`,
          trustScore: 0.3 + Math.random() * 0.4,
          location: 'Unknown'
        },
        deviceFingerprint: {
          deviceId: `device_new_${Date.now()}`,
          isNewDevice: Math.random() > 0.3,
          trustScore: 0.2 + Math.random() * 0.5
        },
        userProfile: {
          userId: `user_${Math.floor(Math.random() * 500)}`,
          lastKnownLocation: 'Accra, Ghana',
          recentTransactions: [],
          riskProfile: 'medium' as any
        },
        networkTrust: 0.3 + Math.random() * 0.4,
        pinAttempts: Math.floor(Math.random() * 3) + 1
      }),
      
      // High-risk transaction (15% chance)
      () => ({
        id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: Math.random() * 3000 + 1000,
        currency: 'GHS',
        timestamp: new Date().toISOString(),
        type: 'cash_out' as any,
        location: 'Unknown Location',
        merchantCategory: ['unknown', 'lottery', 'investment'][Math.floor(Math.random() * 3)],
        agentInfo: {
          id: `suspicious_agent_${Math.floor(Math.random() * 20)}`,
          trustScore: Math.random() * 0.3,
          location: 'Unknown'
        },
        deviceFingerprint: {
          deviceId: `suspicious_device_${Date.now()}`,
          isNewDevice: true,
          trustScore: Math.random() * 0.2
        },
        userProfile: {
          userId: `high_risk_user_${Math.floor(Math.random() * 100)}`,
          lastKnownLocation: 'Different Location',
          recentTransactions: [],
          riskProfile: 'high' as any
        },
        networkTrust: Math.random() * 0.3,
        pinAttempts: Math.floor(Math.random() * 4) + 2
      })
    ];
    
    // Select scenario based on probability
    const rand = Math.random();
    let transaction: Transaction;
    
    if (rand < 0.6) {
      transaction = scenarios[0](); // Normal (60%)
    } else if (rand < 0.85) {
      transaction = scenarios[1](); // Suspicious (25%)
    } else {
      transaction = scenarios[2](); // High-risk (15%)
    }
    
    try {
      const prediction = await simpleFraudDetectionAI.predictFraud(transaction);
      
      // Always add to recent predictions
      setRecentPredictions(prev => [prediction, ...prev.slice(0, 9)]);
      
      // Create alert for medium, high, or critical risk
      if (['medium', 'high', 'critical'].includes(prediction.riskLevel)) {
        const alert: FraudAlert = {
          id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          transactionId: prediction.transactionId,
          alertType: prediction.riskLevel === 'critical' ? 'fraud_detected' : 
                    prediction.riskLevel === 'high' ? 'suspicious_pattern' : 'high_risk',
          severity: prediction.riskLevel,
          message: `${prediction.riskLevel.toUpperCase()} risk transaction: ${prediction.explanation.slice(0, 100)}...`,
          timestamp: new Date().toISOString(),
          status: 'active'
        };
        
        setRealtimeAlerts(prev => [alert, ...prev.slice(0, 9)]);
      }
      
    } catch (error) {
      console.error('Error in transaction simulation:', error);
      // Create a fallback prediction for demo purposes
      const fallbackPrediction: FraudPrediction = {
        transactionId: transaction.id,
        riskScore: Math.random(),
        riskLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
        isFraudulent: Math.random() > 0.7,
        confidence: 0.8,
        detectedPatterns: [],
        explanation: 'Fallback prediction due to processing error',
        recommendedAction: 'MONITOR_CLOSELY',
        timestamp: new Date().toISOString()
      };
      
      setRecentPredictions(prev => [fallbackPrediction, ...prev.slice(0, 9)]);
    }
  };

  const testFraudDetection = async () => {
    try {
      // Create test transaction with more realistic risk factors
      const riskFactors = {
        isHighRisk: Math.random() > 0.5,
        isNewDevice: Math.random() > 0.6,
        isOffHours: Math.random() > 0.7,
        isLargeAmount: (testTransaction.amount || 500) > 1000
      };

      const transaction: Transaction = {
        id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: testTransaction.amount || 500,
        currency: 'GHS',
        timestamp: new Date().toISOString(),
        type: testTransaction.type || 'send_money',
        location: riskFactors.isHighRisk ? 'Unknown Location' : 'Accra, Ghana',
        merchantCategory: testTransaction.merchantCategory || 'unknown',
        agentInfo: {
          id: 'agent_test',
          trustScore: riskFactors.isHighRisk ? Math.random() * 0.4 : 0.6 + Math.random() * 0.4,
          location: riskFactors.isHighRisk ? 'Unknown' : 'Test Location'
        },
        deviceFingerprint: {
          deviceId: riskFactors.isNewDevice ? `new_device_${Date.now()}` : 'known_test_device',
          isNewDevice: riskFactors.isNewDevice,
          trustScore: riskFactors.isNewDevice ? Math.random() * 0.3 : 0.7 + Math.random() * 0.3
        },
        userProfile: {
          userId: 'test_user',
          lastKnownLocation: 'Accra, Ghana',
          recentTransactions: [],
          riskProfile: riskFactors.isHighRisk ? 'high' : 'medium'
        },
        networkTrust: riskFactors.isHighRisk ? Math.random() * 0.4 : 0.6 + Math.random() * 0.4,
        pinAttempts: riskFactors.isHighRisk ? Math.floor(Math.random() * 4) + 2 : 1
      };

      console.log('Testing fraud detection with transaction:', transaction);
      
      const prediction = await simpleFraudDetectionAI.predictFraud(transaction);
      
      console.log('Fraud detection result:', prediction);
      
      // Add to recent predictions
      setRecentPredictions(prev => [prediction, ...prev.slice(0, 9)]);
      
      // Create alert if high risk
      if (['high', 'critical'].includes(prediction.riskLevel)) {
        const alert: FraudAlert = {
          id: `test_alert_${Date.now()}`,
          transactionId: prediction.transactionId,
          alertType: prediction.riskLevel === 'critical' ? 'fraud_detected' : 'suspicious_pattern',
          severity: prediction.riskLevel,
          message: `TEST: ${prediction.riskLevel.toUpperCase()} risk detected - ${prediction.explanation.slice(0, 80)}...`,
          timestamp: new Date().toISOString(),
          status: 'active'
        };
        
        setRealtimeAlerts(prev => [alert, ...prev.slice(0, 9)]);
      }
      
    } catch (error) {
      console.error('Error in fraud detection test:', error);
      
      // Create fallback prediction for demo
      const fallbackPrediction: FraudPrediction = {
        transactionId: `test_fallback_${Date.now()}`,
        riskScore: Math.random() * 0.6 + 0.2,
        riskLevel: 'medium',
        isFraudulent: false,
        confidence: 0.7,
        detectedPatterns: [],
        explanation: 'Test transaction processed with fallback method due to processing error',
        recommendedAction: 'MONITOR_CLOSELY - Test transaction',
        timestamp: new Date().toISOString()
      };
      
      setRecentPredictions(prev => [fallbackPrediction, ...prev.slice(0, 9)]);
    }
  };

  const processBatchData = async () => {
    if (!csvData.trim()) return;
    
    setIsProcessingBatch(true);
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const results: FraudPrediction[] = [];
    
    try {
      // Process in smaller batches for performance
      const batchSize = 5;
      for (let i = 1; i < Math.min(lines.length, 21); i += batchSize) { // Limit to 20 transactions
        const batch = lines.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (line, batchIndex) => {
          const values = line.split(',').map(v => v.trim());
          
          // Create transaction from CSV data
          const transaction: Transaction = {
            id: `batch_${Date.now()}_${i + batchIndex}`,
            amount: parseFloat(values[headers.indexOf('amount')] || '0'),
            currency: 'GHS',
            timestamp: new Date().toISOString(),
            type: (values[headers.indexOf('type')] || 'send_money') as any,
            location: values[headers.indexOf('location')] || 'Unknown',
            merchantCategory: values[headers.indexOf('merchant_category')] || 'unknown',
            agentInfo: {
              id: values[headers.indexOf('agent_id')] || 'unknown',
              trustScore: parseFloat(values[headers.indexOf('agent_trust')] || '0.5'),
              location: values[headers.indexOf('agent_location')] || 'Unknown'
            },
            deviceFingerprint: {
              deviceId: values[headers.indexOf('device_id')] || 'unknown',
              isNewDevice: values[headers.indexOf('new_device')] === 'true',
              trustScore: parseFloat(values[headers.indexOf('device_trust')] || '0.5')
            },
            userProfile: {
              userId: values[headers.indexOf('user_id')] || 'unknown',
              lastKnownLocation: values[headers.indexOf('last_location')] || 'Unknown',
              recentTransactions: [],
              riskProfile: (values[headers.indexOf('risk_profile')] || 'medium') as any
            },
            networkTrust: parseFloat(values[headers.indexOf('network_trust')] || '0.5'),
            pinAttempts: parseInt(values[headers.indexOf('pin_attempts')] || '1')
          };
          
          try {
            const prediction = await simpleFraudDetectionAI.predictFraud(transaction);
            
            // Generate alerts for high-risk batch transactions
            if (['high', 'critical'].includes(prediction.riskLevel)) {
              const alert: FraudAlert = {
                id: `batch_alert_${Date.now()}_${batchIndex}`,
                transactionId: prediction.transactionId,
                alertType: prediction.riskLevel === 'critical' ? 'fraud_detected' : 'suspicious_pattern',
                severity: prediction.riskLevel,
                message: `BATCH: ${prediction.riskLevel.toUpperCase()} risk in batch analysis - ${prediction.explanation.slice(0, 60)}...`,
                timestamp: new Date().toISOString(),
                status: 'active'
              };
              
              // Add alert with a small delay to avoid overwhelming the UI
              setTimeout(() => {
                setRealtimeAlerts(prev => [alert, ...prev.slice(0, 9)]);
              }, batchIndex * 200);
            }
            
            return prediction;
          } catch (error) {
            console.error('Error processing batch transaction:', error);
            // Return fallback prediction
            return {
              transactionId: transaction.id,
              riskScore: Math.random() * 0.5,
              riskLevel: 'low' as any,
              isFraudulent: false,
              confidence: 0.5,
              detectedPatterns: [],
              explanation: 'Batch processing fallback',
              recommendedAction: 'ALLOW',
              timestamp: new Date().toISOString()
            };
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Add small delay between batches to prevent blocking
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setBatchResults(results);
    } catch (error) {
      console.error('Error processing batch data:', error);
    } finally {
      setIsProcessingBatch(false);
    }
  };



  const downloadBatchResults = () => {
    const csvContent = [
      'Transaction ID,Risk Score,Risk Level,Is Fraudulent,Confidence,Detected Patterns,Explanation,Recommended Action',
      ...batchResults.map(result => 
        `${result.transactionId},${result.riskScore},${result.riskLevel},${result.isFraudulent},${result.confidence},"${result.detectedPatterns.map(p => p.type).join('; ')}","${result.explanation}","${result.recommendedAction}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fraud_detection_results_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCsvData(content);
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid CSV file');
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'text-red-400 bg-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">AI Fraud Detection Center</h2>
          <p className="text-gray-400 text-sm sm:text-base">Real-time fraud detection for Ghanaian mobile money transactions</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <button
            onClick={() => setShowBatchModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Batch Analysis</span>
          </button>
          <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full animate-pulse ${isMonitoring ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className="text-sm text-gray-400">
            {isMonitoring ? 'Monitoring Active' : 'Monitoring Inactive'}
          </span>
          </div>
        </div>
      </div>

      {/* Model Performance Metrics */}
      {modelMetrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Model Accuracy</p>
                <p className="text-2xl font-bold text-green-400">{(modelMetrics.accuracy * 100).toFixed(1)}%</p>
              </div>
              <Brain className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Training Data</p>
                <p className="text-2xl font-bold text-blue-400">{modelMetrics.trainingDataSize?.toLocaleString() || 'N/A'}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Fraud Patterns</p>
                <p className="text-2xl font-bold text-purple-400">{modelMetrics.supportedPatterns?.length || 0}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <p className="text-lg font-bold text-white">Ready</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>
      )}

      {/* Test Fraud Detection */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Test Fraud Detection</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Amount (GHS)</label>
            <input
              type="number"
              value={testTransaction.amount}
              onChange={(e) => setTestTransaction(prev => ({ ...prev, amount: Number(e.target.value) }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Transaction Type</label>
            <select
              value={testTransaction.type}
              onChange={(e) => setTestTransaction(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="send_money">Send Money</option>
              <option value="cash_out">Cash Out</option>
              <option value="bill_payment">Bill Payment</option>
              <option value="airtime">Airtime</option>
              <option value="merchant_payment">Merchant Payment</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Merchant Category</label>
            <select
              value={testTransaction.merchantCategory}
              onChange={(e) => setTestTransaction(prev => ({ ...prev, merchantCategory: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="grocery">Grocery</option>
              <option value="utilities">Utilities</option>
              <option value="transport">Transport</option>
              <option value="investment">Investment</option>
              <option value="lottery">Lottery</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={testFraudDetection}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Test Detection
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Alerts and Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Real-time Alerts */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span>Real-time Fraud Alerts</span>
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {realtimeAlerts.length === 0 ? (
              <p className="text-gray-400 text-center py-4 sm:py-8">No active alerts</p>
            ) : (
              realtimeAlerts.map((alert) => (
                <div key={alert.id} className="p-3 bg-gray-700/50 rounded-lg border-l-4 border-red-500">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${getRiskColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-white">{alert.message}</p>
                  <p className="text-xs text-gray-400 mt-1">Transaction: {alert.transactionId}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Predictions */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Brain className="w-5 h-5 text-blue-400" />
            <span>Recent AI Predictions</span>
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentPredictions.length === 0 ? (
              <p className="text-gray-400 text-center py-4 sm:py-8">No predictions yet</p>
            ) : (
              recentPredictions.map((prediction) => (
                <div key={prediction.transactionId} className="p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${getRiskColor(prediction.riskLevel)}`}>
                      {prediction.riskLevel}
                    </span>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Risk Score</p>
                      <p className="text-sm font-medium text-white">{(prediction.riskScore * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                  <p className="text-sm text-white mb-1">{prediction.explanation}</p>
                  <p className="text-xs text-gray-400">{prediction.recommendedAction}</p>
                  {prediction.detectedPatterns.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-400">Detected Patterns:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {prediction.detectedPatterns.map((pattern, index) => (
                          <span key={index} className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                            {pattern.type}
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

      {/* Fraud Pattern Analysis */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Ghanaian Fraud Pattern Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-300">Most Common Patterns</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">SIM Swap Fraud</span>
                <span className="text-sm text-red-400">35%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Social Engineering</span>
                <span className="text-sm text-orange-400">28%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Agent Fraud</span>
                <span className="text-sm text-yellow-400">22%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Investment Scams</span>
                <span className="text-sm text-blue-400">15%</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-300">Geographic Hotspots</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Greater Accra</span>
                <span className="text-sm text-red-400">42%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Ashanti Region</span>
                <span className="text-sm text-orange-400">25%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Northern Region</span>
                <span className="text-sm text-yellow-400">18%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Western Region</span>
                <span className="text-sm text-blue-400">15%</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-300">Time Patterns</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Late Night (11PM-3AM)</span>
                <span className="text-sm text-red-400">High Risk</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Early Morning (3AM-6AM)</span>
                <span className="text-sm text-orange-400">High Risk</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Business Hours (9AM-5PM)</span>
                <span className="text-sm text-green-400">Low Risk</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Weekends</span>
                <span className="text-sm text-yellow-400">Medium Risk</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Batch Analysis Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Batch Fraud Analysis</h3>
              <p className="text-gray-400 text-sm mt-1">Upload CSV data for bulk fraud detection analysis</p>
            </div>
            
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-6">
                {/* CSV Format Instructions */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h4 className="text-blue-400 font-medium mb-2">CSV Format Requirements</h4>
                  <p className="text-sm text-gray-300 mb-2">Your CSV should include the following columns:</p>
                  <div className="text-xs text-gray-400 font-mono bg-gray-800 p-2 rounded">
                    amount,type,location,merchant_category,agent_id,agent_trust,agent_location,device_id,new_device,device_trust,user_id,last_location,risk_profile,network_trust,pin_attempts
                  </div>
                </div>
                
                {/* Data Input Options */}
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Data Input Options</h4>
                  
                  {/* File Upload Option */}
                  <div className="border border-gray-700 rounded-lg p-4">
                    <h5 className="text-gray-300 font-medium mb-2">Option 1: Upload CSV File</h5>
                    <div className="flex items-center space-x-3">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
                      />
                      {uploadedFileName && (
                        <span className="text-sm text-green-400">✓ {uploadedFileName}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Upload your own CSV file with transaction data</p>
                  </div>
                  
                  {/* Sample Data Option */}
                  <div className="border border-gray-700 rounded-lg p-4">
                    <h5 className="text-gray-300 font-medium mb-2">Option 2: Use Sample Data</h5>
                  <button
                    onClick={() => setCsvData(`amount,type,location,merchant_category,agent_id,agent_trust,agent_location,device_id,new_device,device_trust,user_id,last_location,risk_profile,network_trust,pin_attempts
500,send_money,Accra,unknown,agent_001,0.2,Kumasi,device_new,true,0.1,user_123,Accra,high,0.3,4
150,bill_payment,Lagos,utilities,agent_002,0.9,Lagos,device_known,false,0.8,user_456,Lagos,low,0.9,1
2000,cash_out,Nairobi,agent,agent_003,0.1,Unknown,device_suspicious,true,0.2,user_789,Mombasa,high,0.2,3
75,airtime,Dakar,telecom,agent_004,0.8,Dakar,device_trusted,false,0.9,user_012,Dakar,low,0.8,1`)}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
                  >
                    Load Sample Data
                  </button>
                    <p className="text-xs text-gray-400 mt-1">Load pre-configured sample data to test the system</p>
                  </div>
                </div>
                
                {/* CSV Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    CSV Data Preview/Edit
                  </label>
                  <textarea
                    value={csvData}
                    onChange={(e) => setCsvData(e.target.value)}
                    className="w-full h-32 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm font-mono"
                    placeholder="CSV data will appear here after upload or sample data load..."
                  />
                  <p className="text-xs text-gray-400 mt-1">You can edit the CSV data directly in this text area</p>
                </div>
                
                {/* Process Button */}
                <div className="flex justify-center">
                  <button
                    onClick={processBatchData}
                    disabled={!csvData.trim() || isProcessingBatch}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    {isProcessingBatch ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4" />
                        <span>Analyze Batch</span>
                      </>
                    )}
                  </button>
                </div>
                
                {/* Results */}
                {batchResults.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-medium">Analysis Results ({batchResults.length} transactions)</h4>
                      <button
                        onClick={downloadBatchResults}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download CSV</span>
                      </button>
                    </div>
                    
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <div className="text-lg font-bold text-white">
                          {batchResults.filter(r => r.isFraudulent).length}
                        </div>
                        <div className="text-xs text-red-400">Fraudulent</div>
                      </div>
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <div className="text-lg font-bold text-white">
                          {batchResults.filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical').length}
                        </div>
                        <div className="text-xs text-orange-400">High Risk</div>
                      </div>
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <div className="text-lg font-bold text-white">
                          {(batchResults.reduce((sum, r) => sum + r.riskScore, 0) / batchResults.length * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-yellow-400">Avg Risk</div>
                      </div>
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <div className="text-lg font-bold text-white">
                          {(batchResults.reduce((sum, r) => sum + r.confidence, 0) / batchResults.length * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-blue-400">Avg Confidence</div>
                      </div>
                    </div>
                    
                    {/* Results Table */}
                    <div className="bg-gray-800 rounded-lg overflow-hidden">
                      <div className="max-h-64 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-700 sticky top-0">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300">Transaction</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300">Risk Score</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300">Risk Level</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300">Fraudulent</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300">Patterns</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700">
                            {batchResults.map((result, index) => (
                              <tr key={index} className="hover:bg-gray-700/30">
                                <td className="px-3 py-2 text-white font-mono text-xs">
                                  {result.transactionId.substring(0, 12)}...
                                </td>
                                <td className="px-3 py-2 text-white">
                                  {(result.riskScore * 100).toFixed(1)}%
                                </td>
                                <td className="px-3 py-2">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(result.riskLevel)}`}>
                                    {result.riskLevel}
                                  </span>
                                </td>
                                <td className="px-3 py-2">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    result.isFraudulent ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                                  }`}>
                                    {result.isFraudulent ? 'Yes' : 'No'}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-xs text-gray-400">
                                  {result.detectedPatterns.length > 0 
                                    ? result.detectedPatterns.map(p => p.type).join(', ')
                                    : 'None'
                                  }
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-700 flex justify-end">
              <button
                onClick={() => {
                  setShowBatchModal(false);
                  setCsvData('');
                  setBatchResults([]);
                  setUploadedFileName('');
                }}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};