import { ConfigurationError } from '../types/ai';

/**
 * API Key Validation Utilities
 */
export class APIKeyValidator {
  /**
   * Validate Gemini API key format
   */
  static validateGeminiKey(apiKey: string): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!apiKey) {
      errors.push('API key is required');
      return { isValid: false, errors, warnings };
    }

    // Basic format validation
    if (apiKey.length < 20) {
      errors.push('API key appears to be too short');
    }

    if (!apiKey.startsWith('AIza')) {
      errors.push('Invalid Gemini API key format - should start with "AIza"');
    }

    // Check for common issues
    if (apiKey.includes(' ')) {
      errors.push('API key should not contain spaces');
    }

    if (apiKey !== apiKey.trim()) {
      warnings.push('API key has leading or trailing whitespace');
    }

    // Check for placeholder values
    const placeholders = ['your_api_key', 'api_key_here', 'replace_me', 'xxx'];
    if (placeholders.some(placeholder => apiKey.toLowerCase().includes(placeholder))) {
      errors.push('API key appears to be a placeholder value');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Test API key by making a simple request
   */
  static async testAPIKey(apiKey: string): Promise<{
    isValid: boolean;
    message: string;
    details?: any;
  }> {
    try {
      // First validate format
      const formatValidation = this.validateGeminiKey(apiKey);
      if (!formatValidation.isValid) {
        return {
          isValid: false,
          message: formatValidation.errors.join(', ')
        };
      }

      // Test with a simple request to Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return {
          isValid: true,
          message: 'API key is valid and working',
          details: {
            modelsAvailable: data.models?.length || 0,
            status: 'active'
          }
        };
      } else if (response.status === 403) {
        return {
          isValid: false,
          message: 'API key is invalid or access is denied'
        };
      } else if (response.status === 429) {
        return {
          isValid: true,
          message: 'API key is valid but rate limited'
        };
      } else {
        return {
          isValid: false,
          message: `API test failed with status ${response.status}`
        };
      }
    } catch (error) {
      return {
        isValid: false,
        message: `API test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Mask API key for display
   */
  static maskAPIKey(apiKey: string): string {
    if (!apiKey || apiKey.length < 8) {
      return '••••••••';
    }
    
    const start = apiKey.substring(0, 4);
    const end = apiKey.substring(apiKey.length - 4);
    const middle = '•'.repeat(Math.max(8, apiKey.length - 8));
    
    return `${start}${middle}${end}`;
  }

  /**
   * Generate API key strength score
   */
  static getKeyStrength(apiKey: string): {
    score: number;
    level: 'weak' | 'medium' | 'strong';
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 0;

    if (!apiKey) {
      return { score: 0, level: 'weak', issues: ['No API key provided'] };
    }

    // Length check
    if (apiKey.length >= 39) {
      score += 30;
    } else if (apiKey.length >= 30) {
      score += 20;
    } else {
      issues.push('API key is shorter than expected');
    }

    // Format check
    if (apiKey.startsWith('AIza')) {
      score += 30;
    } else {
      issues.push('Invalid API key format');
    }

    // Character variety
    const hasNumbers = /\d/.test(apiKey);
    const hasLetters = /[a-zA-Z]/.test(apiKey);
    const hasSpecialChars = /[_-]/.test(apiKey);

    if (hasNumbers) score += 15;
    if (hasLetters) score += 15;
    if (hasSpecialChars) score += 10;

    if (!hasNumbers || !hasLetters) {
      issues.push('API key should contain both letters and numbers');
    }

    // Determine level
    let level: 'weak' | 'medium' | 'strong';
    if (score >= 80) {
      level = 'strong';
    } else if (score >= 50) {
      level = 'medium';
    } else {
      level = 'weak';
    }

    return { score, level, issues };
  }
}

/**
 * Environment variable helpers
 */
export class EnvironmentConfig {
  /**
   * Get API key from environment with fallback
   */
  static getAPIKey(): string | undefined {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }

  /**
   * Check if running in development mode
   */
  static isDevelopment(): boolean {
    return import.meta.env.DEV;
  }

  /**
   * Get all AI-related environment variables
   */
  static getAIEnvironmentConfig(): {
    apiKey?: string;
    enabled: boolean;
    rateLimitPerMinute: number;
    timeoutMs: number;
    retryAttempts: number;
  } {
    return {
      apiKey: this.getAPIKey(),
      enabled: this.getBooleanEnv('VITE_AI_ENABLED', true),
      rateLimitPerMinute: this.getNumberEnv('VITE_AI_RATE_LIMIT_PER_MINUTE', 60),
      timeoutMs: this.getNumberEnv('VITE_AI_TIMEOUT_MS', 10000),
      retryAttempts: this.getNumberEnv('VITE_AI_RETRY_ATTEMPTS', 3),
    };
  }

  private static getBooleanEnv(key: string, defaultValue: boolean): boolean {
    const value = import.meta.env[key];
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === 'true';
  }

  private static getNumberEnv(key: string, defaultValue: number): number {
    const value = import.meta.env[key];
    if (value === undefined) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }
}