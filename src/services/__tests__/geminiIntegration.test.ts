import { describe, it, expect } from 'vitest';
import { geminiClient } from '../geminiClient';
import { isAIEnabled } from '../../config/aiConfig';

describe('Gemini Integration', () => {
  it('should have proper configuration', () => {
    expect(isAIEnabled()).toBe(true);
  });

  it('should initialize client without errors', async () => {
    expect(() => geminiClient.initialize()).not.toThrow();
  });

  it('should have correct status after initialization', async () => {
    await geminiClient.initialize();
    const status = geminiClient.getStatus();
    
    expect(status.initialized).toBe(true);
    expect(status.healthy).toBe(true);
  });

  it('should validate prompts correctly', async () => {
    await geminiClient.initialize();
    
    // Test with empty prompt - should throw ValidationError
    await expect(
      geminiClient.generateContent({ prompt: '' })
    ).rejects.toThrow();
    
    // Test with valid prompt structure (will fail at API call but validation should pass)
    const validRequest = {
      prompt: 'Test prompt for validation',
      context: { analysisType: 'general' as const, priority: 'low' as const },
    };
    
    // This will fail at the API call level, but validation should pass
    try {
      await geminiClient.generateContent(validRequest);
    } catch (error) {
      // We expect this to fail at API level, not validation level
      // The error should be an AIServiceError, not a ValidationError
      expect(error).toBeInstanceOf(Error);
      expect(error.message).not.toContain('validation');
    }
  });

  it('should handle connection test gracefully', async () => {
    await geminiClient.initialize();
    
    const result = await geminiClient.testConnection();
    
    // Should return a result object regardless of success/failure
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('message');
    expect(typeof result.success).toBe('boolean');
    expect(typeof result.message).toBe('string');
  });
});