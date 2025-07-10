export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  timestamp: string;
  type: 'send_money' | 'cash_out' | 'bill_payment' | 'airtime' | 'merchant_payment';
  description?: string;
  location?: string;
  merchantCategory?: string;
  agentInfo?: {
    id: string;
    trustScore: number;
    location: string;
  };
  deviceFingerprint?: {
    deviceId: string;
    isNewDevice: boolean;
    trustScore: number;
  };
  userProfile?: {
    userId: string;
    lastKnownLocation?: string;
    recentTransactions: Transaction[];
    riskProfile: 'low' | 'medium' | 'high';
  };
  networkTrust?: number;
  pinAttempts?: number;
}

export interface FraudPrediction {
  transactionId: string;
  riskScore: number; // 0-1 scale
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  isFraudulent: boolean;
  confidence: number; // 0-1 scale
  detectedPatterns: FraudPattern[];
  explanation: string;
  recommendedAction: string;
  timestamp: string;
}

export interface FraudPattern {
  type: string;
  confidence: number;
  description: string;
  indicators: string[];
}

export interface ModelFeatures {
  amount: number;
  hour: number;
  dayOfWeek: number;
  locationChange: number;
  newDevice: number;
  velocityScore: number;
  agentTrust: number;
  networkTrust: number;
  pinAttempts: number;
}

export interface FraudAlert {
  id: string;
  transactionId: string;
  alertType: 'fraud_detected' | 'suspicious_pattern' | 'high_risk';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
}

export interface FraudStatistics {
  totalTransactions: number;
  fraudDetected: number;
  falsePositives: number;
  accuracy: number;
  averageResponseTime: number;
  topFraudPatterns: { pattern: string; count: number }[];
  geographicDistribution: { region: string; fraudCount: number }[];
}