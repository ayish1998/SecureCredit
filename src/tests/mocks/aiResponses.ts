import { 
  FraudAnalysis, 
  CreditEnhancement, 
  SecurityAssessment,
  AIAnalysisResponse 
} from '../../types/ai';

/**
 * Mock AI responses for consistent testing
 */
export const mockAIResponses = {
  fraud: {
    lowRisk: {
      confidence: 85,
      reasoning: "Transaction patterns appear normal with consistent user behavior and standard transaction amounts.",
      recommendations: [
        "Continue monitoring for unusual patterns",
        "Maintain current security protocols"
      ],
      riskLevel: 'low' as const,
      factors: [
        {
          factor: "Transaction Amount",
          impact: 15,
          explanation: "Amount is within normal range for this user"
        },
        {
          factor: "Location Consistency",
          impact: 25,
          explanation: "Transaction location matches user's typical patterns"
        },
        {
          factor: "Device Recognition",
          impact: 30,
          explanation: "Transaction from recognized device"
        }
      ],
      timestamp: new Date('2024-01-15T10:30:00Z'),
      fraudProbability: 12,
      suspiciousPatterns: [],
      preventionActions: [
        "Continue standard monitoring",
        "No additional verification required"
      ]
    } as FraudAnalysis,

    highRisk: {
      confidence: 92,
      reasoning: "Multiple suspicious indicators detected including unusual transaction patterns, new device, and location anomalies.",
      recommendations: [
        "Immediately flag transaction for manual review",
        "Require additional authentication",
        "Contact customer for verification"
      ],
      riskLevel: 'critical' as const,
      factors: [
        {
          factor: "Transaction Velocity",
          impact: 85,
          explanation: "Unusually high number of transactions in short time period"
        },
        {
          factor: "Geographic Anomaly",
          impact: 70,
          explanation: "Transaction from location 500km from usual area"
        },
        {
          factor: "Device Fingerprint",
          impact: 60,
          explanation: "New device with suspicious characteristics"
        }
      ],
      timestamp: new Date('2024-01-15T14:45:00Z'),
      fraudProbability: 87,
      suspiciousPatterns: [
        "Rapid successive transactions",
        "New device registration",
        "Geographic inconsistency",
        "Unusual transaction amounts"
      ],
      preventionActions: [
        "Block transaction pending verification",
        "Send SMS verification code",
        "Require additional documentation",
        "Flag account for enhanced monitoring"
      ]
    } as FraudAnalysis
  },

  credit: {
    excellent: {
      confidence: 88,
      reasoning: "Strong financial history with consistent payment patterns, low debt-to-income ratio, and diverse credit mix.",
      recommendations: [
        "Approve for premium credit products",
        "Offer competitive interest rates",
        "Consider credit limit increases"
      ],
      riskLevel: 'low' as const,
      factors: [
        {
          factor: "Payment History",
          impact: 90,
          explanation: "Perfect payment record over 24 months"
        },
        {
          factor: "Credit Utilization",
          impact: 85,
          explanation: "Consistently low utilization below 30%"
        }
      ],
      timestamp: new Date('2024-01-15T09:15:00Z'),
      enhancedScore: 785,
      scoreFactors: [
        {
          category: "Payment History",
          score: 95,
          weight: 35,
          explanation: "Excellent payment track record"
        },
        {
          category: "Credit Utilization",
          score: 88,
          weight: 30,
          explanation: "Low utilization demonstrates good credit management"
        },
        {
          category: "Length of Credit History",
          score: 75,
          weight: 15,
          explanation: "Moderate credit history length"
        },
        {
          category: "Credit Mix",
          score: 80,
          weight: 10,
          explanation: "Good variety of credit types"
        },
        {
          category: "New Credit",
          score: 85,
          weight: 10,
          explanation: "Responsible approach to new credit"
        }
      ],
      lendingRecommendation: "Highly recommended for approval with premium terms",
      improvementSuggestions: [
        "Continue maintaining low credit utilization",
        "Consider adding a mortgage to improve credit mix"
      ]
    } as CreditEnhancement,

    poor: {
      confidence: 91,
      reasoning: "Multiple negative indicators including recent missed payments, high utilization, and limited credit history.",
      recommendations: [
        "Require additional documentation",
        "Consider secured credit products",
        "Implement enhanced monitoring"
      ],
      riskLevel: 'high' as const,
      factors: [
        {
          factor: "Payment History",
          impact: 75,
          explanation: "Recent missed payments indicate financial stress"
        },
        {
          factor: "Credit Utilization",
          impact: 80,
          explanation: "High utilization suggests overextension"
        }
      ],
      timestamp: new Date('2024-01-15T11:20:00Z'),
      enhancedScore: 485,
      scoreFactors: [
        {
          category: "Payment History",
          score: 45,
          weight: 35,
          explanation: "Recent missed payments significantly impact score"
        },
        {
          category: "Credit Utilization",
          score: 25,
          weight: 30,
          explanation: "Very high utilization indicates financial stress"
        },
        {
          category: "Length of Credit History",
          score: 60,
          weight: 15,
          explanation: "Limited credit history"
        },
        {
          category: "Credit Mix",
          score: 50,
          weight: 10,
          explanation: "Limited variety of credit types"
        },
        {
          category: "New Credit",
          score: 40,
          weight: 10,
          explanation: "Recent credit inquiries indicate credit seeking"
        }
      ],
      lendingRecommendation: "High risk - consider alternative products or require collateral",
      improvementSuggestions: [
        "Focus on making all payments on time",
        "Reduce credit utilization below 30%",
        "Avoid applying for new credit",
        "Consider credit counseling services"
      ]
    } as CreditEnhancement
  },

  security: {
    secure: {
      confidence: 89,
      reasoning: "Device shows strong security characteristics with no suspicious indicators detected.",
      recommendations: [
        "Continue standard security monitoring",
        "Maintain current authentication levels"
      ],
      riskLevel: 'low' as const,
      factors: [
        {
          factor: "Device Integrity",
          impact: 20,
          explanation: "Device passes all integrity checks"
        },
        {
          factor: "Network Security",
          impact: 15,
          explanation: "Connection from secure network"
        },
        {
          factor: "Behavioral Patterns",
          impact: 25,
          explanation: "User behavior matches established patterns"
        }
      ],
      timestamp: new Date('2024-01-15T13:10:00Z'),
      threatLevel: 15,
      vulnerabilities: [],
      mitigationSteps: [
        "Continue regular security updates",
        "Maintain current monitoring protocols"
      ],
      deviceRiskScore: 18
    } as SecurityAssessment,

    compromised: {
      confidence: 94,
      reasoning: "Multiple security threats detected including potential malware, suspicious network activity, and device tampering indicators.",
      recommendations: [
        "Immediately require additional authentication",
        "Block high-risk transactions",
        "Recommend device security scan"
      ],
      riskLevel: 'critical' as const,
      factors: [
        {
          factor: "Malware Detection",
          impact: 90,
          explanation: "Potential malware signatures detected"
        },
        {
          factor: "Network Anomalies",
          impact: 75,
          explanation: "Suspicious network traffic patterns"
        },
        {
          factor: "Device Tampering",
          impact: 80,
          explanation: "Signs of device modification or rooting"
        }
      ],
      timestamp: new Date('2024-01-15T16:30:00Z'),
      threatLevel: 88,
      vulnerabilities: [
        "Potential malware infection",
        "Compromised network connection",
        "Device security bypass detected",
        "Unusual application behavior"
      ],
      mitigationSteps: [
        "Require immediate password reset",
        "Enable two-factor authentication",
        "Recommend full device security scan",
        "Temporarily restrict account access",
        "Monitor all account activity closely"
      ],
      deviceRiskScore: 92
    } as SecurityAssessment
  },

  general: {
    insights: {
      confidence: 82,
      reasoning: "Analysis of user patterns reveals opportunities for improved financial health and security.",
      recommendations: [
        "Consider budgeting tools integration",
        "Explore investment opportunities",
        "Review insurance coverage"
      ],
      riskLevel: 'medium' as const,
      factors: [
        {
          factor: "Spending Patterns",
          impact: 40,
          explanation: "Regular spending with room for optimization"
        },
        {
          factor: "Savings Behavior",
          impact: 35,
          explanation: "Moderate savings rate with growth potential"
        },
        {
          factor: "Financial Goals",
          impact: 30,
          explanation: "Clear financial objectives identified"
        }
      ],
      timestamp: new Date('2024-01-15T12:00:00Z')
    } as AIAnalysisResponse
  },

  errors: {
    rateLimited: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'API rate limit exceeded. Please try again later.',
      retryAfter: 60
    },
    
    invalidApiKey: {
      code: 'INVALID_API_KEY',
      message: 'The provided API key is invalid or has expired.'
    },
    
    serviceUnavailable: {
      code: 'SERVICE_UNAVAILABLE',
      message: 'AI service is temporarily unavailable. Please try again later.'
    },
    
    validationError: {
      code: 'VALIDATION_ERROR',
      message: 'Invalid input data provided for analysis.'
    }
  }
};

/**
 * Generate random mock response based on type and risk level
 */
export function generateMockResponse(
  type: 'fraud' | 'credit' | 'security' | 'general',
  riskLevel?: 'low' | 'medium' | 'high' | 'critical'
): AIAnalysisResponse {
  const baseResponse = mockAIResponses[type];
  
  if (type === 'fraud') {
    return riskLevel === 'high' || riskLevel === 'critical' 
      ? baseResponse.highRisk 
      : baseResponse.lowRisk;
  }
  
  if (type === 'credit') {
    return riskLevel === 'high' || riskLevel === 'critical'
      ? baseResponse.poor
      : baseResponse.excellent;
  }
  
  if (type === 'security') {
    return riskLevel === 'high' || riskLevel === 'critical'
      ? baseResponse.compromised
      : baseResponse.secure;
  }
  
  return baseResponse.insights;
}

/**
 * Generate mock error response
 */
export function generateMockError(errorType: keyof typeof mockAIResponses.errors) {
  return mockAIResponses.errors[errorType];
}

/**
 * Performance test scenarios with different response times
 */
export const performanceTestScenarios = {
  fast: {
    responseTime: 500,
    confidence: 85,
    complexity: 'low'
  },
  normal: {
    responseTime: 1500,
    confidence: 88,
    complexity: 'medium'
  },
  slow: {
    responseTime: 4000,
    confidence: 92,
    complexity: 'high'
  },
  timeout: {
    responseTime: 15000,
    confidence: 0,
    complexity: 'error'
  }
};

/**
 * Load test data generator
 */
export function generateLoadTestData(count: number, type: 'fraud' | 'credit' | 'security' | 'general') {
  return Array.from({ length: count }, (_, i) => {
    switch (type) {
      case 'fraud':
        return {
          amount: 100 + (i * 50),
          currency: ['USD', 'EUR', 'GHS'][i % 3],
          merchantType: ['retail', 'online', 'restaurant'][i % 3],
          timestamp: new Date(Date.now() - i * 3600000).toISOString(),
          id: `fraud-test-${i}`
        };
      case 'credit':
        return {
          creditScore: 500 + (i * 10),
          income: 30000 + (i * 1000),
          employmentStatus: ['employed', 'self-employed', 'unemployed'][i % 3],
          existingDebts: i * 1000,
          id: `credit-test-${i}`
        };
      case 'security':
        return {
          deviceFingerprint: `device-${i}`,
          loginPatterns: [{
            timestamp: new Date(Date.now() - i * 3600000).toISOString(),
            location: `Location-${i % 5}`,
            success: i % 4 !== 0
          }],
          riskIndicators: i % 3 === 0 ? ['new_device'] : [],
          id: `security-test-${i}`
        };
      default:
        return {
          metrics: { users: 1000 + i, transactions: 5000 + (i * 100) },
          type: 'dashboard',
          id: `general-test-${i}`
        };
    }
  });
}

/**
 * Edge case test scenarios
 */
export const edgeCaseScenarios = {
  emptyData: {},
  nullData: null,
  largeData: {
    amount: 999999999,
    metadata: Array.from({ length: 10000 }, (_, i) => ({ id: i, value: `data-${i}` }))
  },
  invalidData: {
    amount: 'invalid',
    currency: 123,
    timestamp: 'not-a-date'
  },
  maliciousData: {
    amount: 1000,
    script: '<script>alert("xss")</script>',
    injection: "'; DROP TABLE users; --"
  }
};

/**
 * Stress test configuration
 */
export const stressTestConfig = {
  concurrentRequests: [1, 5, 10, 25, 50, 100],
  requestTypes: ['fraud', 'credit', 'security', 'general'] as const,
  testDuration: 30000, // 30 seconds
  maxResponseTime: 5000, // 5 seconds
  minSuccessRate: 95 // 95%
};

/**
 * Mock response generator with configurable delays and errors
 */
export class MockResponseGenerator {
  private errorRate: number = 0;
  private averageDelay: number = 1000;
  private varianceDelay: number = 500;

  constructor(options?: {
    errorRate?: number;
    averageDelay?: number;
    varianceDelay?: number;
  }) {
    if (options) {
      this.errorRate = options.errorRate ?? 0;
      this.averageDelay = options.averageDelay ?? 1000;
      this.varianceDelay = options.varianceDelay ?? 500;
    }
  }

  async generateResponse(
    type: 'fraud' | 'credit' | 'security' | 'general',
    data: any
  ): Promise<AIAnalysisResponse> {
    // Simulate network delay
    const delay = Math.max(
      100,
      this.averageDelay + (Math.random() - 0.5) * this.varianceDelay * 2
    );
    await new Promise(resolve => setTimeout(resolve, delay));

    // Simulate errors
    if (Math.random() < this.errorRate) {
      throw new Error(`Simulated ${type} analysis error`);
    }

    // Return appropriate mock response
    return generateMockResponse(type, this.determineRiskLevel(data));
  }

  private determineRiskLevel(data: any): 'low' | 'medium' | 'high' | 'critical' {
    if (!data || typeof data !== 'object') return 'medium';
    
    // Simple risk determination based on data characteristics
    if (data.amount && data.amount > 10000) return 'high';
    if (data.creditScore && data.creditScore < 600) return 'high';
    if (data.riskIndicators && data.riskIndicators.length > 2) return 'critical';
    
    return Math.random() > 0.7 ? 'high' : 'low';
  }

  setErrorRate(rate: number) {
    this.errorRate = Math.max(0, Math.min(1, rate));
  }

  setAverageDelay(delay: number) {
    this.averageDelay = Math.max(0, delay);
  }
}