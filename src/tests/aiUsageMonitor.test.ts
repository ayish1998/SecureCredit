import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AIUsageMonitor, aiUsageMonitor } from '../services/aiUsageMonitor';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('AIUsageMonitor', () => {
  let monitor: AIUsageMonitor;

  beforeEach(() => {
    monitor = AIUsageMonitor.getInstance();
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    monitor.resetMetrics();
  });

  afterEach(() => {
    monitor.resetMetrics();
  });

  describe('usage tracking', () => {
    it('should track successful requests', () => {
      monitor.recordRequest('fraud', true, 1500, 0.001);
      
      const metrics = monitor.getUsageMetrics();
      expect(metrics.totalRequests).toBe(1);
      expect(metrics.successfulRequests).toBe(1);
      expect(metrics.failedRequests).toBe(0);
      expect(metrics.fraudAnalysisCount).toBe(1);
      expect(metrics.totalCost).toBe(0.001);
    });

    it('should track failed requests', () => {
      monitor.recordRequest('credit', false, 2000);
      
      const metrics = monitor.getUsageMetrics();
      expect(metrics.totalRequests).toBe(1);
      expect(metrics.successfulRequests).toBe(0);
      expect(metrics.failedRequests).toBe(1);
      expect(metrics.creditScoringCount).toBe(1);
      expect(metrics.totalCost).toBe(0);
    });

    it('should track multiple request types', () => {
      monitor.recordRequest('fraud', true, 1000, 0.001);
      monitor.recordRequest('credit', true, 1500, 0.002);
      monitor.recordRequest('security', false, 2000);
      monitor.recordRequest('general', true, 800, 0.001);
      
      const metrics = monitor.getUsageMetrics();
      expect(metrics.totalRequests).toBe(4);
      expect(metrics.successfulRequests).toBe(3);
      expect(metrics.failedRequests).toBe(1);
      expect(metrics.fraudAnalysisCount).toBe(1);
      expect(metrics.creditScoringCount).toBe(1);
      expect(metrics.securityAnalysisCount).toBe(1);
      expect(metrics.generalInsightsCount).toBe(1);
      expect(metrics.totalCost).toBe(0.004);
    });

    it('should calculate error rate correctly', () => {
      monitor.recordRequest('fraud', true, 1000);
      monitor.recordRequest('fraud', false, 1000);
      monitor.recordRequest('fraud', false, 1000);
      
      const metrics = monitor.getUsageMetrics();
      expect(metrics.errorRate).toBe(66.67); // 2 failed out of 3 total
    });

    it('should calculate average response time', () => {
      monitor.recordRequest('fraud', true, 1000);
      monitor.recordRequest('fraud', true, 2000);
      monitor.recordRequest('fraud', true, 3000);
      
      const metrics = monitor.getUsageMetrics();
      expect(metrics.averageResponseTime).toBe(2000);
    });
  });

  describe('performance metrics', () => {
    it('should track response times by request type', () => {
      monitor.recordRequest('fraud', true, 1000);
      monitor.recordRequest('fraud', true, 2000);
      monitor.recordRequest('credit', true, 3000);
      
      const performance = monitor.getPerformanceMetrics();
      expect(performance.fraud.averageResponseTime).toBe(1500);
      expect(performance.fraud.requestCount).toBe(2);
      expect(performance.credit.averageResponseTime).toBe(3000);
      expect(performance.credit.requestCount).toBe(1);
    });

    it('should track success rates by request type', () => {
      monitor.recordRequest('fraud', true, 1000);
      monitor.recordRequest('fraud', false, 1000);
      monitor.recordRequest('credit', true, 1000);
      monitor.recordRequest('credit', true, 1000);
      
      const performance = monitor.getPerformanceMetrics();
      expect(performance.fraud.successRate).toBe(50);
      expect(performance.credit.successRate).toBe(100);
    });

    it('should handle empty performance metrics', () => {
      const performance = monitor.getPerformanceMetrics();
      expect(performance.fraud.requestCount).toBe(0);
      expect(performance.fraud.averageResponseTime).toBe(0);
      expect(performance.fraud.successRate).toBe(0);
    });
  });

  describe('cost tracking', () => {
    it('should track costs by request type', () => {
      monitor.recordRequest('fraud', true, 1000, 0.001);
      monitor.recordRequest('fraud', true, 1000, 0.001);
      monitor.recordRequest('credit', true, 1000, 0.002);
      
      const costs = monitor.getCostBreakdown();
      expect(costs.fraud).toBe(0.002);
      expect(costs.credit).toBe(0.002);
      expect(costs.security).toBe(0);
      expect(costs.general).toBe(0);
      expect(costs.total).toBe(0.004);
    });

    it('should calculate daily cost estimates', () => {
      // Record some requests
      monitor.recordRequest('fraud', true, 1000, 0.001);
      monitor.recordRequest('credit', true, 1000, 0.002);
      
      const estimate = monitor.getDailyCostEstimate();
      expect(estimate).toBeGreaterThan(0);
    });

    it('should calculate monthly cost projections', () => {
      monitor.recordRequest('fraud', true, 1000, 0.001);
      monitor.recordRequest('credit', true, 1000, 0.002);
      
      const projection = monitor.getMonthlyCostProjection();
      expect(projection).toBeGreaterThan(0);
    });
  });

  describe('budget management', () => {
    it('should set and track monthly budget', () => {
      monitor.setMonthlyBudget(100);
      
      const budget = monitor.getBudgetStatus();
      expect(budget.monthlyBudget).toBe(100);
      expect(budget.currentSpend).toBe(0);
      expect(budget.remainingBudget).toBe(100);
      expect(budget.percentUsed).toBe(0);
    });

    it('should calculate budget usage correctly', () => {
      monitor.setMonthlyBudget(10);
      monitor.recordRequest('fraud', true, 1000, 3); // $3 cost
      monitor.recordRequest('credit', true, 1000, 2); // $2 cost
      
      const budget = monitor.getBudgetStatus();
      expect(budget.currentSpend).toBe(5);
      expect(budget.remainingBudget).toBe(5);
      expect(budget.percentUsed).toBe(50);
    });

    it('should detect budget overruns', () => {
      monitor.setMonthlyBudget(5);
      monitor.recordRequest('fraud', true, 1000, 6); // $6 cost, over budget
      
      const budget = monitor.getBudgetStatus();
      expect(budget.isOverBudget).toBe(true);
      expect(budget.percentUsed).toBe(120);
    });

    it('should warn when approaching budget limit', () => {
      monitor.setMonthlyBudget(10);
      monitor.recordRequest('fraud', true, 1000, 9); // $9 cost, 90% of budget
      
      const budget = monitor.getBudgetStatus();
      expect(budget.isNearLimit).toBe(true); // Should warn at 80%+ usage
    });
  });

  describe('data persistence', () => {
    it('should save metrics to localStorage', () => {
      monitor.recordRequest('fraud', true, 1000, 0.001);
      monitor.saveMetrics();
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ai_usage_metrics',
        expect.stringContaining('"totalRequests":1')
      );
    });

    it('should load metrics from localStorage', () => {
      const savedMetrics = {
        totalRequests: 5,
        successfulRequests: 4,
        failedRequests: 1,
        totalCost: 0.01,
        fraudAnalysisCount: 2,
        creditScoringCount: 2,
        securityAnalysisCount: 1,
        generalInsightsCount: 0
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedMetrics));
      monitor.loadMetrics();
      
      const metrics = monitor.getUsageMetrics();
      expect(metrics.totalRequests).toBe(5);
      expect(metrics.successfulRequests).toBe(4);
      expect(metrics.totalCost).toBe(0.01);
    });

    it('should handle corrupted localStorage data', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      // Should not throw error
      expect(() => monitor.loadMetrics()).not.toThrow();
      
      // Should maintain default metrics
      const metrics = monitor.getUsageMetrics();
      expect(metrics.totalRequests).toBe(0);
    });
  });

  describe('alerts and notifications', () => {
    it('should generate high error rate alerts', () => {
      // Create high error rate scenario
      monitor.recordRequest('fraud', false, 1000);
      monitor.recordRequest('fraud', false, 1000);
      monitor.recordRequest('fraud', true, 1000);
      
      const alerts = monitor.getAlerts();
      expect(alerts.some(alert => alert.type === 'high_error_rate')).toBe(true);
    });

    it('should generate slow response time alerts', () => {
      // Create slow response scenario
      monitor.recordRequest('fraud', true, 15000); // 15 seconds
      
      const alerts = monitor.getAlerts();
      expect(alerts.some(alert => alert.type === 'slow_response')).toBe(true);
    });

    it('should generate budget alerts', () => {
      monitor.setMonthlyBudget(5);
      monitor.recordRequest('fraud', true, 1000, 4.5); // 90% of budget
      
      const alerts = monitor.getAlerts();
      expect(alerts.some(alert => alert.type === 'budget_warning')).toBe(true);
    });

    it('should generate budget exceeded alerts', () => {
      monitor.setMonthlyBudget(5);
      monitor.recordRequest('fraud', true, 1000, 6); // Over budget
      
      const alerts = monitor.getAlerts();
      expect(alerts.some(alert => alert.type === 'budget_exceeded')).toBe(true);
    });
  });

  describe('metrics reset', () => {
    it('should reset all metrics', () => {
      monitor.recordRequest('fraud', true, 1000, 0.001);
      monitor.setMonthlyBudget(100);
      
      monitor.resetMetrics();
      
      const metrics = monitor.getUsageMetrics();
      expect(metrics.totalRequests).toBe(0);
      expect(metrics.totalCost).toBe(0);
      
      const budget = monitor.getBudgetStatus();
      expect(budget.currentSpend).toBe(0);
    });

    it('should reset monthly metrics while preserving configuration', () => {
      monitor.setMonthlyBudget(100);
      monitor.recordRequest('fraud', true, 1000, 0.001);
      
      monitor.resetMonthlyMetrics();
      
      const metrics = monitor.getUsageMetrics();
      expect(metrics.totalRequests).toBe(0);
      
      const budget = monitor.getBudgetStatus();
      expect(budget.monthlyBudget).toBe(100); // Budget preserved
      expect(budget.currentSpend).toBe(0);
    });
  });

  describe('singleton instance', () => {
    it('should return the same instance', () => {
      const instance1 = AIUsageMonitor.getInstance();
      const instance2 = AIUsageMonitor.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('should work with the exported singleton', () => {
      expect(aiUsageMonitor).toBeInstanceOf(AIUsageMonitor);
      
      aiUsageMonitor.recordRequest('fraud', true, 1000, 0.001);
      const metrics = aiUsageMonitor.getUsageMetrics();
      expect(metrics.totalRequests).toBe(1);
    });
  });
});