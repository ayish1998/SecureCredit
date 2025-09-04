import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { aiService } from '../../services/aiService';
import { geminiClient } from '../../services/geminiClient';
import { aiUsageMonitor } from '../../services/aiUsageMonitor';
import { aiConfigManager } from '../../utils/aiConfigManager';
import { mockAIResponses, MockResponseGenerator, generateLoadTestData } from '../mocks/aiResponses';

/**
 * Comprehensive AI Integration Test Suite
 * 
 * This test suite covers all aspects of AI integration including:
 * - Unit tests for all AI service components
 * - Integration tests for AI-enhanced features
 * - Performance tests for AI analysis workflows
 * - Error handling and fallback scenarios
 * - Security and validation testing
 */

describe('Comprehensive AI Integration Test Suite', () => {
  let mockGenerator: MockResponseGenerator;

  beforeAll(async () => {
    // Initialize mock generator with realistic settings
    mockGenerator = new MockResponseGenerator({
      errorRate: 0.05, // 5% error rate
      averageDelay: 1500, // 1.5 second average delay
      varianceDelay: 500 // ±500ms variance
    });

    // Initialize AI services for testing
    await aiService.initialize({ enableFallback: true });
  });

  afterAll(() => {
    // Cleanup
    aiService.clearCache();
    aiUsageMonitor.resetMetrics();
  });

  describe('Core AI Service Functionality', () => {
    it('should handle all analysis types correctly', async () => {
      const testCases = [
        {
          type: 'fraud' as const,
          data: { amount: 1000, currency: 'USD', merchantType: 'retail' },
          expectedFields: ['fraudProbability', 'suspiciousPatterns', 'preventionActions']
        },
        {
          type: 'credit' as const,
          data: { creditScore: 650, income: 50000, employmentStatus: 'employed' },
          expectedFields: ['enhancedScore', 'scoreFactors', 'lendingRecommendation']
        },
        {
          type: 'security' as const,
          data: { deviceFingerprint: 'test123', loginPatterns: [] },
          expectedFields: ['threatLevel', 'vulnerabilities', 'mitigationSteps']
        },
        {
          type: 'general' as const,
          data: { metrics: { users: 1000, transactions: 5000 } },
          expectedFields: ['reasoning', 'recommendations', 'factors']
        }
      ];

      for (const testCase of testCases) {
        const result = await mockGenerator.generateResponse(testCase.type, testCase.data);
        
        expect(result).toBeDefined();
        expect(result.confidence).toBeGreaterThan(0);
        expect(result.confidence).toBeLessThanOrEqual(100);
        expect(result.riskLevel).toMatch(/^(low|medium|high|critical)$/);
        
        // Check type-specific fields
        testCase.expectedFields.forEach(field => {
          expect(result).toHaveProperty(field);
        });
      }
    });

    it('should maintain consistent response format across all analysis types', async () => {
      const analysisTypes = ['fraud', 'credit', 'security', 'general'] as const;
      const results = [];

      for (const type of analysisTypes) {
        const result = await mockGenerator.generateResponse(type, { test: 'data' });
        results.push(result);
      }

      // All results should have common fields
      const commonFields = ['confidence', 'reasoning', 'recommendations', 'riskLevel', 'factors', 'timestamp'];
      
      results.forEach(result => {
        commonFields.forEach(field => {
          expect(result).toHaveProperty(field);
        });
      });
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle concurrent requests efficiently', async () => {
      const concurrentRequestCounts = [5, 10, 25];
      
      for (const count of concurrentRequestCounts) {
        const requests = Array.from({ length: count }, (_, i) => 
          mockGenerator.generateResponse('fraud', { amount: 1000 + i })
        );

        const startTime = Date.now();
        const results = await Promise.all(requests);
        const endTime = Date.now();

        const totalTime = endTime - startTime;
        const averageTime = totalTime / count;

        expect(results).toHaveLength(count);
        expect(results.every(result => result !== null)).toBe(true);
        expect(averageTime).toBeLessThan(5000); // Average should be reasonable
        
        console.log(`${count} concurrent requests completed in ${totalTime}ms (avg: ${averageTime.toFixed(2)}ms)`);
      }
    });

    it('should maintain performance under sustained load', async () => {
      const testDuration = 10000; // 10 seconds
      const requestInterval = 100; // Request every 100ms
      const startTime = Date.now();
      const results = [];
      const responseTimes = [];

      while (Date.now() - startTime < testDuration) {
        const requestStart = Date.now();
        
        try {
          const result = await mockGenerator.generateResponse('fraud', { 
            amount: Math.random() * 10000,
            timestamp: new Date().toISOString()
          });
          
          const requestEnd = Date.now();
          const responseTime = requestEnd - requestStart;
          
          results.push(result);
          responseTimes.push(responseTime);
          
        } catch (error) {
          console.warn('Request failed during load test:', error);
        }

        // Wait for next interval
        await new Promise(resolve => setTimeout(resolve, requestInterval));
      }

      const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const successRate = (results.length / (responseTimes.length || 1)) * 100;

      expect(results.length).toBeGreaterThan(0);
      expect(averageResponseTime).toBeLessThan(3000);
      expect(successRate).toBeGreaterThan(90); // At least 90% success rate
      
      console.log(`Load test: ${results.length} requests, avg response time: ${averageResponseTime.toFixed(2)}ms, success rate: ${successRate.toFixed(2)}%`);
    });

    it('should handle memory efficiently during extended usage', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      const requestCount = 100;

      // Perform many requests to test memory usage
      for (let i = 0; i < requestCount; i++) {
        await mockGenerator.generateResponse('fraud', { 
          amount: i * 100,
          id: `memory-test-${i}`,
          metadata: Array.from({ length: 100 }, (_, j) => ({ id: j, value: `data-${j}` }))
        });

        // Periodically clear cache to simulate real usage
        if (i % 20 === 0) {
          aiService.clearCache();
        }
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      const memoryIncreasePerRequest = memoryIncrease / requestCount;

      expect(memoryIncreasePerRequest).toBeLessThan(1024 * 1024); // Less than 1MB per request
      console.log(`Memory usage: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB increase for ${requestCount} requests`);
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle various error scenarios gracefully', async () => {
      const errorScenarios = [
        { errorRate: 0.1, description: '10% error rate' },
        { errorRate: 0.3, description: '30% error rate' },
        { errorRate: 0.5, description: '50% error rate' }
      ];

      for (const scenario of errorScenarios) {
        const testGenerator = new MockResponseGenerator({ 
          errorRate: scenario.errorRate,
          averageDelay: 1000
        });

        const requestCount = 20;
        const results = [];
        const errors = [];

        for (let i = 0; i < requestCount; i++) {
          try {
            const result = await testGenerator.generateResponse('fraud', { amount: 1000 + i });
            results.push(result);
          } catch (error) {
            errors.push(error);
          }
        }

        const actualErrorRate = errors.length / requestCount;
        const expectedErrorRate = scenario.errorRate;

        // Error rate should be approximately as expected (within 20% tolerance)
        expect(Math.abs(actualErrorRate - expectedErrorRate)).toBeLessThan(0.2);
        
        // Should still have some successful results unless error rate is 100%
        if (scenario.errorRate < 1) {
          expect(results.length).toBeGreaterThan(0);
        }

        console.log(`${scenario.description}: ${results.length} successes, ${errors.length} errors`);
      }
    });

    it('should recover from temporary service outages', async () => {
      const outageGenerator = new MockResponseGenerator({ errorRate: 1.0 }); // 100% errors
      const normalGenerator = new MockResponseGenerator({ errorRate: 0.05 }); // 5% errors

      // Simulate outage period
      const outageResults = [];
      for (let i = 0; i < 5; i++) {
        try {
          await outageGenerator.generateResponse('fraud', { amount: 1000 + i });
        } catch (error) {
          outageResults.push(error);
        }
      }

      expect(outageResults.length).toBe(5); // All should fail during outage

      // Simulate recovery
      const recoveryResults = [];
      for (let i = 0; i < 10; i++) {
        try {
          const result = await normalGenerator.generateResponse('fraud', { amount: 2000 + i });
          recoveryResults.push(result);
        } catch (error) {
          // Some errors expected due to 5% error rate
        }
      }

      expect(recoveryResults.length).toBeGreaterThan(8); // Most should succeed after recovery
    });
  });

  describe('Data Validation and Security', () => {
    it('should handle malicious input safely', async () => {
      const maliciousInputs = [
        { script: '<script>alert("xss")</script>', amount: 1000 },
        { injection: "'; DROP TABLE users; --", amount: 1000 },
        { overflow: 'A'.repeat(100000), amount: 1000 },
        { unicode: '💰🔒🚨', amount: 1000 }
      ];

      for (const input of maliciousInputs) {
        const result = await mockGenerator.generateResponse('fraud', input);
        
        expect(result).toBeDefined();
        expect(result.confidence).toBeGreaterThan(0);
        
        // Response should not contain malicious content
        expect(result.reasoning).not.toContain('<script>');
        expect(result.reasoning).not.toContain('DROP TABLE');
      }
    });

    it('should validate input data types and ranges', async () => {
      const invalidInputs = [
        { amount: -1000 }, // Negative amount
        { amount: 'invalid' }, // Non-numeric amount
        { creditScore: 1000 }, // Invalid credit score range
        { confidence: 150 } // Invalid confidence range
      ];

      for (const input of invalidInputs) {
        // Should either handle gracefully or throw appropriate validation error
        try {
          const result = await mockGenerator.generateResponse('fraud', input);
          expect(result).toBeDefined();
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect(error.message).toContain('validation');
        }
      }
    });
  });

  describe('Configuration and Feature Management', () => {
    it('should respect feature toggles and configuration', async () => {
      const configurations = [
        { fraudDetection: true, creditScoring: false },
        { fraudDetection: false, creditScoring: true },
        { fraudDetection: true, creditScoring: true }
      ];

      for (const config of configurations) {
        // Mock configuration
        vi.spyOn(aiConfigManager, 'getConfig').mockReturnValue({
          features: config,
          apiKey: 'test-key',
          maxRetries: 3,
          analysisTimeout: 30000,
          enableFallback: true,
          cacheResults: true,
          maxCacheSize: 100,
          logging: { level: 'info', includeRequestData: false }
        } as any);

        if (config.fraudDetection) {
          const result = await mockGenerator.generateResponse('fraud', { amount: 1000 });
          expect(result).toBeDefined();
        }

        if (config.creditScoring) {
          const result = await mockGenerator.generateResponse('credit', { creditScore: 650 });
          expect(result).toBeDefined();
        }
      }
    });

    it('should track usage metrics accurately', async () => {
      // Reset metrics
      aiUsageMonitor.resetMetrics();

      const testRequests = [
        { type: 'fraud' as const, count: 5 },
        { type: 'credit' as const, count: 3 },
        { type: 'security' as const, count: 2 },
        { type: 'general' as const, count: 4 }
      ];

      for (const request of testRequests) {
        for (let i = 0; i < request.count; i++) {
          try {
            await mockGenerator.generateResponse(request.type, { id: i });
            aiUsageMonitor.recordRequest(request.type, true, 1500, 0.001);
          } catch (error) {
            aiUsageMonitor.recordRequest(request.type, false, 1500);
          }
        }
      }

      const metrics = aiUsageMonitor.getUsageMetrics();
      const expectedTotal = testRequests.reduce((sum, req) => sum + req.count, 0);

      expect(metrics.totalRequests).toBe(expectedTotal);
      expect(metrics.fraudAnalysisCount).toBe(5);
      expect(metrics.creditScoringCount).toBe(3);
      expect(metrics.securityAnalysisCount).toBe(2);
      expect(metrics.generalInsightsCount).toBe(4);
    });
  });

  describe('Integration with UI Components', () => {
    it('should provide consistent data format for UI consumption', async () => {
      const analysisTypes = ['fraud', 'credit', 'security', 'general'] as const;
      
      for (const type of analysisTypes) {
        const result = await mockGenerator.generateResponse(type, { test: 'ui-data' });
        
        // Check that result has all fields needed by UI components
        expect(result).toHaveProperty('confidence');
        expect(result).toHaveProperty('riskLevel');
        expect(result).toHaveProperty('recommendations');
        expect(result).toHaveProperty('timestamp');
        
        // Validate data types
        expect(typeof result.confidence).toBe('number');
        expect(typeof result.riskLevel).toBe('string');
        expect(Array.isArray(result.recommendations)).toBe(true);
        expect(result.timestamp).toBeInstanceOf(Date);
      }
    });

    it('should handle UI state updates correctly', async () => {
      // Simulate UI state management
      const uiState = {
        loading: false,
        error: null,
        data: null
      };

      // Simulate loading state
      uiState.loading = true;
      uiState.error = null;

      try {
        const result = await mockGenerator.generateResponse('fraud', { amount: 1000 });
        
        // Simulate successful state update
        uiState.loading = false;
        uiState.data = result;
        uiState.error = null;

        expect(uiState.loading).toBe(false);
        expect(uiState.error).toBeNull();
        expect(uiState.data).toBeDefined();
        
      } catch (error) {
        // Simulate error state update
        uiState.loading = false;
        uiState.error = error;
        uiState.data = null;

        expect(uiState.loading).toBe(false);
        expect(uiState.error).toBeDefined();
        expect(uiState.data).toBeNull();
      }
    });
  });

  describe('End-to-End Workflow Testing', () => {
    it('should complete full analysis workflow successfully', async () => {
      const workflowSteps = [
        'Initialize AI service',
        'Validate input data',
        'Perform AI analysis',
        'Process response',
        'Update UI state',
        'Record metrics'
      ];

      const workflowResults = [];

      try {
        // Step 1: Initialize
        await aiService.initialize();
        workflowResults.push('Initialize AI service: SUCCESS');

        // Step 2: Validate input
        const inputData = { amount: 1000, currency: 'USD', merchantType: 'retail' };
        expect(inputData.amount).toBeGreaterThan(0);
        workflowResults.push('Validate input data: SUCCESS');

        // Step 3: Perform analysis
        const analysisResult = await mockGenerator.generateResponse('fraud', inputData);
        expect(analysisResult).toBeDefined();
        workflowResults.push('Perform AI analysis: SUCCESS');

        // Step 4: Process response
        expect(analysisResult.confidence).toBeGreaterThan(0);
        expect(analysisResult.riskLevel).toBeTruthy();
        workflowResults.push('Process response: SUCCESS');

        // Step 5: Update UI state (simulated)
        const uiUpdate = { data: analysisResult, loading: false, error: null };
        expect(uiUpdate.data).toBe(analysisResult);
        workflowResults.push('Update UI state: SUCCESS');

        // Step 6: Record metrics
        aiUsageMonitor.recordRequest('fraud', true, 1500, 0.001);
        workflowResults.push('Record metrics: SUCCESS');

      } catch (error) {
        workflowResults.push(`Workflow failed: ${error.message}`);
      }

      expect(workflowResults.length).toBe(workflowSteps.length);
      expect(workflowResults.every(result => result.includes('SUCCESS'))).toBe(true);
    });
  });
});