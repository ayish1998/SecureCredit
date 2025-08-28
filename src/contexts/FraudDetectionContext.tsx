import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FraudAlert, FraudPrediction } from '../types/fraud';

interface FraudDetectionContextType {
  realtimeAlerts: FraudAlert[];
  recentPredictions: FraudPrediction[];
  addAlert: (alert: FraudAlert) => void;
  addPrediction: (prediction: FraudPrediction) => void;
  clearAlerts: () => void;
  clearPredictions: () => void;
  downloadFraudReport: () => void;
}

const FraudDetectionContext = createContext<FraudDetectionContextType | undefined>(undefined);

export const useFraudDetection = () => {
  const context = useContext(FraudDetectionContext);
  if (!context) {
    throw new Error('useFraudDetection must be used within a FraudDetectionProvider');
  }
  return context;
};

interface FraudDetectionProviderProps {
  children: ReactNode;
}

export const FraudDetectionProvider: React.FC<FraudDetectionProviderProps> = ({ children }) => {
  const [realtimeAlerts, setRealtimeAlerts] = useState<FraudAlert[]>([]);
  const [recentPredictions, setRecentPredictions] = useState<FraudPrediction[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedAlerts = localStorage.getItem('fraudDetection_alerts');
    const savedPredictions = localStorage.getItem('fraudDetection_predictions');

    if (savedAlerts) {
      try {
        setRealtimeAlerts(JSON.parse(savedAlerts));
      } catch (error) {
        console.error('Error loading saved alerts:', error);
      }
    }

    if (savedPredictions) {
      try {
        setRecentPredictions(JSON.parse(savedPredictions));
      } catch (error) {
        console.error('Error loading saved predictions:', error);
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('fraudDetection_alerts', JSON.stringify(realtimeAlerts));
  }, [realtimeAlerts]);

  useEffect(() => {
    localStorage.setItem('fraudDetection_predictions', JSON.stringify(recentPredictions));
  }, [recentPredictions]);

  const addAlert = (alert: FraudAlert) => {
    setRealtimeAlerts(prev => [alert, ...prev.slice(0, 19)]); // Keep last 20 alerts
  };

  const addPrediction = (prediction: FraudPrediction) => {
    setRecentPredictions(prev => [prediction, ...prev.slice(0, 49)]); // Keep last 50 predictions
  };

  const clearAlerts = () => {
    setRealtimeAlerts([]);
    localStorage.removeItem('fraudDetection_alerts');
  };

  const clearPredictions = () => {
    setRecentPredictions([]);
    localStorage.removeItem('fraudDetection_predictions');
  };

  const downloadFraudReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalAlerts: realtimeAlerts.length,
        totalPredictions: recentPredictions.length,
        highRiskTransactions: recentPredictions.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical').length,
        fraudDetected: recentPredictions.filter(p => p.isFraudulent).length,
        averageRiskScore: recentPredictions.length > 0 
          ? (recentPredictions.reduce((sum, p) => sum + p.riskScore, 0) / recentPredictions.length * 100).toFixed(2)
          : '0.00'
      },
      alerts: realtimeAlerts.map(alert => ({
        id: alert.id,
        transactionId: alert.transactionId,
        alertType: alert.alertType,
        severity: alert.severity,
        message: alert.message,
        timestamp: alert.timestamp,
        status: alert.status
      })),
      predictions: recentPredictions.map(prediction => ({
        transactionId: prediction.transactionId,
        riskScore: (prediction.riskScore * 100).toFixed(2) + '%',
        riskLevel: prediction.riskLevel,
        isFraudulent: prediction.isFraudulent,
        confidence: (prediction.confidence * 100).toFixed(2) + '%',
        detectedPatterns: prediction.detectedPatterns.map(p => p.type).join(', '),
        explanation: prediction.explanation,
        recommendedAction: prediction.recommendedAction,
        timestamp: prediction.timestamp
      })),
      riskAnalysis: {
        riskLevelDistribution: {
          low: recentPredictions.filter(p => p.riskLevel === 'low').length,
          medium: recentPredictions.filter(p => p.riskLevel === 'medium').length,
          high: recentPredictions.filter(p => p.riskLevel === 'high').length,
          critical: recentPredictions.filter(p => p.riskLevel === 'critical').length
        },
        commonPatterns: getCommonPatterns(recentPredictions),
        timeAnalysis: getTimeAnalysis(recentPredictions)
      }
    };

    // Generate CSV format
    const csvContent = generateCSVReport(reportData);
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `fraud_detection_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Also generate JSON report
    const jsonBlob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const jsonLink = document.createElement('a');
    const jsonUrl = URL.createObjectURL(jsonBlob);
    jsonLink.setAttribute('href', jsonUrl);
    jsonLink.setAttribute('download', `fraud_detection_report_${new Date().toISOString().split('T')[0]}.json`);
    jsonLink.style.visibility = 'hidden';
    document.body.appendChild(jsonLink);
    jsonLink.click();
    document.body.removeChild(jsonLink);
  };

  const value: FraudDetectionContextType = {
    realtimeAlerts,
    recentPredictions,
    addAlert,
    addPrediction,
    clearAlerts,
    clearPredictions,
    downloadFraudReport
  };

  return (
    <FraudDetectionContext.Provider value={value}>
      {children}
    </FraudDetectionContext.Provider>
  );
};

// Helper functions
function getCommonPatterns(predictions: FraudPrediction[]): { pattern: string; count: number }[] {
  const patternCounts: Record<string, number> = {};
  
  predictions.forEach(prediction => {
    prediction.detectedPatterns.forEach(pattern => {
      patternCounts[pattern.type] = (patternCounts[pattern.type] || 0) + 1;
    });
  });

  return Object.entries(patternCounts)
    .map(([pattern, count]) => ({ pattern, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 patterns
}

function getTimeAnalysis(predictions: FraudPrediction[]): { hour: number; riskCount: number }[] {
  const hourlyRisk: Record<number, number> = {};
  
  predictions.forEach(prediction => {
    if (prediction.riskLevel === 'high' || prediction.riskLevel === 'critical') {
      const hour = new Date(prediction.timestamp).getHours();
      hourlyRisk[hour] = (hourlyRisk[hour] || 0) + 1;
    }
  });

  return Object.entries(hourlyRisk)
    .map(([hour, count]) => ({ hour: parseInt(hour), riskCount: count }))
    .sort((a, b) => b.riskCount - a.riskCount);
}

function generateCSVReport(reportData: any): string {
  const lines: string[] = [];
  
  // Header
  lines.push('SecureCredit Fraud Detection Report');
  lines.push(`Generated: ${new Date(reportData.generatedAt).toLocaleString()}`);
  lines.push('');
  
  // Summary
  lines.push('SUMMARY');
  lines.push(`Total Alerts,${reportData.summary.totalAlerts}`);
  lines.push(`Total Predictions,${reportData.summary.totalPredictions}`);
  lines.push(`High Risk Transactions,${reportData.summary.highRiskTransactions}`);
  lines.push(`Fraud Detected,${reportData.summary.fraudDetected}`);
  lines.push(`Average Risk Score,${reportData.summary.averageRiskScore}%`);
  lines.push('');
  
  // Risk Level Distribution
  lines.push('RISK LEVEL DISTRIBUTION');
  lines.push(`Low Risk,${reportData.riskAnalysis.riskLevelDistribution.low}`);
  lines.push(`Medium Risk,${reportData.riskAnalysis.riskLevelDistribution.medium}`);
  lines.push(`High Risk,${reportData.riskAnalysis.riskLevelDistribution.high}`);
  lines.push(`Critical Risk,${reportData.riskAnalysis.riskLevelDistribution.critical}`);
  lines.push('');
  
  // Common Patterns
  lines.push('COMMON FRAUD PATTERNS');
  lines.push('Pattern,Count');
  reportData.riskAnalysis.commonPatterns.forEach((pattern: any) => {
    lines.push(`${pattern.pattern},${pattern.count}`);
  });
  lines.push('');
  
  // Recent Predictions
  lines.push('RECENT PREDICTIONS');
  lines.push('Transaction ID,Risk Score,Risk Level,Is Fraudulent,Confidence,Detected Patterns,Recommended Action,Timestamp');
  reportData.predictions.forEach((prediction: any) => {
    lines.push(`${prediction.transactionId},${prediction.riskScore},${prediction.riskLevel},${prediction.isFraudulent},${prediction.confidence},"${prediction.detectedPatterns}","${prediction.recommendedAction}",${prediction.timestamp}`);
  });
  lines.push('');
  
  // Recent Alerts
  lines.push('RECENT ALERTS');
  lines.push('Alert ID,Transaction ID,Alert Type,Severity,Message,Status,Timestamp');
  reportData.alerts.forEach((alert: any) => {
    lines.push(`${alert.id},${alert.transactionId},${alert.alertType},${alert.severity},"${alert.message}",${alert.status},${alert.timestamp}`);
  });
  
  return lines.join('\n');
}