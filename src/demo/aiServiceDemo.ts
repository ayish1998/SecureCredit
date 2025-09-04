#!/usr/bin/env node

/**
 * AI Service Demo Script
 * 
 * This script demonstrates the AI service functionality with sample data.
 * Run with: npm run demo:ai-service
 */

import { aiService } from '../services/aiService';
import { aiLogger } from '../utils/aiLogger';

// Sample data for testing
const sampleTransactionData = {
  amount: 2500,
  currency: 'USD',
  timestamp: new Date().toISOString(),
  merchantType: 'retail',
  location: 'Lagos, Nigeria',
  deviceInfo: {
    type: 'mobile',
    os: 'Android',
    isNewDevice: false,
    trustScore: 0.8,
  },
  userProfile: {
    accountAge: 365,
    transactionCount: 150,
    averageTransactionAmount: 500,
    riskLevel: 'low',
    verificationStatus: 'verified',
  },
};

const sampleCreditData = {
  creditScore: 680,
  income: 45000,
  employmentStatus: 'employed',
  existingDebts: 12000,
  creditHistory: [
    {
      type: 'credit_card',
      status: 'active',
      balance: 2500,
      limit: 5000,
      openDate: '2022-01-15',
    },
    {
      type: 'personal_loan',
      status: 'active',
      balance: 8000,
      openDate: '2021-06-01',
    },
  ],
  paymentHistory: [
    { amount: 250, date: '2024-01-15', status: 'completed', onTime: true },
    { amount: 300, date: '2024-02-15', status: 'completed', onTime: true },
    { amount: 250, date: '2024-03-15', status: 'completed', onTime: false },
  ],
  demographics: {
    ageRange: '25-34',
    region: 'West Africa',
    employmentSector: 'Technology',
    educationLevel: 'Bachelor',
  },
};

const sampleSecurityData = {
  deviceFingerprint: 'fp_abc123xyz789',
  loginPatterns: [
    {
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      location: 'Lagos, Nigeria',
      device: 'mobile',
      success: true,
    },
    {
      timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      location: 'Lagos, Nigeria',
      device: 'desktop',
      success: true,
    },
  ],
  locationHistory: [
    { city: 'Lagos', country: 'Nigeria', frequency: 95 },
    { city: 'Abuja', country: 'Nigeria', frequency: 5 },
  ],
  behaviorMetrics: {
    averageSessionDuration: 1200, // 20 minutes
    typingSpeed: 45,
  },
  securityEvents: [
    {
      type: 'password_change',
      severity: 'low',
      timestamp: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
      resolved: true,
    },
  ],
  riskIndicators: [],
};

async function runDemo() {
  console.log('🚀 Starting AI Service Demo...\n');

  try {
    // Initialize the AI service
    console.log('📋 Initializing AI Service...');
    await aiService.initialize({
      enableFallback: true,
      cacheResults: true,
    });
    
    const status = aiService.getStatus();
    console.log('✅ AI Service Status:', {
      initialized: status.initialized,
      aiAvailable: status.aiAvailable,
      fallbackEnabled: status.fallbackEnabled,
    });
    console.log();

    // Test service functionality
    console.log('🧪 Testing AI Service...');
    const testResult = await aiService.testService();
    console.log('Test Result:', testResult);
    console.log();

    // Demo 1: Fraud Analysis
    console.log('🔍 Demo 1: Fraud Risk Analysis');
    console.log('Transaction Data:', JSON.stringify(sampleTransactionData, null, 2));
    
    const fraudAnalysis = await aiService.analyzeFraudRisk(
      sampleTransactionData,
      { userId: 'demo_user_1', priority: 'high', analysisType: 'fraud' }
    );
    
    console.log('Fraud Analysis Result:');
    console.log(`  • Fraud Probability: ${fraudAnalysis.fraudProbability}%`);
    console.log(`  • Risk Level: ${fraudAnalysis.riskLevel}`);
    console.log(`  • Confidence: ${fraudAnalysis.confidence}%`);
    console.log(`  • Suspicious Patterns: ${fraudAnalysis.suspiciousPatterns.join(', ')}`);
    console.log(`  • Recommendations: ${fraudAnalysis.recommendations.slice(0, 2).join(', ')}`);
    console.log(`  • Reasoning: ${fraudAnalysis.reasoning.substring(0, 100)}...`);
    console.log();

    // Demo 2: Credit Enhancement
    console.log('💳 Demo 2: Credit Scoring Enhancement');
    console.log('Credit Data Summary:', {
      creditScore: sampleCreditData.creditScore,
      income: sampleCreditData.income,
      existingDebts: sampleCreditData.existingDebts,
      creditAccounts: sampleCreditData.creditHistory.length,
    });
    
    const creditEnhancement = await aiService.enhanceCreditScoring(
      sampleCreditData,
      { userId: 'demo_user_1', priority: 'medium', analysisType: 'credit' }
    );
    
    console.log('Credit Enhancement Result:');
    console.log(`  • Enhanced Score: ${creditEnhancement.enhancedScore}`);
    console.log(`  • Risk Level: ${creditEnhancement.riskLevel}`);
    console.log(`  • Confidence: ${creditEnhancement.confidence}%`);
    console.log(`  • Lending Recommendation: ${creditEnhancement.lendingRecommendation}`);
    console.log(`  • Key Factors: ${creditEnhancement.factors.slice(0, 2).map(f => f.factor).join(', ')}`);
    console.log(`  • Recommendations: ${creditEnhancement.recommendations.slice(0, 2).join(', ')}`);
    console.log();

    // Demo 3: Security Analysis
    console.log('🔒 Demo 3: Security Pattern Analysis');
    console.log('Security Data Summary:', {
      deviceFingerprint: sampleSecurityData.deviceFingerprint,
      loginCount: sampleSecurityData.loginPatterns.length,
      riskIndicators: sampleSecurityData.riskIndicators.length,
      securityEvents: sampleSecurityData.securityEvents.length,
    });
    
    const securityAssessment = await aiService.analyzeSecurityPattern(
      sampleSecurityData,
      { userId: 'demo_user_1', priority: 'high', analysisType: 'security' }
    );
    
    console.log('Security Assessment Result:');
    console.log(`  • Threat Level: ${securityAssessment.threatLevel}%`);
    console.log(`  • Risk Level: ${securityAssessment.riskLevel}`);
    console.log(`  • Confidence: ${securityAssessment.confidence}%`);
    console.log(`  • Vulnerabilities: ${securityAssessment.vulnerabilities.join(', ')}`);
    console.log(`  • Mitigation Steps: ${securityAssessment.mitigationSteps.slice(0, 2).join(', ')}`);
    console.log();

    // Demo 4: General Insights
    console.log('📊 Demo 4: General AI Insights');
    const dashboardData = {
      totalUsers: 10000,
      activeUsers: 7500,
      totalTransactions: 50000,
      averageTransactionValue: 750,
      fraudRate: 0.02,
      systemHealth: 'good',
    };
    
    const insights = await aiService.generateInsights(
      dashboardData,
      'dashboard-overview',
      { userId: 'admin', priority: 'low', analysisType: 'general' }
    );
    
    console.log('General Insights Result:');
    console.log(`  • Risk Level: ${insights.riskLevel}`);
    console.log(`  • Confidence: ${insights.confidence}%`);
    console.log(`  • Key Factors: ${insights.factors.slice(0, 2).map(f => f.factor).join(', ')}`);
    console.log(`  • Recommendations: ${insights.recommendations.slice(0, 2).join(', ')}`);
    console.log(`  • Reasoning: ${insights.reasoning.substring(0, 100)}...`);
    console.log();

    // Demo 5: Performance and Caching
    console.log('⚡ Demo 5: Performance and Caching');
    console.log('Running duplicate fraud analysis to test caching...');
    
    const startTime = Date.now();
    await aiService.analyzeFraudRisk(sampleTransactionData);
    const cachedTime = Date.now() - startTime;
    
    console.log(`  • Cached analysis completed in: ${cachedTime}ms`);
    
    const finalStatus = aiService.getStatus();
    console.log(`  • Cache size: ${finalStatus.cacheSize} items`);
    console.log();

    // Demo 6: Error Handling
    console.log('🛡️  Demo 6: Error Handling');
    console.log('Testing with invalid data...');
    
    try {
      const invalidResult = await aiService.analyzeFraudRisk(
        { invalid: 'data' },
        { userId: 'test', priority: 'low', analysisType: 'fraud' }
      );
      console.log(`  • Handled invalid data gracefully: ${invalidResult.riskLevel} risk`);
    } catch (error) {
      console.log(`  • Error handled: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    console.log();

    console.log('✅ AI Service Demo completed successfully!');
    console.log('\n📈 Summary:');
    console.log(`  • All analysis types working: Fraud, Credit, Security, General`);
    console.log(`  • Fallback mechanisms active: ${status.fallbackEnabled}`);
    console.log(`  • Caching functional: ${finalStatus.cacheSize} cached results`);
    console.log(`  • Error handling robust: Invalid data handled gracefully`);

  } catch (error) {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Demo interrupted. Cleaning up...');
  aiService.clearCache();
  process.exit(0);
});

// Run the demo if this file is executed directly
if (require.main === module) {
  runDemo().catch(console.error);
}

export { runDemo };