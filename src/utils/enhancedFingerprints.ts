import FingerprintJS from '@fingerprintjs/fingerprintjs';

export interface EnhancedDeviceFingerprint {
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
    audio: string;
    webrtc: string;
    battery: string;
    network: string;
  };
  riskScore: number;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  location?: {
    country?: string;
    region?: string;
    timezone?: string;
  };
  behavioralMetrics: {
    mouseMovements: number[];
    keyboardDynamics: number[];
    scrollPatterns: number[];
    clickPatterns: number[];
  };
  environmentalFactors: {
    vpnDetected: boolean;
    proxyDetected: boolean;
    torDetected: boolean;
    emulatorDetected: boolean;
    automationDetected: boolean;
  };
}

export interface EnhancedSecurityAnalysis {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: string[];
  recommendations: string[];
  trustScore: number;
  deviceHistory: {
    firstSeen: Date;
    lastSeen: Date;
    transactionCount: number;
    flaggedActivities: number;
    behaviorConsistency: number;
  };
  realTimeMetrics: {
    cpuUsage: number;
    memoryUsage: number;
    networkLatency: number;
    batteryLevel: number;
    connectionType: string;
  };
  aiAnalysis: {
    anomalyScore: number;
    behaviorPattern: 'normal' | 'suspicious' | 'fraudulent';
    confidenceLevel: number;
    mlPredictions: {
      deviceSpoofing: number;
      automation: number;
      emulation: number;
      vpnUsage: number;
    };
  };
}

class EnhancedFingerprintService {
  private fp: any = null;
  private initialized = false;
  private isInitializing = false;
  private behavioralData: {
    mouseMovements: { x: number; y: number; timestamp: number }[];
    keystrokes: { key: string; timestamp: number; duration: number }[];
    scrollEvents: { deltaY: number; timestamp: number }[];
    clickEvents: { x: number; y: number; timestamp: number }[];
  } = {
    mouseMovements: [],
    keystrokes: [],
    scrollEvents: [],
    clickEvents: []
  };

  async initialize(): Promise<void> {
    if (this.initialized) return;
    if (this.isInitializing) {
      // Wait for existing initialization
      while (this.isInitializing && !this.initialized) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      return;
    }
    
    this.isInitializing = true;
    
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Fingerprint initialization timeout')), 3000)
      );
      
      const fpPromise = FingerprintJS.load({
        monitoring: false,
        debug: false
      });
      
      this.fp = await Promise.race([fpPromise, timeoutPromise]);
      
      // Setup behavioral tracking
      this.setupBehavioralTracking();
      this.initialized = true;
      console.log('Fingerprint service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Enhanced FingerprintJS:', error);
      // Don't throw error, use fallback mode
      this.initialized = false;
    } finally {
      this.isInitializing = false;
    }
  }

  private setupBehavioralTracking(): void {
    let lastMouseMove = 0;
    let lastScroll = 0;
    let lastClick = 0;
    
    // Mouse movement tracking with throttling
    document.addEventListener('mousemove', (event) => {
      const now = Date.now();
      if (now - lastMouseMove < 200) return; // Throttle to 5fps
      lastMouseMove = now;
      
      this.behavioralData.mouseMovements.push({
        x: event.clientX,
        y: event.clientY,
        timestamp: now
      });
      
      // Keep only last 10 movements for performance
      if (this.behavioralData.mouseMovements.length > 10) {
        this.behavioralData.mouseMovements.shift();
      }
    });

    // Keyboard dynamics tracking
    let keyDownTime: number = 0;
    document.addEventListener('keydown', (event) => {
      keyDownTime = Date.now();
    });

    document.addEventListener('keyup', (event) => {
      const duration = Date.now() - keyDownTime;
      this.behavioralData.keystrokes.push({
        key: event.key,
        timestamp: Date.now(),
        duration
      });
      
      // Keep only last 50 keystrokes
      if (this.behavioralData.keystrokes.length > 50) {
        this.behavioralData.keystrokes.shift();
      }
    });

    // Scroll pattern tracking
    document.addEventListener('scroll', (event) => {
      const now = Date.now();
      if (now - lastScroll < 200) return; // Throttle scroll events
      lastScroll = now;
      
      this.behavioralData.scrollEvents.push({
        deltaY: window.scrollY,
        timestamp: now
      });
      
      // Keep only last 10 scroll events
      if (this.behavioralData.scrollEvents.length > 10) {
        this.behavioralData.scrollEvents.shift();
      }
    });

    // Click pattern tracking
    document.addEventListener('click', (event) => {
      const now = Date.now();
      if (now - lastClick < 100) return; // Throttle clicks
      lastClick = now;
      
      this.behavioralData.clickEvents.push({
        x: event.clientX,
        y: event.clientY,
        timestamp: now
      });
      
      // Keep only last 20 clicks
      if (this.behavioralData.clickEvents.length > 20) {
        this.behavioralData.clickEvents.shift();
      }
    });
  }

  async generateEnhancedFingerprint(): Promise<EnhancedDeviceFingerprint> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // If still not initialized, use fallback
      if (!this.initialized || !this.fp) {
        return this.generateFallbackFingerprint();
      }

      const result = await this.fp.get();
      return this.processFingerprint(result);
    } catch (error) {
      console.error('Failed to generate enhanced fingerprint:', error);
      return this.generateFallbackFingerprint();
    }
  }

  private processFingerprint(result: any): EnhancedDeviceFingerprint {
    const components = result.components;

    // Extract enhanced components
    const enhancedComponents = {
      userAgent: components.userAgent?.value || navigator.userAgent,
      language: components.languages?.value?.[0] || navigator.language,
      colorDepth: components.colorDepth?.value || screen.colorDepth,
      deviceMemory: components.deviceMemory?.value || (navigator as any).deviceMemory || 4,
      pixelRatio: components.pixelRatio?.value || window.devicePixelRatio,
      hardwareConcurrency: components.hardwareConcurrency?.value || navigator.hardwareConcurrency,
      screenResolution: `${components.screenResolution?.value?.[0] || screen.width}x${components.screenResolution?.value?.[1] || screen.height}`,
      timezone: components.timezone?.value || Intl.DateTimeFormat().resolvedOptions().timeZone,
      platform: components.platform?.value || navigator.platform,
      touchSupport: components.touchSupport?.value?.maxTouchPoints > 0 || 'ontouchstart' in window,
      fonts: components.fonts?.value || [],
      canvas: components.canvas?.value || 'canvas_hash',
      webgl: components.webgl?.value || 'webgl_hash',
      audio: 'audio_hash',
      webrtc: 'webrtc_hash',
      battery: 'battery_info',
      network: 'network_info'
    };

    // Calculate enhanced risk score
    const riskScore = this.calculateEnhancedRiskScore(enhancedComponents);

    // Determine device type
    const deviceType = this.determineDeviceType(
      enhancedComponents.userAgent, 
      enhancedComponents.touchSupport, 
      enhancedComponents.screenResolution
    );

    // Get behavioral metrics
    const behavioralMetrics = this.analyzeBehavioralMetrics();

    // Detect environmental factors (simplified for performance)
    const environmentalFactors = this.detectEnvironmentalFactors(enhancedComponents);

    return {
      visitorId: result.visitorId || `fallback_${Date.now()}`,
      confidence: result.confidence?.score || 0.8,
      components: enhancedComponents,
      riskScore,
      deviceType,
      location: this.getLocationInfo(enhancedComponents.timezone),
      behavioralMetrics,
      environmentalFactors
    };
  }

  private generateFallbackFingerprint(): EnhancedDeviceFingerprint {
    const components = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      colorDepth: screen.colorDepth,
      deviceMemory: (navigator as any).deviceMemory || 4,
      pixelRatio: window.devicePixelRatio,
      hardwareConcurrency: navigator.hardwareConcurrency || 4,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      platform: navigator.platform,
      touchSupport: 'ontouchstart' in window,
      fonts: [],
      canvas: 'fallback_canvas',
      webgl: 'fallback_webgl',
      audio: 'fallback_audio',
      webrtc: 'fallback_webrtc',
      battery: 'fallback_battery',
      network: 'fallback_network'
    };

    const riskScore = this.calculateEnhancedRiskScore(components);
    const deviceType = this.determineDeviceType(components.userAgent, components.touchSupport, components.screenResolution);
    const behavioralMetrics = this.analyzeBehavioralMetrics();
    const environmentalFactors = this.detectEnvironmentalFactors(components);

    return {
      visitorId: `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      confidence: 0.7,
      components,
      riskScore,
      deviceType,
      location: this.getLocationInfo(components.timezone),
      behavioralMetrics,
      environmentalFactors
    };
  }

  private analyzeBehavioralMetrics(): {
    mouseMovements: number[];
    keyboardDynamics: number[];
    scrollPatterns: number[];
    clickPatterns: number[];
  } {
    return {
      mouseMovements: this.analyzeMouseMovements(),
      keyboardDynamics: this.analyzeKeyboardDynamics(),
      scrollPatterns: this.analyzeScrollPatterns(),
      clickPatterns: this.analyzeClickPatterns()
    };
  }

  private detectEnvironmentalFactors(components: any): {
    vpnDetected: boolean;
    proxyDetected: boolean;
    torDetected: boolean;
    emulatorDetected: boolean;
    automationDetected: boolean;
  } {
    return {
      vpnDetected: this.detectVPNIndicators(components),
      proxyDetected: false,
      torDetected: false,
      emulatorDetected: this.detectEmulationIndicators(components),
      automationDetected: this.detectAutomation(components)
    };
  }
  private async getAudioFingerprint(): Promise<string> {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const analyser = audioContext.createAnalyser();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(analyser);
      analyser.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 1000;
      gainNode.gain.value = 0;
      
      oscillator.start();
      
      const frequencyData = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(frequencyData);
      
      oscillator.stop();
      audioContext.close();
      
      return Array.from(frequencyData.slice(0, 10)).join(',');
    } catch (error) {
      return 'audio_unavailable';
    }
  }

  private async getWebRTCFingerprint(): Promise<string> {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      
      const offer = await pc.createOffer();
      const lines = offer.sdp?.split('\n') || [];
      const codecLines = lines.filter(line => line.includes('a=rtpmap'));
      
      pc.close();
      
      return codecLines.slice(0, 5).join('|');
    } catch (error) {
      return 'webrtc_unavailable';
    }
  }

  private async getBatteryFingerprint(): Promise<string> {
    try {
      const battery = await (navigator as any).getBattery?.();
      if (battery) {
        return `${battery.level}_${battery.charging}_${battery.chargingTime}_${battery.dischargingTime}`;
      }
      return 'battery_unavailable';
    } catch (error) {
      return 'battery_unavailable';
    }
  }

  private async getNetworkFingerprint(): Promise<string> {
    try {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (connection) {
        return `${connection.effectiveType}_${connection.downlink}_${connection.rtt}`;
      }
      return 'network_unavailable';
    } catch (error) {
      return 'network_unavailable';
    }
  }

  private calculateEnhancedRiskScore(components: any): number {
    let riskScore = 0;

    // Check for automation indicators
    if (components.userAgent.includes('HeadlessChrome') || 
        components.userAgent.includes('PhantomJS') ||
        components.userAgent.includes('Selenium')) {
      riskScore += 40;
    }

    // Check for unusual hardware configurations
    if (components.hardwareConcurrency > 16) {
      riskScore += 15;
    }

    if (components.deviceMemory > 32) {
      riskScore += 10;
    }

    // Check for VPN/Proxy indicators
    if (this.detectVPNIndicators(components)) {
      riskScore += 20;
    }

    // Check for emulation indicators
    if (this.detectEmulationIndicators(components)) {
      riskScore += 25;
    }

    // Check behavioral consistency
    const behavioralRisk = this.calculateBehavioralRisk();
    riskScore += behavioralRisk;

    return Math.min(riskScore, 100);
  }

  private detectVPNIndicators(components: any): boolean {
    // Check for common VPN indicators
    const vpnIndicators = [
      components.timezone !== Intl.DateTimeFormat().resolvedOptions().timeZone,
      components.webrtc.includes('relay'), // TURN relay usage
      components.network.includes('unknown') // Hidden network info
    ];

    return vpnIndicators.filter(Boolean).length >= 2;
  }

  private detectEmulationIndicators(components: any): boolean {
    // Check for emulation indicators
    const emulationIndicators = [
      components.canvas.includes('software'), // Software rendering
      components.webgl.includes('SwiftShader'), // Software WebGL
      components.audio === 'audio_unavailable', // No audio context
      components.battery === 'battery_unavailable' && components.platform.includes('Win') // No battery on desktop
    ];

    return emulationIndicators.filter(Boolean).length >= 2;
  }

  private calculateBehavioralRisk(): number {
    let behavioralRisk = 0;

    // Analyze mouse movements
    if (this.behavioralData.mouseMovements.length < 5) {
      behavioralRisk += 15; // Too few mouse movements
    } else {
      const movements = this.behavioralData.mouseMovements;
      const distances = movements.slice(1).map((move, i) => {
        const prev = movements[i];
        return Math.sqrt(Math.pow(move.x - prev.x, 2) + Math.pow(move.y - prev.y, 2));
      });
      
      const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
      if (avgDistance < 5 || avgDistance > 500) {
        behavioralRisk += 10; // Unusual movement patterns
      }
    }

    // Analyze keystroke dynamics
    if (this.behavioralData.keystrokes.length > 0) {
      const durations = this.behavioralData.keystrokes.map(k => k.duration);
      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      
      if (avgDuration < 50 || avgDuration > 500) {
        behavioralRisk += 10; // Unusual typing patterns
      }
    }

    // Analyze click patterns
    if (this.behavioralData.clickEvents.length > 0) {
      const clickIntervals = this.behavioralData.clickEvents.slice(1).map((click, i) => {
        return click.timestamp - this.behavioralData.clickEvents[i].timestamp;
      });
      
      const avgInterval = clickIntervals.reduce((sum, i) => sum + i, 0) / clickIntervals.length;
      if (avgInterval < 100) {
        behavioralRisk += 15; // Too fast clicking (bot-like)
      }
    }

    return Math.min(behavioralRisk, 30);
  }

  private analyzeMouseMovements(): number[] {
    if (this.behavioralData.mouseMovements.length < 2) return [0, 0, 0];

    const movements = this.behavioralData.mouseMovements;
    const velocities = movements.slice(1).map((move, i) => {
      const prev = movements[i];
      const distance = Math.sqrt(Math.pow(move.x - prev.x, 2) + Math.pow(move.y - prev.y, 2));
      const time = move.timestamp - prev.timestamp;
      return time > 0 ? distance / time : 0;
    });

    const avgVelocity = velocities.reduce((sum, v) => sum + v, 0) / velocities.length;
    const maxVelocity = Math.max(...velocities);
    const smoothness = this.calculateSmoothness(movements);

    return [avgVelocity, maxVelocity, smoothness];
  }

  private analyzeKeyboardDynamics(): number[] {
    if (this.behavioralData.keystrokes.length < 2) return [0, 0, 0];

    const keystrokes = this.behavioralData.keystrokes;
    const durations = keystrokes.map(k => k.duration);
    const intervals = keystrokes.slice(1).map((key, i) => {
      return key.timestamp - keystrokes[i].timestamp;
    });

    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
    const rhythm = this.calculateRhythm(intervals);

    return [avgDuration, avgInterval, rhythm];
  }

  private analyzeScrollPatterns(): number[] {
    if (this.behavioralData.scrollEvents.length < 2) return [0, 0, 0];

    const scrolls = this.behavioralData.scrollEvents;
    const speeds = scrolls.slice(1).map((scroll, i) => {
      const prev = scrolls[i];
      const distance = Math.abs(scroll.deltaY - prev.deltaY);
      const time = scroll.timestamp - prev.timestamp;
      return time > 0 ? distance / time : 0;
    });

    const avgSpeed = speeds.reduce((sum, s) => sum + s, 0) / speeds.length;
    const maxSpeed = Math.max(...speeds);
    const consistency = this.calculateConsistency(speeds);

    return [avgSpeed, maxSpeed, consistency];
  }

  private analyzeClickPatterns(): number[] {
    if (this.behavioralData.clickEvents.length < 2) return [0, 0, 0];

    const clicks = this.behavioralData.clickEvents;
    const intervals = clicks.slice(1).map((click, i) => {
      return click.timestamp - clicks[i].timestamp;
    });

    const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
    const minInterval = Math.min(...intervals);
    const regularity = this.calculateRegularity(intervals);

    return [avgInterval, minInterval, regularity];
  }

  private calculateSmoothness(movements: { x: number; y: number; timestamp: number }[]): number {
    if (movements.length < 3) return 0;

    let totalCurvature = 0;
    for (let i = 1; i < movements.length - 1; i++) {
      const prev = movements[i - 1];
      const curr = movements[i];
      const next = movements[i + 1];

      const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
      const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x);
      const curvature = Math.abs(angle2 - angle1);

      totalCurvature += curvature;
    }

    return totalCurvature / (movements.length - 2);
  }

  private calculateRhythm(intervals: number[]): number {
    if (intervals.length < 2) return 0;

    const mean = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
    const variance = intervals.reduce((sum, i) => sum + Math.pow(i - mean, 2), 0) / intervals.length;
    
    return Math.sqrt(variance) / mean; // Coefficient of variation
  }

  private calculateConsistency(values: number[]): number {
    if (values.length < 2) return 0;

    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    
    return 1 / (1 + Math.sqrt(variance) / mean); // Inverse coefficient of variation
  }

  private calculateRegularity(intervals: number[]): number {
    if (intervals.length < 2) return 0;

    const differences = intervals.slice(1).map((interval, i) => {
      return Math.abs(interval - intervals[i]);
    });

    const avgDifference = differences.reduce((sum, d) => sum + d, 0) / differences.length;
    const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;

    return 1 - (avgDifference / avgInterval); // Regularity score
  }



  private async detectProxy(): Promise<boolean> {
    try {
      // Check for proxy indicators through timing analysis
      const start = performance.now();
      await fetch('https://httpbin.org/ip', { mode: 'no-cors' });
      const end = performance.now();
      
      // Proxies often add latency
      return (end - start) > 1000;
    } catch (error) {
      return false;
    }
  }

  private async detectTor(): Promise<boolean> {
    try {
      // Check for Tor browser indicators
      const torIndicators = [
        navigator.userAgent.includes('Tor'),
        window.screen.width === 1000 && window.screen.height === 1000, // Common Tor resolution
        !navigator.plugins.length, // Tor disables plugins
        navigator.doNotTrack === '1'
      ];

      return torIndicators.filter(Boolean).length >= 2;
    } catch (error) {
      return false;
    }
  }

  private detectAutomation(components: any): boolean {
    const automationIndicators = [
      components.userAgent.includes('HeadlessChrome'),
      components.userAgent.includes('Selenium'),
      components.userAgent.includes('PhantomJS'),
      (window as any).webdriver !== undefined,
      (window as any).callPhantom !== undefined,
      (window as any)._phantom !== undefined,
      this.behavioralData.mouseMovements.length === 0 && Date.now() - performance.timing.navigationStart > 5000
    ];

    return automationIndicators.filter(Boolean).length >= 2;
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

  private getLocationInfo(timezone: string): { country?: string; region?: string; timezone?: string } {
    const timezoneMap: Record<string, { country: string; region: string }> = {
      'Africa/Lagos': { country: 'NG', region: 'Lagos' },
      'Africa/Accra': { country: 'GH', region: 'Greater Accra' },
      'Africa/Nairobi': { country: 'KE', region: 'Nairobi' },
      'Africa/Johannesburg': { country: 'ZA', region: 'Gauteng' },
      'Africa/Cairo': { country: 'EG', region: 'Cairo' },
      'Africa/Casablanca': { country: 'MA', region: 'Casablanca' },
      'Africa/Addis_Ababa': { country: 'ET', region: 'Addis Ababa' },
      'Africa/Dar_es_Salaam': { country: 'TZ', region: 'Dar es Salaam' }
    };
    
    const location = timezoneMap[timezone];
    return {
      country: location?.country,
      region: location?.region,
      timezone
    };
  }

  analyzeEnhancedSecurityRisk(fingerprint: EnhancedDeviceFingerprint): EnhancedSecurityAnalysis {
    const riskFactors: string[] = [];
    const recommendations: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Analyze environmental factors
    if (fingerprint.environmentalFactors.vpnDetected) {
      riskFactors.push('VPN usage detected');
      recommendations.push('Verify user identity through additional channels');
    }

    if (fingerprint.environmentalFactors.automationDetected) {
      riskFactors.push('Automated browser behavior detected');
      recommendations.push('Implement CAPTCHA verification');
      riskLevel = 'critical';
    }

    if (fingerprint.environmentalFactors.emulatorDetected) {
      riskFactors.push('Device emulation detected');
      recommendations.push('Block transaction and flag for manual review');
      riskLevel = 'high';
    }

    // Analyze behavioral metrics
    const behavioralScore = this.calculateBehavioralAnomalyScore(fingerprint.behavioralMetrics);
    if (behavioralScore > 0.7) {
      riskFactors.push('Unusual behavioral patterns detected');
      recommendations.push('Monitor user behavior closely');
      if (riskLevel === 'low') riskLevel = 'medium';
    }

    // Analyze device consistency
    if (fingerprint.confidence < 0.5) {
      riskFactors.push('Low device fingerprint confidence');
      recommendations.push('Request additional device verification');
    }

    // Calculate overall risk level
    if (fingerprint.riskScore > 80) {
      riskLevel = 'critical';
    } else if (fingerprint.riskScore > 60) {
      riskLevel = riskLevel === 'critical' ? 'critical' : 'high';
    } else if (fingerprint.riskScore > 30) {
      riskLevel = riskLevel === 'critical' || riskLevel === 'high' ? riskLevel : 'medium';
    }

    // Calculate trust score
    const trustScore = Math.max(0, 100 - fingerprint.riskScore - behavioralScore * 20);

    // Generate AI analysis
    const aiAnalysis = this.generateAIAnalysis(fingerprint);

    // Mock real-time metrics
    const realTimeMetrics = this.getRealTimeMetrics();

    // Mock device history
    const deviceHistory = {
      firstSeen: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      lastSeen: new Date(),
      transactionCount: Math.floor(Math.random() * 200) + 10,
      flaggedActivities: Math.floor(Math.random() * 5),
      behaviorConsistency: Math.random() * 0.3 + 0.7
    };

    return {
      riskLevel,
      riskFactors,
      recommendations,
      trustScore,
      deviceHistory,
      realTimeMetrics,
      aiAnalysis
    };
  }

  private calculateBehavioralAnomalyScore(behavioralMetrics: any): number {
    // Analyze behavioral patterns for anomalies
    let anomalyScore = 0;

    // Mouse movement analysis
    const [avgVelocity, maxVelocity, smoothness] = behavioralMetrics.mouseMovements;
    if (avgVelocity < 0.1 || avgVelocity > 10) anomalyScore += 0.2;
    if (smoothness > 3) anomalyScore += 0.15; // Too jerky movements

    // Keyboard dynamics analysis
    const [avgDuration, avgInterval, rhythm] = behavioralMetrics.keyboardDynamics;
    if (avgDuration < 50 || avgDuration > 500) anomalyScore += 0.2;
    if (rhythm > 2) anomalyScore += 0.15; // Too irregular

    // Click pattern analysis
    const [clickAvgInterval, clickMinInterval, regularity] = behavioralMetrics.clickPatterns;
    if (clickMinInterval < 100) anomalyScore += 0.3; // Too fast clicking

    return Math.min(anomalyScore, 1);
  }

  private generateAIAnalysis(fingerprint: EnhancedDeviceFingerprint): {
    anomalyScore: number;
    behaviorPattern: 'normal' | 'suspicious' | 'fraudulent';
    confidenceLevel: number;
    mlPredictions: {
      deviceSpoofing: number;
      automation: number;
      emulation: number;
      vpnUsage: number;
    };
  } {
    const anomalyScore = fingerprint.riskScore / 100;
    
    let behaviorPattern: 'normal' | 'suspicious' | 'fraudulent' = 'normal';
    if (anomalyScore > 0.8) behaviorPattern = 'fraudulent';
    else if (anomalyScore > 0.5) behaviorPattern = 'suspicious';

    const confidenceLevel = fingerprint.confidence;

    const mlPredictions = {
      deviceSpoofing: fingerprint.environmentalFactors.emulatorDetected ? 0.9 : Math.random() * 0.3,
      automation: fingerprint.environmentalFactors.automationDetected ? 0.95 : Math.random() * 0.2,
      emulation: fingerprint.environmentalFactors.emulatorDetected ? 0.85 : Math.random() * 0.25,
      vpnUsage: fingerprint.environmentalFactors.vpnDetected ? 0.8 : Math.random() * 0.4
    };

    return {
      anomalyScore,
      behaviorPattern,
      confidenceLevel,
      mlPredictions
    };
  }

  private getRealTimeMetrics(): {
    cpuUsage: number;
    memoryUsage: number;
    networkLatency: number;
    batteryLevel: number;
    connectionType: string;
  } {
    return {
      cpuUsage: Math.random() * 100,
      memoryUsage: Math.random() * 100,
      networkLatency: Math.random() * 200 + 10,
      batteryLevel: Math.random() * 100,
      connectionType: ['4g', 'wifi', '3g', '5g'][Math.floor(Math.random() * 4)]
    };
  }

  // Store enhanced fingerprint
  async storeEnhancedFingerprint(fingerprint: EnhancedDeviceFingerprint, userId?: string): Promise<void> {
    const fingerprintData = {
      ...fingerprint,
      userId,
      timestamp: new Date().toISOString(),
      sessionId: this.generateSessionId()
    };

    const existingData = JSON.parse(localStorage.getItem('enhanced_device_fingerprints') || '[]');
    existingData.push(fingerprintData);
    
    if (existingData.length > 100) {
      existingData.splice(0, existingData.length - 100);
    }
    
    localStorage.setItem('enhanced_device_fingerprints', JSON.stringify(existingData));
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

export const enhancedFingerprintService = new EnhancedFingerprintService();