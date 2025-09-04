import { 
  AIServiceError, 
  RateLimitError, 
  ValidationError, 
  ConfigurationError 
} from '../types/ai';

export interface ErrorHandlingOptions {
  maxRetries?: number;
  retryDelay?: number;
  fallbackEnabled?: boolean;
  logErrors?: boolean;
  circuitBreakerEnabled?: boolean;
  circuitBreakerThreshold?: number;
  circuitBreakerTimeout?: number;
  notifyUser?: boolean;
}

export interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'closed' | 'open' | 'half-open';
}

export interface ErrorNotification {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  dismissed: boolean;
  retryable: boolean;
}

export class AIErrorHandler {
  private static defaultOptions: ErrorHandlingOptions = {
    maxRetries: 3,
    retryDelay: 1000,
    fallbackEnabled: true,
    logErrors: true,
    circuitBreakerEnabled: true,
    circuitBreakerThreshold: 5,
    circuitBreakerTimeout: 60000, // 1 minute
    notifyUser: true,
  };

  private static circuitBreaker: CircuitBreakerState = {
    failures: 0,
    lastFailureTime: 0,
    state: 'closed',
  };

  private static errorNotifications: ErrorNotification[] = [];
  private static notificationListeners: ((notifications: ErrorNotification[]) => void)[] = [];

  /**
   * Handle AI service errors with appropriate retry and fallback logic
   */
  static async handleError<T>(
    error: Error,
    operation: () => Promise<T>,
    options: ErrorHandlingOptions = {}
  ): Promise<T | null> {
    const opts = { ...this.defaultOptions, ...options };

    if (opts.logErrors) {
      console.error('AI Service Error:', error);
    }

    // Check circuit breaker state
    if (opts.circuitBreakerEnabled && this.isCircuitOpen()) {
      const notification = this.createNotification(
        'warning',
        'AI Service Temporarily Unavailable',
        'AI service is temporarily disabled due to repeated failures. Using fallback mode.',
        true
      );
      
      if (opts.notifyUser) {
        this.addNotification(notification);
      }

      if (opts.fallbackEnabled) {
        return null; // Use fallback
      }
      
      throw new AIServiceError('Circuit breaker is open', 'CIRCUIT_BREAKER_OPEN', false);
    }

    try {
      // Handle specific error types
      if (error instanceof RateLimitError) {
        return await this.handleRateLimitError(error, operation, opts);
      }

      if (error instanceof ValidationError) {
        return this.handleValidationError(error, opts);
      }

      if (error instanceof ConfigurationError) {
        return this.handleConfigurationError(error, opts);
      }

      if (error instanceof AIServiceError && error.retryable) {
        return await this.handleRetryableError(error, operation, opts);
      }

      // Record failure for circuit breaker
      this.recordFailure();

      // Non-retryable error
      if (opts.fallbackEnabled) {
        const notification = this.createNotification(
          'warning',
          'AI Service Error',
          'AI analysis failed. Using fallback analysis instead.',
          false
        );
        
        if (opts.notifyUser) {
          this.addNotification(notification);
        }

        console.warn('AI service unavailable, falling back to mock data');
        return null; // Indicates fallback should be used
      }

      throw error;
    } catch (handlingError) {
      // Record failure for circuit breaker
      this.recordFailure();
      
      if (opts.fallbackEnabled) {
        const notification = this.createNotification(
          'error',
          'AI Service Critical Error',
          'Critical error in AI service. Switching to fallback mode.',
          true
        );
        
        if (opts.notifyUser) {
          this.addNotification(notification);
        }

        return null;
      }
      
      throw handlingError;
    }
  }

  /**
   * Handle rate limit errors with exponential backoff
   */
  private static async handleRateLimitError<T>(
    error: RateLimitError,
    operation: () => Promise<T>,
    options: ErrorHandlingOptions
  ): Promise<T | null> {
    const retryAfter = error.retryAfter || options.retryDelay || 1000;
    
    console.warn(`Rate limit exceeded. Retrying after ${retryAfter}ms`);
    
    // Wait for the specified time
    await this.delay(retryAfter);
    
    try {
      return await operation();
    } catch (retryError) {
      if (options.fallbackEnabled) {
        console.warn('Rate limit retry failed, falling back to mock data');
        return null;
      }
      throw retryError;
    }
  }

  /**
   * Handle validation errors (non-retryable)
   */
  private static handleValidationError<T>(
    error: ValidationError,
    options: ErrorHandlingOptions
  ): T | null {
    console.error('Validation error in AI service:', error.message);
    
    if (options.fallbackEnabled) {
      return null; // Use fallback
    }
    
    throw error;
  }

  /**
   * Handle configuration errors (non-retryable)
   */
  private static handleConfigurationError<T>(
    error: ConfigurationError,
    options: ErrorHandlingOptions
  ): T | null {
    console.error('Configuration error in AI service:', error.message);
    
    if (options.fallbackEnabled) {
      return null; // Use fallback
    }
    
    throw error;
  }

  /**
   * Handle retryable errors with exponential backoff
   */
  private static async handleRetryableError<T>(
    error: AIServiceError,
    operation: () => Promise<T>,
    options: ErrorHandlingOptions,
    attempt: number = 1
  ): Promise<T | null> {
    const maxRetries = options.maxRetries || 3;
    
    if (attempt > maxRetries) {
      if (options.fallbackEnabled) {
        console.warn('Max retries exceeded, falling back to mock data');
        return null;
      }
      throw error;
    }

    const delay = (options.retryDelay || 1000) * Math.pow(2, attempt - 1);
    console.warn(`AI service error, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
    
    await this.delay(delay);
    
    try {
      return await operation();
    } catch (retryError) {
      return this.handleRetryableError(
        retryError instanceof AIServiceError ? retryError : error,
        operation,
        options,
        attempt + 1
      );
    }
  }

  /**
   * Utility function to create a delay
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create a standardized error response for UI components
   */
  static createErrorResponse(error: Error): {
    success: false;
    error: string;
    code: string;
    retryable: boolean;
  } {
    if (error instanceof AIServiceError) {
      return {
        success: false,
        error: error.message,
        code: error.code,
        retryable: error.retryable,
      };
    }

    return {
      success: false,
      error: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      retryable: false,
    };
  }

  /**
   * Check if an error indicates AI service is unavailable
   */
  static isServiceUnavailable(error: Error): boolean {
    return (
      error instanceof ConfigurationError ||
      (error instanceof AIServiceError && !error.retryable) ||
      error.message.includes('network') ||
      error.message.includes('timeout')
    );
  }

  /**
   * Circuit Breaker Implementation
   */
  private static recordFailure(): void {
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailureTime = Date.now();
    
    if (this.circuitBreaker.failures >= this.defaultOptions.circuitBreakerThreshold!) {
      this.circuitBreaker.state = 'open';
      console.warn('Circuit breaker opened due to repeated failures');
    }
  }

  private static recordSuccess(): void {
    this.circuitBreaker.failures = 0;
    this.circuitBreaker.state = 'closed';
  }

  private static isCircuitOpen(): boolean {
    if (this.circuitBreaker.state === 'closed') {
      return false;
    }

    if (this.circuitBreaker.state === 'open') {
      const timeSinceLastFailure = Date.now() - this.circuitBreaker.lastFailureTime;
      
      if (timeSinceLastFailure >= this.defaultOptions.circuitBreakerTimeout!) {
        this.circuitBreaker.state = 'half-open';
        return false;
      }
      
      return true;
    }

    // half-open state - allow one request to test
    return false;
  }

  /**
   * Test circuit breaker and potentially close it
   */
  static async testCircuitBreaker<T>(operation: () => Promise<T>): Promise<T | null> {
    if (this.circuitBreaker.state !== 'half-open') {
      return null;
    }

    try {
      const result = await operation();
      this.recordSuccess();
      
      const notification = this.createNotification(
        'info',
        'AI Service Restored',
        'AI service is back online and functioning normally.',
        false
      );
      this.addNotification(notification);
      
      return result;
    } catch (error) {
      this.recordFailure();
      return null;
    }
  }

  /**
   * Notification System
   */
  private static createNotification(
    type: 'error' | 'warning' | 'info',
    title: string,
    message: string,
    retryable: boolean
  ): ErrorNotification {
    return {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      timestamp: Date.now(),
      dismissed: false,
      retryable,
    };
  }

  private static addNotification(notification: ErrorNotification): void {
    this.errorNotifications.unshift(notification);
    
    // Keep only last 10 notifications
    if (this.errorNotifications.length > 10) {
      this.errorNotifications = this.errorNotifications.slice(0, 10);
    }
    
    this.notifyListeners();
  }

  private static notifyListeners(): void {
    this.notificationListeners.forEach(listener => {
      try {
        listener([...this.errorNotifications]);
      } catch (error) {
        console.error('Error notifying listener:', error);
      }
    });
  }

  /**
   * Public API for notification management
   */
  static subscribeToNotifications(listener: (notifications: ErrorNotification[]) => void): () => void {
    this.notificationListeners.push(listener);
    
    // Immediately notify with current notifications
    listener([...this.errorNotifications]);
    
    // Return unsubscribe function
    return () => {
      const index = this.notificationListeners.indexOf(listener);
      if (index > -1) {
        this.notificationListeners.splice(index, 1);
      }
    };
  }

  static dismissNotification(id: string): void {
    const notification = this.errorNotifications.find(n => n.id === id);
    if (notification) {
      notification.dismissed = true;
      this.notifyListeners();
    }
  }

  static clearAllNotifications(): void {
    this.errorNotifications = [];
    this.notifyListeners();
  }

  static getActiveNotifications(): ErrorNotification[] {
    return this.errorNotifications.filter(n => !n.dismissed);
  }

  /**
   * Circuit breaker status
   */
  static getCircuitBreakerStatus(): {
    state: string;
    failures: number;
    isOpen: boolean;
    timeUntilRetry?: number;
  } {
    const isOpen = this.isCircuitOpen();
    let timeUntilRetry: number | undefined;
    
    if (this.circuitBreaker.state === 'open') {
      const timeSinceLastFailure = Date.now() - this.circuitBreaker.lastFailureTime;
      timeUntilRetry = Math.max(0, this.defaultOptions.circuitBreakerTimeout! - timeSinceLastFailure);
    }
    
    return {
      state: this.circuitBreaker.state,
      failures: this.circuitBreaker.failures,
      isOpen,
      timeUntilRetry,
    };
  }

  /**
   * Reset circuit breaker (for testing or manual recovery)
   */
  static resetCircuitBreaker(): void {
    this.circuitBreaker = {
      failures: 0,
      lastFailureTime: 0,
      state: 'closed',
    };
    
    const notification = this.createNotification(
      'info',
      'Circuit Breaker Reset',
      'AI service circuit breaker has been manually reset.',
      false
    );
    this.addNotification(notification);
  }

  /**
   * Enhanced error analysis
   */
  static analyzeError(error: Error): {
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    recoverable: boolean;
    suggestedAction: string;
  } {
    if (error instanceof RateLimitError) {
      return {
        category: 'Rate Limiting',
        severity: 'medium',
        recoverable: true,
        suggestedAction: 'Wait and retry automatically',
      };
    }

    if (error instanceof ValidationError) {
      return {
        category: 'Data Validation',
        severity: 'low',
        recoverable: false,
        suggestedAction: 'Check input data format',
      };
    }

    if (error instanceof ConfigurationError) {
      return {
        category: 'Configuration',
        severity: 'high',
        recoverable: false,
        suggestedAction: 'Check AI service configuration',
      };
    }

    if (error instanceof AIServiceError) {
      return {
        category: 'AI Service',
        severity: error.retryable ? 'medium' : 'high',
        recoverable: error.retryable,
        suggestedAction: error.retryable ? 'Retry operation' : 'Use fallback mode',
      };
    }

    // Network or timeout errors
    if (error.message.includes('network') || error.message.includes('timeout')) {
      return {
        category: 'Network',
        severity: 'medium',
        recoverable: true,
        suggestedAction: 'Check network connection and retry',
      };
    }

    return {
      category: 'Unknown',
      severity: 'critical',
      recoverable: false,
      suggestedAction: 'Contact support if issue persists',
    };
  }
}