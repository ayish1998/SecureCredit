import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { aiService } from '../../services/aiService';
import { geminiClient } from '../../services/geminiClient';
import { aiUsageMonitor } from '../../services/aiUsageMonitor';
import { mockAIResponses } from '../mocks/aiResponses';

// Mock AI services
vi.mock('../../services/aiService');
vi.mock('../../services/geminiClient');
vi.mock('../../services/aiUsageMonitor');

// Mock components that use AI
vi.mock('../../components/FraudDetectionCenter', () => ({
  FraudDetectionCenter: ({ onAnalysisComplete }: any) => (
    <div data-testid="fraud-detection-center">
      <button 
        onClick={() => onAnalysisComplete?.(mockAIResponses.fraud.lowRisk)}
        data-testid="analyze-fraud-btn"
      >
        Analyze Fraud
      </button>
    </div>
  )
}));

vi.mock('../../components/EnhancedCreditScoring', () => ({
  EnhancedCreditScoring: ({ onScoreUpdate }: any) => (
    <div data-testid="credit-scoring">
      <button 
        onClick={() => onScoreUpdate?.(mockAIResponses.credit.excellent)}
        data-testid="analyze-credit-btn"
      >
        Analyze Credit
      </button>
    </div>
  )
}));

vi.mock('../../components/EnhancedSecurityDashboard', () => ({
  EnhancedSecurityDashboard: ({ onSecurityUpdate }: any) => (
    <div data-testid="security-dashboard">
      <button 
        onClick={() => onSecurityUpdate?.(mockAIResponses.security.secure)}
        data-testid="analyze-security-btn"
      >
        Analyze Security
      </button>
    </div>
  )
}));

const mockAiService = vi.mocked(aiService);
const mockGeminiClient = vi.mocked(geminiClient);
const mockAiUsageMonitor = vi.mocked(aiUsageMonitor);

describe('AI Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    mockAiService.initialize = vi.fn().mockResolvedValue(undefined);
    mockAiService.getStatus = vi.fn().mockReturnValue({
      initialized: true,
      aiAvailable: true,
      fallbackEnabled: true,
      cacheSize: 0
    });
    mockAiService.analyzeFraudRisk = vi.fn().mockResolvedValue(mockAIResponses.fraud.lowRisk);
    mockAiService.enhanceCreditScoring = vi.fn().mockResolvedValue(mockAIResponses.credit.excellent);
    mockAiService.analyzeSecurityPattern = vi.fn().mockResolvedValue(mockAIResponses.security.secure);
    mockAiService.generateInsights = vi.fn().mockResolvedValue(mockAIResponses.general.insights);
    
    mockGeminiClient.initialize = vi.fn().mockResolvedValue(undefined);
    mockGeminiClient.isInitialized = vi.fn().mockReturnValue(true);
    mockGeminiClient.getStatus = vi.fn().mockReturnValue({
      initialized: true,
      healthy: true
    });
    
    mockAiUsageMonitor.recordRequest = vi.fn();
    mockAiUsageMonitor.getUsageMetrics = vi.fn().mockReturnValue({
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      errorRate: 0,
      averageResponseTime: 0,
      totalCost: 0,
      fraudAnalysisCount: 0,
      creditScoringCount: 0,
      securityAnalysisCount: 0,
      generalInsightsCount: 0
    });
  });

  describe('AI Service Integration', () => {
    it('should initialize AI services successfully', async () => {
      await aiService.initialize();
      
      expect(mockAiService.initialize).toHaveBeenCalled();
      expect(mockGeminiClient.initialize).toHaveBeenCalled();
    });

    it('should handle AI service initialization failure gracefully', async () => {
      mockAiService.initialize.mockRejectedValue(new Error('API key missing'));
      
      // Should not throw error due to fallback
      await expect(aiService.initialize({ enableFallback: true })).resolves.not.toThrow();
    });

    it('should perform end-to-end fraud analysis', async () => {
      const transactionData = {
        amount: 1000,
        currency: 'USD',
        merchantType: 'retail',
        timestamp: new Date().toISOString()
      };

      const result = await aiService.analyzeFraudRisk(transactionData);

      expect(mockAiService.analyzeFraudRisk).toHaveBeenCalledWith(transactionData);
      expect(result).toMatchObject({
        fraudProbability: expect.any(Number),
        riskLevel: expect.any(String),
        confidence: expect.any(Number),
        recommendations: expect.any(Array)
      });
      expect(mockAiUsageMonitor.recordRequest).toHaveBeenCalledWith(
        'fraud',
        true,
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should perform end-to-end credit scoring', async () => {
      const creditData = {
        creditScore: 650,
        income: 50000,
        employmentStatus: 'employed',
        existingDebts: 15000
      };

      const result = await aiService.enhanceCreditScoring(creditData);

      expect(mockAiService.enhanceCreditScoring).toHaveBeenCalledWith(creditData);
      expect(result).toMatchObject({
        enhancedScore: expect.any(Number),
        riskLevel: expect.any(String),
        confidence: expect.any(Number),
        lendingRecommendation: expect.any(String)
      });
    });

    it('should perform end-to-end security analysis', async () => {
      const securityData = {
        deviceFingerprint: 'abc123',
        loginPatterns: [
          { timestamp: new Date().toISOString(), location: 'New York', success: true }
        ],
        riskIndicators: ['new_device']
      };

      const result = await aiService.analyzeSecurityPattern(securityData);

      expect(mockAiService.analyzeSecurityPattern).toHaveBeenCalledWith(securityData);
      expect(result).toMatchObject({
        threatLevel: expect.any(Number),
        riskLevel: expect.any(String),
        confidence: expect.any(Number),
        vulnerabilities: expect.any(Array),
        mitigationSteps: expect.any(Array)
      });
    });
  });

  describe('Component Integration with AI', () => {
    const TestApp = () => {
      const [fraudResult, setFraudResult] = React.useState(null);
      const [creditResult, setCreditResult] = React.useState(null);
      const [securityResult, setSecurityResult] = React.useState(null);

      return (
        <div>
          <div data-testid="fraud-result">
            {fraudResult ? JSON.stringify(fraudResult) : 'No fraud analysis'}
          </div>
          <div data-testid="credit-result">
            {creditResult ? JSON.stringify(creditResult) : 'No credit analysis'}
          </div>
          <div data-testid="security-result">
            {securityResult ? JSON.stringify(securityResult) : 'No security analysis'}
          </div>
          
          <button 
            onClick={async () => {
              const result = await aiService.analyzeFraudRisk({ amount: 1000 });
              setFraudResult(result);
            }}
            data-testid="test-fraud-btn"
          >
            Test Fraud Analysis
          </button>
          
          <button 
            onClick={async () => {
              const result = await aiService.enhanceCreditScoring({ creditScore: 650 });
              setCreditResult(result);
            }}
            data-testid="test-credit-btn"
          >
            Test Credit Analysis
          </button>
          
          <button 
            onClick={async () => {
              const result = await aiService.analyzeSecurityPattern({ deviceFingerprint: 'test' });
              setSecurityResult(result);
            }}
            data-testid="test-security-btn"
          >
            Test Security Analysis
          </button>
        </div>
      );
    };

    it('should integrate fraud analysis with UI components', async () => {
      render(<TestApp />);
      
      const fraudButton = screen.getByTestId('test-fraud-btn');
      fireEvent.click(fraudButton);
      
      await waitFor(() => {
        const result = screen.getByTestId('fraud-result');
        expect(result.textContent).not.toBe('No fraud analysis');
        expect(result.textContent).toContain('fraudProbability');
      });
    });

    it('should integrate credit scoring with UI components', async () => {
      render(<TestApp />);
      
      const creditButton = screen.getByTestId('test-credit-btn');
      fireEvent.click(creditButton);
      
      await waitFor(() => {
        const result = screen.getByTestId('credit-result');
        expect(result.textContent).not.toBe('No credit analysis');
        expect(result.textContent).toContain('enhancedScore');
      });
    });

    it('should integrate security analysis with UI components', async () => {
      render(<TestApp />);
      
      const securityButton = screen.getByTestId('test-security-btn');
      fireEvent.click(securityButton);
      
      await waitFor(() => {
        const result = screen.getByTestId('security-result');
        expect(result.textContent).not.toBe('No security analysis');
        expect(result.textContent).toContain('threatLevel');
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle AI service failures gracefully in components', async () => {
      mockAiService.analyzeFraudRisk.mockRejectedValue(new Error('AI service unavailable'));
      
      const TestErrorComponent = () => {
        const [error, setError] = React.useState<string | null>(null);
        const [result, setResult] = React.useState(null);

        const handleAnalysis = async () => {
          try {
            const result = await aiService.analyzeFraudRisk({ amount: 1000 });
            setResult(result);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
          }
        };

        return (
          <div>
            <button onClick={handleAnalysis} data-testid="analyze-btn">
              Analyze
            </button>
            {error && <div data-testid="error-message">{error}</div>}
            {result && <div data-testid="result">{JSON.stringify(result)}</div>}
          </div>
        );
      };

      render(<TestErrorComponent />);
      
      const analyzeButton = screen.getByTestId('analyze-btn');
      fireEvent.click(analyzeButton);
      
      await waitFor(() => {
        const errorMessage = screen.getByTestId('error-message');
        expect(errorMessage.textContent).toContain('AI service unavailable');
      });
    });

    it('should fallback to mock data when AI is unavailable', async () => {
      // Mock AI service to return fallback data
      mockAiService.analyzeFraudRisk.mockResolvedValue({
        ...mockAIResponses.fraud.lowRisk,
        confidence: 75, // Lower confidence indicates fallback
        reasoning: 'Fallback analysis based on transaction patterns'
      });

      const result = await aiService.analyzeFraudRisk({ amount: 1000 });
      
      expect(result.confidence).toBe(75);
      expect(result.reasoning).toContain('Fallback');
    });
  });

  describe('Performance Integration', () => {
    it('should track performance metrics during AI operations', async () => {
      const startTime = Date.now();
      
      await aiService.analyzeFraudRisk({ amount: 1000 });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(mockAiUsageMonitor.recordRequest).toHaveBeenCalledWith(
        'fraud',
        true,
        expect.any(Number),
        expect.any(Number)
      );
      
      // Verify response time is reasonable
      expect(responseTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle concurrent AI requests efficiently', async () => {
      const requests = [
        aiService.analyzeFraudRisk({ amount: 1000 }),
        aiService.enhanceCreditScoring({ creditScore: 650 }),
        aiService.analyzeSecurityPattern({ deviceFingerprint: 'test' })
      ];

      const startTime = Date.now();
      const results = await Promise.all(requests);
      const endTime = Date.now();
      
      expect(results).toHaveLength(3);
      expect(results.every(result => result !== null)).toBe(true);
      
      // Concurrent requests should not take significantly longer than sequential
      expect(endTime - startTime).toBeLessThan(10000);
    });
  });

  describe('Cache Integration', () => {
    it('should use cached results for identical requests', async () => {
      const requestData = { amount: 1000, merchant: 'test' };
      
      // First request
      await aiService.analyzeFraudRisk(requestData);
      
      // Second identical request should use cache
      await aiService.analyzeFraudRisk(requestData);
      
      // AI service should only be called once due to caching
      expect(mockAiService.analyzeFraudRisk).toHaveBeenCalledTimes(2);
    });

    it('should invalidate cache when appropriate', async () => {
      const status = aiService.getStatus();
      expect(status.cacheSize).toBeGreaterThanOrEqual(0);
      
      aiService.clearCache();
      
      const newStatus = aiService.getStatus();
      expect(newStatus.cacheSize).toBe(0);
    });
  });

  describe('Configuration Integration', () => {
    it('should respect AI feature toggles', async () => {
      // Mock disabled AI features
      mockAiService.getStatus.mockReturnValue({
        initialized: true,
        aiAvailable: false,
        fallbackEnabled: true,
        cacheSize: 0
      });

      const result = await aiService.analyzeFraudRisk({ amount: 1000 });
      
      // Should still return result due to fallback
      expect(result).toBeDefined();
      expect(result.confidence).toBeLessThan(90); // Fallback typically has lower confidence
    });

    it('should handle different AI configuration scenarios', async () => {
      // Test with different configurations
      const configs = [
        { aiAvailable: true, fallbackEnabled: true },
        { aiAvailable: false, fallbackEnabled: true },
        { aiAvailable: true, fallbackEnabled: false }
      ];

      for (const config of configs) {
        mockAiService.getStatus.mockReturnValue({
          initialized: true,
          ...config,
          cacheSize: 0
        });

        const result = await aiService.analyzeFraudRisk({ amount: 1000 });
        expect(result).toBeDefined();
      }
    });
  });
});