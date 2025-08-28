import { 
  Transaction, 
  RiskAssessment, 
  FeatureVector, 
  MLPrediction, 
  RiskThresholds, 
  TrainingData,
  DeviceFingerprint 
} from '../types/fraud-detection';

/**
 * Main transaction processor interface
 */
export interface ITransactionProcessor {
  /**
   * Analyze a single transaction for fraud risk
   */
  analyzeTransaction(transaction: Transaction): Promise<RiskAssessment>;

  /**
   * Process transactions in real-time from a stream
   */
  processInRealTime(transactionStream: AsyncIterable<Transaction>): Promise<void>;

  /**
   * Batch process multiple transactions
   */
  batchAnalyze(transactions: Transaction[]): Promise<RiskAssessment[]>;
}

/**
 * Feature extraction engine interface
 */
export interface IFeatureExtractor {
  /**
   * Extract features from transaction data
   */
  extractFeatures(transaction: Transaction): Promise<FeatureVector>;

  /**
   * Enrich features with behavioral data
   */
  enrichWithBehavioralData(features: FeatureVector, userId: string): Promise<FeatureVector>;

  /**
   * Extract device-specific features
   */
  extractDeviceFeatures(deviceInfo: DeviceFingerprint, userId: string): Promise<FeatureVector['deviceFeatures']>;

  /**
   * Extract geographic features
   */
  extractGeographicFeatures(transaction: Transaction, userId: string): Promise<FeatureVector['geographicFeatures']>;
}

/**
 * Risk scoring engine interface
 */
export interface IRiskScorer {
  /**
   * Calculate risk score from feature vector
   */
  calculateRiskScore(features: FeatureVector): Promise<number>;

  /**
   * Update risk thresholds
   */
  updateRiskThresholds(newThresholds: RiskThresholds): Promise<void>;

  /**
   * Get current risk thresholds
   */
  getRiskThresholds(): Promise<RiskThresholds>;

  /**
   * Calculate device trust score
   */
  calculateDeviceTrustScore(deviceInfo: DeviceFingerprint, userId: string): Promise<number>;
}

/**
 * Machine Learning service interface
 */
export interface IMLService {
  /**
   * Make fraud prediction using ML model
   */
  predict(features: FeatureVector): Promise<MLPrediction>;

  /**
   * Update ML model with new training data
   */
  updateModel(trainingData: TrainingData[]): Promise<void>;

  /**
   * Get model performance metrics
   */
  getModelMetrics(): Promise<{
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    lastUpdated: Date;
  }>;

  /**
   * Check if model is healthy and performing well
   */
  isModelHealthy(): Promise<boolean>;
}

/**
 * Device fingerprinting interface
 */
export interface IDeviceFingerprintService {
  /**
   * Generate device fingerprint
   */
  generateFingerprint(): Promise<DeviceFingerprint>;

  /**
   * Validate fingerprint integrity
   */
  validateFingerprint(fingerprint: DeviceFingerprint): boolean;

  /**
   * Compare two fingerprints for similarity
   */
  compareFingerprints(fp1: DeviceFingerprint, fp2: DeviceFingerprint): number;

  /**
   * Check if device is trusted for user
   */
  isDeviceTrusted(deviceInfo: DeviceFingerprint, userId: string): Promise<boolean>;
}

/**
 * Alert and notification service interface
 */
export interface IAlertService {
  /**
   * Send immediate alert for high-risk transaction
   */
  sendImmediateAlert(assessment: RiskAssessment, transaction: Transaction): Promise<void>;

  /**
   * Send escalation alert for multiple suspicious activities
   */
  sendEscalationAlert(assessments: RiskAssessment[], userId: string): Promise<void>;

  /**
   * Configure alert channels and recipients
   */
  configureAlerts(config: {
    email?: string[];
    sms?: string[];
    webhook?: string[];
    thresholds: {
      immediate: number;
      escalation: number;
    };
  }): Promise<void>;
}

/**
 * Behavioral analytics interface
 */
export interface IBehavioralAnalytics {
  /**
   * Build user behavioral profile
   */
  buildUserProfile(userId: string): Promise<{
    transactionPatterns: any;
    locationPatterns: any;
    timePatterns: any;
    devicePatterns: any;
  }>;

  /**
   * Calculate behavioral deviation score
   */
  calculateDeviationScore(transaction: Transaction, userId: string): Promise<number>;

  /**
   * Update user behavioral profile
   */
  updateUserProfile(transaction: Transaction, userId: string): Promise<void>;
}

/**
 * Geographic analysis interface
 */
export interface IGeographicAnalysis {
  /**
   * Analyze geographic risk factors
   */
  analyzeGeographicRisk(transaction: Transaction, userId: string): Promise<{
    isNewLocation: boolean;
    distanceFromHome: number;
    velocityBetweenLocations: number;
    riskCountry: boolean;
    riskScore: number;
  }>;

  /**
   * Get user's home location
   */
  getUserHomeLocation(userId: string): Promise<{ latitude: number; longitude: number } | null>;

  /**
   * Calculate distance between two locations
   */
  calculateDistance(loc1: { latitude: number; longitude: number }, loc2: { latitude: number; longitude: number }): number;
}

/**
 * Data validation interface
 */
export interface IDataValidator {
  /**
   * Validate transaction data
   */
  validateTransaction(transaction: Transaction): Promise<{
    isValid: boolean;
    errors: string[];
  }>;

  /**
   * Validate device fingerprint data
   */
  validateDeviceFingerprint(fingerprint: DeviceFingerprint): Promise<{
    isValid: boolean;
    errors: string[];
  }>;

  /**
   * Sanitize and normalize transaction data
   */
  sanitizeTransaction(transaction: Transaction): Promise<Transaction>;
}

/**
 * Audit logging interface
 */
export interface IAuditLogger {
  /**
   * Log fraud detection event
   */
  logFraudEvent(event: {
    type: 'ANALYSIS' | 'ALERT' | 'BLOCK' | 'REVIEW';
    transactionId: string;
    userId: string;
    riskScore: number;
    decision: string;
    timestamp: Date;
    details: any;
  }): Promise<void>;

  /**
   * Log system event
   */
  logSystemEvent(event: {
    type: 'MODEL_UPDATE' | 'THRESHOLD_CHANGE' | 'CONFIG_CHANGE';
    details: any;
    timestamp: Date;
  }): Promise<void>;

  /**
   * Get audit trail for transaction
   */
  getAuditTrail(transactionId: string): Promise<any[]>;
}