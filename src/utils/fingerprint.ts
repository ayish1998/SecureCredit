import FingerprintJS from '@fingerprintjs/fingerprintjs';

export interface DeviceFingerprint {
  visitorId: string;
  confidence: number;
  components: {
    userAgent: string;
    language: string;
    colorDepth: number;
    deviceMemory: number;
    pixelRatio: number;
    hardwareConcurrency: number;
    screenResolution: string;
    timezone: string;
    platform: string;
    touchSupport: boolean;
    fonts: string[];
    canvas: string;
    webgl: string;
  };
  riskScore: number;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  location?: {
    country?: string;
    region?: string;
  };
}

export interface SecurityAnalysis {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: string[];
  recommendations: string[];
  trustScore: number;
  deviceHistory: {
    firstSeen: Date;
    lastSeen: Date;
    transactionCount: number;
    flaggedActivities: number;
  };
}

class FingerprintService {
  private fp: any = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      this.fp = await FingerprintJS.load({
        monitoring: false // Disable monitoring for privacy
      });
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize FingerprintJS:', error);
      throw new Error('Fingerprint service initialization failed');
    }
  }

  async generateFingerprint(): Promise<DeviceFingerprint> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const result = await this.fp.get();
      const components = result.components;

      // Extract key components
      const userAgent = components.userAgent?.value || '';
      const language = components.languages?.value?.[0] || 'unknown';
      const colorDepth = components.colorDepth?.value || 0;
      const deviceMemory = components.deviceMemory?.value || 0;
      const pixelRatio = components.pixelRatio?.value || 1;
      const hardwareConcurrency = components.hardwareConcurrency?.value || 0;
      const screenResolution = `${components.screenResolution?.value?.[0] || 0}x${components.screenResolution?.value?.[1] || 0}`;
      const timezone = components.timezone?.value || '';
      const platform = components.platform?.value || '';
      const touchSupport = components.touchSupport?.value?.maxTouchPoints > 0 || false;
      const fonts = components.fonts?.value || [];
      const canvas = components.canvas?.value || '';
      const webgl = components.webgl?.value || '';

      // Calculate risk score based on various factors
      const riskScore = this.calculateRiskScore({
        userAgent,
        language,
        colorDepth,
        deviceMemory,
        pixelRatio,
        hardwareConcurrency,
        timezone,
        platform,
        touchSupport
      });

      // Determine device type
      const deviceType = this.determineDeviceType(userAgent, touchSupport, screenResolution);

      return {
        visitorId: result.visitorId,
        confidence: result.confidence.score,
        components: {
          userAgent,
          language,
          colorDepth,
          deviceMemory,
          pixelRatio,
          hardwareConcurrency,
          screenResolution,
          timezone,
          platform,
          touchSupport,
          fonts,
          canvas,
          webgl
        },
        riskScore,
        deviceType
      };
    } catch (error) {
      console.error('Failed to generate fingerprint:', error);
      throw new Error('Fingerprint generation failed');
    }
  }

  private calculateRiskScore(components: any): number {
    let riskScore = 0;

    // Check for suspicious user agents
    if (components.userAgent.includes('bot') || components.userAgent.includes('crawler')) {
      riskScore += 30;
    }

    // Check for unusual hardware configurations
    if (components.hardwareConcurrency > 16) {
      riskScore += 10; // Unusually high CPU cores
    }

    if (components.deviceMemory > 32) {
      riskScore += 10; // Unusually high memory
    }

    // Check for VPN/Proxy indicators
    if (components.timezone && components.language) {
      const timezoneCountry = this.getCountryFromTimezone(components.timezone);
      const languageCountry = this.getCountryFromLanguage(components.language);
      
      if (timezoneCountry !== languageCountry) {
        riskScore += 15; // Timezone/language mismatch
      }
    }

    // Check for automation tools
    if (components.webgl.includes('ANGLE') && components.platform === 'Win32') {
      riskScore += 5; // Potential automation
    }

    // Normalize to 0-100 scale
    return Math.min(riskScore, 100);
  }

  private determineDeviceType(userAgent: string, touchSupport: boolean, screenResolution: string): 'mobile' | 'tablet' | 'desktop' {
    const [width, height] = screenResolution.split('x').map(Number);
    
    if (touchSupport && (width <= 768 || height <= 768)) {
      return 'mobile';
    } else if (touchSupport && (width <= 1024 || height <= 1024)) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  private getCountryFromTimezone(timezone: string): string {
    // Simplified timezone to country mapping
    const timezoneMap: { [key: string]: string } = {
      'Africa/Lagos': 'NG',
      'Africa/Accra': 'GH',
      'Africa/Nairobi': 'KE',
      'Africa/Johannesburg': 'ZA',
      'Africa/Cairo': 'EG',
      'Africa/Casablanca': 'MA',
      'Africa/Addis_Ababa': 'ET',
      'Africa/Dar_es_Salaam': 'TZ'
    };
    
    return timezoneMap[timezone] || 'unknown';
  }

  private getCountryFromLanguage(language: string): string {
    // Simplified language to country mapping
    const languageMap: { [key: string]: string } = {
      'en-NG': 'NG',
      'en-GH': 'GH',
      'en-KE': 'KE',
      'en-ZA': 'ZA',
      'ar-EG': 'EG',
      'fr-MA': 'MA',
      'am-ET': 'ET',
      'sw-TZ': 'TZ'
    };
    
    return languageMap[language] || 'unknown';
  }

  analyzeSecurityRisk(fingerprint: DeviceFingerprint): SecurityAnalysis {
    const riskFactors: string[] = [];
    const recommendations: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Analyze risk factors
    if (fingerprint.riskScore > 70) {
      riskLevel = 'critical';
      riskFactors.push('High automation risk detected');
      recommendations.push('Require additional authentication');
    } else if (fingerprint.riskScore > 40) {
      riskLevel = 'high';
      riskFactors.push('Suspicious device characteristics');
      recommendations.push('Monitor transaction patterns closely');
    } else if (fingerprint.riskScore > 20) {
      riskLevel = 'medium';
      riskFactors.push('Moderate risk indicators present');
      recommendations.push('Apply standard security measures');
    }

    // Check confidence score
    if (fingerprint.confidence < 0.5) {
      riskFactors.push('Low fingerprint confidence');
      recommendations.push('Request additional verification');
      if (riskLevel === 'low') riskLevel = 'medium';
    }

    // Device type analysis
    if (fingerprint.deviceType === 'desktop' && fingerprint.components.touchSupport) {
      riskFactors.push('Inconsistent device characteristics');
      recommendations.push('Verify device authenticity');
    }

    // Calculate trust score (inverse of risk)
    const trustScore = Math.max(0, 100 - fingerprint.riskScore);

    // Mock device history (in production, this would come from database)
    const deviceHistory = {
      firstSeen: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
      lastSeen: new Date(),
      transactionCount: Math.floor(Math.random() * 100),
      flaggedActivities: Math.floor(Math.random() * 5)
    };

    return {
      riskLevel,
      riskFactors,
      recommendations,
      trustScore,
      deviceHistory
    };
  }

  // Store fingerprint for fraud detection
  async storeFingerprint(fingerprint: DeviceFingerprint, userId?: string): Promise<void> {
    // In production, this would store to your backend
    const fingerprintData = {
      ...fingerprint,
      userId,
      timestamp: new Date().toISOString(),
      sessionId: this.generateSessionId()
    };

    // Store in localStorage for demo purposes
    const existingData = JSON.parse(localStorage.getItem('device_fingerprints') || '[]');
    existingData.push(fingerprintData);
    
    // Keep only last 100 entries
    if (existingData.length > 100) {
      existingData.splice(0, existingData.length - 100);
    }
    
    localStorage.setItem('device_fingerprints', JSON.stringify(existingData));
  }

  // Check if device is known/trusted
  async isKnownDevice(visitorId: string): Promise<boolean> {
    const existingData = JSON.parse(localStorage.getItem('device_fingerprints') || '[]');
    return existingData.some((fp: any) => fp.visitorId === visitorId);
  }

  // Get device history
  async getDeviceHistory(visitorId: string): Promise<any[]> {
    const existingData = JSON.parse(localStorage.getItem('device_fingerprints') || '[]');
    return existingData.filter((fp: any) => fp.visitorId === visitorId);
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

export const fingerprintService = new FingerprintService();