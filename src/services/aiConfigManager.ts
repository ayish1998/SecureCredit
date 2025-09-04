import { 
  AIServiceConfig, 
  AIModelConfig, 
  AIUsageMetrics, 
  AIConfigValidation, 
  AIConfigPreset, 
  AIConfigBackup, 
  AIFeatureFlag, 
  AIConfigExport, 
  AIConfigImport,
  DEFAULT_AI_CONFIG,
  AI_CONFIG_PRESETS,
  AFRICAN_REGIONAL_CONFIGS
} from '../types/aiConfig';
import { aiLogger } from '../utils/aiLogger';

/**
 * AI Configuration Manager
 * Handles all AI service configuration, validation, and management
 */
export class AIConfigManager {
  private static instance: AIConfigManager;
  private config: AIServiceConfig;
  private models: AIModelConfig[] = [];
  private featureFlags: AIFeatureFlag[] = [];
  private usageMetrics: AIUsageMetrics;
  private configBackups: AIConfigBackup[] = [];
  private configListeners: ((config: AIServiceConfig) => void)[] = [];

  private constructor() {
    this.config = this.loadConfig();
    this.usageMetrics = this.initializeUsageMetrics();
    this.initializeFeatureFlags();
  }

  public static getInstance(): AIConfigManager {
    if (!AIConfigManager.instance) {
      AIConfigManager.instance = new AIConfigManager();
    }
    return AIConfigManager.instance;
  }

  /**
   * Configuration Management
   */
  public getConfig(): AIServiceConfig {
    return { ...this.config };
  }

  public async updateConfig(updates: Partial<AIServiceConfig>): Promise<void> {
    try {
      // Create backup before updating
      await this.createBackup('Auto-backup before config update');

      // Validate the updated configuration
      const newConfig = { ...this.config, ...updates };
      const validation = this.validateConfig(newConfig);
      
      if (!validation.isValid) {
        throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
      }

      // Apply the updates
      this.config = newConfig;
      
      // Save to storage
      await this.saveConfig();
      
      // Notify listeners
      this.notifyConfigListeners();
      
      aiLogger.info('AI configuration updated successfully', undefined, { updates });
    } catch (error) {
      aiLogger.error('Failed to update AI configuration', error as Error);
      throw error;
    }
  }

  public async resetConfig(): Promise<void> {
    try {
      await this.createBackup('Auto-backup before config reset');
      this.config = { ...DEFAULT_AI_CONFIG };
      await this.saveConfig();
      this.notifyConfigListeners();
      aiLogger.info('AI configuration reset to defaults');
    } catch (error) {
      aiLogger.error('Failed to reset AI configuration', error as Error);
      throw error;
    }
  }

  public validateConfig(config: AIServiceConfig = this.config): AIConfigValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Validate API configuration
    if (!config.apiKey && process.env.NODE_ENV === 'production') {
      errors.push('API key is required for production environment');
    }

    // Validate retry settings
    if (config.maxRetries < 0 || config.maxRetries > 10) {
      errors.push('Max retries must be between 0 and 10');
    }

    if (config.retryDelay < 100 || config.retryDelay > 30000) {
      warnings.push('Retry delay should be between 100ms and 30s for optimal performance');
    }

    // Validate circuit breaker settings
    if (config.circuitBreakerEnabled) {
      if (config.circuitBreakerThreshold < 1) {
        errors.push('Circuit breaker threshold must be at least 1');
      }
      if (config.circuitBreakerTimeout < 1000) {
        warnings.push('Circuit breaker timeout should be at least 1 second');
      }
    }

    // Validate performance settings
    if (config.performance.maxConcurrentRequests < 1) {
      errors.push('Max concurrent requests must be at least 1');
    }
    if (config.performance.maxConcurrentRequests > 100) {
      warnings.push('High concurrent request limit may impact performance');
    }

    if (config.performance.cacheSize < 0) {
      errors.push('Cache size cannot be negative');
    }
    if (config.performance.cacheSize > 50000) {
      warnings.push('Large cache size may consume significant memory');
    }

    // Validate security settings
    if (config.security.dataRetentionDays < 1) {
      errors.push('Data retention period must be at least 1 day');
    }
    if (config.security.dataRetentionDays > 2555) { // ~7 years
      warnings.push('Long data retention period may have compliance implications');
    }

    // Validate notification settings
    if (config.notifications.alertThresholds.errorRate < 0 || config.notifications.alertThresholds.errorRate > 100) {
      errors.push('Error rate threshold must be between 0 and 100');
    }

    // Suggestions
    if (!config.enableFallback) {
      suggestions.push('Consider enabling fallback mode for better reliability');
    }
    if (!config.cacheResults) {
      suggestions.push('Enabling cache can improve performance and reduce costs');
    }
    if (!config.security.enableEncryption && process.env.NODE_ENV === 'production') {
      suggestions.push('Enable encryption for production environments');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * Model Configuration Management
   */
  public getModels(): AIModelConfig[] {
    return [...this.models];
  }

  public addModel(model: AIModelConfig): void {
    const existingIndex = this.models.findIndex(m => m.modelId === model.modelId);
    if (existingIndex >= 0) {
      this.models[existingIndex] = model;
    } else {
      this.models.push(model);
    }
    this.saveModels();
    aiLogger.info('AI model configuration updated', undefined, { modelId: model.modelId });
  }

  public removeModel(modelId: string): void {
    this.models = this.models.filter(m => m.modelId !== modelId);
    this.saveModels();
    aiLogger.info('AI model configuration removed', undefined, { modelId });
  }

  public getActiveModels(): AIModelConfig[] {
    return this.models.filter(m => m.enabled);
  }

  /**
   * Feature Flag Management
   */
  public getFeatureFlags(): AIFeatureFlag[] {
    return [...this.featureFlags];
  }

  public isFeatureEnabled(key: string): boolean {
    const flag = this.featureFlags.find(f => f.key === key);
    if (!flag) return false;
    
    // Simple rollout logic - in production, this would be more sophisticated
    return flag.enabled && Math.random() * 100 < flag.rolloutPercentage;
  }

  public updateFeatureFlag(key: string, updates: Partial<AIFeatureFlag>): void {
    const flagIndex = this.featureFlags.findIndex(f => f.key === key);
    if (flagIndex >= 0) {
      this.featureFlags[flagIndex] = { ...this.featureFlags[flagIndex], ...updates };
      this.saveFeatureFlags();
      aiLogger.info('Feature flag updated', undefined, { key, updates });
    }
  }

  /**
   * Usage Metrics Management
   */
  public getUsageMetrics(): AIUsageMetrics {
    return { ...this.usageMetrics };
  }

  public updateUsageMetrics(metrics: Partial<AIUsageMetrics>): void {
    this.usageMetrics = { ...this.usageMetrics, ...metrics, lastUpdated: new Date().toISOString() };
    this.saveUsageMetrics();
  }

  public recordRequest(success: boolean, responseTime: number, cost: number = 0): void {
    this.usageMetrics.totalRequests++;
    if (success) {
      this.usageMetrics.successfulRequests++;
    } else {
      this.usageMetrics.failedRequests++;
    }
    
    // Update average response time
    this.usageMetrics.averageResponseTime = 
      (this.usageMetrics.averageResponseTime * (this.usageMetrics.totalRequests - 1) + responseTime) / 
      this.usageMetrics.totalRequests;
    
    this.usageMetrics.totalCost += cost;
    this.usageMetrics.errorRate = (this.usageMetrics.failedRequests / this.usageMetrics.totalRequests) * 100;
    this.usageMetrics.lastUpdated = new Date().toISOString();
    
    // Update daily usage
    const today = new Date().toISOString().split('T')[0];
    let dailyEntry = this.usageMetrics.dailyUsage.find(d => d.date === today);
    if (!dailyEntry) {
      dailyEntry = { date: today, requests: 0, cost: 0, errors: 0 };
      this.usageMetrics.dailyUsage.push(dailyEntry);
    }
    dailyEntry.requests++;
    dailyEntry.cost += cost;
    if (!success) dailyEntry.errors++;
    
    // Keep only last 30 days
    this.usageMetrics.dailyUsage = this.usageMetrics.dailyUsage
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30);
    
    this.saveUsageMetrics();
  }

  /**
   * Configuration Presets
   */
  public getPresets(): AIConfigPreset[] {
    return [...AI_CONFIG_PRESETS];
  }

  public async applyPreset(presetId: string): Promise<void> {
    const preset = AI_CONFIG_PRESETS.find(p => p.id === presetId);
    if (!preset) {
      throw new Error(`Preset not found: ${presetId}`);
    }

    await this.createBackup(`Auto-backup before applying preset: ${preset.name}`);
    await this.updateConfig(preset.config);
    aiLogger.info('Configuration preset applied', undefined, { presetId, presetName: preset.name });
  }

  /**
   * Regional Configuration
   */
  public applyRegionalConfig(region: keyof typeof AFRICAN_REGIONAL_CONFIGS): void {
    const regionalConfig = AFRICAN_REGIONAL_CONFIGS[region];
    if (regionalConfig) {
      this.updateConfig({
        regional: { ...this.config.regional, ...regionalConfig }
      });
      aiLogger.info('Regional configuration applied', undefined, { region });
    }
  }

  /**
   * Backup and Restore
   */
  public async createBackup(description: string): Promise<string> {
    const backup: AIConfigBackup = {
      id: `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      config: { ...this.config },
      description,
      version: '1.0.0',
      createdBy: 'system',
    };

    this.configBackups.unshift(backup);
    
    // Keep only last 10 backups
    if (this.configBackups.length > 10) {
      this.configBackups = this.configBackups.slice(0, 10);
    }

    await this.saveBackups();
    aiLogger.info('Configuration backup created', undefined, { backupId: backup.id, description });
    return backup.id;
  }

  public getBackups(): AIConfigBackup[] {
    return [...this.configBackups];
  }

  public async restoreBackup(backupId: string): Promise<void> {
    const backup = this.configBackups.find(b => b.id === backupId);
    if (!backup) {
      throw new Error(`Backup not found: ${backupId}`);
    }

    await this.createBackup('Auto-backup before restore');
    this.config = { ...backup.config };
    await this.saveConfig();
    this.notifyConfigListeners();
    aiLogger.info('Configuration restored from backup', undefined, { backupId });
  }

  /**
   * Import/Export
   */
  public exportConfig(): AIConfigExport {
    return {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      config: { ...this.config },
      models: [...this.models],
      featureFlags: [...this.featureFlags],
      metadata: {
        exportedBy: 'system',
        environment: process.env.NODE_ENV || 'development',
      },
    };
  }

  public async importConfig(importData: AIConfigImport): Promise<void> {
    try {
      if (importData.options.validateBeforeImport) {
        const validation = this.validateConfig(importData.data.config);
        if (!validation.isValid) {
          throw new Error(`Import validation failed: ${validation.errors.join(', ')}`);
        }
      }

      if (importData.options.backupCurrent) {
        await this.createBackup('Auto-backup before import');
      }

      if (importData.options.selectiveImport.config) {
        this.config = importData.options.overwriteExisting 
          ? { ...importData.data.config }
          : { ...this.config, ...importData.data.config };
      }

      if (importData.options.selectiveImport.models) {
        this.models = importData.options.overwriteExisting 
          ? [...importData.data.models]
          : [...this.models, ...importData.data.models];
      }

      if (importData.options.selectiveImport.featureFlags) {
        this.featureFlags = importData.options.overwriteExisting 
          ? [...importData.data.featureFlags]
          : [...this.featureFlags, ...importData.data.featureFlags];
      }

      await this.saveAll();
      this.notifyConfigListeners();
      aiLogger.info('Configuration imported successfully', undefined, { source: importData.source });
    } catch (error) {
      aiLogger.error('Failed to import configuration', error as Error);
      throw error;
    }
  }

  /**
   * API Key Management
   */
  public async testApiKey(apiKey?: string): Promise<{ valid: boolean; message: string; details?: any }> {
    const keyToTest = apiKey || this.config.apiKey;
    
    if (!keyToTest) {
      return { valid: false, message: 'No API key provided' };
    }

    try {
      // In a real implementation, this would make a test API call
      // For now, we'll simulate the test
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple validation - in production, this would be more sophisticated
      if (keyToTest.length < 10) {
        return { valid: false, message: 'API key appears to be too short' };
      }

      return { 
        valid: true, 
        message: 'API key is valid',
        details: {
          keyLength: keyToTest.length,
          keyPrefix: keyToTest.substring(0, 8) + '...',
          testedAt: new Date().toISOString(),
        }
      };
    } catch (error) {
      return { 
        valid: false, 
        message: `API key test failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  public async updateApiKey(apiKey: string): Promise<void> {
    const testResult = await this.testApiKey(apiKey);
    if (!testResult.valid) {
      throw new Error(`Invalid API key: ${testResult.message}`);
    }

    await this.updateConfig({ apiKey });
    aiLogger.info('API key updated successfully');
  }

  /**
   * Event Listeners
   */
  public onConfigChange(listener: (config: AIServiceConfig) => void): () => void {
    this.configListeners.push(listener);
    return () => {
      const index = this.configListeners.indexOf(listener);
      if (index > -1) {
        this.configListeners.splice(index, 1);
      }
    };
  }

  private notifyConfigListeners(): void {
    this.configListeners.forEach(listener => {
      try {
        listener(this.config);
      } catch (error) {
        aiLogger.error('Error notifying config listener', error as Error);
      }
    });
  }

  /**
   * Storage Methods
   */
  private loadConfig(): AIServiceConfig {
    try {
      const stored = localStorage.getItem('ai_service_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_AI_CONFIG, ...parsed };
      }
    } catch (error) {
      aiLogger.warn('Failed to load stored config, using defaults', error as Error);
    }
    return { ...DEFAULT_AI_CONFIG };
  }

  private async saveConfig(): Promise<void> {
    try {
      localStorage.setItem('ai_service_config', JSON.stringify(this.config));
    } catch (error) {
      aiLogger.error('Failed to save configuration', error as Error);
      throw error;
    }
  }

  private saveModels(): void {
    try {
      localStorage.setItem('ai_models_config', JSON.stringify(this.models));
    } catch (error) {
      aiLogger.error('Failed to save models configuration', error as Error);
    }
  }

  private saveFeatureFlags(): void {
    try {
      localStorage.setItem('ai_feature_flags', JSON.stringify(this.featureFlags));
    } catch (error) {
      aiLogger.error('Failed to save feature flags', error as Error);
    }
  }

  private saveUsageMetrics(): void {
    try {
      localStorage.setItem('ai_usage_metrics', JSON.stringify(this.usageMetrics));
    } catch (error) {
      aiLogger.error('Failed to save usage metrics', error as Error);
    }
  }

  private async saveBackups(): Promise<void> {
    try {
      localStorage.setItem('ai_config_backups', JSON.stringify(this.configBackups));
    } catch (error) {
      aiLogger.error('Failed to save configuration backups', error as Error);
    }
  }

  private async saveAll(): Promise<void> {
    await Promise.all([
      this.saveConfig(),
      Promise.resolve(this.saveModels()),
      Promise.resolve(this.saveFeatureFlags()),
      Promise.resolve(this.saveUsageMetrics()),
      this.saveBackups(),
    ]);
  }

  private initializeUsageMetrics(): AIUsageMetrics {
    try {
      const stored = localStorage.getItem('ai_usage_metrics');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      aiLogger.warn('Failed to load usage metrics, initializing defaults', error as Error);
    }

    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      totalCost: 0,
      cacheHitRate: 0,
      errorRate: 0,
      lastUpdated: new Date().toISOString(),
      dailyUsage: [],
      monthlyUsage: [],
    };
  }

  private initializeFeatureFlags(): void {
    try {
      const stored = localStorage.getItem('ai_feature_flags');
      if (stored) {
        this.featureFlags = JSON.parse(stored);
        return;
      }
    } catch (error) {
      aiLogger.warn('Failed to load feature flags, initializing defaults', error as Error);
    }

    // Initialize default feature flags
    this.featureFlags = [
      {
        key: 'enhanced_fraud_detection',
        name: 'Enhanced Fraud Detection',
        description: 'Advanced AI-powered fraud detection algorithms',
        enabled: true,
        rolloutPercentage: 100,
      },
      {
        key: 'real_time_credit_scoring',
        name: 'Real-time Credit Scoring',
        description: 'Real-time AI credit scoring enhancements',
        enabled: true,
        rolloutPercentage: 100,
      },
      {
        key: 'behavioral_security_analysis',
        name: 'Behavioral Security Analysis',
        description: 'AI-powered behavioral security pattern analysis',
        enabled: true,
        rolloutPercentage: 90,
      },
      {
        key: 'batch_processing',
        name: 'Batch Processing',
        description: 'Batch processing for high-volume analysis',
        enabled: false,
        rolloutPercentage: 0,
      },
    ];
    this.saveFeatureFlags();
  }
}

// Export singleton instance
export const aiConfigManager = AIConfigManager.getInstance();