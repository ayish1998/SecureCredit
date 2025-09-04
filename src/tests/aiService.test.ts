import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { aiService, AIService } from '../services/aiService';
import { geminiClient } from '../services/geminiClient';
import { aiLogger } from '../utils/aiLogger';

// Mock dependencies
vi.mock('../services/geminiClient');
vi.mock('../utils/aiLogger');
vi.mock('../utils/dataAdapter', () => ({
  dataAdapter: {
    getFraudDetectionData: vi.fn().mockReturnValue({
      recentAlerts: [],
      riskMetrics: { riskLevel: 'medium' }
    })
  }
}));

const mockGeminiClient = vi.mocked(geminiClient);
const mockAiLogger = vi.mocked(aiLogger);

describe('AIService', () => {
  let testService: AIService;

  beforeEach(() => {
    testService = new AIService();
    vi.clearAllMocks();
    
    // Setup default mocks
    mockGeminiClient.initialize = vi.fn().mockResolvedValue(undefined);
    mockGeminiClient.analyzeWithContext = vi.fn();
    mockGeminiClient.getStatus = vi.fn().mockReturnValue({ 
      initialized: true, 
      healthy: true 
    });
    
    mockAiLogger.info = vi.fn();
    mockAiLogger.error = vi.fn();
    mockAiLogger.warn = vi.fn();
    mockAiLogger.startOperation = vi.fn().mockReturnValue(() => {});
  });

  afterEach(() => {
    testService.clearCache();
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await testService.initialize();
      
      expect(mockGeminiClient.initialize).toHaveBeenCalled();
      expect(mockAiLogger.info).toHaveBeenCalledWith(
        'AI Service initialized successfully',
        undefined,
        expect.objectContaining({
          fallbackEnabled: true,
          cacheEnabled: true,
        })
      );
    });

    it('should handle initialization failure with fallback enabled', async () => {
      mockGeminiClient.initialize.mockRejectedValue(new Error('API key missing'));
      
      await testService.initialize({ enableFallback: true });
      
      expect(mockAiLogger.error).toHaveBeenCalled();
      expect(mockAiLogger.info).toHaveBeenCalledWith('AI Service running in fallback mode');
    });

    it('should throw error when initialization fails and fallback is disabled', async () => {
      mockGeminiClient.initialize.mockRejectedValue(new Error('API key missing'));
      
      await expect(testService.initialize({ enableFallback: false }))
        .rejects.toThrow('Failed to initialize AI service');
    });
  });

  describe('fraud analysis', () => {
    const mockTransactionData = {
      amount: 1000,
      currency: 'USD',
      timestamp: new Date().toISOString(),
      merchantType: 'retail',
    };

    it('should perform AI fraud analysis successfully', async () => {
      const mockAIResponse = {
        content: 'Fraud probability: 15%\nRisk level: low\nSuspicious patterns identified: None\nRecommendations: Continue monitoring',
        confidence: 90,
      };
      
      mockGeminiClient.analyzeWithContext.mockResolvedValue(mockAIResponse);
      
      const result = await testService.analyzeFraudRisk(mockTransactionData);
      
      expect(result).toMatchObject({
        fraudProbability: 15,
        riskLevel: 'low',
        confidence: 90,
      });
      expect(result.suspiciousPatterns).toContain('identified: none');
      expect(result.recommendations).toContain('continue monitoring');
    });

    it('should fallback to mock analysis when AI fails', async () => {
      mockGeminiClient.analyzeWithContext.mockRejectedValue(new Error('API error'));
      
      const result = await testService.analyzeFraudRisk(mockTransactionData);
      
      expect(result).toMatchObject({
        confidence: 75,
        riskLevel: 'low',
        fraudProbability: 15,
      });
      // Note: warn is called during performAIAnalysis, not in the main method
      expect(mockAiLogger.error).toHaveBeenCalled();
    });

    it('should use cached results when available', async () => {
      const mockAIResponse = {
        content: 'Fraud probability: 20%\nRisk level: medium',
        confidence: 85,
      };
      
      mockGeminiClient.analyzeWithContext.mockResolvedValue(mockAIResponse);
      
      // First call
      await testService.analyzeFraudRisk(mockTransactionData);
      
      // Second call should use cache
      await testService.analyzeFraudRisk(mockTransactionData);
      
      expect(mockGeminiClient.analyzeWithContext).toHaveBeenCalledTimes(1);
    });
  });

  describe('credit scoring enhancement', () => {
    const mockCreditData = {
      creditScore: 650,
      income: 50000,
      employmentStatus: 'employed',
      existingDebts: 15000,
    };

    it('should perform AI credit enhancement successfully', async () => {
      const mockAIResponse = {
        content: 'Enhanced credit score: 720\nRisk assessment: low\nLending recommendation: Approved for standard terms',
        confidence: 88,
      };
      
      mockGeminiClient.analyzeWithContext.mockResolvedValue(mockAIResponse);
      
      const result = await testService.enhanceCreditScoring(mockCreditData);
      
      expect(result).toMatchObject({
        enhancedScore: 720,
        riskLevel: 'low',
        confidence: 88,
        lendingRecommendation: 'approved for standard terms',
      });
    });

    it('should fallback to mock enhancement when AI fails', async () => {
      mockGeminiClient.analyzeWithContext.mockRejectedValue(new Error('Rate limit exceeded'));
      
      const result = await testService.enhanceCreditScoring(mockCreditData);
      
      expect(result).toMatchObject({
        confidence: 75,
        riskLevel: 'low',
        enhancedScore: 720,
      });
      // Note: error is logged during performAIAnalysis
      expect(mockAiLogger.error).toHaveBeenCalled();
    });
  });

  describe('security pattern analysis', () => {
    const mockSecurityData = {
      deviceFingerprint: 'abc123',
      loginPatterns: [
        { timestamp: new Date().toISOString(), location: 'New York', success: true }
      ],
      riskIndicators: ['new_device'],
    };

    it('should perform AI security analysis successfully', async () => {
      const mockAIResponse = {
        content: 'Threat level: 25%\nRisk assessment: medium\nVulnerabilities: Device not fully trusted\nMitigation: Enable 2FA',
        confidence: 82,
      };
      
      mockGeminiClient.analyzeWithContext.mockResolvedValue(mockAIResponse);
      
      const result = await testService.analyzeSecurityPattern(mockSecurityData);
      
      expect(result).toMatchObject({
        threatLevel: 25,
        riskLevel: 'medium',
        confidence: 82,
      });
      expect(result.vulnerabilities).toContain('device not fully trusted');
      expect(result.mitigationSteps).toContain('enable 2fa');
    });

    it('should fallback to mock assessment when AI fails', async () => {
      mockGeminiClient.analyzeWithContext.mockRejectedValue(new Error('Network error'));
      
      const result = await testService.analyzeSecurityPattern(mockSecurityData);
      
      expect(result).toMatchObject({
        confidence: 75,
        riskLevel: 'low',
        threatLevel: 20,
      });
    });
  });

  describe('general insights', () => {
    const mockData = {
      type: 'dashboard',
      metrics: { users: 1000, transactions: 5000 },
    };

    it('should generate AI insights successfully', async () => {
      const mockAIResponse = {
        content: 'Key findings: Strong user engagement\nRisk assessment: low\nRecommendations: Continue current strategy',
        confidence: 85,
      };
      
      mockGeminiClient.analyzeWithContext.mockResolvedValue(mockAIResponse);
      
      const result = await testService.generateInsights(mockData, 'dashboard-analysis');
      
      expect(result).toMatchObject({
        confidence: 85,
        riskLevel: 'low',
      });
      expect(result.recommendations).toContain('continue current strategy');
    });

    it('should fallback to general analysis when AI fails', async () => {
      mockGeminiClient.analyzeWithContext.mockRejectedValue(new Error('Service unavailable'));
      
      const result = await testService.generateInsights(mockData, 'dashboard-analysis');
      
      expect(result).toMatchObject({
        confidence: 70,
        riskLevel: 'medium',
      });
    });
  });

  describe('service management', () => {
    it('should return correct service status', async () => {
      await testService.initialize();
      
      const status = testService.getStatus();
      
      expect(status).toMatchObject({
        initialized: true,
        aiAvailable: true,
        fallbackEnabled: true,
        cacheSize: 0,
      });
    });

    it('should clear cache successfully', async () => {
      // Add something to cache first
      const mockAIResponse = { content: 'test', confidence: 80 };
      mockGeminiClient.analyzeWithContext.mockResolvedValue(mockAIResponse);
      
      await testService.analyzeFraudRisk({ amount: 100 });
      
      let status = testService.getStatus();
      expect(status.cacheSize).toBeGreaterThan(0);
      
      testService.clearCache();
      
      status = testService.getStatus();
      expect(status.cacheSize).toBe(0);
    });

    it('should test service functionality', async () => {
      const mockAIResponse = {
        content: 'Test successful\nRisk assessment: low\nRecommendations: Continue testing',
        confidence: 90,
      };
      
      mockGeminiClient.analyzeWithContext.mockResolvedValue(mockAIResponse);
      
      const result = await testService.testService();
      
      expect(result).toMatchObject({
        success: true,
        message: 'AI Service test completed successfully',
        details: {
          confidence: 90,
          hasRecommendations: true,
          riskLevel: 'low',
        },
      });
    });

    it('should handle test service failure', async () => {
      // Mock the generateInsights method to throw an error
      const failingService = new AIService();
      mockGeminiClient.analyzeWithContext.mockRejectedValue(new Error('Test failed'));
      
      // Override the generateInsights method to throw an error
      vi.spyOn(failingService, 'generateInsights').mockRejectedValue(new Error('Test failed'));
      
      const result = await failingService.testService();
      
      expect(result).toMatchObject({
        success: false,
        message: expect.stringContaining('AI Service test failed'),
      });
    });
  });

  describe('error handling', () => {
    it('should handle malformed AI responses gracefully', async () => {
      const mockAIResponse = {
        content: 'Invalid response format without proper structure',
        confidence: 50,
      };
      
      mockGeminiClient.analyzeWithContext.mockResolvedValue(mockAIResponse);
      
      const result = await testService.analyzeFraudRisk({ amount: 100 });
      
      // Should still return a valid result structure
      expect(result).toHaveProperty('fraudProbability');
      expect(result).toHaveProperty('riskLevel');
      expect(result).toHaveProperty('confidence');
    });

    it('should handle empty AI responses', async () => {
      const mockAIResponse = {
        content: '',
        confidence: 0,
      };
      
      mockGeminiClient.analyzeWithContext.mockResolvedValue(mockAIResponse);
      
      const result = await testService.analyzeFraudRisk({ amount: 100 });
      
      // Should fallback to mock data
      expect(result.confidence).toBe(85); // AI response confidence (empty content still has base confidence)
    });
  });

  describe('cache management', () => {
    it('should limit cache size to prevent memory issues', async () => {
      const mockAIResponse = { content: 'test response', confidence: 80 };
      mockGeminiClient.analyzeWithContext.mockResolvedValue(mockAIResponse);
      
      // Add more than 100 items to trigger cache cleanup
      for (let i = 0; i < 105; i++) {
        await testService.analyzeFraudRisk({ amount: i, id: i });
      }
      
      const status = testService.getStatus();
      expect(status.cacheSize).toBeLessThanOrEqual(100);
    });
  });
});

describe('AIService Integration', () => {
  it('should work with the singleton instance', async () => {
    // Test that the exported singleton works correctly
    expect(aiService).toBeInstanceOf(AIService);
    
    const status = aiService.getStatus();
    expect(status).toHaveProperty('initialized');
    expect(status).toHaveProperty('aiAvailable');
  });
});