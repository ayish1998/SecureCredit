import { RateLimitError } from '../types/ai';

interface RateLimitEntry {
  timestamp: number;
  count: number;
}

export class RateLimiter {
  private requests: Map<string, RateLimitEntry[]> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(maxRequests: number, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Check if a request is allowed and track it
   */
  async checkLimit(key: string = 'default'): Promise<void> {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get or create request history for this key
    let requestHistory = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    requestHistory = requestHistory.filter(entry => entry.timestamp > windowStart);
    
    // Count total requests in the current window
    const totalRequests = requestHistory.reduce((sum, entry) => sum + entry.count, 0);
    
    if (totalRequests >= this.maxRequests) {
      const oldestRequest = requestHistory[0];
      const retryAfter = oldestRequest ? oldestRequest.timestamp + this.windowMs - now : this.windowMs;
      
      throw new RateLimitError(
        `Rate limit exceeded. ${totalRequests}/${this.maxRequests} requests in the last ${this.windowMs}ms`,
        Math.max(retryAfter, 1000) // At least 1 second
      );
    }

    // Add current request
    requestHistory.push({
      timestamp: now,
      count: 1,
    });

    // Update the map
    this.requests.set(key, requestHistory);
  }

  /**
   * Get current usage for a key
   */
  getCurrentUsage(key: string = 'default'): {
    requests: number;
    limit: number;
    remaining: number;
    resetTime: Date;
  } {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const requestHistory = this.requests.get(key) || [];
    
    // Count requests in current window
    const currentRequests = requestHistory
      .filter(entry => entry.timestamp > windowStart)
      .reduce((sum, entry) => sum + entry.count, 0);

    const remaining = Math.max(0, this.maxRequests - currentRequests);
    const oldestRequest = requestHistory.find(entry => entry.timestamp > windowStart);
    const resetTime = new Date(
      oldestRequest ? oldestRequest.timestamp + this.windowMs : now + this.windowMs
    );

    return {
      requests: currentRequests,
      limit: this.maxRequests,
      remaining,
      resetTime,
    };
  }

  /**
   * Reset rate limit for a specific key
   */
  reset(key: string = 'default'): void {
    this.requests.delete(key);
  }

  /**
   * Reset all rate limits
   */
  resetAll(): void {
    this.requests.clear();
  }

  /**
   * Clean up old entries to prevent memory leaks
   */
  cleanup(): void {
    const now = Date.now();
    const cutoff = now - this.windowMs * 2; // Keep some extra history

    for (const [key, history] of this.requests.entries()) {
      const filteredHistory = history.filter(entry => entry.timestamp > cutoff);
      
      if (filteredHistory.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, filteredHistory);
      }
    }
  }

  /**
   * Get statistics about rate limiting
   */
  getStats(): {
    totalKeys: number;
    totalRequests: number;
    averageRequestsPerKey: number;
  } {
    const totalKeys = this.requests.size;
    let totalRequests = 0;

    for (const history of this.requests.values()) {
      totalRequests += history.reduce((sum, entry) => sum + entry.count, 0);
    }

    return {
      totalKeys,
      totalRequests,
      averageRequestsPerKey: totalKeys > 0 ? totalRequests / totalKeys : 0,
    };
  }
}

// Create a global rate limiter instance
let globalRateLimiter: RateLimiter | null = null;

/**
 * Get or create the global rate limiter
 */
export function getGlobalRateLimiter(maxRequests?: number, windowMs?: number): RateLimiter {
  if (!globalRateLimiter) {
    globalRateLimiter = new RateLimiter(maxRequests || 60, windowMs || 60000);
    
    // Set up periodic cleanup
    setInterval(() => {
      globalRateLimiter?.cleanup();
    }, 300000); // Clean up every 5 minutes
  }
  
  return globalRateLimiter;
}

/**
 * Convenience function to check rate limit using global limiter
 */
export async function checkRateLimit(key?: string): Promise<void> {
  const limiter = getGlobalRateLimiter();
  return limiter.checkLimit(key);
}

/**
 * Get current rate limit status
 */
export function getRateLimitStatus(key?: string) {
  const limiter = getGlobalRateLimiter();
  return limiter.getCurrentUsage(key);
}