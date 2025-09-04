import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GeminiClient } from '../geminiClient';
import { AIServiceError, RateLimitError, ValidationError } from '../../types/ai';

// Mock the Google Generative AI
const mockGenerateContent = vi.fn();
const mockGetGenerativeModel = vi.fn().mockReturnValue({
  generateContent: mockGenerateContent,
});

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: mockGetGenerativeModel,
  })),
}));

// Mock the utilities
vi.mock('../../utils/rateLimiter', () => ({
  checkRateLimit: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../utils/aiLogger', () => ({
  aiLogger: {
    info: vi.fn(),
    error: vi.fn(),
    startOperation: vi.fn().mockReturnValue(() => {}),
  },
}));

describe('GeminiClient', () => {
  let client: GeminiClient;

  beforeEach(() => {
    client = new GeminiClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
    client.reset();
  });

  describe('initialization', () => {
    it('should initialize successfully with valid config', async () => {
      await expect(client.initialize()).resolves.not.toThrow();
      
      const status = client.getStatus();
      expect(status.initialized).toBe(true);
      expect(status.healthy).toBe(true);
    });

    it('should throw error when API key is missing', async () => {
      // Temporarily override the environment
      const originalEnv = import.meta.env.VITE_GEMINI_API_KEY;
      // @ts-ignore
      import.meta.env.VITE_GEMINI_API_KEY = '';

      await expect(client.initialize()).rejects.toThrow(AIServiceError);

      // Restore original environment
      // @ts-ignore
      import.meta.env.VITE_GEMINI_API_KEY = originalEnv;
    });
  });

  describe('generateContent', () => {
    beforeEach(async () => {
      await client.initialize();
    });

    it('should generate content successfully', async () => {
      const mockResponse = {
        response: {
          text: () => 'Generated content response',
        },
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await client.generateContent({
        prompt: 'Test prompt',
        context: { analysisType: 'general', priority: 'medium' },
      });

      expect(result.content).toBe('Generated content response');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(100);
    });

    it('should handle rate limit errors', async () => {
      vi.mocked(rateLimiter.checkRateLimit).mockRejectedValue(
        new RateLimitError('Rate limit exceeded', 5000)
      );

      await expect(client.generateContent({
        prompt: 'Test prompt',
      })).rejects.toThrow(RateLimitError);
    });

    it('should validate request parameters', async () => {
      await expect(client.generateContent({
        prompt: '',
      })).rejects.toThrow(ValidationError);

      await expect(client.generateContent({
        prompt: 'Valid prompt',
        temperature: 3, // Invalid temperature
      })).rejects.toThrow(ValidationError);
    });

    it('should handle API timeout', async () => {
      mockModel.generateContent.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 15000))
      );

      await expect(client.generateContent({
        prompt: 'Test prompt',
      })).rejects.toThrow();
    });

    it('should handle empty API response', async () => {
      const mockResponse = {
        response: {
          text: () => '',
        },
      };

      mockModel.generateContent.mockResolvedValue(mockResponse);

      await expect(client.generateContent({
        prompt: 'Test prompt',
      })).rejects.toThrow(ValidationError);
    });
  });

  describe('analyzeWithContext', () => {
    beforeEach(async () => {
      await client.initialize();
    });

    it('should analyze fraud data', async () => {
      const mockResponse = {
        response: {
          text: () => 'Fraud analysis: Low risk detected',
        },
      };

      mockModel.generateContent.mockResolvedValue(mockResponse);

      const result = await client.analyzeWithContext(
        { transactionAmount: 1000, location: 'Lagos' },
        'fraud',
        { userId: 'user123', priority: 'high' }
      );

      expect(result.content).toContain('Fraud analysis');
      expect(mockModel.generateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          contents: expect.arrayContaining([
            expect.objectContaining({
              parts: expect.arrayContaining([
                expect.objectContaining({
                  text: expect.stringContaining('fraud detection analyst'),
                }),
              ]),
            }),
          ]),
        })
      );
    });

    it('should analyze credit data', async () => {
      const mockResponse = {
        response: {
          text: () => 'Credit analysis: Score 720, Good creditworthiness',
        },
      };

      mockModel.generateContent.mockResolvedValue(mockResponse);

      const result = await client.analyzeWithContext(
        { income: 50000, expenses: 30000 },
        'credit'
      );

      expect(result.content).toContain('Credit analysis');
    });

    it('should analyze security data', async () => {
      const mockResponse = {
        response: {
          text: () => 'Security analysis: No threats detected',
        },
      };

      mockModel.generateContent.mockResolvedValue(mockResponse);

      const result = await client.analyzeWithContext(
        { deviceId: 'device123', ipAddress: '192.168.1.1' },
        'security'
      );

      expect(result.content).toContain('Security analysis');
    });
  });

  describe('testConnection', () => {
    beforeEach(async () => {
      await client.initialize();
    });

    it('should test connection successfully', async () => {
      const mockResponse = {
        response: {
          text: () => 'Connection successful',
        },
      };

      mockModel.generateContent.mockResolvedValue(mockResponse);

      const result = await client.testConnection();

      expect(result.success).toBe(true);
      expect(result.message).toContain('successful');
      expect(result.latency).toBeGreaterThan(0);
    });

    it('should handle connection test failure', async () => {
      mockModel.generateContent.mockRejectedValue(new Error('Network error'));

      const result = await client.testConnection();

      expect(result.success).toBe(false);
      expect(result.message).toContain('failed');
    });
  });

  describe('error handling', () => {
    beforeEach(async () => {
      await client.initialize();
    });

    it('should handle quota exceeded errors', async () => {
      mockModel.generateContent.mockRejectedValue(
        new Error('Quota exceeded for this request')
      );

      await expect(client.generateContent({
        prompt: 'Test prompt',
      })).rejects.toThrow(RateLimitError);
    });

    it('should handle unauthorized errors', async () => {
      mockModel.generateContent.mockRejectedValue(
        new Error('Invalid API key or unauthorized access')
      );

      await expect(client.generateContent({
        prompt: 'Test prompt',
      })).rejects.toThrow(AIServiceError);
    });

    it('should handle network timeout errors', async () => {
      mockModel.generateContent.mockRejectedValue(
        new Error('Request timeout')
      );

      await expect(client.generateContent({
        prompt: 'Test prompt',
      })).rejects.toThrow(AIServiceError);
    });
  });

  describe('confidence calculation', () => {
    beforeEach(async () => {
      await client.initialize();
    });

    it('should calculate higher confidence for longer responses', async () => {
      const longResponse = 'A'.repeat(1000);
      const shortResponse = 'Short';

      const mockLongResponse = {
        response: { text: () => longResponse },
      };
      const mockShortResponse = {
        response: { text: () => shortResponse },
      };

      mockModel.generateContent
        .mockResolvedValueOnce(mockLongResponse)
        .mockResolvedValueOnce(mockShortResponse);

      const longResult = await client.generateContent({ prompt: 'Test' });
      const shortResult = await client.generateContent({ prompt: 'Test' });

      expect(longResult.confidence).toBeGreaterThan(shortResult.confidence);
    });

    it('should calculate higher confidence for structured responses', async () => {
      const structuredResponse = 'Analysis complete. Confidence: 95%. Probability: 80%.';
      const unstructuredResponse = 'This is a simple response.';

      const mockStructuredResponse = {
        response: { text: () => structuredResponse },
      };
      const mockUnstructuredResponse = {
        response: { text: () => unstructuredResponse },
      };

      mockModel.generateContent
        .mockResolvedValueOnce(mockStructuredResponse)
        .mockResolvedValueOnce(mockUnstructuredResponse);

      const structuredResult = await client.generateContent({ prompt: 'Test' });
      const unstructuredResult = await client.generateContent({ prompt: 'Test' });

      expect(structuredResult.confidence).toBeGreaterThan(unstructuredResult.confidence);
    });
  });

  describe('status and health', () => {
    it('should report correct status when not initialized', () => {
      const status = client.getStatus();
      
      expect(status.initialized).toBe(false);
      expect(status.healthy).toBe(false);
    });

    it('should report correct status when initialized', async () => {
      await client.initialize();
      const status = client.getStatus();
      
      expect(status.initialized).toBe(true);
      expect(status.healthy).toBe(true);
    });

    it('should reset properly', async () => {
      await client.initialize();
      client.reset();
      
      const status = client.getStatus();
      expect(status.initialized).toBe(false);
      expect(status.healthy).toBe(false);
    });
  });
});