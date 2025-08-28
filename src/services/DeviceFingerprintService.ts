import { DeviceFingerprint } from '../types/fraud-detection';
import { sha256 } from 'crypto-js';

export class DeviceFingerprintService {
  private static instance: DeviceFingerprintService;
  private fingerprintCache: DeviceFingerprint | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private deviceHistory: Map<string, DeviceFingerprint[]> = new Map();
  private readonly MAX_DEVICE_HISTORY = 10;

  private constructor() {}

  public static getInstance(): DeviceFingerprintService {
    if (!DeviceFingerprintService.instance) {
      DeviceFingerprintService.instance = new DeviceFingerprintService();
    }
    return DeviceFingerprintService.instance;
  }

  /**
   * Generate a comprehensive device fingerprint using real browser APIs
   */
  public async generateFingerprint(): Promise<DeviceFingerprint> {
    // Check cache first
    if (this.fingerprintCache && Date.now() < this.cacheExpiry) {
      return this.fingerprintCache;
    }

    try {
      const fingerprint: DeviceFingerprint = {
        deviceId: await this.generateDeviceId(),
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        languages: Array.from(navigator.languages),
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack,
        ipAddress: await this.getIPAddress(),
        networkType: await this.getNetworkType(),
        hardwareConcurrency: navigator.hardwareConcurrency || 0,
        maxTouchPoints: navigator.maxTouchPoints || 0,
        canvas: await this.getCanvasFingerprint(),
        webgl: await this.getWebGLFingerprint(),
        fonts: await this.getAvailableFonts(),
        plugins: this.getPlugins(),
        localStorage: this.hasLocalStorage(),
        sessionStorage: this.hasSessionStorage(),
        indexedDB: this.hasIndexedDB(),
        cpuClass: (navigator as any).cpuClass,
        deviceMemory: (navigator as any).deviceMemory,
        pixelRatio: window.devicePixelRatio,
        touchSupport: this.getTouchSupport(),
        audioContext: await this.getAudioFingerprint(),
        webRTC: await this.getWebRTCFingerprint(),
        battery: await this.getBatteryInfo()
      };

      // Cache the fingerprint
      this.fingerprintCache = fingerprint;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;

      return fingerprint;
    } catch (error) {
      console.error('Error generating device fingerprint:', error);
      throw new Error('Failed to generate device fingerprint');
    }
  }

  /**
   * Generate a unique device ID based on multiple device characteristics
   */
  private async generateDeviceId(): Promise<string> {
    const components = [
      navigator.userAgent,
      navigator.language,
      navigator.platform,
      screen.width.toString(),
      screen.height.toString(),
      screen.colorDepth.toString(),
      new Date().getTimezoneOffset().toString(),
      navigator.hardwareConcurrency?.toString() || '0',
      navigator.maxTouchPoints?.toString() || '0'
    ];

    // Add canvas fingerprint for uniqueness
    const canvas = await this.getCanvasFingerprint();
    components.push(canvas);

    // Add WebGL fingerprint
    const webgl = await this.getWebGLFingerprint();
    components.push(webgl);

    // Create hash of all components
    const combined = components.join('|');
    return sha256(combined).toString();
  }

  /**
   * Get real IP address using multiple methods
   */
  private async getIPAddress(): Promise<string> {
    try {
      // Try multiple IP detection services
      const services = [
        'https://api.ipify.org?format=json',
        'https://ipapi.co/json/',
        'https://httpbin.org/ip'
      ];

      for (const service of services) {
        try {
          const response = await fetch(service);
          const data = await response.json();
          
          if (data.ip) return data.ip;
          if (data.origin) return data.origin;
        } catch (error) {
          continue; // Try next service
        }
      }

      // Fallback: try WebRTC for local IP
      return await this.getLocalIPAddress();
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Get local IP address using WebRTC
   */
  private async getLocalIPAddress(): Promise<string> {
    return new Promise((resolve) => {
      const rtc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      rtc.createDataChannel('');
      rtc.createOffer().then(offer => rtc.setLocalDescription(offer));

      rtc.onicecandidate = (event) => {
        if (event.candidate) {
          const candidate = event.candidate.candidate;
          const ipMatch = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
          if (ipMatch) {
            rtc.close();
            resolve(ipMatch[1]);
          }
        }
      };

      // Timeout after 3 seconds
      setTimeout(() => {
        rtc.close();
        resolve('unknown');
      }, 3000);
    });
  }

  /**
   * Get network connection type
   */
  private async getNetworkType(): Promise<string> {
    const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection;
    
    if (connection) {
      return `${connection.effectiveType || 'unknown'}-${connection.type || 'unknown'}`;
    }
    return 'unknown';
  }

  /**
   * Generate canvas fingerprint
   */
  private async getCanvasFingerprint(): Promise<string> {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return 'no-canvas';

      canvas.width = 200;
      canvas.height = 50;

      // Draw complex pattern
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Device fingerprint canvas 🔒', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Security test 123', 4, 35);

      // Add some geometric shapes
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgb(255,0,255)';
      ctx.beginPath();
      ctx.arc(50, 25, 20, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();

      return sha256(canvas.toDataURL()).toString();
    } catch (error) {
      return 'canvas-error';
    }
  }

  /**
   * Generate WebGL fingerprint
   */
  private async getWebGLFingerprint(): Promise<string> {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) return 'no-webgl';

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const vendor = gl.getParameter(debugInfo?.UNMASKED_VENDOR_WEBGL || gl.VENDOR);
      const renderer = gl.getParameter(debugInfo?.UNMASKED_RENDERER_WEBGL || gl.RENDERER);
      
      const webglInfo = [
        vendor,
        renderer,
        gl.getParameter(gl.VERSION),
        gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
        gl.getSupportedExtensions()?.join(',') || ''
      ].join('|');

      return sha256(webglInfo).toString();
    } catch (error) {
      return 'webgl-error';
    }
  }

  /**
   * Detect available fonts
   */
  private async getAvailableFonts(): Promise<string[]> {
    const testFonts = [
      'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana',
      'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS',
      'Trebuchet MS', 'Arial Black', 'Impact', 'Lucida Sans Unicode',
      'Tahoma', 'Lucida Console', 'Monaco', 'Bradley Hand ITC',
      'Brush Script MT', 'Luminari', 'Chalkduster'
    ];

    const availableFonts: string[] = [];
    const testString = 'mmmmmmmmmmlli';
    const testSize = '72px';
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) return [];

    // Baseline width with default font
    context.font = `${testSize} monospace`;
    const baselineWidth = context.measureText(testString).width;

    for (const font of testFonts) {
      context.font = `${testSize} ${font}, monospace`;
      const width = context.measureText(testString).width;
      
      if (width !== baselineWidth) {
        availableFonts.push(font);
      }
    }

    return availableFonts;
  }

  /**
   * Get browser plugins
   */
  private getPlugins(): string[] {
    const plugins: string[] = [];
    
    for (let i = 0; i < navigator.plugins.length; i++) {
      const plugin = navigator.plugins[i];
      plugins.push(`${plugin.name}:${plugin.version || 'unknown'}`);
    }
    
    return plugins;
  }

  /**
   * Check storage capabilities
   */
  private hasLocalStorage(): boolean {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }

  private hasSessionStorage(): boolean {
    try {
      const test = 'test';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }

  private hasIndexedDB(): boolean {
    return !!window.indexedDB;
  }

  /**
   * Get touch support information
   */
  private getTouchSupport(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  /**
   * Generate audio context fingerprint
   */
  private async getAudioFingerprint(): Promise<string> {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const analyser = audioContext.createAnalyser();
      const gainNode = audioContext.createGain();
      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

      oscillator.type = 'triangle';
      oscillator.frequency.value = 10000;

      gainNode.gain.value = 0;
      oscillator.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(0);

      const audioData: number[] = [];
      
      return new Promise((resolve) => {
        scriptProcessor.onaudioprocess = (event) => {
          const buffer = event.inputBuffer.getChannelData(0);
          for (let i = 0; i < buffer.length; i++) {
            audioData.push(buffer[i]);
          }
          
          if (audioData.length >= 1000) {
            oscillator.stop();
            audioContext.close();
            resolve(sha256(audioData.slice(0, 1000).join(',')).toString());
          }
        };

        // Timeout after 1 second
        setTimeout(() => {
          oscillator.stop();
          audioContext.close();
          resolve('audio-timeout');
        }, 1000);
      });
    } catch (error) {
      return 'no-audio';
    }
  }

  /**
   * Get WebRTC fingerprint
   */
  private async getWebRTCFingerprint(): Promise<string> {
    try {
      const rtc = new RTCPeerConnection();
      const candidates: string[] = [];

      return new Promise((resolve) => {
        rtc.onicecandidate = (event) => {
          if (event.candidate) {
            candidates.push(event.candidate.candidate);
          }
        };

        rtc.createDataChannel('test');
        rtc.createOffer().then(offer => {
          rtc.setLocalDescription(offer);
          
          setTimeout(() => {
            rtc.close();
            resolve(sha256(candidates.join('|')).toString());
          }, 1000);
        });

        // Timeout
        setTimeout(() => {
          rtc.close();
          resolve('webrtc-timeout');
        }, 2000);
      });
    } catch (error) {
      return 'no-webrtc';
    }
  }

  /**
   * Get battery information if available
   */
  private async getBatteryInfo(): Promise<DeviceFingerprint['battery']> {
    try {
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        return {
          charging: battery.charging,
          level: Math.round(battery.level * 100) / 100,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime
        };
      }
    } catch (error) {
      // Battery API not available or blocked
    }
    return undefined;
  }

  /**
   * Validate device fingerprint integrity
   */
  public validateFingerprint(fingerprint: DeviceFingerprint): boolean {
    const requiredFields = [
      'deviceId', 'userAgent', 'screenResolution', 'timezone',
      'language', 'platform', 'canvas', 'webgl'
    ];

    return requiredFields.every(field => 
      fingerprint[field as keyof DeviceFingerprint] !== undefined &&
      fingerprint[field as keyof DeviceFingerprint] !== null &&
      fingerprint[field as keyof DeviceFingerprint] !== ''
    );
  }

  /**
   * Compare two fingerprints for similarity
   */
  public compareFingerprints(fp1: DeviceFingerprint, fp2: DeviceFingerprint): number {
    const weights = {
      deviceId: 0.3,
      userAgent: 0.15,
      screenResolution: 0.1,
      canvas: 0.2,
      webgl: 0.15,
      timezone: 0.05,
      language: 0.05
    };

    let similarity = 0;
    let totalWeight = 0;

    Object.entries(weights).forEach(([field, weight]) => {
      const val1 = fp1[field as keyof DeviceFingerprint];
      const val2 = fp2[field as keyof DeviceFingerprint];
      
      if (val1 === val2) {
        similarity += weight;
      }
      totalWeight += weight;
    });

    return similarity / totalWeight;
  }

  /**
   * Detect device changes by comparing with historical fingerprints
   */
  public detectDeviceChanges(currentFingerprint: DeviceFingerprint, userId: string): {
    hasSignificantChanges: boolean;
    changeScore: number;
    changedComponents: string[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    details: Record<string, any>;
  } {
    const userHistory = this.deviceHistory.get(userId) || [];
    
    if (userHistory.length === 0) {
      // First time user - store fingerprint and return low risk
      this.storeDeviceFingerprint(currentFingerprint, userId);
      return {
        hasSignificantChanges: false,
        changeScore: 0,
        changedComponents: [],
        riskLevel: 'LOW',
        details: { reason: 'First device registration' }
      };
    }

    // Compare with most recent fingerprint
    const lastFingerprint = userHistory[userHistory.length - 1];
    const changes = this.analyzeDeviceChanges(currentFingerprint, lastFingerprint);
    
    // Store current fingerprint
    this.storeDeviceFingerprint(currentFingerprint, userId);
    
    return changes;
  }

  /**
   * Analyze specific changes between two device fingerprints
   */
  private analyzeDeviceChanges(current: DeviceFingerprint, previous: DeviceFingerprint): {
    hasSignificantChanges: boolean;
    changeScore: number;
    changedComponents: string[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    details: Record<string, any>;
  } {
    const changes: string[] = [];
    const details: Record<string, any> = {};
    let changeScore = 0;

    // Define component weights for risk calculation
    const componentWeights = {
      deviceId: 50,        // Highest risk - complete device change
      userAgent: 30,       // High risk - browser/OS change
      screenResolution: 20, // Medium risk - display change
      canvas: 25,          // High risk - graphics change
      webgl: 25,           // High risk - graphics hardware change
      ipAddress: 15,       // Medium risk - network change
      timezone: 10,        // Low-medium risk - location change
      language: 5,         // Low risk - settings change
      platform: 35,       // High risk - OS change
      hardwareConcurrency: 20, // Medium risk - CPU change
      deviceMemory: 15,    // Medium risk - RAM change
      plugins: 10,         // Low-medium risk - software change
      fonts: 8,            // Low risk - font installation
      audioContext: 15,    // Medium risk - audio hardware change
      webRTC: 10,          // Low-medium risk - network config change
      battery: 5           // Low risk - battery status change
    };

    // Check each component for changes
    Object.entries(componentWeights).forEach(([component, weight]) => {
      const currentValue = current[component as keyof DeviceFingerprint];
      const previousValue = previous[component as keyof DeviceFingerprint];

      if (this.hasComponentChanged(currentValue, previousValue, component)) {
        changes.push(component);
        changeScore += weight;
        details[component] = {
          previous: this.sanitizeValue(previousValue),
          current: this.sanitizeValue(currentValue),
          weight
        };
      }
    });

    // Special analysis for complex changes
    const complexAnalysis = this.performComplexChangeAnalysis(current, previous);
    changeScore += complexAnalysis.additionalRisk;
    details.complexAnalysis = complexAnalysis;

    // Determine risk level based on change score
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    if (changeScore >= 100) {
      riskLevel = 'CRITICAL';
    } else if (changeScore >= 60) {
      riskLevel = 'HIGH';
    } else if (changeScore >= 30) {
      riskLevel = 'MEDIUM';
    } else {
      riskLevel = 'LOW';
    }

    return {
      hasSignificantChanges: changeScore >= 30,
      changeScore,
      changedComponents: changes,
      riskLevel,
      details
    };
  }

  /**
   * Check if a specific component has changed
   */
  private hasComponentChanged(current: any, previous: any, component: string): boolean {
    if (component === 'fonts' || component === 'plugins' || component === 'languages') {
      // Array comparison
      if (!Array.isArray(current) || !Array.isArray(previous)) return true;
      if (current.length !== previous.length) return true;
      return !current.every((item, index) => item === previous[index]);
    }

    if (component === 'battery') {
      // Battery comparison (ignore minor level changes)
      if (!current && !previous) return false;
      if (!current || !previous) return true;
      return current.charging !== previous.charging;
    }

    if (component === 'ipAddress') {
      // IP address comparison (consider subnet changes)
      if (!current || !previous) return true;
      const currentSubnet = current.split('.').slice(0, 3).join('.');
      const previousSubnet = previous.split('.').slice(0, 3).join('.');
      return currentSubnet !== previousSubnet;
    }

    return current !== previous;
  }

  /**
   * Perform complex analysis for sophisticated attack detection
   */
  private performComplexChangeAnalysis(current: DeviceFingerprint, previous: DeviceFingerprint): {
    additionalRisk: number;
    suspiciousPatterns: string[];
    analysis: Record<string, any>;
  } {
    const suspiciousPatterns: string[] = [];
    let additionalRisk = 0;
    const analysis: Record<string, any> = {};

    // Pattern 1: Complete device spoofing
    const coreChanges = ['deviceId', 'userAgent', 'canvas', 'webgl', 'platform'].filter(
      component => this.hasComponentChanged(
        current[component as keyof DeviceFingerprint],
        previous[component as keyof DeviceFingerprint],
        component
      )
    );

    if (coreChanges.length >= 4) {
      suspiciousPatterns.push('COMPLETE_DEVICE_SPOOFING');
      additionalRisk += 50;
      analysis.deviceSpoofing = {
        changedCoreComponents: coreChanges.length,
        risk: 'CRITICAL'
      };
    }

    // Pattern 2: Browser fingerprint manipulation
    const fingerprintChanges = ['canvas', 'webgl', 'audioContext'].filter(
      component => this.hasComponentChanged(
        current[component as keyof DeviceFingerprint],
        previous[component as keyof DeviceFingerprint],
        component
      )
    );

    if (fingerprintChanges.length >= 2 && !coreChanges.includes('userAgent')) {
      suspiciousPatterns.push('FINGERPRINT_MANIPULATION');
      additionalRisk += 25;
      analysis.fingerprintManipulation = {
        manipulatedComponents: fingerprintChanges,
        risk: 'HIGH'
      };
    }

    // Pattern 3: Impossible hardware changes
    const hardwareChanges = ['screenResolution', 'hardwareConcurrency', 'deviceMemory'].filter(
      component => this.hasComponentChanged(
        current[component as keyof DeviceFingerprint],
        previous[component as keyof DeviceFingerprint],
        component
      )
    );

    if (hardwareChanges.length >= 2 && !coreChanges.includes('deviceId')) {
      suspiciousPatterns.push('IMPOSSIBLE_HARDWARE_CHANGE');
      additionalRisk += 30;
      analysis.impossibleHardware = {
        changedHardware: hardwareChanges,
        risk: 'HIGH'
      };
    }

    // Pattern 4: Rapid location changes
    if (current.timezone !== previous.timezone && current.ipAddress !== previous.ipAddress) {
      const timezoneDistance = this.calculateTimezoneDistance(current.timezone, previous.timezone);
      if (timezoneDistance > 6) { // More than 6 hours difference
        suspiciousPatterns.push('RAPID_LOCATION_CHANGE');
        additionalRisk += 20;
        analysis.rapidLocation = {
          timezoneDistance,
          risk: 'MEDIUM'
        };
      }
    }

    // Pattern 5: Automation detection
    const automationIndicators = this.detectAutomationIndicators(current, previous);
    if (automationIndicators.score > 0.7) {
      suspiciousPatterns.push('AUTOMATION_DETECTED');
      additionalRisk += 15;
      analysis.automation = automationIndicators;
    }

    return {
      additionalRisk,
      suspiciousPatterns,
      analysis
    };
  }

  /**
   * Detect automation/bot indicators
   */
  private detectAutomationIndicators(current: DeviceFingerprint, previous: DeviceFingerprint): {
    score: number;
    indicators: string[];
    details: Record<string, any>;
  } {
    const indicators: string[] = [];
    let score = 0;
    const details: Record<string, any> = {};

    // Check for headless browser indicators
    if (current.webgl === 'no-webgl' && current.canvas.includes('canvas-error')) {
      indicators.push('HEADLESS_BROWSER');
      score += 0.3;
    }

    // Check for consistent automation patterns
    if (current.plugins.length === 0 && current.fonts.length < 5) {
      indicators.push('MINIMAL_ENVIRONMENT');
      score += 0.2;
    }

    // Check for impossible human behavior
    if (current.maxTouchPoints === 0 && current.touchSupport === false && 
        current.userAgent.includes('Mobile')) {
      indicators.push('INCONSISTENT_MOBILE');
      score += 0.3;
    }

    // Check for selenium/webdriver indicators
    if (current.userAgent.includes('HeadlessChrome') || 
        current.userAgent.includes('PhantomJS')) {
      indicators.push('AUTOMATION_USER_AGENT');
      score += 0.5;
    }

    details.indicators = indicators;
    details.totalScore = score;

    return { score, indicators, details };
  }

  /**
   * Calculate timezone distance in hours
   */
  private calculateTimezoneDistance(tz1: string, tz2: string): number {
    try {
      const date = new Date();
      const time1 = new Date(date.toLocaleString('en-US', { timeZone: tz1 }));
      const time2 = new Date(date.toLocaleString('en-US', { timeZone: tz2 }));
      return Math.abs(time1.getTime() - time2.getTime()) / (1000 * 60 * 60);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Store device fingerprint in history
   */
  private storeDeviceFingerprint(fingerprint: DeviceFingerprint, userId: string): void {
    const userHistory = this.deviceHistory.get(userId) || [];
    userHistory.push({
      ...fingerprint,
      timestamp: new Date() as any // Add timestamp for tracking
    });

    // Keep only recent history
    if (userHistory.length > this.MAX_DEVICE_HISTORY) {
      userHistory.shift();
    }

    this.deviceHistory.set(userId, userHistory);
  }

  /**
   * Get device trust score based on history and consistency
   */
  public calculateDeviceTrustScore(fingerprint: DeviceFingerprint, userId: string): number {
    const userHistory = this.deviceHistory.get(userId) || [];
    
    if (userHistory.length === 0) {
      return 0.5; // Neutral trust for new devices
    }

    let trustScore = 1.0;
    const changeAnalysis = this.detectDeviceChanges(fingerprint, userId);

    // Reduce trust based on change score
    trustScore -= (changeAnalysis.changeScore / 200); // Normalize to 0-1

    // Reduce trust for suspicious patterns
    if (changeAnalysis.details.complexAnalysis?.suspiciousPatterns.length > 0) {
      trustScore -= 0.3;
    }

    // Increase trust for consistent usage
    const consistencyScore = this.calculateConsistencyScore(userHistory);
    trustScore += (consistencyScore * 0.2);

    // Ensure score is between 0 and 1
    return Math.max(0, Math.min(1, trustScore));
  }

  /**
   * Calculate consistency score based on device history
   */
  private calculateConsistencyScore(history: DeviceFingerprint[]): number {
    if (history.length < 2) return 0;

    let consistentComponents = 0;
    const totalComponents = 10; // Key components to check

    const keyComponents = [
      'deviceId', 'userAgent', 'screenResolution', 'platform',
      'hardwareConcurrency', 'canvas', 'webgl', 'timezone',
      'language', 'ipAddress'
    ];

    keyComponents.forEach(component => {
      const values = history.map(fp => fp[component as keyof DeviceFingerprint]);
      const uniqueValues = new Set(values);
      
      // If 80% or more of the values are the same, consider it consistent
      const mostCommonCount = Math.max(...Array.from(uniqueValues).map(
        value => values.filter(v => v === value).length
      ));
      
      if (mostCommonCount / history.length >= 0.8) {
        consistentComponents++;
      }
    });

    return consistentComponents / totalComponents;
  }

  /**
   * Sanitize sensitive values for logging
   */
  private sanitizeValue(value: any): any {
    if (typeof value === 'string' && value.includes('.')) {
      // Potentially an IP address
      const parts = value.split('.');
      if (parts.length === 4 && parts.every(part => !isNaN(Number(part)))) {
        return parts.slice(0, 2).join('.') + '.xxx.xxx';
      }
    }
    return value;
  }

  /**
   * Get device fingerprint history for a user
   */
  public getDeviceHistory(userId: string): DeviceFingerprint[] {
    return this.deviceHistory.get(userId) || [];
  }

  /**
   * Check if device is trusted for user based on history
   */
  public async isDeviceTrusted(deviceInfo: DeviceFingerprint, userId: string): Promise<boolean> {
    const trustScore = this.calculateDeviceTrustScore(deviceInfo, userId);
    return trustScore >= 0.7; // 70% trust threshold
  }

  /**
   * Clear fingerprint cache
   */
  public clearCache(): void {
    this.fingerprintCache = null;
    this.cacheExpiry = 0;
  }

  /**
   * Clear device history for a user (for testing or privacy)
   */
  public clearDeviceHistory(userId: string): void {
    this.deviceHistory.delete(userId);
  }

  /**
   * Get comprehensive device analysis report
   */
  public generateDeviceAnalysisReport(fingerprint: DeviceFingerprint, userId: string): {
    trustScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    changeAnalysis: ReturnType<typeof this.detectDeviceChanges>;
    recommendations: string[];
    securityFlags: string[];
  } {
    const trustScore = this.calculateDeviceTrustScore(fingerprint, userId);
    const changeAnalysis = this.detectDeviceChanges(fingerprint, userId);
    
    const recommendations: string[] = [];
    const securityFlags: string[] = [];

    // Generate recommendations based on analysis
    if (trustScore < 0.3) {
      recommendations.push('BLOCK_TRANSACTION');
      securityFlags.push('UNTRUSTED_DEVICE');
    } else if (trustScore < 0.7) {
      recommendations.push('REQUIRE_ADDITIONAL_VERIFICATION');
      securityFlags.push('SUSPICIOUS_DEVICE');
    }

    if (changeAnalysis.riskLevel === 'CRITICAL') {
      recommendations.push('IMMEDIATE_SECURITY_REVIEW');
      securityFlags.push('CRITICAL_DEVICE_CHANGES');
    }

    if (changeAnalysis.details.complexAnalysis?.suspiciousPatterns.includes('AUTOMATION_DETECTED')) {
      recommendations.push('BOT_DETECTION_ALERT');
      securityFlags.push('AUTOMATION_SUSPECTED');
    }

    return {
      trustScore,
      riskLevel: changeAnalysis.riskLevel,
      changeAnalysis,
      recommendations,
      securityFlags
    };
  }
}

export default DeviceFingerprintService;