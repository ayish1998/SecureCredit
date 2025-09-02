import { datasetGenerator, TrainingDataPoint } from './datasetGenerator';

// Adapter to convert sophisticated dataset generator to UI-friendly formats
export class DataAdapter {
  
  // Convert TrainingDataPoint to UI Alert format
  static toFraudAlert(dataPoint: TrainingDataPoint): any {
    const riskLevel = dataPoint.isFraud ? 
      (dataPoint.amount > 1000 ? 'high' : 'medium') : 'low';
    
    const timeAgo = Math.floor(Math.random() * 60) + 1;
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      type: riskLevel,
      message: dataPoint.isFraud ? 
        this.getFraudMessage(dataPoint.fraudType || 'UNKNOWN') :
        'Normal transaction processed',
      time: `${timeAgo} min ago`,
      amount: `GHS ${dataPoint.amount.toFixed(2)}`,
      location: dataPoint.senderRegion,
      fraudType: dataPoint.fraudType,
      riskScore: dataPoint.isFraud ? 
        Math.floor((1 - dataPoint.deviceTrust) * 100) : 
        Math.floor(Math.random() * 30) + 10
    };
  }

  // Convert TrainingDataPoint to real-time transaction format
  static toRealtimeTransaction(dataPoint: TrainingDataPoint): any {
    return {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user: this.generateGhanaianName(),
      amount: dataPoint.amount,
      currency: 'GHS',
      type: dataPoint.transactionType,
      location: dataPoint.senderRegion,
      timestamp: new Date().toISOString(),
      riskScore: dataPoint.isFraud ? 
        Math.floor((1 - dataPoint.deviceTrust) * 100) : 
        Math.floor(Math.random() * 30) + 10,
      status: dataPoint.isFraud ? 'flagged' : 'approved',
      merchantCategory: dataPoint.merchantCategory,
      deviceTrust: dataPoint.deviceTrust,
      velocityScore: dataPoint.velocityScore,
      agentTrust: dataPoint.agentTrust,
      pinAttempts: dataPoint.pinAttempts,
      newDevice: dataPoint.newDevice,
      locationChange: dataPoint.locationChange
    };
  }

  // Convert to credit profile format
  static toCreditProfile(dataPoint: TrainingDataPoint): any {
    const baseScore = dataPoint.isFraud ? 
      Math.floor(Math.random() * 200) + 400 : // 400-600 for fraud-prone users
      Math.floor(Math.random() * 200) + 650;  // 650-850 for legitimate users
    
    return {
      id: `user_${Math.random().toString(36).substr(2, 9)}`,
      name: this.generateGhanaianName(),
      phone: this.generateGhanaianPhone(),
      email: `${this.generateGhanaianName().toLowerCase().replace(' ', '.')}@email.com`,
      score: baseScore,
      risk: baseScore > 700 ? 'Low' : baseScore > 600 ? 'Medium' : 'High',
      trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.25 ? 'stable' : 'down',
      lastUpdated: new Date().toLocaleDateString(),
      transactionHistory: Math.floor(dataPoint.frequencyScore * 500) + 50,
      monthlyIncome: Math.floor(dataPoint.amount * (Math.random() * 5 + 2)), // Estimate based on transaction patterns
      location: dataPoint.senderRegion,
      mobileMoneyProvider: this.getGhanaianProvider(),
      deviceTrust: dataPoint.deviceTrust,
      velocityScore: dataPoint.velocityScore,
      agentTrust: dataPoint.agentTrust,
      defaultHistory: dataPoint.isFraud ? Math.floor(Math.random() * 3) + 1 : 0,
      accountAge: Math.floor(Math.random() * 60) + 12,
      creditUtilization: Math.floor((1 - dataPoint.amountPattern) * 100),
      paymentHistory: Math.floor(dataPoint.agentTrust * 100)
    };
  }

  // Generate realistic fraud alerts from dataset
  static generateRealtimeFraudAlerts(count: number = 5): any[] {
    const dataset = datasetGenerator.generateDataset(count * 3); // Generate more to filter
    const fraudTransactions = dataset.filter(d => d.isFraud).slice(0, count);
    const legitimateTransactions = dataset.filter(d => !d.isFraud).slice(0, Math.max(1, count - fraudTransactions.length));
    
    return [...fraudTransactions, ...legitimateTransactions]
      .map(dataPoint => this.toFraudAlert(dataPoint))
      .sort(() => Math.random() - 0.5); // Shuffle
  }

  // Generate realistic transaction stream
  static generateTransactionStream(count: number = 20): any[] {
    const dataset = datasetGenerator.generateDataset(count);
    return dataset.map(dataPoint => this.toRealtimeTransaction(dataPoint));
  }

  // Generate credit profiles from dataset patterns
  static generateCreditProfiles(count: number = 15): any[] {
    const dataset = datasetGenerator.generateDataset(count * 2); // Generate more for variety
    return dataset.slice(0, count).map(dataPoint => this.toCreditProfile(dataPoint));
  }

  // Get system metrics based on dataset patterns
  static getSystemMetrics(): any {
    const sampleDataset = datasetGenerator.generateDataset(1000);
    const fraudCount = sampleDataset.filter(d => d.isFraud).length;
    const avgAmount = sampleDataset.reduce((sum, d) => sum + d.amount, 0) / sampleDataset.length;
    const avgDeviceTrust = sampleDataset.reduce((sum, d) => sum + d.deviceTrust, 0) / sampleDataset.length;
    
    return {
      totalTransactions: Math.floor(Math.random() * 100000) + 2800000,
      fraudDetected: Math.floor(fraudCount * 10) + Math.floor(Math.random() * 100),
      fraudPrevented: ((1000 - fraudCount) / 1000 * 100).toFixed(1),
      riskScore: Math.floor((1 - avgDeviceTrust) * 100),
      averageAmount: avgAmount.toFixed(2),
      systemUptime: 99.9,
      activeUsers: Math.floor(Math.random() * 50000) + 150000
    };
  }

  // Helper methods
  private static getFraudMessage(fraudType: string): string {
    const messages = {
      'SIM_SWAP': 'SIM swap attack detected',
      'SOCIAL_ENGINEERING': 'Social engineering attempt identified',
      'INVESTMENT_SCAM': 'Investment scam pattern detected',
      'AGENT_FRAUD': 'Suspicious agent activity',
      'ACCOUNT_TAKEOVER': 'Account takeover attempt',
      'MERCHANT_FRAUD': 'Merchant fraud detected',
      'UNKNOWN': 'Unusual transaction pattern detected'
    };
    return messages[fraudType as keyof typeof messages] || messages.UNKNOWN;
  }

  private static generateGhanaianName(): string {
    const firstNames = [
      'Kwame', 'Kofi', 'Kwaku', 'Yaw', 'Kwabena', 'Akwasi', 'Kwadwo',
      'Ama', 'Abena', 'Akosua', 'Yaa', 'Efua', 'Aba', 'Afia',
      'Nana', 'Kojo', 'Esi', 'Adjoa', 'Adwoa', 'Akua'
    ];
    const lastNames = [
      'Asante', 'Osei', 'Mensah', 'Boateng', 'Owusu', 'Adjei', 'Frimpong',
      'Gyasi', 'Opoku', 'Amoah', 'Darko', 'Appiah', 'Agyei', 'Bonsu'
    ];
    
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  }

  private static generateGhanaianPhone(): string {
    const prefixes = ['024', '054', '055', '026', '056', '027', '057', '020', '050'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(Math.random() * 9000000) + 1000000;
    return `+233${prefix.substring(1)}${number}`;
  }

  private static getGhanaianProvider(): string {
    const providers = ['MTN Mobile Money', 'Vodafone Cash', 'AirtelTigo Money'];
    return providers[Math.floor(Math.random() * providers.length)];
  }
}