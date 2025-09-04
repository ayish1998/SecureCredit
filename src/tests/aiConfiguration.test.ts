import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AIConfigManager, aiConfigManager } from '../utils/aiConfigManager';
import { AIUsageMonitor, aiUsageMonitor } from '../services/aiUsageMonitor';
import { APIKeyValidator } from '../utils/apiKeyValidator';
import { DEFAULT_AI_CONFIG } from '../types/aiConfig';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock environment variables
vi.mock('import.meta', () => ({
  env: {
    VITE_GEMINI_API_KEY: 'AIzaSyTest123456789012345678901234567890',
    PROD: false
  }
}));

describe('AIConfigManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    aiConfigManager.resetToDefaults();
  });

  describe('Configuration Management', () => {
    it('should initialize with default configuration', () => {
      const config = aiConfigManager.getConfig();
      expect(config).toMatchObject(DEFAULT_AI_CONFIG);
    });

    it('should update configuration successfully', async () => {
      const updates = {
        maxRetries: 5,
        analysisTimeout: 20000,
        features: {
          ...DEFAULT_AI_CONFIG.features,
          fraudDetection: false
        }
      };

      const result = await aiConfigManager.updateConfig(updates);
      expect(result.isValid).toBe(true);

      const config = aiConfigManager.getConfig();
      expect(config.maxRetries).toBe(5);
      expect(config.analysisTimeout).toBe(20000);
      expect(config.features.fraudDetection).toBe(false);
    });

    it('should validate configuration correctly', () => {
      const validConfig = {
        ...DEFAULT_AI_CONFIG,
        apiKey: 'AIzaSyTest123456789012345678901234567890'
      };

      const result = aiConfigManager.validateConfiguration(validConfig);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid configuration', () => {
      const invalidConfig = {
        ...DEFAULT_AI_CONFIG,
        apiKey: 'invalid_key',
        maxRetries: -1,
        analysisTimeout: 100000
      };

      const result = aiConfigManager.validateConfiguration(invalidConfig);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should apply presets correctly', () => {
      const result = aiConfigManager.applyPreset('development');
      expect(result.isValid).toBe(true);

      const config = aiConfigManager.getConfig();
      expect(config.logging.level).toBe('debug');
      expect(config.logging.includeRequestData).toBe(true);
    });

    it('should handle regional configurations', async () => {
      const result = await aiConfigManager.applyRegionalConfig('ghana');
      expect(result.isValid).toBe(true);

      const config = aiConfigManager.getConfig();
      expect(config.region).toBe('ghana');
      expect(config.currency).toBe('GHS');
      expect(config.timezone).toBe('Africa/Accra');
    });
  });

  describe('Configuration Persistence', () => {
    it('should save configuration to localStorage', async () => {
      const updates = { maxRetries: 7 };
      await aiConfigManager.updateConfig(updates);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ai_service_config',
        expect.stringContaining('"maxRetries":7')
      );
    });

    it('should load configuration from localStorage', () => {
      const storedConfig = {
        maxRetries: 8,
        analysisTimeout: 25000
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedConfig));

      // Reinitialize to load from storage
      AIConfigManager.initialize();
      
      const config = aiConfigManager.getConfig();
      expect(config.maxRetries).toBe(8);
      expect(config.analysisTimeout).toBe(25000);
    });
  });

  describe('Configuration Testing', () => {
    it('should test valid configuration successfully', async () => {
      const validConfig = {
        ...DEFAULT_AI_CONFIG,
        apiKey: 'AIzaSyTest123456789012345678901234567890'
      };

      const result = await aiConfigManager.testConfiguration(validConfig);
      expect(result.success).toBe(true);
      expect(result.message).toContain('successful');
    });

    it('should fail test for invalid configuration', async () => {
      const invalidConfig = {
        ...DEFAULT_AI_CONFIG,
        apiKey: 'invalid_key'
      };

      const result = await aiConfigManager.testConfiguration(invalidConfig);
      expect(result.success).toBe(false);
     