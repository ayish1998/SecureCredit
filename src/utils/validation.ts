import { 
  Transaction, 
  DeviceFingerprint, 
  TransactionSchema, 
  DeviceFingerprintSchema,
  TransactionType 
} from '../types/fraud-detection';

export class ValidationError extends Error {
  constructor(public field: string, public message: string) {
    super(`Validation error in ${field}: ${message}`);
    this.name = 'ValidationError';
  }
}

export class DataValidator {
  /**
   * Validate transaction data against schema
   */
  static validateTransaction(transaction: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    Object.entries(TransactionSchema).forEach(([field, rules]) => {
      const value = transaction[field];

      if (rules.required && (value === undefined || value === null)) {
        errors.push(`${field} is required`);
        return;
      }

      if (value !== undefined && value !== null) {
        // Type validation
        if (rules.type === 'string' && typeof value !== 'string') {
          errors.push(`${field} must be a string`);
        } else if (rules.type === 'number' && typeof value !== 'number') {
          errors.push(`${field} must be a number`);
        } else if (rules.type === 'date' && !(value instanceof Date) && !this.isValidDateString(value)) {
          errors.push(`${field} must be a valid date`);
        } else if (rules.type === 'object' && typeof value !== 'object') {
          errors.push(`${field} must be an object`);
        }

        // Additional validations
        if (rules.min !== undefined && typeof value === 'number' && value < rules.min) {
          errors.push(`${field} must be at least ${rules.min}`);
        }

        if (rules.length !== undefined && typeof value === 'string' && value.length !== rules.length) {
          errors.push(`${field} must be exactly ${rules.length} characters`);
        }

        if (rules.enum && !rules.enum.includes(value)) {
          errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
        }
      }
    });

    // Additional business logic validations
    if (transaction.amount !== undefined) {
      if (transaction.amount <= 0) {
        errors.push('Amount must be greater than 0');
      }
      if (transaction.amount > 1000000) {
        errors.push('Amount exceeds maximum limit');
      }
    }

    if (transaction.currency && !/^[A-Z]{3}$/.test(transaction.currency)) {
      errors.push('Currency must be a valid 3-letter ISO code');
    }

    if (transaction.userId && typeof transaction.userId === 'string') {
      if (transaction.userId.length < 3) {
        errors.push('User ID must be at least 3 characters');
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(transaction.userId)) {
        errors.push('User ID contains invalid characters');
      }
    }

    // Validate location if present
    if (transaction.location) {
      const locationErrors = this.validateLocation(transaction.location);
      errors.push(...locationErrors);
    }

    // Validate device info if present
    if (transaction.deviceInfo) {
      const deviceErrors = this.validateDeviceFingerprint(transaction.deviceInfo).errors;
      errors.push(...deviceErrors);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate device fingerprint data
   */
  static validateDeviceFingerprint(fingerprint: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    Object.entries(DeviceFingerprintSchema).forEach(([field, rules]) => {
      const value = fingerprint[field];

      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        return;
      }

      if (value !== undefined && value !== null) {
        if (rules.type === 'string' && typeof value !== 'string') {
          errors.push(`${field} must be a string`);
        }
      }
    });

    // Additional validations
    if (fingerprint.screenResolution && typeof fingerprint.screenResolution === 'string') {
      if (!/^\d+x\d+$/.test(fingerprint.screenResolution)) {
        errors.push('Screen resolution must be in format "widthxheight"');
      }
    }

    if (fingerprint.colorDepth !== undefined && typeof fingerprint.colorDepth === 'number') {
      if (![1, 4, 8, 15, 16, 24, 32].includes(fingerprint.colorDepth)) {
        errors.push('Color depth must be a valid value (1, 4, 8, 15, 16, 24, or 32)');
      }
    }

    if (fingerprint.timezone && typeof fingerprint.timezone === 'string') {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: fingerprint.timezone });
      } catch (error) {
        errors.push('Invalid timezone');
      }
    }

    if (fingerprint.language && typeof fingerprint.language === 'string') {
      if (!/^[a-z]{2}(-[A-Z]{2})?$/.test(fingerprint.language)) {
        errors.push('Language must be in format "en" or "en-US"');
      }
    }

    if (fingerprint.ipAddress && typeof fingerprint.ipAddress === 'string') {
      if (!this.isValidIP(fingerprint.ipAddress)) {
        errors.push('Invalid IP address format');
      }
    }

    if (fingerprint.deviceId && typeof fingerprint.deviceId === 'string') {
      if (fingerprint.deviceId.length < 10) {
        errors.push('Device ID is too short (minimum 10 characters)');
      }
      if (!/^[a-zA-Z0-9]+$/.test(fingerprint.deviceId)) {
        errors.push('Device ID contains invalid characters');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate geographic location
   */
  private static validateLocation(location: any): string[] {
    const errors: string[] = [];

    if (typeof location !== 'object' || location === null) {
      errors.push('Location must be an object');
      return errors;
    }

    if (typeof location.latitude !== 'number') {
      errors.push('Latitude must be a number');
    } else if (location.latitude < -90 || location.latitude > 90) {
      errors.push('Latitude must be between -90 and 90');
    }

    if (typeof location.longitude !== 'number') {
      errors.push('Longitude must be a number');
    } else if (location.longitude < -180 || location.longitude > 180) {
      errors.push('Longitude must be between -180 and 180');
    }

    if (location.country && typeof location.country !== 'string') {
      errors.push('Country must be a string');
    }

    if (location.city && typeof location.city !== 'string') {
      errors.push('City must be a string');
    }

    if (location.timezone && typeof location.timezone !== 'string') {
      errors.push('Timezone must be a string');
    }

    return errors;
  }

  /**
   * Check if string is a valid date
   */
  private static isValidDateString(value: any): boolean {
    if (typeof value !== 'string') return false;
    const date = new Date(value);
    return !isNaN(date.getTime());
  }

  /**
   * Validate IP address format
   */
  private static isValidIP(ip: string): boolean {
    // IPv4 validation
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    // IPv6 validation (simplified)
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip) || ip === 'unknown';
  }

  /**
   * Sanitize transaction data
   */
  static sanitizeTransaction(transaction: any): Transaction {
    const sanitized = { ...transaction };

    // Sanitize string fields
    if (typeof sanitized.id === 'string') {
      sanitized.id = sanitized.id.trim().substring(0, 100);
    }

    if (typeof sanitized.userId === 'string') {
      sanitized.userId = sanitized.userId.trim().substring(0, 100);
    }

    if (typeof sanitized.currency === 'string') {
      sanitized.currency = sanitized.currency.toUpperCase().trim();
    }

    if (typeof sanitized.description === 'string') {
      sanitized.description = sanitized.description.trim().substring(0, 500);
    }

    // Sanitize numeric fields
    if (typeof sanitized.amount === 'number') {
      sanitized.amount = Math.round(sanitized.amount * 100) / 100; // Round to 2 decimal places
      sanitized.amount = Math.max(0, sanitized.amount); // Ensure non-negative
    }

    // Ensure timestamp is a Date object
    if (sanitized.timestamp && !(sanitized.timestamp instanceof Date)) {
      sanitized.timestamp = new Date(sanitized.timestamp);
    }

    // Validate and sanitize transaction type
    if (sanitized.transactionType && !Object.values(TransactionType).includes(sanitized.transactionType)) {
      sanitized.transactionType = TransactionType.TRANSFER; // Default fallback
    }

    return sanitized;
  }

  /**
   * Sanitize device fingerprint data
   */
  static sanitizeDeviceFingerprint(fingerprint: any): DeviceFingerprint {
    const sanitized = { ...fingerprint };

    // Sanitize string fields
    const stringFields = ['deviceId', 'userAgent', 'screenResolution', 'timezone', 'language', 'platform'];
    stringFields.forEach(field => {
      if (typeof sanitized[field] === 'string') {
        sanitized[field] = sanitized[field].trim().substring(0, 500);
      }
    });

    // Sanitize arrays
    if (Array.isArray(sanitized.languages)) {
      sanitized.languages = sanitized.languages.filter(lang => typeof lang === 'string').slice(0, 10);
    }

    if (Array.isArray(sanitized.fonts)) {
      sanitized.fonts = sanitized.fonts.filter(font => typeof font === 'string').slice(0, 50);
    }

    if (Array.isArray(sanitized.plugins)) {
      sanitized.plugins = sanitized.plugins.filter(plugin => typeof plugin === 'string').slice(0, 20);
    }

    // Sanitize numeric fields
    if (typeof sanitized.colorDepth === 'number') {
      sanitized.colorDepth = Math.max(1, Math.min(32, sanitized.colorDepth));
    }

    if (typeof sanitized.hardwareConcurrency === 'number') {
      sanitized.hardwareConcurrency = Math.max(0, Math.min(64, sanitized.hardwareConcurrency));
    }

    if (typeof sanitized.maxTouchPoints === 'number') {
      sanitized.maxTouchPoints = Math.max(0, Math.min(10, sanitized.maxTouchPoints));
    }

    return sanitized;
  }
}

export default DataValidator;