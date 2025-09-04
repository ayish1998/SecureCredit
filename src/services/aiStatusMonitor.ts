import { AIServiceStatus } from '../types/ai';
import { aiLogger } from '../utils/aiLogger';
import { getRateLimitStatus } from '../utils/rateLimiter';

export class AIStatusMonitor {
  private status: AIServiceStatus = {
    available: false,
    lastCheck: new Date(),
    rateLimitRemaining: 0,
    errorCount: 0,
  };

  private checkInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL_MS = 30000; // Check every 30 seconds

  /**
   * Start monitoring AI service status
   */
  startMonitoring(): void {
    if (this.checkInterval) {
      return; // Already monitoring
    }

    // Initial check
    this.checkStatus();

    // Set up periodic checks
    this.checkInterval = setInterval(() => {
      this.checkStatus();
    }, this.CHECK_INTERVAL_MS);

    aiLogger.info('AI Status Monitor started');
  }

  /**
   * Stop monitoring AI service status
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      aiLogger.info('AI Status Monitor stopped');
    }
  }

  /**
   * Get current AI service status
   */
  getStatus(): AIServiceStatus {
    return { ...this.status };
  }

  /**
   * Check AI service status
   */
  private async checkStatus(): Promise<void> {
    try {
      const rateLimitStatus = getRateLimitStatus();
      const errorLogs = aiLogger.getErrorLogs();
      const recentErrors = errorLogs.filter(
        log => Date.now() - log.timestamp.getTime() < 300000 // Last 5 minutes
      );

      this.status = {
        available: this.determineAvailability(recentErrors.length, rateLimitStatus.remaining),
        lastCheck: new Date(),
        rateLimitRemaining: rateLimitStatus.remaining,
        errorCount: recentErrors.length,
      };

      aiLogger.debug('AI Status Check', undefined, {
        available: this.status.available,
        rateLimitRemaining: this.status.rateLimitRemaining,
        errorCount: this.status.errorCount,
      });
    } catch (error) {
      aiLogger.error('AI Status Check Failed', error as Error);
      
      this.status = {
        available: false,
        lastCheck: new Date(),
        rateLimitRemaining: 0,
        errorCount: this.status.errorCount + 1,
      };
    }
  }

  /**
   * Determine if AI service is available based on recent errors and rate limits
   */
  private determineAvailability(recentErrorCount: number, rateLimitRemaining: number): boolean {
    // Service is unavailable if too many recent errors
    if (recentErrorCount >= 5) {
      return false;
    }

    // Service is unavailable if rate limit is exhausted
    if (rateLimitRemaining <= 0) {
      return false;
    }

    return true;
  }

  /**
   * Force a status update
   */
  async forceUpdate(): Promise<AIServiceStatus> {
    await this.checkStatus();
    return this.getStatus();
  }

  /**
   * Get health metrics
   */
  getHealthMetrics(): {
    uptime: number;
    availability: number;
    averageResponseTime: number;
    errorRate: number;
  } {
    const performanceMetrics = aiLogger.getPerformanceMetrics();
    const errorLogs = aiLogger.getErrorLogs();
    const totalLogs = aiLogger.getRecentLogs().length;

    return {
      uptime: this.status.available ? 100 : 0,
      availability: totalLogs > 0 ? ((totalLogs - errorLogs.length) / totalLogs) * 100 : 100,
      averageResponseTime: performanceMetrics.averageResponseTime,
      errorRate: performanceMetrics.errorRate,
    };
  }

  /**
   * Check if service is healthy for new requests
   */
  isHealthy(): boolean {
    const metrics = this.getHealthMetrics();
    
    return (
      this.status.available &&
      metrics.errorRate < 50 && // Less than 50% error rate
      metrics.averageResponseTime < 10000 && // Less than 10 second average
      this.status.rateLimitRemaining > 0
    );
  }
}

// Export singleton instance
export const aiStatusMonitor = new AIStatusMonitor();