import { aiConfigManager } from '../config/aiConfig';
import { ConfigurationError } from '../types/ai';

export interface EnvSetupResult {
  success: boolean;
  message: string;
  missingVars?: string[];
  suggestions?: string[];
}

/**
 * Check if all required environment variables are properly configured
 */
export function checkEnvironmentSetup(): EnvSetupResult {
  const requiredVars = ['VITE_GEMINI_API_KEY'];
  const missingVars: string[] = [];
  const suggestions: string[] = [];

  // Check for required variables
  for (const varName of requiredVars) {
    const value = import.meta.env[varName];
    if (!value) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    suggestions.push('Create a .env file in your project root');
    suggestions.push('Copy the contents from .env.example');
    suggestions.push('Replace placeholder values with your actual API keys');
    suggestions.push('Restart your development server after adding environment variables');

    return {
      success: false,
      message: `Missing required environment variables: ${missingVars.join(', ')}`,
      missingVars,
      suggestions,
    };
  }

  // Validate API key format
  try {
    const config = aiConfigManager.getConfig();
    if (!aiConfigManager.validateApiKey(config.apiKey)) {
      return {
        success: false,
        message: 'Invalid Gemini API key format. Please check your VITE_GEMINI_API_KEY.',
        suggestions: [
          'Ensure your API key starts with "AIza"',
          'Verify the API key is copied correctly from Google AI Studio',
          'Check for any extra spaces or characters in the .env file',
        ],
      };
    }
  } catch (error) {
    if (error instanceof ConfigurationError) {
      return {
        success: false,
        message: error.message,
        suggestions: [
          'Check your .env file configuration',
          'Ensure all values are properly formatted',
          'Restart your development server',
        ],
      };
    }
  }

  return {
    success: true,
    message: 'Environment is properly configured for AI services',
  };
}

/**
 * Get setup instructions for users
 */
export function getSetupInstructions(): {
  title: string;
  steps: string[];
  notes: string[];
} {
  return {
    title: 'AI Service Setup Instructions',
    steps: [
      '1. Get a Gemini API key from Google AI Studio (https://makersuite.google.com/app/apikey)',
      '2. Create a .env file in your project root directory',
      '3. Copy the contents from .env.example to your .env file',
      '4. Replace "your_gemini_api_key_here" with your actual API key',
      '5. Save the .env file and restart your development server',
      '6. The AI features will automatically activate once configured',
    ],
    notes: [
      'Never commit your .env file to version control',
      'Keep your API keys secure and do not share them',
      'The .env file should be in your .gitignore',
      'API keys should start with "AIza" for Gemini',
    ],
  };
}

/**
 * Generate a sample .env file content
 */
export function generateEnvTemplate(apiKey?: string): string {
  return `# AI Service Configuration
VITE_GEMINI_API_KEY=${apiKey || 'your_gemini_api_key_here'}

# AI Service Settings (Optional - defaults will be used if not specified)
VITE_AI_ENABLED=true
VITE_AI_RATE_LIMIT_PER_MINUTE=60
VITE_AI_TIMEOUT_MS=10000
VITE_AI_RETRY_ATTEMPTS=3

# Note: Never commit this file to version control
# Add .env to your .gitignore file`;
}

/**
 * Validate a specific API key format
 */
export function validateApiKeyFormat(apiKey: string): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  if (!apiKey) {
    issues.push('API key is empty');
  } else {
    if (apiKey.length < 20) {
      issues.push('API key appears to be too short');
    }
    
    if (!apiKey.startsWith('AIza')) {
      issues.push('Gemini API keys should start with "AIza"');
    }
    
    if (apiKey.includes(' ')) {
      issues.push('API key contains spaces');
    }
    
    if (apiKey === 'your_gemini_api_key_here') {
      issues.push('Please replace the placeholder with your actual API key');
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Test API key by attempting a simple configuration
 */
export async function testApiKeyConfiguration(apiKey: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Validate format first
    const formatValidation = validateApiKeyFormat(apiKey);
    if (!formatValidation.valid) {
      return {
        success: false,
        message: `API key format issues: ${formatValidation.issues.join(', ')}`,
      };
    }

    // Test configuration
    aiConfigManager.updateConfig({ apiKey });
    
    return {
      success: true,
      message: 'API key configuration test passed',
    };
  } catch (error) {
    return {
      success: false,
      message: `Configuration test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}