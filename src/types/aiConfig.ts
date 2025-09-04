/**
 * AI Configuration Types and Interfaces
 */

export interface AIServiceConfig {
  // API Configuration
  apiKey?: string;
  apiEndpoint?: string;
  apiVersion?: string;
  
  // Service Settings
  enableFallback: boolean;
  cacheResults: boolean;
  maxRetries: number;
  retryDelay: number;
  
  // Circuit Breaker Settings
  circuitBreakerEnabled: boolean;
  circuitBreakerThreshold: number;
  circuitBreakerTimeout: number;
  
  // Analysis Settings
  defaultConfidenceThreshold: number;
  enableRealTimeAnalysis: boolean;
  analysisTimeout: number;
  
  // Feature Toggles
  features: {
    fraudDetection: boolean;
    creditScoring: boolean;
    securityAnalysis: boolean;
    generalInsights: boolean;
  };
  
  // Performance Settings
  maxCacheSize: number;
  cacheExpirationTime: number;
  batchProcessingEnabled: boolean;
  maxBatchSize: number;
  
  // Notification Settings
  notifications: {
    enabled: boolean;
    showSuccessMessages: boolean;
    showWarningMessages: boolean;
    showErrorMessages: boolean;
    autoHideDelay: number;
  };
  
  // Logging Settings
  logging: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
    includeRequestData: boolean;
    includeResponseData: boolean;
  };
  
  // Regional Settings
  region: 'global' | 'africa' | 'ghana' | 'nigeria' | 'kenya' | 'south-africa';
  currency: string;
  language: string;
  timezone: string;
}

export interface AIUsageMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
  lastResetDate: string;
  
  // Feature-specific metrics
  fraudAnalysisCount: number;
  creditScoringCount: number;
  securityAnalysisCount: number;
  generalInsightsCount: number;
  
  // Cost tracking (if applicable)
  estimatedCost: number;
  costPerRequest: number;
  monthlyBudget?: number;
}

export interface AIConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface AIFeatureFlag {
  name: string;
  enabled: boolean;
  description: string;
  requiresApiKey: boolean;
  betaFeature: boolean;
  supportedRegions: string[];
}

export interface AIModelConfig {
  modelId: string;
  modelName: string;
  version: string;
  enabled: boolean;
  confidence: number;
  maxTokens?: number;
  temperature?: number;
  supportedFeatures: string[];
}

export interface AIConfigPreset {
  id: string;
  name: string;
  description: string;
  config: Partial<AIServiceConfig>;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_AI_CONFIG: AIServiceConfig = {
  // API Configuration
  apiKey: undefined,
  apiEndpoint: 'https://generativelanguage.googleapis.com',
  apiVersion: 'v1beta',
  
  // Service Settings
  enableFallback: true,
  cacheResults: true,
  maxRetries: 3,
  retryDelay: 1000,
  
  // Circuit Breaker Settings
  circuitBreakerEnabled: true,
  circuitBreakerThreshold: 5,
  circuitBreakerTimeout: 60000,
  
  // Analysis Settings
  defaultConfidenceThreshold: 80,
  enableRealTimeAnalysis: true,
  analysisTimeout: 30000,
  
  // Feature Toggles
  features: {
    fraudDetection: true,
    creditScoring: true,
    securityAnalysis: true,
    generalInsights: true,
  },
  
  // Performance Settings
  maxCacheSize: 100,
  cacheExpirationTime: 3600000, // 1 hour
  batchProcessingEnabled: false,
  maxBatchSize: 10,
  
  // Notification Settings
  notifications: {
    enabled: true,
    showSuccessMessages: false,
    showWarningMessages: true,
    showErrorMessages: true,
    autoHideDelay: 5000,
  },
  
  // Logging Settings
  logging: {
    enabled: true,
    level: 'info',
    includeRequestData: false,
    includeResponseData: false,
  },
  
  // Regional Settings
  region: 'africa',
  currency: 'USD',
  language: 'en',
  timezone: 'UTC',
};

export const AI_CONFIG_PRESETS: AIConfigPreset[] = [
  {
    id: 'development',
    name: 'Development',
    description: 'Configuration optimized for development and testing',
    config: {
      enableFallback: true,
      cacheResults: false,
      maxRetries: 1,
      logging: {
        enabled: true,
        level: 'debug',
        includeRequestData: true,
        includeResponseData: true,
      },
      notifications: {
        enabled: true,
        showSuccessMessages: true,
        showWarningMessages: true,
        showErrorMessages: true,
        autoHideDelay: 10000,
      },
    },
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'production',
    name: 'Production',
    description: 'Configuration optimized for production environments',
    config: {
      enableFallback: true,
      cacheResults: true,
      maxRetries: 3,
      circuitBreakerEnabled: true,
      logging: {
        enabled: true,
        level: 'warn',
        includeRequestData: false,
        includeResponseData: false,
      },
      notifications: {
        enabled: true,
        showSuccessMessages: false,
        showWarningMessages: true,
        showErrorMessages: true,
        autoHideDelay: 5000,
      },
    },
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'high-performance',
    name: 'High Performance',
    description: 'Configuration optimized for high-performance scenarios',
    config: {
      enableFallback: true,
      cacheResults: true,
      maxCacheSize: 500,
      batchProcessingEnabled: true,
      maxBatchSize: 20,
      analysisTimeout: 15000,
      logging: {
        enabled: false,
        level: 'error',
        includeRequestData: false,
        includeResponseData: false,
      },
    },
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cost-optimized',
    name: 'Cost Optimized',
    description: 'Configuration optimized for cost efficiency',
    config: {
      enableFallback: true,
      cacheResults: true,
      maxCacheSize: 1000,
      cacheExpirationTime: 7200000, // 2 hours
      maxRetries: 1,
      batchProcessingEnabled: true,
      features: {
        fraudDetection: true,
        creditScoring: true,
        securityAnalysis: false,
        generalInsights: false,
      },
    },
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const REGIONAL_CONFIGS: Record<string, Partial<AIServiceConfig>> = {
  ghana: {
    region: 'ghana',
    currency: 'GHS',
    language: 'en',
    timezone: 'Africa/Accra',
  },
  nigeria: {
    region: 'nigeria',
    currency: 'NGN',
    language: 'en',
    timezone: 'Africa/Lagos',
  },
  kenya: {
    region: 'kenya',
    currency: 'KES',
    language: 'en',
    timezone: 'Africa/Nairobi',
  },
  'south-africa': {
    region: 'south-africa',
    currency: 'ZAR',
    language: 'en',
    timezone: 'Africa/Johannesburg',
  },
};