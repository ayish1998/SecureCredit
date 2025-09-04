import { aiLogger } from './aiLogger';

/**
 * Utility functions for transforming data for AI analysis
 */

export interface TransactionDataForAI {
  amount: number;
  currency: string;
  timestamp: string;
  merchantType?: string;
  location?: string;
  deviceInfo?: any;
  userProfile?: any;
  riskFactors?: string[];
}

export interface CreditDataForAI {
  creditScore?: number;
  income?: number;
  employmentStatus?: string;
  creditHistory?: any[];
  existingDebts?: number;
  paymentHistory?: any[];
  demographics?: any;
}

export interface SecurityDataForAI {
  deviceFingerprint?: string;
  loginPatterns?: any[];
  locationHistory?: any[];
  behaviorMetrics?: any;
  securityEvents?: any[];
  riskIndicators?: string[];
}

/**
 * Transform transaction data for AI fraud analysis
 */
export function transformTransactionForAI(transactionData: any): TransactionDataForAI {
  try {
    return {
      amount: parseFloat(transactionData.amount) || 0,
      currency: transactionData.currency || 'USD',
      timestamp: transactionData.timestamp || new Date().toISOString(),
      merchantType: transactionData.merchantType || transactionData.category,
      location: transactionData.location || transactionData.city,
      deviceInfo: sanitizeDeviceInfo(transactionData.deviceInfo),
      userProfile: sanitizeUserProfile(transactionData.userProfile),
      riskFactors: extractRiskFactors(transactionData),
    };
  } catch (error) {
    aiLogger.error('Failed to transform transaction data for AI', error as Error);
    return {
      amount: 0,
      currency: 'USD',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Transform credit data for AI analysis
 */
export function transformCreditForAI(creditData: any): CreditDataForAI {
  try {
    return {
      creditScore: parseInt(creditData.creditScore) || undefined,
      income: parseFloat(creditData.income) || undefined,
      employmentStatus: creditData.employmentStatus || creditData.employment?.status,
      creditHistory: sanitizeCreditHistory(creditData.creditHistory),
      existingDebts: parseFloat(creditData.totalDebt) || parseFloat(creditData.existingDebts) || 0,
      paymentHistory: sanitizePaymentHistory(creditData.paymentHistory),
      demographics: sanitizeDemographics(creditData.demographics),
    };
  } catch (error) {
    aiLogger.error('Failed to transform credit data for AI', error as Error);
    return {
      creditScore: undefined,
      income: undefined,
      existingDebts: 0,
    };
  }
}

/**
 * Transform security data for AI analysis
 */
export function transformSecurityForAI(securityData: any): SecurityDataForAI {
  try {
    return {
      deviceFingerprint: securityData.deviceFingerprint || securityData.deviceId,
      loginPatterns: sanitizeLoginPatterns(securityData.loginHistory),
      locationHistory: sanitizeLocationHistory(securityData.locationHistory),
      behaviorMetrics: sanitizeBehaviorMetrics(securityData.behaviorMetrics),
      securityEvents: sanitizeSecurityEvents(securityData.securityEvents),
      riskIndicators: extractSecurityRiskIndicators(securityData),
    };
  } catch (error) {
    aiLogger.error('Failed to transform security data for AI', error as Error);
    return {
      deviceFingerprint: undefined,
      riskIndicators: [],
    };
  }
}

/**
 * Sanitize device information for AI analysis
 */
function sanitizeDeviceInfo(deviceInfo: any): any {
  if (!deviceInfo) return undefined;
  
  return {
    type: deviceInfo.type || deviceInfo.deviceType,
    os: deviceInfo.os || deviceInfo.operatingSystem,
    browser: deviceInfo.browser,
    isNewDevice: deviceInfo.isNewDevice || false,
    trustScore: parseFloat(deviceInfo.trustScore) || undefined,
  };
}

/**
 * Sanitize user profile for AI analysis
 */
function sanitizeUserProfile(userProfile: any): any {
  if (!userProfile) return undefined;
  
  return {
    accountAge: userProfile.accountAge || calculateAccountAge(userProfile.createdAt),
    transactionCount: parseInt(userProfile.transactionCount) || 0,
    averageTransactionAmount: parseFloat(userProfile.averageTransactionAmount) || 0,
    riskLevel: userProfile.riskLevel || 'medium',
    verificationStatus: userProfile.verificationStatus || 'unverified',
  };
}

/**
 * Extract risk factors from transaction data
 */
function extractRiskFactors(data: any): string[] {
  const factors: string[] = [];
  
  if (data.amount && parseFloat(data.amount) > 10000) {
    factors.push('high_amount');
  }
  
  if (data.isNewDevice) {
    factors.push('new_device');
  }
  
  if (data.location && data.userProfile?.usualLocation && 
      data.location !== data.userProfile.usualLocation) {
    factors.push('unusual_location');
  }
  
  if (data.timestamp) {
    const hour = new Date(data.timestamp).getHours();
    if (hour < 6 || hour > 22) {
      factors.push('unusual_time');
    }
  }
  
  return factors;
}

/**
 * Sanitize credit history for AI analysis
 */
function sanitizeCreditHistory(creditHistory: any[]): any[] {
  if (!Array.isArray(creditHistory)) return [];
  
  return creditHistory.map(item => ({
    type: item.type || item.accountType,
    status: item.status,
    balance: parseFloat(item.balance) || 0,
    limit: parseFloat(item.limit) || undefined,
    openDate: item.openDate || item.dateOpened,
    lastActivity: item.lastActivity || item.lastPayment,
  })).slice(0, 10); // Limit to 10 most recent items
}

/**
 * Sanitize payment history for AI analysis
 */
function sanitizePaymentHistory(paymentHistory: any[]): any[] {
  if (!Array.isArray(paymentHistory)) return [];
  
  return paymentHistory.map(payment => ({
    amount: parseFloat(payment.amount) || 0,
    date: payment.date || payment.paymentDate,
    status: payment.status || 'completed',
    method: payment.method || payment.paymentMethod,
    onTime: payment.onTime !== false,
  })).slice(0, 20); // Limit to 20 most recent payments
}

/**
 * Sanitize demographics for AI analysis
 */
function sanitizeDemographics(demographics: any): any {
  if (!demographics) return undefined;
  
  return {
    ageRange: demographics.ageRange || getAgeRange(demographics.age),
    region: demographics.region || demographics.country,
    employmentSector: demographics.employmentSector || demographics.industry,
    educationLevel: demographics.educationLevel,
    householdSize: parseInt(demographics.householdSize) || undefined,
  };
}

/**
 * Sanitize login patterns for AI analysis
 */
function sanitizeLoginPatterns(loginHistory: any[]): any[] {
  if (!Array.isArray(loginHistory)) return [];
  
  return loginHistory.map(login => ({
    timestamp: login.timestamp || login.loginTime,
    location: login.location || login.city,
    device: login.device || login.deviceType,
    success: login.success !== false,
    ipAddress: login.ipAddress ? hashIP(login.ipAddress) : undefined, // Hash IP for privacy
  })).slice(0, 50); // Limit to 50 most recent logins
}

/**
 * Sanitize location history for AI analysis
 */
function sanitizeLocationHistory(locationHistory: any[]): any[] {
  if (!Array.isArray(locationHistory)) return [];
  
  return locationHistory.map(location => ({
    city: location.city,
    country: location.country,
    timestamp: location.timestamp,
    frequency: parseInt(location.frequency) || 1,
  })).slice(0, 20); // Limit to 20 most frequent locations
}

/**
 * Sanitize behavior metrics for AI analysis
 */
function sanitizeBehaviorMetrics(behaviorMetrics: any): any {
  if (!behaviorMetrics) return undefined;
  
  return {
    sessionDuration: parseFloat(behaviorMetrics.averageSessionDuration) || 0,
    clickPatterns: behaviorMetrics.clickPatterns || [],
    navigationPatterns: behaviorMetrics.navigationPatterns || [],
    typingSpeed: parseFloat(behaviorMetrics.typingSpeed) || undefined,
    mouseMovements: behaviorMetrics.mouseMovements || undefined,
  };
}

/**
 * Sanitize security events for AI analysis
 */
function sanitizeSecurityEvents(securityEvents: any[]): any[] {
  if (!Array.isArray(securityEvents)) return [];
  
  return securityEvents.map(event => ({
    type: event.type || event.eventType,
    severity: event.severity || 'medium',
    timestamp: event.timestamp,
    resolved: event.resolved || false,
    description: event.description?.substring(0, 200), // Limit description length
  })).slice(0, 30); // Limit to 30 most recent events
}

/**
 * Extract security risk indicators
 */
function extractSecurityRiskIndicators(data: any): string[] {
  const indicators: string[] = [];
  
  if (data.failedLoginAttempts && data.failedLoginAttempts > 3) {
    indicators.push('multiple_failed_logins');
  }
  
  if (data.newDevice) {
    indicators.push('new_device_login');
  }
  
  if (data.vpnDetected) {
    indicators.push('vpn_usage');
  }
  
  if (data.suspiciousActivity) {
    indicators.push('suspicious_activity');
  }
  
  if (data.locationMismatch) {
    indicators.push('location_mismatch');
  }
  
  return indicators;
}

/**
 * Helper function to calculate account age in days
 */
function calculateAccountAge(createdAt: string | Date): number {
  if (!createdAt) return 0;
  
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Helper function to get age range from specific age
 */
function getAgeRange(age: number): string {
  if (!age) return 'unknown';
  
  if (age < 25) return '18-24';
  if (age < 35) return '25-34';
  if (age < 45) return '35-44';
  if (age < 55) return '45-54';
  if (age < 65) return '55-64';
  return '65+';
}

/**
 * Helper function to hash IP addresses for privacy
 */
function hashIP(ip: string): string {
  // Simple hash function for IP addresses
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Validate transformed data before sending to AI
 */
export function validateTransformedData(data: any, type: 'transaction' | 'credit' | 'security'): boolean {
  try {
    switch (type) {
      case 'transaction':
        return data.amount !== undefined && data.currency !== undefined;
      case 'credit':
        return data.creditScore !== undefined || data.income !== undefined;
      case 'security':
        return data.deviceFingerprint !== undefined || (data.riskIndicators && data.riskIndicators.length > 0);
      default:
        return false;
    }
  } catch (error) {
    aiLogger.error(`Failed to validate ${type} data`, error as Error);
    return false;
  }
}

/**
 * Get data summary for logging purposes
 */
export function getDataSummary(data: any, type: string): string {
  try {
    const keys = Object.keys(data).length;
    const hasData = keys > 0;
    return `${type} data: ${keys} fields, ${hasData ? 'valid' : 'empty'}`;
  } catch {
    return `${type} data: invalid format`;
  }
}