// Core fraud detection types and interfaces

export interface GeoLocation {
  latitude: number;
  longitude: number;
  country: string;
  city: string;
  region: string;
  timezone: string;
}

export interface DeviceFingerprint {
  deviceId: string;
  userAgent: string;
  screenResolution: string;
  colorDepth: number;
  timezone: string;
  language: string;
  languages: string[];
  platform: string;
  cookieEnabled: boolean;
  doNotTrack: string | null;
  ipAddress: string;
  networkType: string;
  hardwareConcurrency: number;
  maxTouchPoints: number;
  canvas: string;
  webgl: string;
  fonts: string[];
  plugins: string[];
  localStorage: boolean;
  sessionStorage: boolean;
  indexedDB: boolean;
  cpuClass?: string;
  deviceMemory?: number;
  pixelRatio: number;
  touchSupport: boolean;
  audioContext: string;
  webRTC: string;
  battery?: {
    charging: boolean;
    level: number;
    chargingTime: number;
    dischargingTime: number;
  };
}

export enum TransactionType {
  TRANSFER = 'TRANSFER',
  PAYMENT = 'PAYMENT',
  WITHDRAWAL = 'WITHDRAWAL',
  DEPOSIT = 'DEPOSIT',
  BILL_PAYMENT = 'BILL_PAYMENT',
  AIRTIME_PURCHASE = 'AIRTIME_PURCHASE'
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum RecommendationType {
  APPROVE = 'APPROVE',
  REVIEW = 'REVIEW',
  BLOCK = 'BLOCK'
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  timestamp: Date;
  merchantId?: string;
  location: GeoLocation;
  deviceInfo: DeviceFingerprint;
  transactionType: TransactionType;
  description?: string;
  reference?: string;
}

export interface RiskFactor {
  type: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score: number;
  details?: Record<string, any>;
}

export interface RiskAssessment {
  transactionId: string;
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  riskFactors: RiskFactor[];
  recommendation: RecommendationType;
  confidence: number;
  processingTime: number;
  timestamp: Date;
  deviceTrustScore: number;
  behavioralScore: number;
  geographicScore: number;
}

export interface FeatureVector {
  transactionFeatures: {
    amount: number;
    timeOfDay: number;
    dayOfWeek: number;
    isWeekend: boolean;
    transactionType: TransactionType;
    merchantCategory?: string;
  };
  deviceFeatures: {
    isNewDevice: boolean;
    deviceTrustScore: number;
    deviceChangeScore: number;
    browserFingerprint: string;
  };
  behavioralFeatures: {
    velocityScore: number;
    patternDeviationScore: number;
    historicalRiskScore: number;
    accountAge: number;
  };
  geographicFeatures: {
    isNewLocation: boolean;
    distanceFromHome: number;
    velocityBetweenLocations: number;
    riskCountry: boolean;
  };
}

export interface MLPrediction {
  fraudProbability: number;
  confidence: number;
  modelVersion: string;
  features: string[];
  timestamp: Date;
}

export interface RiskThresholds {
  lowRisk: number;
  mediumRisk: number;
  highRisk: number;
  criticalRisk: number;
  autoBlock: number;
  autoApprove: number;
}

export interface TrainingData {
  transactionId: string;
  features: FeatureVector;
  label: boolean; // true for fraud, false for legitimate
  timestamp: Date;
}

// Validation schemas
export const TransactionSchema = {
  id: { required: true, type: 'string' },
  userId: { required: true, type: 'string' },
  amount: { required: true, type: 'number', min: 0 },
  currency: { required: true, type: 'string', length: 3 },
  timestamp: { required: true, type: 'date' },
  location: { required: true, type: 'object' },
  deviceInfo: { required: true, type: 'object' },
  transactionType: { required: true, enum: Object.values(TransactionType) }
};

export const DeviceFingerprintSchema = {
  deviceId: { required: true, type: 'string' },
  userAgent: { required: true, type: 'string' },
  screenResolution: { required: true, type: 'string' },
  timezone: { required: true, type: 'string' },
  language: { required: true, type: 'string' },
  platform: { required: true, type: 'string' },
  ipAddress: { required: true, type: 'string' }
};