import { 
  AIServiceConfig, 
  AIUsageMetrics, 
  AIConfigValidationResult, 
  DEFAULT_AI_CONFIG,
  REGIONAL_CONFIGS 
} from '../types/aiConfig';
import { ConfigurationError } from '../types/ai';
import { APIKeyValidator, EnvironmentConfig } from './apiKeyValidator';

/**
 * AI Configuration Manager
 * Handles AI service configuration, validation, and persistence
 */
class AIConfigManager {
  private static readonly CONFIG_STORAGE_KEY = 'ai_service_config';
  private static readonly USAGE_STORAGE_KEY = 'ai_usage_metrics';
  private static readonly USER_PRESETS_KEY = 'ai_user_presets';
  
  private static currentConfig: AIServiceConfig = { ...DEFAULT_AI_CONFIG };
  private static configListeners: ((config: AIServiceConfig) => void)[] = [];
  private static usageMetrics: AIUsageMetrics = this.getDefaultUsageMetrics();

  /**
   * Initialize the configuration manager
   */
  static initialize(): void {
    this.loadConfiguration();
    this.loadUsageMetrics();
    
    // Load API key from environment if available
    const envConfig = EnvironmentConfig.getAIEnvironmentConfig();
    if (envConfig.apiKey && !this.currentConfig.apiKey) {
      this.currentConfig.apiKey = envConfig.apiKey;
    }
  }

  /**
   * Get current configuration
   */
  static getConfig(): AIServiceConfig {
    return { ...this.currentConfig };
  }

  /**
   * Update configuration
   */
  static async updateConfig(newConfig: Partial<AIServiceConfig>): Promise<AIConfigValidationResult> {
    const mergedConfig = { ...this.currentConfig, ...newConfig };
    const validation = this.validateConfiguration(mergedConfig);
    
    if (validation.isValid) {
      this.currentConfig = mergedConfig;
      this.saveConfiguration();
      this.notifyConfigListeners();
    }
    
    return validation;
  }

  /**
   * Get default configuration
   */
  static getDefaultConfig(): AIServiceConfig {
    return { ...DEFAULT_AI_CONFIG };
  }

  /**
   * Reset configuration to defaults
   */
  static resetToDefaults(): void {
    this.currentConfig = { ...DEFAULT_AI_CONFIG };
    this.saveConfiguration();
    this.notifyConfigListeners();
  }

  /**
   * Apply regional configuration
   */
  static applyRegionalConfig(region: string): void {
    const regionalConfig = REGIONAL_CONFIGS[region];
    if (regionalConfig) {
      this.updateConfig(regionalConfig);
    }
  }

  /**
   * Get usage metrics
   */
  static getUsageMetrics(): AIUsageMetrics {
    return { ...this.usageMetrics };
  }

  /**
   * Update usage metrics
   */
  static updateUsageMetrics(updates: Partial<AIUsageMetrics>): void {
    this.usageMetrics = { ...this.usageMetrics, ...updates };
    this.saveUsageMetrics();
  }

  /**
   * Record API request
   */
  static recordRequest(success: boolean, responseTime: number, feature: string, cost?: number): void {
    this.usageMetrics.totalRequests++;
    
    if (success) {
      this.usageMetrics.successfulRequests++;
    } else {
      this.usageMetrics.failedRequests++;
    }
    
    // Update average response time
    this.usageMetrics.averageResponseTime = 
      (this.usageMetrics.averageResponseTime + responseTime) / 2;
    
    // Update feature-specific counters
    switch (feature) {
      case 'fraud':
        this.usageMetrics.fraudAnalysisCount++;
        break;
      case 'credit':
        this.usageMetrics.creditScoringCount++;
        break;
      case 'security':
        this.usageMetrics.securityAnalysisCount++;
        break;
      case 'general':
        this.usageMetrics.generalInsightsCount++;
        break;
    }
    
    // Update cost tracking
    if (cost) {
      this.usageMetrics.estimatedCost += cost;
      this.usageMetrics.costPerRequest = 
        this.usageMetrics.estimatedCost / this.usageMetrics.totalRequests;
    }
    
    // Update error rate
    this.usageMetrics.errorRate = 
      (this.usageMetrics.failedRequests / this.usageMetrics.totalRequests) * 100;
    
    this.saveUsageMetrics();
  }

  /**
   * Reset usage metrics
   */
  static resetUsageMetrics(): void {
    this.usageMetrics = this.getDefaultUsageMetrics();
    this.saveUsageMetrics();
  }

  /**
   * Validate configuration
   */
  static validateConfiguration(config: AIServiceConfig): AIConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // API Key validation
    if (!config.apiKey) {
      errors.push('API key is required');
    } else if (!this.validateApiKey(config.apiKey)) {
      errors.push('Invalid API key format');
    }

    // Performance settings validation
    if (config.maxRetries < 0 || config.maxRetries > 10) {
      errors.push('Max retries must be between 0 and 10');
    }

    if (config.analysisTimeout < 1000 || config.analysisTimeout > 60000) {
      errors.push('Analysis timeout must be between 1 and 60 seconds');
    }

    if (config.defaultConfidenceThreshold < 0 || config.defaultConfidenceThreshold > 100) {
      errors.push('Confidence threshold must be between 0 and 100');
    }

    if (config.maxCacheSize < 10 || config.maxCacheSize > 1000) {
      warnings.push('Cache size should be between 10 and 1000 for optimal performance');
    }

    // Feature validation
    const enabledFeatures = Object.values(config.features).filter(Boolean).length;
    if (enabledFeatures === 0) {
      warnings.push('No AI features are enabled');
    }

    // Performance suggestions
    if (config.cacheResults && config.maxCacheSize < 50) {
      suggestions.push('Consider increasing cache size for better performance');
    }

    if (config.maxRetries > 5) {
      suggestions.push('High retry count may impact performance');
    }

    if (!config.circuitBreakerEnabled) {
      suggestions.push('Enable circuit breaker for better error handling');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Test configuration
   */
  static async testConfiguration(config?: AIServiceConfig): Promise<{
    success: boolean;
    message: string;
    details?: any;
  }> {
    const testConfig = config || this.currentConfig;
    
    try {
      // Validate configuration first
      const validation = this.validateConfiguration(testConfig);
      if (!validation.isValid) {
        return {
          success: false,
          message: `Configuration validation failed: ${validation.errors.join(', ')}`
        };
      }

      // Test API key using the validator
      if (testConfig.apiKey) {
        const apiKeyTest = await APIKeyValidator.testAPIKey(testConfig.apiKey);
        return {
          success: apiKeyTest.isValid,
          message: apiKeyTest.message,
          details: {
            ...apiKeyTest.details,
            features: testConfig.features
          }
        };
      } else {
        return {
          success: false,
          message: 'No API key provided'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Configuration test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Add configuration change listener
   */
  static onConfigChange(listener: (config: AIServiceConfig) => void): () => void {
    this.configListeners.push(listener);
    return () => {
      const index = this.configListeners.indexOf(listener);
      if (index > -1) {
        this.configListeners.splice(index, 1);
      }
    };
  }

  /**
   * Check if AI services are enabled
   */
  static isEnabled(): boolean {
    return !!(this.currentConfig.apiKey && 
             Object.values(this.currentConfig.features).some(Boolean));
  }

  /**
   * Get cost estimate for request
   */
  static getCostEstimate(feature: string): number {
    // Basic cost estimation (adjust based on actual pricing)
    const baseCosts = {
      fraud: 0.001,
      credit: 0.002,
      security: 0.0015,
      general: 0.001
    };
    
    return baseCosts[feature as keyof typeof baseCosts] || 0.001;
  }

  // Private methods

  private static validateApiKey(apiKey: string): boolean {
    const validation = APIKeyValidator.validateGeminiKey(apiKey);
    return validation.isValid;
  }

  private static loadConfiguration(): void {
    try {
      const stored = localStorage.getItem(this.CONFIG_STORAGE_KEY);
      if (stored) {
        const parsedConfig = JSON.parse(stored);
        this.currentConfig = { ...DEFAULT_AI_CONFIG, ...parsedConfig };
      }
    } catch (error) {
      console.warn('Failed to load AI configuration from storage:', error);
    }
  }

  private static saveConfiguration(): void {
    try {
      localStorage.setItem(this.CONFIG_STORAGE_KEY, JSON.stringify(this.currentConfig));
    } catch (error) {
      console.error('Failed to save AI configuration:', error);
    }
  }

  private static loadUsageMetrics(): void {
    try {
      const stored = localStorage.getItem(this.USAGE_STORAGE_KEY);
      if (stored) {
        this.usageMetrics = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load usage metrics from storage:', error);
    }
  }

  private static saveUsageMetrics(): void {
    try {
      localStorage.setItem(this.USAGE_STORAGE_KEY, JSON.stringify(this.usageMetrics));
    } catch (error) {
      console.error('Failed to save usage metrics:', error);
    }
  }

  private static notifyConfigListeners(): void {
    this.configListeners.forEach(listener => {
      try {
        listener(this.currentConfig);
      } catch (error) {
        console.error('Error in config change listener:', error);
      }
    });
  }

  private static getDefaultUsageMetrics(): AIUsageMetrics {
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      errorRate: 0,
      lastResetDate: new Date().toISOString(),
      fraudAnalysisCount: 0,
      creditScoringCount: 0,
      securityAnalysisCount: 0,
      generalInsightsCount: 0,
      estimatedCost: 0,
      costPerRequest: 0
    };
  }
}

// Initialize on module load
AIConfigManager.initialize();

export { AIConfigManager as aiConfigManager };