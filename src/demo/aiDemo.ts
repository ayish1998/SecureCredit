import { geminiClient } from '../services/geminiClient';
import { aiLogger } from '../utils/aiLogger';
import { checkEnvironmentSetup } from '../utils/envSetup';

/**
 * Demo script to test AI functionality
 */
export async function runAIDemo(): Promise<void> {
  console.log('🚀 Starting AI Demo...\n');

  // Check environment setup
  console.log('1. Checking environment setup...');
  const envCheck = checkEnvironmentSetup();
  if (!envCheck.success) {
    console.error('❌ Environment setup failed:', envCheck.message);
    if (envCheck.suggestions) {
      console.log('💡 Suggestions:');
      envCheck.suggestions.forEach(suggestion => console.log(`   - ${suggestion}`));
    }
    return;
  }
  console.log('✅ Environment setup successful\n');

  // Initialize client
  console.log('2. Initializing Gemini client...');
  try {
    await geminiClient.initialize();
    console.log('✅ Gemini client initialized successfully\n');
  } catch (error) {
    console.error('❌ Failed to initialize Gemini client:', error);
    return;
  }

  // Test connection
  console.log('3. Testing connection...');
  try {
    const connectionTest = await geminiClient.testConnection();
    if (connectionTest.success) {
      console.log(`✅ Connection successful (${connectionTest.latency}ms)\n`);
    } else {
      console.log(`⚠️ Connection test failed: ${connectionTest.message}\n`);
    }
  } catch (error) {
    console.log(`⚠️ Connection test error: ${error}\n`);
  }

  // Test fraud analysis
  console.log('4. Testing fraud analysis...');
  try {
    const fraudData = {
      amount: 50000,
      currency: 'NGN',
      location: 'Lagos, Nigeria',
      timestamp: new Date().toISOString(),
      deviceId: 'device_123',
    };

    const fraudAnalysis = await geminiClient.analyzeWithContext(
      fraudData,
      'fraud',
      { userId: 'demo_user', analysisType: 'fraud', priority: 'high' }
    );

    console.log('✅ Fraud analysis completed');
    console.log(`   Confidence: ${fraudAnalysis.confidence}%`);
    console.log(`   Response length: ${fraudAnalysis.content.length} characters`);
    console.log(`   Preview: ${fraudAnalysis.content.substring(0, 100)}...\n`);
  } catch (error) {
    console.log(`⚠️ Fraud analysis failed: ${error}\n`);
  }

  // Test credit analysis
  console.log('5. Testing credit analysis...');
  try {
    const creditData = {
      income: 150000,
      expenses: 80000,
      creditHistory: ['on-time', 'on-time', 'late'],
      employmentStatus: 'employed',
    };

    const creditAnalysis = await geminiClient.analyzeWithContext(
      creditData,
      'credit',
      { userId: 'demo_user', analysisType: 'credit', priority: 'medium' }
    );

    console.log('✅ Credit analysis completed');
    console.log(`   Confidence: ${creditAnalysis.confidence}%`);
    console.log(`   Response length: ${creditAnalysis.content.length} characters`);
    console.log(`   Preview: ${creditAnalysis.content.substring(0, 100)}...\n`);
  } catch (error) {
    console.log(`⚠️ Credit analysis failed: ${error}\n`);
  }

  // Test security analysis
  console.log('6. Testing security analysis...');
  try {
    const securityData = {
      deviceId: 'device_123',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Mobile; Android 12)',
      loginAttempts: 1,
      location: 'Lagos, Nigeria',
    };

    const securityAnalysis = await geminiClient.analyzeWithContext(
      securityData,
      'security',
      { userId: 'demo_user', analysisType: 'security', priority: 'high' }
    );

    console.log('✅ Security analysis completed');
    console.log(`   Confidence: ${securityAnalysis.confidence}%`);
    console.log(`   Response length: ${securityAnalysis.content.length} characters`);
    console.log(`   Preview: ${securityAnalysis.content.substring(0, 100)}...\n`);
  } catch (error) {
    console.log(`⚠️ Security analysis failed: ${error}\n`);
  }

  // Show performance metrics
  console.log('7. Performance metrics:');
  const metrics = aiLogger.getPerformanceMetrics();
  console.log(`   Total operations: ${metrics.totalOperations}`);
  console.log(`   Average response time: ${metrics.averageResponseTime}ms`);
  console.log(`   Error rate: ${metrics.errorRate}%`);
  console.log(`   Operation counts:`, metrics.operationCounts);

  console.log('\n🎉 AI Demo completed!');
}

// Export for use in components
export default runAIDemo;