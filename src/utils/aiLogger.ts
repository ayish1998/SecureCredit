import { AIRequestContext } from '../types/ai';

export interface AILogEntry {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  operation: string;
  context?: AIRequestContext;
  duration?: number;
  error?: string;
  metadata?: Record<string, any>;
}

class AILogger {
  private logs: AILogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 log entries
  private enableConsoleLogging = true;

  /**
   * Log an info message
   */
  info(operation: string, context?: AIRequestContext, metadata?: Record<string, any>): void {
    this.log('info', operation, context, undefined, undefined, metadata);
  }

  /**
   * Log a warning message
   */
  warn(operation: string, context?: AIRequestContext, metadata?: Record<string, any>): void {
    this.log('warn', operation, context, undefined, undefined, metadata);
  }

  /**
   * Log an error message
   */
  error(operation: string, error: Error, context?: AIRequestContext, metadata?: Record<string, any>): void {
    this.log('error', operation, context, undefined, error.message, metadata);
  }

  /**
   * Log a debug message
   */
  debug(operation: string, context?: AIRequestContext, metadata?: Record<string, any>): void {
    this.log('debug', operation, context, undefined, undefined, metadata);
  }

  /**
   * Log the start of an operation and return a function to log completion
   */
  startOperation(operation: string, context?: AIRequestContext): () => void {
    const startTime = Date.now();
    this.info(`${operation} - Started`, context);

    return () => {
      const duration = Date.now() - startTime;
      this.info(`${operation} - Completed`, context, { duration });
    };
  }

  /**
   * Log an operation with timing
   */
  logOperation<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: AIRequestContext
  ): Promise<T> {
    const startTime = Date.now();
    this.info(`${operation} - Started`, context);

    return fn()
      .then(result => {
        const duration = Date.now() - startTime;
        this.info(`${operation} - Completed`, context, { duration });
        return result;
      })
      .catch(error => {
        const duration = Date.now() - startTime;
        this.error(`${operation} - Failed`, error, context, { duration });
        throw error;
      });
  }

  /**
   * Core logging method
   */
  private log(
    level: 'info' | 'warn' | 'error' | 'debug',
    operation: string,
    context?: AIRequestContext,
    duration?: number,
    error?: string,
    metadata?: Record<string, any>
  ): void {
    const entry: AILogEntry = {
      timestamp: new Date(),
      level,
      operation,
      context: context ? { ...context } : undefined,
      duration,
      error,
      metadata: metadata ? { ...metadata } : undefined,
    };

    // Add to internal log storage
    this.logs.push(entry);
    
    // Trim logs if exceeding max size
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console logging (can be disabled in production)
    if (this.enableConsoleLogging) {
      this.logToConsole(entry);
    }
  }

  /**
   * Log to console with appropriate formatting
   */
  private logToConsole(entry: AILogEntry): void {
    const prefix = `[AI Service] ${entry.timestamp.toISOString()}`;
    const message = `${prefix} ${entry.operation}`;
    
    const details = {
      ...(entry.context && { context: entry.context }),
      ...(entry.duration && { duration: `${entry.duration}ms` }),
      ...(entry.metadata && entry.metadata),
    };

    switch (entry.level) {
      case 'error':
        console.error(message, entry.error, details);
        break;
      case 'warn':
        console.warn(message, details);
        break;
      case 'debug':
        console.debug(message, details);
        break;
      default:
        console.log(message, details);
    }
  }

  /**
   * Get recent logs for debugging
   */
  getRecentLogs(count: number = 50): AILogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * Get logs filtered by level
   */
  getLogsByLevel(level: 'info' | 'warn' | 'error' | 'debug'): AILogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Get error logs for troubleshooting
   */
  getErrorLogs(): AILogEntry[] {
    return this.getLogsByLevel('error');
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Enable or disable console logging
   */
  setConsoleLogging(enabled: boolean): void {
    this.enableConsoleLogging = enabled;
  }

  /**
   * Get performance metrics from logs
   */
  getPerformanceMetrics(): {
    averageResponseTime: number;
    totalOperations: number;
    errorRate: number;
    operationCounts: Record<string, number>;
  } {
    const operationsWithDuration = this.logs.filter(log => log.duration !== undefined);
    const totalOperations = operationsWithDuration.length;
    const errorCount = this.getErrorLogs().length;
    
    const averageResponseTime = totalOperations > 0
      ? operationsWithDuration.reduce((sum, log) => sum + (log.duration || 0), 0) / totalOperations
      : 0;

    const errorRate = totalOperations > 0 ? (errorCount / totalOperations) * 100 : 0;

    const operationCounts = this.logs.reduce((counts, log) => {
      const operation = log.operation.split(' - ')[0]; // Remove status suffix
      counts[operation] = (counts[operation] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    return {
      averageResponseTime: Math.round(averageResponseTime),
      totalOperations,
      errorRate: Math.round(errorRate * 100) / 100,
      operationCounts,
    };
  }
}

// Export singleton instance
export const aiLogger = new AILogger();

// Export convenience functions
export const logAIOperation = (operation: string, context?: AIRequestContext) => 
  aiLogger.info(operation, context);

export const logAIError = (operation: string, error: Error, context?: AIRequestContext) => 
  aiLogger.error(operation, error, context);

export const startAIOperation = (operation: string, context?: AIRequestContext) => 
  aiLogger.startOperation(operation, context);