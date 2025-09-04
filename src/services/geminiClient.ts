import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from '@google/generative-ai';
import { getAIConfig } from '../config/aiConfig';
import { 
  AIServiceError, 
  RateLimitError, 
  ValidationError, 
  AIRequestContext 
} from '../types/ai';
import { aiLogger } from '../utils/aiLogger';
import { checkRateLimit } from '../utils/rateLimiter';
import { AIErrorHandler } from '../utils/aiErrorHandler';
import { 
  validatePrompt, 
  validateResponse, 
  sanitizeInput,
  validateTransactionData,
  validateCreditData,
  validateSecurityData 
} from '../utils/aiValidation';

export interface GeminiRequest {
  prompt: string;
  data?: any;
  context?: AIRequestContext;
  temperature?: number;
  maxTokens?: number;
}

export interface GeminiResponse {
  content: string;
  confidence: number;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class GeminiClient {
  private genAI: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;
  private initialized = false;

  /**
   * Initialize the Gemini client
   */
  async initialize(): Promise<void> {
    try {
      const config = getAIConfig();
      
      if (!config.apiKey) {
        throw new AIServiceError('Gemini API key not configured', 'MISSING_API_KEY');
      }

      this.genAI = new GoogleGenerativeAI(config.apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });

      this.initialized = true;
      aiLogger.info('Gemini Client initialized successfully');
    } catch (error) {
      aiLogger.error('Gemini Client initialization failed', error as Error);
      throw new AIServiceError(
        `Failed to initialize Gemini client: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'INITIALIZATION_ERROR'
      );
    }
  }

  /**
   * Generate content using Gemini API
   */
  async generateContent(request: GeminiRequest): Promise<GeminiResponse> {
    const operation = `Gemini Generate Content - ${request.context?.analysisType || 'general'}`;
    const endLog = aiLogger.startOperation(operation, request.context);

    try {
      // Check initialization
      if (!this.initialized || !this.model) {
        await this.initialize();
      }

      // Check rate limits
      await checkRateLimit(request.context?.userId || 'default');

      // Validate request
      this.validateRequest(request);

      // Prepare the prompt
      const fullPrompt = this.buildPrompt(request);

      // Make the API call with timeout
      const result = await this.makeAPICall(fullPrompt, request);

      // Validate and process response
      const response = this.processResponse(result, request);
      
      // Validate the final response
      validateResponse(response);

      endLog();
      aiLogger.info('Gemini content generated successfully', request.context, {
        promptLength: fullPrompt.length,
        responseLength: response.content.length,
        confidence: response.confidence,
      });

      return response;

    } catch (error) {
      endLog();
      
      // Handle specific error types
      if (error instanceof RateLimitError || error instanceof ValidationError) {
        throw error;
      }

      // Handle API errors
      if (error instanceof Error) {
        if (error.message.includes('quota') || error.message.includes('rate limit')) {
          throw new RateLimitError('Gemini API rate limit exceeded');
        }
        
        if (error.message.includes('invalid') || error.message.includes('unauthorized')) {
          throw new AIServiceError('Invalid API key or unauthorized access', 'AUTH_ERROR');
        }

        if (error.message.includes('timeout')) {
          throw new AIServiceError('Request timeout', 'TIMEOUT_ERROR', true);
        }
      }

      throw new AIServiceError(
        `Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'API_ERROR',
        true
      );
    }
  }

  /**
   * Analyze data with specific context
   */
  async analyzeWithContext(
    data: any, 
    analysisType: 'fraud' | 'credit' | 'security' | 'general',
    context?: AIRequestContext
  ): Promise<GeminiResponse> {
    const prompt = this.buildAnalysisPrompt(data, analysisType);
    
    return this.generateContent({
      prompt,
      data,
      context: { ...context, analysisType },
      temperature: 0.3, // Lower temperature for analysis tasks
    });
  }

  /**
   * Validate the request before processing
   */
  private validateRequest(request: GeminiRequest): void {
    // Validate prompt using the validation utility
    validatePrompt(request.prompt);

    // Validate temperature
    if (request.temperature !== undefined && (request.temperature < 0 || request.temperature > 2)) {
      throw new ValidationError('Temperature must be between 0 and 2');
    }

    // Validate max tokens
    if (request.maxTokens !== undefined && (request.maxTokens < 1 || request.maxTokens > 4096)) {
      throw new ValidationError('Max tokens must be between 1 and 4096');
    }

    // Sanitize and validate data if provided
    if (request.data) {
      request.data = sanitizeInput(request.data);
      
      // Validate data based on analysis type
      if (request.context?.analysisType === 'fraud') {
        validateTransactionData(request.data);
      } else if (request.context?.analysisType === 'credit') {
        validateCreditData(request.data);
      } else if (request.context?.analysisType === 'security') {
        validateSecurityData(request.data);
      }
    }
  }

  /**
   * Build the complete prompt with context
   */
  private buildPrompt(request: GeminiRequest): string {
    let prompt = request.prompt;

    // Add context if provided
    if (request.context) {
      prompt = `Context: ${JSON.stringify(request.context, null, 2)}\n\n${prompt}`;
    }

    // Add data if provided
    if (request.data) {
      prompt += `\n\nData to analyze:\n${JSON.stringify(request.data, null, 2)}`;
    }

    return prompt;
  }

  /**
   * Build analysis-specific prompts
   */
  private buildAnalysisPrompt(data: any, analysisType: string): string {
    const basePrompts = {
      fraud: `You are an expert fraud detection analyst for African mobile money systems. Analyze the following transaction data and provide:
1. Fraud probability (0-100%)
2. Risk level (low/medium/high/critical)
3. Suspicious patterns identified
4. Confidence score (0-100%)
5. Specific recommendations for prevention
6. Reasoning for your assessment

Focus on patterns common in African mobile money fraud including SIM swapping, social engineering, and merchant fraud.`,

      credit: `You are an expert credit analyst specializing in African financial markets. Analyze the following financial data and provide:
1. Enhanced credit score (300-850 scale)
2. Risk assessment (low/medium/high/critical)
3. Key factors affecting creditworthiness
4. Lending recommendation
5. Confidence score (0-100%)
6. Improvement suggestions
7. Reasoning for your assessment

Consider factors relevant to African markets including mobile money usage, informal income, and limited credit history.`,

      security: `You are a cybersecurity expert specializing in device fingerprinting and behavioral analysis. Analyze the following security data and provide:
1. Threat level (0-100%)
2. Risk assessment (low/medium/high/critical)
3. Identified vulnerabilities
4. Device risk score
5. Confidence score (0-100%)
6. Mitigation recommendations
7. Reasoning for your assessment

Focus on mobile device security, behavioral anomalies, and emerging threats in African markets.`,

      general: `You are an AI assistant specializing in financial technology and security. Analyze the provided data and give insights with:
1. Key findings
2. Risk assessment
3. Confidence score (0-100%)
4. Recommendations
5. Reasoning for your assessment`
    };

    return basePrompts[analysisType as keyof typeof basePrompts] || basePrompts.general;
  }

  /**
    * Make the actual API call with timeout and retry logic
    */
  private async makeAPICall(prompt: string, request: GeminiRequest): Promise<any> {
    const config = getAIConfig();
    
   if (!this.model) {
     throw new AIServiceError('Model not initialized', 'MODEL_ERROR');
   }

   // Create generation config
   const generationConfig: GenerationConfig = {
     temperature: request.temperature || 0.7,
     maxOutputTokens: request.maxTokens || 2048,
   };

   // Make the API call with timeout
   const timeoutPromise = new Promise((_, reject) => {
     setTimeout(() => reject(new Error('Request timeout')), config.timeoutMs);
   });

   const apiPromise = this.model.generateContent({
     contents: [{ role: 'user', parts: [{ text: prompt }] }],
     generationConfig,
   });

   return Promise.race([apiPromise, timeoutPromise]);
  }


  /**
   * Process and validate the API response
   */
  private processResponse(result: any, request: GeminiRequest): GeminiResponse {
    try {
      if (!result || !result.response) {
        throw new ValidationError('Invalid response from Gemini API');
      }

      const text = result.response.text();
      if (!text || text.trim().length === 0) {
        throw new ValidationError('Empty response from Gemini API');
      }

      // Calculate confidence based on response quality
      const confidence = this.calculateConfidence(text, request);

      return {
        content: text.trim(),
        confidence,
        usage: this.extractUsageInfo(result),
      };
    } catch (error) {
      throw new ValidationError(
        `Failed to process Gemini response: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Calculate confidence score based on response characteristics
   */
  private calculateConfidence(text: string, request: GeminiRequest): number {
    let confidence = 85; // Base confidence

    // Adjust based on response length
    if (text.length < 50) confidence -= 20;
    else if (text.length > 500) confidence += 10;

    // Adjust based on analysis type
    if (request.context?.analysisType === 'fraud' || request.context?.analysisType === 'security') {
      confidence += 5; // Higher confidence for security-related analysis
    }

    // Adjust based on structured content
    if (text.includes('confidence') || text.includes('probability')) {
      confidence += 10;
    }

    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * Extract usage information from the response
   */
  private extractUsageInfo(result: any): GeminiResponse['usage'] {
    try {
      // Gemini API doesn't always provide detailed usage info
      // This is a placeholder for when it becomes available
      return {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      };
    } catch {
      return undefined;
    }
  }

  /**
   * Test the connection to Gemini API
   */
  async testConnection(): Promise<{ success: boolean; message: string; latency?: number }> {
    try {
      const startTime = Date.now();
      
      const response = await this.generateContent({
        prompt: 'Respond with "Connection successful" if you can read this message.',
        context: { analysisType: 'general', priority: 'low' },
      });

      const latency = Date.now() - startTime;

      if (response.content.toLowerCase().includes('connection successful')) {
        return {
          success: true,
          message: 'Gemini API connection successful',
          latency,
        };
      }

      return {
        success: false,
        message: 'Unexpected response from Gemini API',
        latency,
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get client status and health information
   */
  getStatus(): {
    initialized: boolean;
    healthy: boolean;
    lastError?: string;
  } {
    return {
      initialized: this.initialized,
      healthy: this.initialized && this.model !== null,
    };
  }

  /**
   * Reset the client (useful for testing or error recovery)
   */
  reset(): void {
    this.genAI = null;
    this.model = null;
    this.initialized = false;
    aiLogger.info('Gemini Client reset');
  }
}

// Export singleton instance
export const geminiClient = new GeminiClient();