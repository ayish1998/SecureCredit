/**
 * Data transformation utilities for AI service integration
 */

export interface TransactionDataInput {
  amount: number;
  currency?: string;
  timestamp?: string | Date;
  location?: string;
  deviceId?: string;
  userId?: string;
  merchantId?: string;
  paymentMethod?: string;
  description?: string;
}

export interface CreditDataInput {
  income?: number;
  expenses?: number;
  creditHistory?: string[];
  employmentStatus?: string;
  age?: number;
  educationLevel?: string;
  bankingHistory?: number;
  mobileMoneyUsage?: number;
  collateral?: boolean;
  guarantor?: boolean;
}

export interface SecurityDataInput {
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
  loginAttempts?: number;
  location?: string;
  timestamp?: string | Date;
  sessionDuration?: number;
  previousLogins?: Array<{ timestamp: Date; location: string; success: boolean }>;
  deviceFingerprint?: Record<string, any>;
}

export class AIDataTransformer {
  static transformTransactionData(input: TransactionDataInput): any {
    return {
      amount: input.amount,
      currency: input.currency || 'NGN',
      timestamp: input.timestamp ? new Date(input.timestamp).toISOString() : new Date().toISOString(),
      location: input.location || 'Unknown',
      deviceId: input.deviceId || 'unknown_device',
      userId: input.userId || 'anonymous',
      merchantId: input.merchantId,
      paymentMethod: input.paymentMethod || 'mobile_money',
      description: input.description || 'Transaction',
      isHighValue: input.amount > 100000,
      isOffHours: !this.isBusinessHours(input.timestamp),
    };
  }

  static transformCreditData(input: CreditDataInput): any {
    return {
      monthlyIncome: input.income || 0,
      monthlyExpenses: input.expenses || 0,
      netIncome: (input.income || 0) - (input.expenses || 0),
      creditHistory: input.creditHistory || [],
      employmentStatus: input.employmentStatus || 'unknown',
      age: input.age || 0,
      educationLevel: input.educationLevel || 'unknown',
      bankingHistoryMonths: input.bankingHistory || 0,
      hasCollateral: input.collateral || false,
      hasGuarantor: input.guarantor || false,
      isEmployed: input.employmentStatus === 'employed',
      hasStableIncome: (input.income || 0) > 50000,
    };
  }

  static transformSecurityData(input: SecurityDataInput): any {
    return {
      deviceId: input.deviceId || 'unknown_device',
      ipAddress: input.ipAddress || '0.0.0.0',
      userAgent: input.userAgent || 'unknown',
      loginAttempts: input.loginAttempts || 1,
      location: input.location || 'Unknown',
      timestamp: input.timestamp ? new Date(input.timestamp).toISOString() : new Date().toISOString(),
      sessionDuration: input.sessionDuration || 0,
      isNewDevice: !input.deviceId || input.deviceId === 'unknown_device',
      hasMultipleFailedAttempts: (input.loginAttempts || 0) > 3,
    };
  }

  private static isBusinessHours(timestamp?: string | Date): boolean {
    const date = timestamp ? new Date(timestamp) : new Date();
    const hour = date.getHours();
    const day = date.getDay();
    return day >= 1 && day <= 5 && hour >= 8 && hour < 18;
  }
}