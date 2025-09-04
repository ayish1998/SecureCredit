import { aiConfigManager } from '../utils/aiConfigManager';
import { AIUsageMetrics } from '../types/aiConfig';

/**
 * AI Usage Monitor Service
 * Tracks AI service usage, costs, and performance metrics
 */
export class AIUsageMonitor {
  private static instance: AIUsageMonitor;
  private costPerRequest = 0.001; // Default cost per request in USD
  private monthlyBudget?: number;
  private alertThresholds = {
    budgetWarning: 0.8, // 80% of budget
    budgetCritical: 0.95, // 95% of budget
    errorRateWarning: 0.1, // 10% error rate
    errorRateCritical: 0.25, // 25% error rate
  };

  private constructor() {
    this.loadSettings();
  }

  static getInstance(): AIUsageMonitor {
    if (!AIUsageMonitor.instance) {
      AIUsageMonitor.instance = new AIUsageMonitor();
    }
    return AIUsageMonitor.instance;
  }

  /**
   * Record an AI service request
   */
  recordRequest(
    feature: 'fraudDetection' | 'creditScoring' | 'securityAnalysis' | 'generalInsights',
    success: boolean,
    responseTime: number,
    tokensUsed?: number
  ): void {
    const cost = this.calculateCost(tokensUsed);
    
    aiConfigManager.recordApiRequest(feature, success, responseTime, cost);
    
    // Check for alerts
    this.checkAlerts();
  }

  /**
   * Get current usage statistics
   */
  getUsageStats(): AIUsageMetrics & {
    budgetUtilization?: number;
    remainingBudget?: number;
    projectedMonthlyCost?: number;
  } {
    const metrics = aiConfigManager.getUsageMetrics();
    const stats: any = { ...metrics };

    if (this.monthlyBudget) {
      stats.budgetUtilization = (metrics.estimatedCost / this.monthlyBudget) * 100;
      stats.remainingBudget = this.monthlyBudget - metrics.estimatedCost;
      
      // Project monthly cost based on current usage
      const daysInMonth = new Date().getDate();
      const totalDaysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
      stats.projectedMonthlyCost = (metrics.estimatedCost / daysInMonth) * totalDaysInMonth;
    }

    return stats;
  }

  /**
   * Set monthly budget
   */
  setMonthlyBudget(budget: number): void {
    this.monthlyBudget = budget;
    this.saveSettings();
  }

  /**
   * Get monthly budget
   */
  getMonthlyBudget(): number | undefined {
    return this.monthlyBudget;
  }

  /**
   * Set cost per request
   */
  setCostPerRequest(cost: number): void {
    this.costPerRequest = cost;
    this.saveSettings();
  }

  /**
   * Get cost per request
   */
  getCostPerRequest(): number {
    return this.costPerRequest;
  }

  /**
   * Set alert thresholds
   */
  setAlertThresholds(thresholds: Partial<typeof this.alertThresholds>): void {
    this.alertThresholds = { ...this.alertThresholds, ...thresholds };
    this.saveSettings();
  }

  /**
   * Get alert thresholds
   */
  getAlertThresholds(): typeof this.alertThresholds {
    return { ...this.alertThresholds };
  }

  /**
   * Reset usage metrics for new period
   */
  resetUsageMetrics(): void {
    aiConfigManager.resetUsageMetrics();
  }

  /**
   * Get usage by feature
   */
  getFeatureUsage(): Array<{
    feature: string;
    count: number;
    percentage: number;
    cost: number;
  }> {
    const metrics = aiConfigManager.getUsageMetrics();
    const features = [
      { key: 'fraudAnalysisCount', name: 'Fraud Detection' },
      { key: 'creditScoringCount', name: 'Credit Scoring' },
      { key: 'securityAnalysisCount', name: 'Security Analysis' },
      { key: 'generalInsightsCount', name: 'General Insights' }
    ];

    return features.map(feature => {
      const count = metrics[feature.key as keyof AIUsageMetrics] as number;
      const percentage = metrics.totalRequests > 0 ? (count / metrics.totalRequests) * 100 : 0;
      const cost = count * this.costPerRequest;

      return {
        feature: feature.name,
        count,
        percentage,
        cost
      };
    });
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): {
    averageResponseTime: number;
    successRate: number;
    errorRate: number;
    cacheHitRate: number;
    uptime: number;
  } {
    const metrics = aiConfigManager.getUsageMetrics();
    
    return {
      averageResponseTime: metrics.averageResponseTime,
      successRate: metrics.totalRequests > 0 ? (metrics.successfulRequests / metrics.totalRequests) * 100 : 0,
      errorRate: metrics.errorRate,
      cacheHitRate: metrics.cacheHitRate,
      uptime: 99.9 // Mock uptime - in real implementation, this would be calculated
    };
  }

  /**
   * Export usage data
   */
  exportUsageData(format: 'json' | 'csv' = 'json'): string {
    const metrics = aiConfigManager.getUsageMetrics();
    const featureUsage = this.getFeatureUsage();
    const performanceMetrics = this.getPerformanceMetrics();

    const data = {
      summary: metrics,
      featureBreakdown: featureUsage,
      performance: performanceMetrics,
      exportDate: new Date().toISOString(),
      settings: {
        monthlyBudget: this.monthlyBudget,
        costPerRequest: this.costPerRequest,
        alertThresholds: this.alertThresholds
      }
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else {
      // Convert to CSV format
      const csvLines = [
        'Metric,Value',
        `Total Requests,${metrics.totalRequests}`,
        `Successful Requests,${metrics.successfulRequests}`,
        `Failed Requests,${metrics.failedRequests}`,
        `Average Response Time,${metrics.averageResponseTime}ms`,
        `Error Rate,${metrics.errorRate}%`,
        `Estimated Cost,$${metrics.estimatedCost.toFixed(2)}`,
        '',
        'Feature,Count,Percentage,Cost',
        ...featureUsage.map(f => `${f.feature},${f.count},${f.percentage.toFixed(1)}%,$${f.cost.toFixed(2)}`)
      ];
      return csvLines.join('\n');
    }
  }

  /**
   * Check for usage alerts
   */
  private checkAlerts(): void {
    const metrics = aiConfigManager.getUsageMetrics();
    const alerts: Array<{ type: 'warning' | 'critical'; message: string }> = [];

    // Budget alerts
    if (this.monthlyBudget) {
      const budgetUtilization = (metrics.estimatedCost / this.monthlyBudget);
      
      if (budgetUtilization >= this.alertThresholds.budgetCritical) {
        alerts.push({
          type: 'critical',
          message: `AI service costs have reached ${(budgetUtilization * 100).toFixed(1)}% of monthly budget`
        });
      } else if (budgetUtilization >= this.alertThresholds.budgetWarning) {
        alerts.push({
          type: 'warning',
          message: `AI service costs have reached ${(budgetUtilization * 100).toFixed(1)}% of monthly budget`
        });
      }
    }

    // Error rate alerts
    if (metrics.errorRate >= this.alertThresholds.errorRateCritical * 100) {
      alerts.push({
        type: 'critical',
        message: `AI service error rate is critically high: ${metrics.errorRate.toFixed(1)}%`
      });
    } else if (metrics.errorRate >= this.alertThresholds.errorRateWarning * 100) {
      alerts.push({
        type: 'warning',
        message: `AI service error rate is elevated: ${metrics.errorRate.toFixed(1)}%`
      });
    }

    // Dispatch alerts
    alerts.forEach(alert => this.dispatchAlert(alert));
  }

  /**
   * Dispatch alert to notification system
   */
  private dispatchAlert(alert: { type: 'warning' | 'critical'; message: string }): void {
    // In a real implementation, this would integrate with the notification system
    console.warn(`AI Usage Alert [${alert.type.toUpperCase()}]: ${alert.message}`);
    
    // Could dispatch custom events for the UI to handle
    window.dispatchEvent(new CustomEvent('ai-usage-alert', {
      detail: alert
    }));
  }

  /**
   * Calculate cost based on tokens used
   */
  private calculateCost(tokensUsed?: number): number {
    if (tokensUsed) {
      // More accurate cost calculation based on tokens
      // Gemini pricing is typically per 1K tokens
      return (tokensUsed / 1000) * this.costPerRequest;
    }
    
    // Fallback to flat rate per request
    return this.costPerRequest;
  }

  /**
   * Load settings from storage
   */
  private loadSettings(): void {
    try {
      const stored = localStorage.getItem('ai_usage_monitor_settings');
      if (stored) {
        const settings = JSON.parse(stored);
        this.monthlyBudget = settings.monthlyBudget;
        this.costPerRequest = settings.costPerRequest || this.costPerRequest;
        this.alertThresholds = { ...this.alertThresholds, ...settings.alertThresholds };
      }
    } catch (error) {
      console.error('Failed to load usage monitor settings:', error);
    }
  }

  /**
   * Save settings to storage
   */
  private saveSettings(): void {
    try {
      const settings = {
        monthlyBudget: this.monthlyBudget,
        costPerRequest: this.costPerRequest,
        alertThresholds: this.alertThresholds
      };
      localStorage.setItem('ai_usage_monitor_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save usage monitor settings:', error);
    }
  }
}

// Export singleton instance
export const aiUsageMonitor = AIUsageMonitor.getInstance();