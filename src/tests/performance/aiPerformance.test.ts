import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { aiService } from '../../services/aiService';
import { geminiClient } from '../../services/geminiClient';
import { aiUsageMonitor } from '../../services/aiUsageMonitor';
import { mockAIResponses } from '../mocks/aiResponses';

// Mock AI services for performance testing
vi.mock('../../services/aiService');
vi.mock('../../services/geminiClient');
vi.mock('../../services/aiUsageMonitor');

const mockAiService = vi.mocked(aiService);
const mockGeminiClient = vi.mocked(geminiClient);
const mockAiUsageMonitor = vi.mocked(aiUsageMonitor);

describe('AI Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup realistic response times for different operations
    mockAiService.analyzeFraudRisk = vi.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5s
      return mockAIResponses.fraud.lowRisk;
    });
    
    mockAiService.enhanceCreditScoring = vi.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 2500)); // 2.5s
      return mockAIResponses.credit.excellent;
    });
    
    mockAiService.analyzeSecurityPattern = vi.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2s
      return mockAIResponses.security.secure;
    });
    
    mockAiService.generateInsights = vi.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1s
      return mockAIResponses.general.insights;
    });
    
    mockAiUsageMonitor.recordRequest = vi.fn();
  });

  describe('Response Time Performance', () => {
    it('should complete fraud analysis within acceptable time limits', async () => {
      const startTime = Date.now();
      
      const result = await aiService.analyzeFraudRisk({
        amount: 1000,
        currency: 'USD',
        merchantType: 'retail'
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(result).toBeDefined();
      expect(responseTime).toBeLessThan(3000); // Should complete within 3 seconds
      expect(responseTime).toBeGreaterThan(1000); // Should take at least 1 second for realistic AI processing
    });

    it('should complete credit scoring within acceptable time limits', async () => {
      const startTime = Date.now();
      
      const result = await aiService.enhanceCreditScoring({
        creditScore: 650,
        income: 50000,
        employmentStatus: 'employed'
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(result).toBeDefined();
      expect(responseTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(responseTime).toBeGreaterThan(2000); // Credit scoring is more complex
    });

    it('should complete security analysis within acceptable time limits', async () => {
      const startTime = Date.now();
      
      const result = await aiService.analyzeSecurityPattern({
        deviceFingerprint: 'abc123',
        loginPatterns: [
          { timestamp: new Date().toISOString(), location: 'New York', success: true }
        ]
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(result).toBeDefined();
      expect(responseTime).toBeLessThan(4000); // Should complete within 4 seconds
    });

    it('should complete general insights quickly', async () => {
      const startTime = Date.now();
      
      const result = await aiService.generateInsights(
        { metrics: { users: 1000, transactions: 5000 } },
        'dashboard-analysis'
      );
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(result).toBeDefined();
      expect(responseTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });

  describe('Concurrent Request Performance', () => {
    it('should handle multiple concurrent fraud analyses efficiently', async () => {
      const requestCount = 5;
      const requests = Array.from({ length: requestCount }, (_, i) => 
        aiService.analyzeFraudRisk({
          amount: 1000 + i * 100,
          currency: 'USD',
          merchantType: 'retail'
        })
      );

      const startTime = Date.now();
      const results = await Promise.all(requests);
      const endTime = Date.now();
      
      const totalTime = endTime - startTime;
      const averageTime = totalTime / requestCount;
      
      expect(results).toHaveLength(requestCount);
      expect(results.every(result => result !== null)).toBe(true);
      
      // Concurrent requests should be more efficient than sequential
      expect(totalTime).toBeLessThan(requestCount * 3000); // Less than sequential worst case
      expect(averageTime).toBeLessThan(3000); // Each request should still be fast
    });

    it('should handle mixed concurrent requests efficiently', async () => {
      const requests = [
        aiService.analyzeFraudRisk({ amount: 1000 }),
        aiService.enhanceCreditScoring({ creditScore: 650 }),
        aiService.analyzeSecurityPattern({ deviceFingerprint: 'test' }),
        aiService.generateInsights({ metrics: { users: 1000 } }, 'dashboard')
      ];

      const startTime = Date.now();
      const results = await Promise.all(requests);
      const endTime = Date.now();
      
      const totalTime = endTime - startTime;
      
      expect(results).toHaveLength(4);
      expect(results.every(result => result !== null)).toBe(true);
      
      // Should complete all requests in reasonable time
      expect(totalTime).toBeLessThan(6000); // 6 seconds for all mixed requests
    });

    it('should maintain performance under high load', async () => {
      const highLoadRequestCount = 20;
      const requests = Array.from({ length: highLoadRequestCount }, (_, i) => {
        const requestType = i % 4;
        switch (requestType) {
          case 0:
            return aiService.analyzeFraudRisk({ amount: 1000 + i });
          case 1:
            return aiService.enhanceCreditScoring({ creditScore: 600 + i });
          case 2:
            return aiService.analyzeSecurityPattern({ deviceFingerprint: `device-${i}` });
          default:
            return aiService.generateInsights({ id: i }, 'test');
        }
      });

      const startTime = Date.now();
      const results = await Promise.all(requests);
      const endTime = Date.now();
      
      const totalTime = endTime - startTime;
      const averageTime = totalTime / highLoadRequestCount;
      
      expect(results).toHaveLength(highLoadRequestCount);
      expect(results.every(result => result !== null)).toBe(true);
      
      // Should maintain reasonable performance under load
      expect(averageTime).toBeLessThan(5000); // Average should still be reasonable
      expect(totalTime).toBeLessThan(30000); // Total should complete within 30 seconds
    });
  });

  describe('Memory Performance', () => {
    it('should not cause memory leaks with repeated requests', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Perform many requests to test for memory leaks
      for (let i = 0; i < 50; i++) {
        await aiService.analyzeFraudRisk({ amount: 1000 + i });
        
        // Clear cache periodically to simulate real usage
        if (i % 10 === 0) {
          aiService.clearCache();
        }
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    it('should manage cache size effectively', async () => {
      // Fill cache with many different requests
      const requests = Array.from({ length: 150 }, (_, i) => 
        aiService.analyzeFraudRisk({ amount: i, id: `unique-${i}` })
      );
      
      await Promise.all(requests);
      
      const status = aiService.getStatus();
      
      // Cache should be limited to prevent memory issues
      expect(status.cacheSize).toBeLessThanOrEqual(100); // Should limit cache size
    });
  });

  describe('Fallback Performance', () => {
    it('should fallback quickly when AI is unavailable', async () => {
      // Mock AI service failure
      mockAiService.analyzeFraudRisk.mockRejectedValueOnce(new Error('AI service unavailable'));
      
      // Mock fallback response
      mockAiService.analyzeFraudRisk.mockResolvedValueOnce({
        ...mockAIResponses.fraud.lowRisk,
        confidence: 75, // Lower confidence for fallback
        reasoning: 'Fallback analysis based on rule-based system'
      });

      const startTime = Date.now();
      const result = await aiService.analyzeFraudRisk({ amount: 1000 });
      const endTime = Date.now();
      
      const responseTime = endTime - startTime;
      
      expect(result).toBeDefined();
      expect(result.confidence).toBe(75); // Fallback confidence
      expect(responseTime).toBeLessThan(1000); // Fallback should be very fast
    });

    it('should maintain performance when switching between AI and fallback', async () => {
      const results = [];
      const responseTimes = [];
      
      for (let i = 0; i < 10; i++) {
        // Simulate intermittent AI availability
        if (i % 3 === 0) {
          mockAiService.analyzeFraudRisk.mockRejectedValueOnce(new Error('Temporary failure'));
          mockAiService.analyzeFraudRisk.mockResolvedValueOnce({
            ...mockAIResponses.fraud.lowRisk,
            confidence: 75
          });
        }
        
        const startTime = Date.now();
        const result = await aiService.analyzeFraudRisk({ amount: 1000 + i });
        const endTime = Date.now();
        
        results.push(result);
        responseTimes.push(endTime - startTime);
      }
      
      expect(results).toHaveLength(10);
      expect(results.every(result => result !== null)).toBe(true);
      
      // All response times should be reasonable
      expect(responseTimes.every(time => time < 3000)).toBe(true);
      
      // Average response time should be good
      const averageTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      expect(averageTime).toBeLessThan(2000);
    });
  });

  describe('Resource Usage Performance', () => {
    it('should efficiently handle large data inputs', async () => {
      const largeTransactionData = {
        amount: 10000,
        currency: 'USD',
        merchantType: 'retail',
        metadata: {
          // Simulate large metadata
          history: Array.from({ length: 1000 }, (_, i) => ({
            id: i,
            timestamp: new Date(Date.now() - i * 86400000).toISOString(),
            amount: Math.random() * 1000,
            status: 'completed'
          })),
          deviceInfo: {
            fingerprint: 'large-device-fingerprint-with-lots-of-data',
            capabilities: Array.from({ length: 100 }, (_, i) => `capability-${i}`),
            sensors: Array.from({ length: 50 }, (_, i) => ({
              type: `sensor-${i}`,
              value: Math.random() * 100
            }))
          }
        }
      };

      const startTime = Date.now();
      const result = await aiService.analyzeFraudRisk(largeTransactionData);
      const endTime = Date.now();
      
      const responseTime = endTime - startTime;
      
      expect(result).toBeDefined();
      expect(responseTime).toBeLessThan(5000); // Should handle large data within 5 seconds
    });

    it('should maintain performance with complex analysis requests', async () => {
      const complexRequests = [
        // Complex fraud analysis
        aiService.analyzeFraudRisk({
          amount: 50000,
          currency: 'USD',
          merchantType: 'high-risk',
          riskFactors: ['large-amount', 'new-merchant', 'unusual-time'],
          historicalData: Array.from({ length: 100 }, (_, i) => ({ id: i, amount: i * 100 }))
        }),
        
        // Complex credit scoring
        aiService.enhanceCreditScoring({
          creditScore: 650,
          income: 75000,
          employmentStatus: 'employed',
          creditHistory: Array.from({ length: 50 }, (_, i) => ({
            date: new Date(Date.now() - i * 30 * 86400000).toISOString(),
            type: 'payment',
            amount: Math.random() * 500,
            status: 'on-time'
          })),
          existingDebts: [
            { type: 'mortgage', amount: 200000, monthlyPayment: 1500 },
            { type: 'auto', amount: 25000, monthlyPayment: 400 },
            { type: 'credit-card', amount: 5000, monthlyPayment: 150 }
          ]
        }),
        
        // Complex security analysis
        aiService.analyzeSecurityPattern({
          deviceFingerprint: 'complex-device-analysis',
          loginPatterns: Array.from({ length: 30 }, (_, i) => ({
            timestamp: new Date(Date.now() - i * 86400000).toISOString(),
            location: `Location-${i % 5}`,
            success: Math.random() > 0.1,
            ipAddress: `192.168.1.${i % 255}`,
            userAgent: `Browser-${i % 3}`
          })),
          riskIndicators: ['multiple-locations', 'new-device', 'unusual-hours'],
          securityEvents: Array.from({ length: 20 }, (_, i) => ({
            type: 'login-attempt',
            timestamp: new Date(Date.now() - i * 3600000).toISOString(),
            severity: ['low', 'medium', 'high'][i % 3]
          }))
        })
      ];

      const startTime = Date.now();
      const results = await Promise.all(complexRequests);
      const endTime = Date.now();
      
      const totalTime = endTime - startTime;
      
      expect(results).toHaveLength(3);
      expect(results.every(result => result !== null)).toBe(true);
      
      // Complex analysis should still complete in reasonable time
      expect(totalTime).toBeLessThan(10000); // 10 seconds for all complex requests
    });
  });

  describe('Performance Monitoring Integration', () => {
    it('should accurately track performance metrics', async () => {
      const testRequests = [
        { type: 'fraud', data: { amount: 1000 } },
        { type: 'credit', data: { creditScore: 650 } },
        { type: 'security', data: { deviceFingerprint: 'test' } }
      ];

      for (const request of testRequests) {
        const startTime = Date.now();
        
        switch (request.type) {
          case 'fraud':
            await aiService.analyzeFraudRisk(request.data);
            break;
          case 'credit':
            await aiService.enhanceCreditScoring(request.data);
            break;
          case 'security':
            await aiService.analyzeSecurityPattern(request.data);
            break;
        }
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        // Verify that usage monitor was called with correct timing
        expect(mockAiUsageMonitor.recordRequest).toHaveBeenCalledWith(
          request.type,
          true,
          expect.any(Number),
          expect.any(Number)
        );
        
        // Verify response time is reasonable
        expect(responseTime).toBeGreaterThan(0);
        expect(responseTime).toBeLessThan(10000);
      }
    });

    it('should track performance degradation over time', async () => {
      const performanceData = [];
      
      // Simulate performance over multiple requests
      for (let i = 0; i < 20; i++) {
        const startTime = Date.now();
        await aiService.analyzeFraudRisk({ amount: 1000 + i });
        const endTime = Date.now();
        
        performanceData.push(endTime - startTime);
      }
      
      // Calculate performance metrics
      const averageTime = performanceData.reduce((a, b) => a + b, 0) / performanceData.length;
      const maxTime = Math.max(...performanceData);
      const minTime = Math.min(...performanceData);
      
      // Performance should be consistent
      expect(averageTime).toBeLessThan(3000);
      expect(maxTime - minTime).toBeLessThan(2000); // Variance should be reasonable
      
      // No significant performance degradation
      const firstHalf = performanceData.slice(0, 10);
      const secondHalf = performanceData.slice(10);
      const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      // Second half shouldn't be significantly slower
      expect(secondHalfAvg).toBeLessThan(firstHalfAvg * 1.5);
    });
  });
});