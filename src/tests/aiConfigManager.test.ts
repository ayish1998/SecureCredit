import { describe, it, expect, beforeEach, vi } from 'vitest';
import { aiConfigManager } from '../utils/aiConfigManager';
import { DEFAULT_AI_CONFIG } from '../types/aiConfig';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock environment variables
vi.mock('../utils/apiKeyValidator', () => ({
  APIKeyValidator: {
    validateGeminiKey: vi.fn(() => ({ isValid: true, errors: [], warnings: [] })),
    testAPIKey: vi.fn(() => Promise.resolve({ isValid: true, message: 'Test successful' })),
    maskAPIKey: vi.fn((key: string) => `${key.substring(0, 4)}••••${key.substring(key.length - 4)}`)
  },
  EnvironmentConfig: {
    getAIEnvironmentConfig: vi.fn(() => ({
      apiKey: undefined, // Don't provide default API key in tests
      enabled: true,
      rateLimitPerMinute: 60,
      timeoutMs: 10000,
      retryAttempts: 3
    }))
  }
}));

describe('AIConfigManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    // Reset the config manager state
    aiConfigManager.resetToDefaults();
    aiConfigManager.resetUsageMetrics();
  });

  describe('Configuration Management', () => {
    it('should return default configuration initially', () => {
      const config = aiConfigManager.getConfig();
      expect(config).toEqual(expect.objectContaining({
        enableFallback: DEFAULT_AI_CONFIG.enableFallback,
        cacheResults: DEFAULT_AI_CONFIG.cacheResults,
        maxRetries: DEFAULT_AI_CONFIG.maxRetries
      }));
    });

    it('should update configuration successfully', async () => {
      const updates = { maxRetries: 5, cacheResults: false };
      const result = await aiConfigManager.updateConfig(updates);
      
      expect(result.isValid).toBe(true);
      
      const updatedConfig = aiConfigManager.getConfig();
      expect(updatedConfig.maxRetries).toBe(5);
      expect(updatedConfig.cacheResults).toBe(false);
    });

    it('should validate configuration on update', async () => {
      const invalidUpdates = { maxRetries: -1 };
      const result = await aiConfigManager.updateConfig(invalidUpdates);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Max retries must be between 0 and 10');
    });

    it('should reset to defaults', () => {
      // First update config
      aiConfigManager.updateConfig({ maxRetries: 5 });
      
      // Then reset
      aiConfigManager.resetToDefaults();
      
      const config = aiConfigManager.getConfig();
      expect(config.maxRetries).toBe(DEFAULT_AI_CONFIG.maxRetries);
    });
  });

  describe('Usage Metrics', () => {
    it('should track request metrics', () => {
      aiConfigManager.recordRequest(true, 1500, 'fraud', 0.001);
      
      const metrics = aiConfigManager.getUsageMetrics();
      expect(metrics.totalRequests).toBe(1);
      expect(metrics.successfulRequests).toBe(1);
      expect(metrics.fraudAnalysisCount).toBe(1);
      expect(metrics.estimatedCost).toBe(0.001);
    });

    it('should track failed requests', () => {
      aiConfigManager.recordRequest(false, 2000, 'credit');
      
      const metrics = aiConfigManager.getUsageMetrics();
      expect(metrics.totalRequests).toBe(1);
      expect(metrics.failedRequests).toBe(1);
      expect(metrics.creditScoringCount).toBe(1);
    });

    it('should calculate error rate correctly', () => {
      aiConfigManager.recordRequest(true, 1000, 'fraud');
      aiConfigManager.recordRequest(false, 2000, 'fraud');
      
      const metrics = aiConfigManager.getUsageMetrics();
      expect(metrics.errorRate).toBe(50); // 1 failed out of 2 total
    });

    it('should reset usage metrics', () => {
      aiConfigManager.recordRequest(true, 1000, 'fraud');
      aiConfigManager.resetUsageMetrics();
      
      const metrics = aiConfigManager.getUsageMetrics();
      expect(metrics.totalRequests).toBe(0);
      expect(metrics.successfulRequests).toBe(0);
    });
  });

  describe('Configuration Validation', () => {
    it('should validate API key requirement', () => {
      const config = { ...DEFAULT_AI_CONFIG, apiKey: undefined };
      const validation = aiConfigManager.validateConfiguration(config);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('API key is required');
    });

    it('should validate retry limits', () => {
      const config = { ...DEFAULT_AI_CONFIG, maxRetries: 15 };
      const validation = aiConfigManager.validateConfiguration(config);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Max retries must be between 0 and 10');
    });

    it('should validate timeout limits', () => {
      const config = { ...DEFAULT_AI_CONFIG, analysisTimeout: 100 };
      const validation = aiConfigManager.validateConfiguration(config);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Analysis timeout must be between 1 and 60 seconds');
    });

    it('should provide warnings for suboptimal settings', () => {
      const config = { ...DEFAULT_AI_CONFIG, maxCacheSize: 5 };
      const validation = aiConfigManager.validateConfiguration(config);
      
      expect(validation.warnings).toContain('Cache size should be between 10 and 1000 for optimal performance');
    });
  });

  describe('Feature Management', () => {
    it('should check if AI is enabled', () => {
      // With API key and enabled features
      aiConfigManager.updateConfig({ 
        apiKey: 'test-key',
        features: { ...DEFAULT_AI_CONFIG.features, fraudDetection: true }
      });
      
      expect(aiConfigManager.isEnabled()).toBe(true);
    });

    it('should return false when no API key', async () => {
      await aiConfigManager.updateConfig({ apiKey: undefined });
      
      expect(aiConfigManager.isEnabled()).toBe(false);
    });

    it('should return false when no features enabled', () => {
      aiConfigManager.updateConfig({ 
        apiKey: 'test-key',
        features: {
          fraudDetection: false,
          creditScoring: false,
          securityAnalysis: false,
          generalInsights: false
        }
      });
      
      expect(aiConfigManager.isEnabled()).toBe(false);
    });
  });

  describe('Cost Estimation', () => {
    it('should provide cost estimates for different features', () => {
      expect(aiConfigManager.getCostEstimate('fraud')).toBe(0.001);
      expect(aiConfigManager.getCostEstimate('credit')).toBe(0.002);
      expect(aiConfigManager.getCostEstimate('security')).toBe(0.0015);
      expect(aiConfigManager.getCostEstimate('general')).toBe(0.001);
    });

    it('should provide default cost for unknown features', () => {
      expect(aiConfigManager.getCostEstimate('unknown')).toBe(0.001);
    });
  });
});