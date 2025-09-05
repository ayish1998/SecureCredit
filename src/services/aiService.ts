import { geminiClient } from './geminiClient';
import { DataAdapter } from '../utils/dataAdapter';
import { aiLogger } from '../utils/aiLogger';
import { AIErrorHandler } from '../utils/aiErrorHandler';
import { FallbackDataProvider } from '../utils/fallbackDataProvider';
import { 
  AIAnalysisResponse,
  FraudAnalysis,
  CreditEnhancement,
  SecurityAssessment,
  AIServiceError,
  AIRequestContext
} from '../types/ai';

export interface AIServiceOptions {
  enableFallback?: boolean;
  cacheResults?: boolean;
  maxRetries?: number;
}

export class AIService {
  private initialized = false;
  private fallbackEnabled = true;
  private analysisCache = new Map<string, any>();

  /**
   * Initialize the AI service
   */
  async initialize(options: AIServiceOptions = {}): Promise<void> {
    try {
      this.fallbackEnabled = options.enableFallback !== false;
      
      // Initialize the Gemini client
      await geminiClient.initialize();
      
      this.initialized = true;
      aiLogger.info('AI Service initialized successfully', undefined, {
        fallbackEnabled: this.fallbackEnabled,
        cacheEnabled: options.cacheResults !== false,
      });
    } catch (error) {
      aiLogger.error('AI Service initialization failed', error as Error);
      
      if (this.fallbackEnabled) {
        aiLogger.info('AI Service running in fallback mode');
        this.initialized = true; // Allow fallback operation
      } else {
        throw new AIServiceError(
          `Failed to initialize AI service: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'INITIALIZATION_ERROR'
        );
      }
    }
  }

  /**
   * Analyze fraud risk for transaction data
   */
  async analyzeFraudRisk(
    transactionData: any,
    context?: AIRequestContext
  ): Promise<FraudAnalysis> {
    const operation = 'Fraud Risk Analysis';
    const endLog = aiLogger.startOperation(operation, context);

    try {
      // Check if service is initialized
      if (!this.initialized) {
        await this.initialize();
      }

      // Try AI analysis first
      const aiResult = await this.performAIAnalysis(
        transactionData,
        'fraud',
        context
      );

      if (aiResult) {
        const fraudAnalysis = this.transformToFraudAnalysis(aiResult, transactionData);
        endLog();
        return fraudAnalysis;
      }

      // Fallback to enhanced analysis
      const fallbackResult = this.generateFraudFallback(transactionData);
      endLog();
      return fallbackResult;

    } catch (error) {
      endLog();
      
      // Final fallback with error handling
      const result = await AIErrorHandler.handleError(
        error as Error,
        async () => this.generateFraudFallback(transactionData),
        { fallbackEnabled: true, notifyUser: false }
      );
      
      return result || this.generateFraudFallback(transactionData);
    }
  }

  /**
   * Enhance credit scoring with AI analysis
   */
  async enhanceCreditScoring(
    creditData: any,
    context?: AIRequestContext
  ): Promise<CreditEnhancement> {
    const operation = 'Credit Scoring Enhancement';
    const endLog = aiLogger.startOperation(operation, context);

    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // Try AI analysis first
      const aiResult = await this.performAIAnalysis(
        creditData,
        'credit',
        context
      );

      if (aiResult) {
        const creditEnhancement = this.transformToCreditEnhancement(aiResult, creditData);
        endLog();
        return creditEnhancement;
      }

      // Fallback to enhanced analysis
      const fallbackResult = this.generateCreditFallback(creditData);
      endLog();
      return fallbackResult;

    } catch (error) {
      endLog();
      
      // Final fallback with error handling
      const result = await AIErrorHandler.handleError(
        error as Error,
        async () => this.generateCreditFallback(creditData),
        { fallbackEnabled: true, notifyUser: false }
      );
      
      return result || this.generateCreditFallback(creditData);
    }
  }

  /**
   * Analyze security patterns and threats
   */
  async analyzeSecurityPattern(
    securityData: any,
    context?: AIRequestContext
  ): Promise<SecurityAssessment> {
    const operation = 'Security Pattern Analysis';
    const endLog = aiLogger.startOperation(operation, context);

    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // Try AI analysis first
      const aiResult = await this.performAIAnalysis(
        securityData,
        'security',
        context
      );

      if (aiResult) {
        const securityAssessment = this.transformToSecurityAssessment(aiResult, securityData);
        endLog();
        return securityAssessment;
      }

      // Fallback to enhanced analysis
      const fallbackResult = this.generateSecurityFallback(securityData);
      endLog();
      return fallbackResult;

    } catch (error) {
      endLog();
      
      // Final fallback with error handling
      const result = await AIErrorHandler.handleError(
        error as Error,
        async () => this.generateSecurityFallback(securityData),
        { fallbackEnabled: true, notifyUser: false }
      );
      
      return result || this.generateSecurityFallback(securityData);
    }
  }

  /**
   * Generate general AI insights for any data
   */
  async generateInsights(
    data: any,
    analysisContext: string,
    context?: AIRequestContext
  ): Promise<AIAnalysisResponse> {
    const operation = `General Insights - ${analysisContext}`;
    const endLog = aiLogger.startOperation(operation, context);

    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // Try AI analysis first
      const aiResult = await this.performAIAnalysis(
        data,
        'general',
        { ...context, analysisType: 'general' }
      );

      if (aiResult) {
        const insights = this.transformToGeneralInsights(aiResult, data);
        endLog();
        return insights;
      }

      // Fallback to basic analysis
      const fallbackResult = this.generateGeneralFallback(data, analysisContext);
      endLog();
      return fallbackResult;

    } catch (error) {
      endLog();
      
      if (this.fallbackEnabled) {
        aiLogger.warn('AI insights generation failed, using fallback', error as Error, context);
        return this.generateGeneralFallback(data, analysisContext);
      }
      
      throw error;
    }
  }

  /**
   * Perform AI analysis using Gemini client
   */
  private async performAIAnalysis(
    data: any,
    analysisType: 'fraud' | 'credit' | 'security' | 'general',
    context?: AIRequestContext
  ): Promise<any> {
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(data, analysisType);
      if (this.analysisCache.has(cacheKey)) {
        aiLogger.info('Using cached AI analysis result', context);
        return this.analysisCache.get(cacheKey);
      }

      // Perform AI analysis
      const result = await geminiClient.analyzeWithContext(
        data,
        analysisType,
        context
      );

      // Cache the result
      this.analysisCache.set(cacheKey, result);
      
      // Clean cache if it gets too large
      if (this.analysisCache.size > 100) {
        const firstKey = this.analysisCache.keys().next().value;
        this.analysisCache.delete(firstKey);
      }

      return result;
    } catch (error) {
      aiLogger.error(`AI analysis failed for ${analysisType}`, error as Error, context);
      return null;
    }
  }

  /**
   * Transform AI response to fraud analysis
   */
  private transformToFraudAnalysis(aiResult: any, transactionData: any): FraudAnalysis {
    try {
      // Parse AI response to extract fraud-specific data
      const content = aiResult.content.toLowerCase();
      
      // Extract fraud probability
      const fraudProbMatch = content.match(/fraud probability[:\s]*(\d+)%?/i);
      const fraudProbability = fraudProbMatch ? parseInt(fraudProbMatch[1]) : 25;

      // Extract risk level
      const riskMatch = content.match(/risk level[:\s]*(low|medium|high|critical)/i);
      const riskLevel = riskMatch ? riskMatch[1].toLowerCase() as any : 'medium';

      // Extract suspicious patterns
      const suspiciousPatterns = this.extractListItems(content, 'suspicious patterns', 'patterns identified');

      // Extract prevention actions
      const preventionActions = this.extractListItems(content, 'recommendations', 'prevention');

      return {
        confidence: aiResult.confidence || 85,
        reasoning: this.extractReasoning(content),
        recommendations: preventionActions,
        riskLevel,
        factors: this.extractFactors(content),
        timestamp: new Date(),
        fraudProbability,
        suspiciousPatterns,
        preventionActions,
      };
    } catch (error) {
      aiLogger.error('Failed to transform AI result to fraud analysis', error as Error);
      return this.generateFraudFallback(transactionData);
    }
  }

  /**
   * Transform AI response to credit enhancement
   */
  private transformToCreditEnhancement(aiResult: any, creditData: any): CreditEnhancement {
    try {
      const content = aiResult.content.toLowerCase();
      
      // Extract enhanced score
      const scoreMatch = content.match(/enhanced credit score[:\s]*(\d+)/i) || 
                        content.match(/credit score[:\s]*(\d+)/i);
      const enhancedScore = scoreMatch ? parseInt(scoreMatch[1]) : 650;

      // Extract risk level
      const riskMatch = content.match(/risk assessment[:\s]*(low|medium|high|critical)/i);
      const riskLevel = riskMatch ? riskMatch[1].toLowerCase() as any : 'medium';

      // Extract lending recommendation
      const lendingMatch = content.match(/lending recommendation[:\s]*([^\n]+)/i);
      const lendingRecommendation = lendingMatch ? lendingMatch[1].trim() : 'Standard lending terms recommended';

      return {
        confidence: aiResult.confidence || 85,
        reasoning: this.extractReasoning(content),
        recommendations: this.extractListItems(content, 'recommendations', 'suggestions'),
        riskLevel,
        factors: this.extractFactors(content),
        timestamp: new Date(),
        enhancedScore,
        scoreFactors: this.extractCreditFactors(content),
        lendingRecommendation,
      };
    } catch (error) {
      aiLogger.error('Failed to transform AI result to credit enhancement', error as Error);
      return this.generateCreditFallback(creditData);
    }
  }

  /**
   * Transform AI response to security assessment
   */
  private transformToSecurityAssessment(aiResult: any, securityData: any): SecurityAssessment {
    try {
      const content = aiResult.content.toLowerCase();
      
      // Extract threat level
      const threatMatch = content.match(/threat level[:\s]*(\d+)%?/i);
      const threatLevel = threatMatch ? parseInt(threatMatch[1]) : 30;

      // Extract risk level
      const riskMatch = content.match(/risk assessment[:\s]*(low|medium|high|critical)/i);
      const riskLevel = riskMatch ? riskMatch[1].toLowerCase() as any : 'medium';

      // Extract vulnerabilities
      const vulnerabilities = this.extractListItems(content, 'vulnerabilities', 'identified vulnerabilities');

      // Extract mitigation steps
      const mitigationSteps = this.extractListItems(content, 'mitigation', 'recommendations');

      return {
        confidence: aiResult.confidence || 85,
        reasoning: this.extractReasoning(content),
        recommendations: mitigationSteps,
        riskLevel,
        factors: this.extractFactors(content),
        timestamp: new Date(),
        threatLevel,
        vulnerabilities,
        mitigationSteps,
      };
    } catch (error) {
      aiLogger.error('Failed to transform AI result to security assessment', error as Error);
      return this.generateSecurityFallback(securityData);
    }
  }

  /**
   * Transform AI response to general insights
   */
  private transformToGeneralInsights(aiResult: any, data: any): AIAnalysisResponse {
    try {
      const content = aiResult.content.toLowerCase();
      
      // Extract risk level
      const riskMatch = content.match(/risk assessment[:\s]*(low|medium|high|critical)/i);
      const riskLevel = riskMatch ? riskMatch[1].toLowerCase() as any : 'medium';

      return {
        confidence: aiResult.confidence || 80,
        reasoning: this.extractReasoning(content),
        recommendations: this.extractListItems(content, 'recommendations', 'suggestions'),
        riskLevel,
        factors: this.extractFactors(content),
        timestamp: new Date(),
      };
    } catch (error) {
      aiLogger.error('Failed to transform AI result to general insights', error as Error);
      return this.generateGeneralFallback(data, 'general');
    }
  }

  // Helper methods for parsing AI responses
  private extractReasoning(content: string): string {
    const reasoningMatch = content.match(/reasoning[:\s]*([^0-9]+?)(?=\n|$)/i);
    return reasoningMatch ? reasoningMatch[1].trim() : 'Analysis completed based on provided data patterns';
  }

  private extractListItems(content: string, ...keywords: string[]): string[] {
    const items: string[] = [];
    
    for (const keyword of keywords) {
      const regex = new RegExp(`${keyword}[:\\s]*([^\\n]+(?:\\n[^\\n]*)*?)(?=\\n\\n|\\d+\\.|$)`, 'i');
      const match = content.match(regex);
      
      if (match) {
        const text = match[1];
        const lines = text.split('\n')
          .map(line => line.replace(/^[-*•]\s*/, '').trim())
          .filter(line => {
            // Filter out empty lines, incomplete phrases, and malformed content
            return line.length > 3 && 
                   !line.endsWith(':') && 
                   !line.includes('for prevention:') &&
                   !line.includes('recommendations:') &&
                   !line.includes('suggestions:') &&
                   !line.includes('mitigation:') &&
                   line !== '•' &&
                   !line.match(/^[•\-\*]+$/); // Filter out lines that are just bullet points
          });
        items.push(...lines);
      }
    }
    
    return items.slice(0, 5); // Limit to 5 items
  }

  private extractFactors(content: string): Array<{ factor: string; impact: number; explanation: string }> {
    const factors = this.extractListItems(content, 'factors', 'key factors');
    
    return factors.map((factor, index) => ({
      factor: factor.substring(0, 50),
      impact: Math.max(10, Math.min(90, 50 + (index * 10))),
      explanation: factor,
    }));
  }

  private extractCreditFactors(content: string): Array<{ factor: string; impact: number; explanation: string }> {
    return this.extractFactors(content);
  }

  // Enhanced fallback methods using FallbackDataProvider
  private generateFraudFallback(transactionData: any): FraudAnalysis {
    return FallbackDataProvider.generateFraudAnalysis(transactionData);
  }

  private generateCreditFallback(creditData: any): CreditEnhancement {
    return FallbackDataProvider.generateCreditEnhancement(creditData);
  }

  private generateSecurityFallback(securityData: any): SecurityAssessment {
    return FallbackDataProvider.generateSecurityAssessment(securityData);
  }

  private generateGeneralFallback(data: any, context: string): AIAnalysisResponse {
    return FallbackDataProvider.generateGeneralInsights(data, context);
  }

  private generateCacheKey(data: any, analysisType: string): string {
    const dataHash = JSON.stringify(data).substring(0, 100);
    return `${analysisType}_${btoa(dataHash).substring(0, 20)}`;
  }

  /**
   * Get service status and health information
   */
  getStatus(): {
    initialized: boolean;
    aiAvailable: boolean;
    fallbackEnabled: boolean;
    cacheSize: number;
  } {
    const geminiStatus = geminiClient.getStatus();
    
    return {
      initialized: this.initialized,
      aiAvailable: geminiStatus.healthy,
      fallbackEnabled: this.fallbackEnabled,
      cacheSize: this.analysisCache.size,
    };
  }

  /**
   * Clear analysis cache
   */
  clearCache(): void {
    this.analysisCache.clear();
    aiLogger.info('AI Service cache cleared');
  }

  /**
   * Test the AI service functionality
   */
  async testService(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const testData = { test: true, timestamp: Date.now() };
      const result = await this.generateInsights(testData, 'service-test');
      
      return {
        success: true,
        message: 'AI Service test completed successfully',
        details: {
          confidence: result.confidence,
          hasRecommendations: result.recommendations.length > 0,
          riskLevel: result.riskLevel,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `AI Service test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}

// Export singleton instance
export const aiService = new AIService();