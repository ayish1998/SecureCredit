// AI Service Type Definitions

export interface AnalysisFactor {
  factor: string;
  impact: number; // 0-100 scale
  explanation: string;
}

export interface AIAnalysisResponse {
  confidence: number; // 0-100 scale
  reasoning: string;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: AnalysisFactor[];
  timestamp: Date;
}

export interface FraudAnalysis extends AIAnalysisResponse {
  fraudProbability: number; // 0-100 scale
  suspiciousPatterns: string[];
  preventionActions: string[];
}

export interface CreditFactor {
  category: string;
  score: number;
  weight: number;
  explanation: string;
}

export interface CreditEnhancement extends AIAnalysisResponse {
  enhancedScore: number; // 300-850 scale
  scoreFactors: CreditFactor[];
  lendingRecommendation: string;
  improvementSuggestions: string[];
}

export interface SecurityAssessment extends AIAnalysisResponse {
  threatLevel: number; // 0-100 scale
  vulnerabilities: string[];
  mitigationSteps: string[];
  deviceRiskScore: number;
}

export interface AIConfig {
  apiKey: string;
  enabled: boolean;
  rateLimitPerMinute: number;
  timeoutMs: number;
  retryAttempts: number;
}

export interface AIRequestContext {
  userId?: string;
  sessionId?: string;
  analysisType: 'fraud' | 'credit' | 'security' | 'general';
  priority: 'low' | 'medium' | 'high';
}

export interface AIServiceStatus {
  available: boolean;
  lastCheck: Date;
  rateLimitRemaining: number;
  errorCount: number;
}

// Error types for AI service
export class AIServiceError extends Error {
  public canRetry: boolean;
  public context?: any;

  constructor(
    message: string,
    public code: string,
    canRetry: boolean = false,
    context?: any
  ) {
    super(message);
    this.name = 'AIServiceError';
    this.canRetry = canRetry;
    this.context = context;
  }
}

export class RateLimitError extends AIServiceError {
  constructor(message: string, public retryAfter: number = 60) {
    super(message, 'RATE_LIMIT_EXCEEDED', true);
    this.name = 'RateLimitError';
  }
}

export class ValidationError extends AIServiceError {
  public fieldErrors?: Record<string, string>;

  constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message, 'VALIDATION_ERROR', false);
    this.name = 'ValidationError';
    this.fieldErrors = fieldErrors;
  }
}

export class ConfigurationError extends AIServiceError {
  constructor(message: string) {
    super(message, 'CONFIGURATION_ERROR', false);
    this.name = 'ConfigurationError';
  }
}