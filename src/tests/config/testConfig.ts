/**
 * Test Configuration for AI Integration Testing
 * 
 * This file contains configuration settings for different types of tests
 * including unit tests, integration tests, and performance tests.
 */

export const testConfig = {
  // Unit test configuration
  unit: {
    timeout: 5000, // 5 seconds for unit tests
    retries: 2,
    coverage: {
      threshold: 90, // 90% coverage requirement
      excludePatterns: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/mocks/**',
        '**/test/**'
      ]
    }
  },

  // Integration test configuration
  integration: {
    timeout: 15000, // 15 seconds for integration tests
    retries: 1,
    mockServices: true,
    realApiTests: false // Set to true for testing against real APIs
  },

  // Performance test configuration
  performance: {
    timeout: 30000, // 30 seconds for performance tests
    retries: 0, // No retries for performance tests
    thresholds: {
      maxResponseTime: 5000, // 5 seconds max response time
      minSuccessRate: 95, // 95% minimum success rate
      maxMemoryIncrease: 50 * 1024 * 1024, // 50MB max memory increase
      maxConcurrentRequests: 100
    },
    loadTest: {
      duration: 30000, // 30 seconds
      requestsPerSecond: 10,
      rampUpTime: 5000 // 5 seconds ramp up
    }
  },

  // Mock configuration
  mocks: {
    aiService: {
      defaultDelay: 1500, // 1.5 second default delay
      errorRate: 0.05, // 5% error rate
      varianceDelay: 500 // ±500ms variance
    },
    responses: {
      fraud: {
        lowRisk: { confidence: 85, fraudProbability: 15 },
        highRisk: { confidence: 92, fraudProbability: 87 }
      },
      credit: {
        excellent: { confidence: 88, enhancedScore: 785 },
        poor: { confidence: 91, enhancedScore: 485 }
      },
      security: {
        secure: { confidence: 89, threatLevel: 15 },
        compromised: { confidence: 94, threatLevel: 88 }
      }
    }
  },

  // Environment configuration
  environment: {
    testApiKey: 'test-api-key-AIzaSyTest123',
    testEndpoint: 'https://test-api.example.com',
    enableLogging: false,
    logLevel: 'error'
  },

  // Test data configuration
  testData: {
    fraud: {
      validTransaction: {
        amount: 1000,
        currency: 'USD',
        merchantType: 'retail',
        timestamp: new Date().toISOString()
      },
      suspiciousTransaction: {
        amount: 50000,
        currency: 'USD',
        merchantType: 'high-risk',
        timestamp: new Date().toISOString(),
        riskFactors: ['large-amount', 'new-merchant']
      }
    },
    credit: {
      goodCredit: {
        creditScore: 750,
        income: 75000,
        employmentStatus: 'employed',
        existingDebts: 10000
      },
      poorCredit: {
        creditScore: 500,
        income: 30000,
        employmentStatus: 'unemployed',
        existingDebts: 50000
      }
    },
    security: {
      trustedDevice: {
        deviceFingerprint: 'trusted-device-123',
        loginPatterns: [
          { timestamp: new Date().toISOString(), location: 'New York', success: true }
        ],
        riskIndicators: []
      },
      suspiciousDevice: {
        deviceFingerprint: 'suspicious-device-456',
        loginPatterns: [
          { timestamp: new Date().toISOString(), location: 'Unknown', success: false }
        ],
        riskIndicators: ['new_device', 'unusual_location', 'failed_attempts']
      }
    }
  },

  // Test suite configuration
  suites: {
    unit: {
      pattern: '**/*.test.ts',
      exclude: ['**/integration/**', '**/performance/**']
    },
    integration: {
      pattern: '**/integration/**/*.test.tsx',
      setupFiles: ['./src/test/setup.ts']
    },
    performance: {
      pattern: '**/performance/**/*.test.ts',
      sequential: true // Run performance tests sequentially
    },
    comprehensive: {
      pattern: '**/testSuites/**/*.test.ts',
      timeout: 60000 // 1 minute for comprehensive tests
    }
  },

  // Reporting configuration
  reporting: {
    formats: ['json', 'html', 'text'],
    outputDir: './test-results',
    coverage: {
      formats: ['text', 'html', 'lcov'],
      outputDir: './coverage'
    },
    performance: {
      outputFile: './test-results/performance-report.json',
      includeCharts: true
    }
  }
};

/**
 * Get configuration for specific test type
 */
export function getTestConfig(testType: keyof typeof testConfig) {
  return testConfig[testType];
}

/**
 * Get mock configuration with overrides
 */
export function getMockConfig(overrides?: Partial<typeof testConfig.mocks>) {
  return {
    ...testConfig.mocks,
    ...overrides
  };
}

/**
 * Get test data for specific analysis type
 */
export function getTestData(analysisType: keyof typeof testConfig.testData) {
  return testConfig.testData[analysisType];
}

/**
 * Validate test environment
 */
export function validateTestEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required environment variables
  if (!process.env.VITE_GEMINI_API_KEY && !testConfig.environment.testApiKey) {
    errors.push('Missing API key configuration');
  }

  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion < 16) {
    errors.push('Node.js version 16 or higher required');
  }

  // Check available memory
  const totalMemory = process.memoryUsage().heapTotal;
  const minRequiredMemory = 512 * 1024 * 1024; // 512MB
  if (totalMemory < minRequiredMemory) {
    errors.push('Insufficient memory for testing');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Setup test environment
 */
export function setupTestEnvironment() {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.VITE_GEMINI_API_KEY = testConfig.environment.testApiKey;
  
  // Configure console logging for tests
  if (!testConfig.environment.enableLogging) {
    // Note: vi is not available in this context, would need to be imported
    // console.log = vi.fn();
    // console.info = vi.fn();
    // console.warn = vi.fn();
  }
}

/**
 * Cleanup test environment
 */
export function cleanupTestEnvironment() {
  // Reset environment variables
  delete process.env.VITE_GEMINI_API_KEY;
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
}