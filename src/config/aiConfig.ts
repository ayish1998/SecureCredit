import { AIConfig, ConfigurationError } from '../types/ai';

class AIConfigManager {
  private config: AIConfig | null = null;

  /**
   * Initialize AI configuration from environment variables
   */
  public initialize(): AIConfig {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new ConfigurationError(
          'Gemini API key not found. Please set VITE_GEMINI_API_KEY environment variable.'
        );
      }

      this.config = {
        apiKey,
        enabled: this.getBooleanEnv('VITE_AI_ENABLED', true),
        rateLimitPerMinute: this.getNumberEnv('VITE_AI_RATE_LIMIT_PER_MINUTE', 60),
        timeoutMs: this.getNumberEnv('VITE_AI_TIMEOUT_MS', 10000),
        retryAttempts: this.getNumberEnv('VITE_AI_RETRY_ATTEMPTS', 3),
      };

      // Validate configuration
      this.validateConfig(this.config);

      return this.config;
    } catch (error) {
      console.error('Failed to initialize AI configuration:', error);
      throw error;
    }
  }

  /**
   * Get current AI configuration
   */
  public getConfig(): AIConfig {
    if (!this.config) {
      return this.initialize();
    }
    return this.config;
  }

  /**
   * Check if AI services are enabled and properly configured
   */
  public isEnabled(): boolean {
    try {
      const config = this.getConfig();
      return config.enabled && !!config.apiKey;
    } catch {
      return false;
    }
  }

  /**
   * Validate API key format (basic validation)
   */
  public validateApiKey(apiKey: string): boolean {
    // Basic validation for Gemini API key format
    return apiKey.length > 20 && apiKey.startsWith('AIza');
  }

  /**
   * Get boolean environment variable with default
   */
  private getBooleanEnv(key: string, defaultValue: boolean): boolean {
    const value = import.meta.env[key];
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === 'true';
  }

  /**
   * Get number environment variable with default
   */
  private getNumberEnv(key: string, defaultValue: number): number {
    const value = import.meta.env[key];
    if (value === undefined) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Validate the complete configuration
   */
  private validateConfig(config: AIConfig): void {
    if (!this.validateApiKey(config.apiKey)) {
      throw new ConfigurationError('Invalid Gemini API key format');
    }

    if (config.rateLimitPerMinute <= 0 || config.rateLimitPerMinute > 1000) {
      throw new ConfigurationError('Rate limit must be between 1 and 1000 requests per minute');
    }

    if (config.timeoutMs <= 0 || config.timeoutMs > 60000) {
      throw new ConfigurationError('Timeout must be between 1ms and 60 seconds');
    }

    if (config.retryAttempts < 0 || config.retryAttempts > 10) {
      throw new ConfigurationError('Retry attempts must be between 0 and 10');
    }
  }

  /**
   * Update configuration at runtime (for testing or dynamic updates)
   */
  public updateConfig(updates: Partial<AIConfig>): void {
    if (!this.config) {
      this.initialize();
    }

    this.config = { ...this.config!, ...updates };
    this.validateConfig(this.config);
  }

  /**
   * Reset configuration (useful for testing)
   */
  public reset(): void {
    this.config = null;
  }
}

// Export singleton instance
export const aiConfigManager = new AIConfigManager();

// Export convenience functions
export const getAIConfig = () => aiConfigManager.getConfig();
export const isAIEnabled = () => aiConfigManager.isEnabled();