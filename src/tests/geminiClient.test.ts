import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { GeminiClient, geminiClient } from '../services/geminiClient';
import { AIServiceError, RateLimitError, ValidationError } from '../utils/aiValidation';
import { aiLogger } from '../utils/aiLogger';

// Mock dependencies
vi.mock('../utils/aiLogger');
vi.mock('../config/aiConfig', () => ({
  getAIConfig: vi.fn(() => ({
    apiKey: 'test-api-key-AIzaSyTest123',
    model: 'gemini-1.5-flash',
    temperature: 0.7,
    maxTokens: 1000,
    timeout: 10000,
    retryAttempts: 3
  }))
}));

// Mock Google Generative AI
const mockGenerateContent = vi.fn();
const mockGetGenerativeModel = vi.fn(() => ({
  generateContent: mockGenerateContent
}));

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn(() => ({
    getGenerativeModel: mockGetGenerativeModel
  }))
}));

const mockAiLogger = vi.mocked(aiLogger);

describe('GeminiClient', () => {
  let client: GeminiClient;

  beforeEach(() => {
    client = new GeminiClient();
    vi.clearAllMocks();
    
    // Setup default mocks
    mockAiLogger.info = vi.fn();
    mockAiLogger.error = vi.fn();
    mockAiLogger.warn = vi.fn();
    mockAiLogger.startOperation = vi.fn().mockReturnValue(() => {});
  });

  afterEach(() => {
    client.reset();
  });

  describe('initialization', () => {
    it('should initialize successfully with valid API key', async () => {
      await client.initialize();
      
      expect(client.isInitialized()).toBe(true);
      expect(mockAiLogger.info).toHaveBeenCalledWith('Gemini Client initialized successfully');
    });

    it('should throw error when API key is missing', async () => {
      // Mock config without API key
      vi.doMock('../config/aiConfig', () => ({
        getAIConfig: vi.fn(() => ({ apiKey: undefined }))
      }));

      await expect(client.initialize()).rejects.toThrow(AIServiceError);
      await expect(client.initialize()).rejects.toThrow('Gemini API key not configured');
    });

    it('should handle initialization errors gracefully', async () => {
      mockGetGenerativeModel.mockImplementation(() => {
        throw new Error('Model initialization failed');
      });

      await expect(client.initialize()).rejects.toThrow(AIServiceError);
      expect(mockAiLogger.error).toHaveBeenCalled();
    });
  });

  describe('content generation', () => {
    beforeEach(async () => {
      await client.initialize();
    });

    it('should generate content successfully', async () => {
      const mockResponse = {
        response: {
          text: () => 'Generated content response'
        }
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const request = {
        prompt: 'Test prompt',
        data: { test: 'data' },
        context: { analysisType: 'fraud' as const }
      };

      const result = await client.generateContent(request);

      expect(result).toMatchObject({
        content: 'Generated content response',
        confidence: expect.any(Number)
      });
      expect(mockGenerateContent).toHaveBeenCalled();
    });

    it('should handle rate limit errors', async () => {
      mockGenerateContent.mockRejectedValue(new Error('quota exceeded'));

      const request = {
        prompt: 'Test prompt',
        context: { analysisType: 'fraud' as const }
      };

      await expect(client.generateContent(request)).rejects.toThrow(RateLimitError);
    });

    it('should handle authentication errors', async () => {
      mockGenerateContent.mockRejectedValue(new Error('invalid API key'));

      const request = {
        prompt: 'Test prompt',
        context: { analysisType: 'fraud' as const }
      };

      await expect(client.generateContent(request)).rejects.toThrow(AIServiceError);
    });

    it('should handle timeout errors with retry flag', async () => {
      mockGenerateContent.mockRejectedValue(new Error('timeout'));

      const request = {
        prompt: 'Test prompt',
        context: { analysisType: 'fraud' as const }
      };

      try {
        await client.generateContent(request);
      } catch (error) {
        expect(error).toBeInstanceOf(AIServiceError);
        expect((error as AIServiceError).canRetry).toBe(true);
      }
    });

    it('should validate empty prompts', async () => {
      const request = {
        prompt: '',
        context: { analysisType: 'fraud' as const }
      };

      await expect(client.generateContent(request)).rejects.toThrow(ValidationError);
    });

    it('should handle empty API responses', async () => {
      const mockResponse = {
        response: {
          text: () => ''
        }
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const request = {
        prompt: 'Test prompt',
        context: { analysisType: 'fraud' as const }
      };

      await expect(client.generateContent(request)).rejects.toThrow(ValidationError);
    });
  });

  describe('analysis with context', () => {
    beforeEach(async () => {
      await client.initialize();
    });

    it('should perform fraud analysis', async () => {
      const mockResponse = {
        response: {
          text: () => 'Fraud analysis: Low risk detected'
        }
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const data = { amount: 100, merchant: 'test' };
      const result = await client.analyzeWithContext(data, 'fraud');

      expect(result.content).toContain('Fraud analysis');
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining('fraud detection')
      );
    });

    it('should perform credit analysis', async () => {
      const mockResponse = {
        response: {
          text: () => 'Credit analysis: Good credit score'
        }
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const data = { creditScore: 750, income: 50000 };
      const result = await client.analyzeWithContext(data, 'credit');

      expect(result.content).toContain('Credit analysis');
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining('credit scoring')
      );
    });

    it('should perform security analysis', async () => {
      const mockResponse = {
        response: {
          text: () => 'Security analysis: No threats detected'
        }
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const data = { deviceId: 'test-device', location: 'test-location' };
      const result = await client.analyzeWithContext(data, 'security');

      expect(result.content).toContain('Security analysis');
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining('security analysis')
      );
    });

    it('should perform general analysis', async () => {
      const mockResponse = {
        response: {
          text: () => 'General analysis: Insights generated'
        }
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const data = { metrics: { users: 1000 } };
      const result = await client.analyzeWithContext(data, 'general');

      expect(result.content).toContain('General analysis');
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining('general analysis')
      );
    });
  });

  describe('connection testing', () => {
    beforeEach(async () => {
      await client.initialize();
    });

    it('should test connection successfully', async () => {
      const mockResponse = {
        response: {
          text: () => 'Test response'
        }
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await client.testConnection();

      expect(result.success).toBe(true);
      expect(result.message).toContain('successful');
      expect(result.latency).toBeGreaterThan(0);
    });

    it('should handle connection test failures', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Connection failed'));

      const result = await client.testConnection();

      expect(result.success).toBe(false);
      expect(result.message).toContain('failed');
    });

    it('should handle unexpected responses during testing', async () => {
      mockGenerateContent.mockResolvedValue(null);

      const result = await client.testConnection();

      expect(result.success).toBe(false);
      expect(result.message).toContain('Unexpected response');
    });
  });

  describe('confidence calculation', () => {
    beforeEach(async () => {
      await client.initialize();
    });

    it('should calculate higher confidence for detailed responses', async () => {
      const detailedResponse = {
        response: {
          text: () => 'This is a very detailed analysis with multiple factors considered including transaction patterns, user behavior, and risk indicators. The analysis shows comprehensive evaluation of all relevant data points.'
        }
      };
      mockGenerateContent.mockResolvedValue(detailedResponse);

      const request = {
        prompt: 'Detailed analysis request',
        context: { analysisType: 'fraud' as const }
      };

      const result = await client.generateContent(request);
      expect(result.confidence).toBeGreaterThan(85);
    });

    it('should calculate lower confidence for brief responses', async () => {
      const briefResponse = {
        response: {
          text: () => 'Brief response'
        }
      };
      mockGenerateContent.mockResolvedValue(briefResponse);

      const request = {
        prompt: 'Brief request',
        context: { analysisType: 'fraud' as const }
      };

      const result = await client.generateContent(request);
      expect(result.confidence).toBeLessThan(90);
    });
  });

  describe('service status', () => {
    it('should return correct status when not initialized', () => {
      const status = client.getStatus();
      expect(status.initialized).toBe(false);
      expect(status.healthy).toBe(false);
    });

    it('should return correct status when initialized', async () => {
      await client.initialize();
      const status = client.getStatus();
      expect(status.initialized).toBe(true);
      expect(status.healthy).toBe(true);
    });
  });

  describe('singleton instance', () => {
    it('should work with the exported singleton', async () => {
      expect(geminiClient).toBeInstanceOf(GeminiClient);
      
      // Test that it can be initialized
      await geminiClient.initialize();
      expect(geminiClient.isInitialized()).toBe(true);
    });
  });
});