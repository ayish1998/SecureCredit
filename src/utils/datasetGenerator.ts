// Ghanaian Mobile Money Fraud Dataset Generator
// This generates realistic training data based on actual fraud patterns in Ghana

export interface TrainingDataPoint {
  // Transaction features
  amount: number;
  hour: number;
  dayOfWeek: number;
  month: number;

  // Location features
  senderRegion: string;
  receiverRegion: string;
  locationChange: boolean;

  // Device features
  newDevice: boolean;
  deviceTrust: number;

  // User behavior features
  velocityScore: number;
  frequencyScore: number;
  amountPattern: number;

  // Network features
  agentTrust: number;
  networkTrust: number;

  // Security features
  pinAttempts: number;
  authMethod: string;

  // Transaction context
  transactionType: string;
  merchantCategory: string;
  description: string;

  // Target variable
  isFraud: boolean;
  fraudType?: string;
}

const GHANA_REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Central",
  "Volta",
  "Eastern",
  "Northern",
  "Upper East",
  "Upper West",
  "Brong Ahafo",
];

export const FRAUD_TYPES = [
  "SIM_SWAP",
  "SOCIAL_ENGINEERING",
  "INVESTMENT_SCAM",
  "AGENT_FRAUD",
  "ACCOUNT_TAKEOVER",
  "MERCHANT_FRAUD",
];

export const MERCHANT_CATEGORIES = [
  "grocery",
  "utilities",
  "transport",
  "telecom",
  "fuel",
  "education",
  "healthcare",
  "entertainment",
  "investment",
  "lottery",
  "unknown",
  "agent",
];

export class GhanaianFraudDatasetGenerator {
  // Generate legitimate transaction
  private generateLegitimateTransaction(): TrainingDataPoint {
    const hour = this.normalDistribution(12, 4); // Peak around noon
    const amount = this.logNormalDistribution(100, 2); // Most transactions are small

    return {
      amount: Math.max(5, Math.min(amount, 2000)), // 5-2000 GHS range
      hour: Math.max(0, Math.min(hour, 23)),
      dayOfWeek: Math.floor(Math.random() * 7),
      month: Math.floor(Math.random() * 12) + 1,

      senderRegion: this.randomChoice(GHANA_REGIONS),
      receiverRegion: this.randomChoice(GHANA_REGIONS),
      locationChange: Math.random() < 0.1, // 10% chance of location change

      newDevice: Math.random() < 0.05, // 5% chance of new device
      deviceTrust: this.normalDistribution(0.8, 0.15),

      velocityScore: this.normalDistribution(0.2, 0.1),
      frequencyScore: this.normalDistribution(0.3, 0.15),
      amountPattern: this.normalDistribution(0.7, 0.2),

      agentTrust: this.normalDistribution(0.85, 0.1),
      networkTrust: this.normalDistribution(0.8, 0.1),

      pinAttempts: Math.random() < 0.95 ? 1 : 2, // Usually 1 attempt
      authMethod: this.randomChoice(["PIN", "biometric", "SMS"]),

      transactionType: this.randomChoice([
        "send_money",
        "bill_payment",
        "airtime",
        "merchant_payment",
      ]),
      merchantCategory: this.randomChoice([
        "grocery",
        "utilities",
        "transport",
        "telecom",
        "fuel",
      ]),
      description: "Regular transaction",

      isFraud: false,
    };
  }

  // Generate SIM swap fraud transaction
  private generateSimSwapFraud(): TrainingDataPoint {
    const baseTransaction = this.generateLegitimateTransaction();

    return {
      ...baseTransaction,
      amount: this.logNormalDistribution(500, 1.5), // Higher amounts
      hour:
        Math.random() < 0.6
          ? Math.floor(Math.random() * 6) + 22
          : baseTransaction.hour, // Often late night

      locationChange: true, // Always location change
      newDevice: true, // Always new device
      deviceTrust: this.normalDistribution(0.1, 0.05),

      velocityScore: this.normalDistribution(0.8, 0.1), // High velocity
      frequencyScore: this.normalDistribution(0.9, 0.1),

      agentTrust: this.normalDistribution(0.3, 0.2),
      networkTrust: this.normalDistribution(0.2, 0.1),

      pinAttempts: Math.floor(Math.random() * 3) + 2, // Multiple attempts

      transactionType: this.randomChoice(["send_money", "cash_out"]),
      merchantCategory: "unknown",
      description: "Urgent transfer",

      isFraud: true,
      fraudType: "SIM_SWAP",
    };
  }

  // Generate social engineering fraud
  private generateSocialEngineeringFraud(): TrainingDataPoint {
    const baseTransaction = this.generateLegitimateTransaction();

    return {
      ...baseTransaction,
      amount: this.normalDistribution(300, 100),
      hour:
        Math.random() < 0.4
          ? Math.floor(Math.random() * 4) + 8
          : baseTransaction.hour, // Often business hours

      locationChange: Math.random() < 0.3,
      newDevice: Math.random() < 0.2,
      deviceTrust: this.normalDistribution(0.6, 0.2),

      velocityScore: this.normalDistribution(0.6, 0.2),
      frequencyScore: this.normalDistribution(0.4, 0.2),

      agentTrust: this.normalDistribution(0.7, 0.2),
      networkTrust: this.normalDistribution(0.5, 0.2),

      pinAttempts: 1, // Usually successful on first try

      transactionType: "send_money",
      merchantCategory: this.randomChoice(["telecom", "unknown"]),
      description: "Customer service request",

      isFraud: true,
      fraudType: "SOCIAL_ENGINEERING",
    };
  }

  // Generate investment scam transaction
  private generateInvestmentScamFraud(): TrainingDataPoint {
    const baseTransaction = this.generateLegitimateTransaction();

    return {
      ...baseTransaction,
      amount: this.normalDistribution(50, 30), // Usually small amounts initially

      locationChange: false,
      newDevice: Math.random() < 0.1,
      deviceTrust: this.normalDistribution(0.7, 0.2),

      velocityScore: this.normalDistribution(0.5, 0.2),
      frequencyScore: this.normalDistribution(0.7, 0.2), // Frequent small payments

      agentTrust: this.normalDistribution(0.8, 0.1),
      networkTrust: this.normalDistribution(0.6, 0.2),

      pinAttempts: 1,

      transactionType: "send_money",
      merchantCategory: this.randomChoice(["investment", "lottery"]),
      description: "Investment opportunity",

      isFraud: true,
      fraudType: "INVESTMENT_SCAM",
    };
  }

  // Generate agent fraud transaction
  private generateAgentFraud(): TrainingDataPoint {
    const baseTransaction = this.generateLegitimateTransaction();

    return {
      ...baseTransaction,
      amount: this.normalDistribution(800, 200),
      hour:
        Math.random() < 0.7
          ? Math.random() < 0.5
            ? Math.floor(Math.random() * 6)
            : Math.floor(Math.random() * 4) + 20
          : baseTransaction.hour,

      locationChange: Math.random() < 0.6,
      newDevice: Math.random() < 0.1,
      deviceTrust: this.normalDistribution(0.7, 0.2),

      velocityScore: this.normalDistribution(0.7, 0.2),
      frequencyScore: this.normalDistribution(0.6, 0.2),

      agentTrust: this.normalDistribution(0.2, 0.1), // Low agent trust
      networkTrust: this.normalDistribution(0.3, 0.2),

      pinAttempts: 1,

      transactionType: this.randomChoice(["cash_out", "send_money"]),
      merchantCategory: "agent",
      description: "Agent transaction",

      isFraud: true,
      fraudType: "AGENT_FRAUD",
    };
  }

  // Generate account takeover fraud
  private generateAccountTakeoverFraud(): TrainingDataPoint {
    const baseTransaction = this.generateLegitimateTransaction();

    return {
      ...baseTransaction,
      amount: this.normalDistribution(1000, 300),

      locationChange: Math.random() < 0.8,
      newDevice: Math.random() < 0.9, // Usually new device
      deviceTrust: this.normalDistribution(0.1, 0.05),

      velocityScore: this.normalDistribution(0.9, 0.1),
      frequencyScore: this.normalDistribution(0.8, 0.2),

      agentTrust: this.normalDistribution(0.4, 0.3),
      networkTrust: this.normalDistribution(0.2, 0.1),

      pinAttempts: Math.floor(Math.random() * 4) + 2, // Multiple PIN attempts

      transactionType: this.randomChoice(["send_money", "cash_out"]),
      merchantCategory: "unknown",
      description: "Account access",

      isFraud: true,
      fraudType: "ACCOUNT_TAKEOVER",
    };
  }

  // Generate complete dataset
  generateDataset(size: number = 10000): TrainingDataPoint[] {
    const dataset: TrainingDataPoint[] = [];

    // 70% legitimate transactions
    const legitimateCount = Math.floor(size * 0.7);
    for (let i = 0; i < legitimateCount; i++) {
      dataset.push(this.generateLegitimateTransaction());
    }

    // 30% fraudulent transactions with different types
    const fraudCount = size - legitimateCount;
    const fraudDistribution = {
      SIM_SWAP: 0.35,
      SOCIAL_ENGINEERING: 0.25,
      AGENT_FRAUD: 0.2,
      INVESTMENT_SCAM: 0.1,
      ACCOUNT_TAKEOVER: 0.1,
    };

    Object.entries(fraudDistribution).forEach(([fraudType, percentage]) => {
      const count = Math.floor(fraudCount * percentage);
      for (let i = 0; i < count; i++) {
        switch (fraudType) {
          case "SIM_SWAP":
            dataset.push(this.generateSimSwapFraud());
            break;
          case "SOCIAL_ENGINEERING":
            dataset.push(this.generateSocialEngineeringFraud());
            break;
          case "AGENT_FRAUD":
            dataset.push(this.generateAgentFraud());
            break;
          case "INVESTMENT_SCAM":
            dataset.push(this.generateInvestmentScamFraud());
            break;
          case "ACCOUNT_TAKEOVER":
            dataset.push(this.generateAccountTakeoverFraud());
            break;
        }
      }
    });

    // Shuffle dataset
    return this.shuffleArray(dataset);
  }

  // Utility functions
  private normalDistribution(mean: number, stdDev: number): number {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
  }

  private logNormalDistribution(mean: number, stdDev: number): number {
    return Math.exp(this.normalDistribution(Math.log(mean), stdDev));
  }

  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

// Export singleton instance
export const datasetGenerator = new GhanaianFraudDatasetGenerator();
