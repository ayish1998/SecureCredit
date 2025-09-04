import { ValidationError } from '../types/ai';

/**
 * Validation utilities for AI service requests and responses
 */

export interface ValidationRule<T> {
  field: keyof T;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export class AIValidator {
  /**
   * Validate an object against a set of rules
   */
  static validate<T extends Record<string, any>>(
    data: T,
    rules: ValidationRule<T>[],
    context?: string
  ): void {
    const errors: string[] = [];

    for (const rule of rules) {
      const value = data[rule.field];
      const fieldName = String(rule.field);
      
      try {
        this.validateField(value, rule, fieldName);
      } catch (error) {
        if (error instanceof ValidationError) {
          errors.push(error.message);
        }
      }
    }

    if (errors.length > 0) {
      const contextStr = context ? `${context}: ` : '';
      throw new ValidationError(`${contextStr}${errors.join(', ')}`);
    }
  }

  /**
   * Validate a single field against a rule
   */
  private static validateField<T>(
    value: any,
    rule: ValidationRule<T>,
    fieldName: string
  ): void {
    // Check required fields
    if (rule.required && (value === undefined || value === null || value === '')) {
      throw new ValidationError(`${fieldName} is required`);
    }

    // Skip further validation if field is not required and empty
    if (!rule.required && (value === undefined || value === null)) {
      return;
    }

    // Type validation
    if (rule.type && !this.validateType(value, rule.type)) {
      throw new ValidationError(`${fieldName} must be of type ${rule.type}`);
    }

    // String validations
    if (rule.type === 'string' && typeof value === 'string') {
      if (rule.minLength !== undefined && value.length < rule.minLength) {
        throw new ValidationError(`${fieldName} must be at least ${rule.minLength} characters`);
      }
      
      if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        throw new ValidationError(`${fieldName} must not exceed ${rule.maxLength} characters`);
      }
      
      if (rule.pattern && !rule.pattern.test(value)) {
        throw new ValidationError(`${fieldName} format is invalid`);
      }
    }

    // Number validations
    if (rule.type === 'number' && typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        throw new ValidationError(`${fieldName} must be at least ${rule.min}`);
      }
      
      if (rule.max !== undefined && value > rule.max) {
        throw new ValidationError(`${fieldName} must not exceed ${rule.max}`);
      }
    }

    // Array validations
    if (rule.type === 'array' && Array.isArray(value)) {
      if (rule.minLength !== undefined && value.length < rule.minLength) {
        throw new ValidationError(`${fieldName} must have at least ${rule.minLength} items`);
      }
      
      if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        throw new ValidationError(`${fieldName} must not have more than ${rule.maxLength} items`);
      }
    }

    // Custom validation
    if (rule.custom) {
      const result = rule.custom(value);
      if (result !== true) {
        const message = typeof result === 'string' ? result : `${fieldName} is invalid`;
        throw new ValidationError(message);
      }
    }
  }

  /**
   * Validate the type of a value
   */
  private static validateType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'array':
        return Array.isArray(value);
      default:
        return false;
    }
  }

  /**
   * Sanitize input data to prevent injection attacks
   */
  static sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/<<script>.*?<\/script>/gi, '') // Remove nested script attempts
        .replace(/javascript:/gi, '') // Remove javascript: protocols
        .replace(/data:text\/html/gi, '') // Remove data URLs
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .replace(/['";].*DROP\s+TABLE.*[';]/gi, '') // Remove SQL DROP statements
        .replace(/['";].*DELETE\s+FROM.*[';]/gi, '') // Remove SQL DELETE statements
        .replace(/['"]--/gi, '') // Remove SQL comment indicators
        .replace(/<[^>]*>/g, '') // Remove all HTML tags
        .replace(/alert\s*\(/gi, '') // Remove alert calls
        .trim();
    }

    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item));
    }

    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }

    return input;
  }

  /**
   * Validate AI prompt content
   */
  static validatePrompt(prompt: string): void {
    // Handle null, undefined, or empty strings
    if (prompt === null || prompt === undefined || prompt === '' || (typeof prompt === 'string' && prompt.trim() === '')) {
      throw new ValidationError('Prompt cannot be empty');
    }

    // Check if it's a string
    if (typeof prompt !== 'string') {
      throw new ValidationError('Prompt must be a string');
    }

    // Check length limits
    if (prompt.length > 10000) {
      throw new ValidationError('Prompt exceeds maximum length of 10000 characters');
    }

    // Check for potentially harmful content
    const harmfulPatterns = [
      /ignore\s+previous\s+instructions/i,
      /forget\s+everything/i,
      /system\s+prompt/i,
      /jailbreak/i,
      /DROP\s+TABLE/i,
      /<script/i,
      /DELETE\s+FROM/i,
      /System:\s+Override/i
    ];

    for (const pattern of harmfulPatterns) {
      if (pattern.test(prompt)) {
        throw new ValidationError('Prompt contains potentially harmful content');
      }
    }
  }

  /**
   * Validate AI response content
   */
  static validateResponse(response: any): void {
    if (!response || typeof response !== 'object') {
      throw new ValidationError('Response must be an object');
    }

    // Check required content field
    if (!response.content || typeof response.content !== 'string' || response.content.trim() === '') {
      throw new ValidationError('Response must have non-empty content');
    }

    // Check required confidence field
    if (response.confidence === undefined || response.confidence === null) {
      throw new ValidationError('Response must have confidence score');
    }

    if (typeof response.confidence !== 'number' || response.confidence < 0 || response.confidence > 100) {
      throw new ValidationError('Confidence must be a number between 0 and 100');
    }

    // Validate usage information if present
    if (response.usage) {
      if (typeof response.usage !== 'object') {
        throw new ValidationError('Usage must be an object');
      }

      const { promptTokens, completionTokens, totalTokens } = response.usage;
      
      if (promptTokens !== undefined && (typeof promptTokens !== 'number' || promptTokens < 0)) {
        throw new ValidationError('promptTokens must be a non-negative number');
      }
      
      if (completionTokens !== undefined && (typeof completionTokens !== 'number' || completionTokens < 0)) {
        throw new ValidationError('completionTokens must be a non-negative number');
      }
      
      if (totalTokens !== undefined && (typeof totalTokens !== 'number' || totalTokens < 0)) {
        throw new ValidationError('totalTokens must be a non-negative number');
      }
    }
  }

  /**
   * Validate transaction data for fraud analysis
   */
  static validateTransactionData(data: any): void {
    const rules: ValidationRule<any>[] = [
      {
        field: 'amount',
        required: true,
        type: 'number',
        min: 0,
      },
      {
        field: 'currency',
        required: false,
        type: 'string',
        minLength: 3,
        maxLength: 3,
      },
      {
        field: 'timestamp',
        required: false,
        custom: (value: any) => {
          if (value && !(value instanceof Date) && isNaN(Date.parse(value))) {
            return 'Invalid timestamp format';
          }
          return true;
        },
      },
    ];

    this.validate(data, rules, 'Transaction data validation');
  }

  /**
   * Validate credit data for scoring analysis
   */
  static validateCreditData(data: any): void {
    const rules: ValidationRule<any>[] = [
      {
        field: 'income',
        required: false,
        type: 'number',
        min: 0,
      },
      {
        field: 'expenses',
        required: false,
        type: 'number',
        min: 0,
      },
      {
        field: 'creditHistory',
        required: false,
        type: 'array',
      },
    ];

    this.validate(data, rules, 'Credit data validation');
  }

  /**
   * Validate security data for threat analysis
   */
  static validateSecurityData(data: any): void {
    const rules: ValidationRule<any>[] = [
      {
        field: 'deviceId',
        required: false,
        type: 'string',
        minLength: 1,
        maxLength: 100,
      },
      {
        field: 'ipAddress',
        required: false,
        type: 'string',
        pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
      },
      {
        field: 'userAgent',
        required: false,
        type: 'string',
        maxLength: 500,
      },
    ];

    this.validate(data, rules, 'Security data validation');
  }
}

// Export convenience functions
export const validatePrompt = (prompt: string) => AIValidator.validatePrompt(prompt);
export const validateResponse = (response: any) => AIValidator.validateResponse(response);
export const sanitizeInput = (input: any) => AIValidator.sanitizeInput(input);
export const validateTransactionData = (data: any) => AIValidator.validateTransactionData(data);
export const validateCreditData = (data: any) => AIValidator.validateCreditData(data);
export const validateSecurityData = (data: any) => AIValidator.validateSecurityData(data);