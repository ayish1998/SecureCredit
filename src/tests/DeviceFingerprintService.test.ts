import DeviceFingerprintService from '../services/DeviceFingerprintService';
import { DeviceFingerprint } from '../types/fraud-detection';

// Mock browser APIs for testing
const mockNavigator = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  language: 'en-US',
  languages: ['en-US', 'en'],
  platform: 'Win32',
  cookieEnabled: true,
  doNotTrack: null,
  hardwareConcurrency: 8,
  maxTouchPoints: 0,
  plugins: []
};

const mockScreen = {
  width: 1920,
  height: 1080,
  colorDepth: 24
};

const mockWindow = {
  devicePixelRatio: 1,
  indexedDB: {},
  AudioContext: jest.fn(),
  webkitAudioContext: jest.fn()
};

const mockStorage = {
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

// Mock global objects
Object.defineProperty(global, 'navigator', {
  value: mockNavigator,
  writable: true
});

Object.defineProperty(global, 'screen', {
  value: mockScreen,
  writable: true
});

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true
});

Object.defineProperty(global, 'localStorage', {
  value: mockStorage,
  writable: true
});

Object.defineProperty(global, 'sessionStorage', {
  value: mockStorage,
  writable: true
});

// Mock Intl
Object.defineProperty(global, 'Intl', {
  value: {
    DateTimeFormat: jest.fn(() => ({
      resolvedOptions: () => ({ timeZone: 'America/New_York' })
    }))
  },
  writable: true
});

// Mock fetch for IP detection
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ ip: '192.168.1.1' })
  })
) as jest.Mock;

// Mock document
Object.defineProperty(global, 'document', {
  value: {
    createElement: jest.fn(() => ({
      getContext: jest.fn(() => ({
        fillRect: jest.fn(),
        fillText: jest.fn(),
        measureText: jest.fn(() => ({ width: 100 })),
        beginPath: jest.fn(),
        arc: jest.fn(),
        closePath: jest.fn(),
        fill: jest.fn(),
        toDataURL: jest.fn(() => 'mock-canvas-data')
      })),
      width: 0,
      height: 0,
      toDataURL: jest.fn(() => 'mock-canvas-data')
    }))
  },
  writable: true
});

// Mock RTCPeerConnection
global.RTCPeerConnection = jest.fn(() => ({
  createDataChannel: jest.fn(),
  createOffer: jest.fn(() => Promise.resolve({})),
  setLocalDescription: jest.fn(),
  onicecandidate: null,
  close: jest.fn()
}));

const mockFingerprint: DeviceFingerprint = {
  deviceId: 'test-device-id',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  screenResolution: '1920x1080',
  colorDepth: 24,
  timezone: 'America/New_York',
  language: 'en-US',
  languages: ['en-US', 'en'],
  platform: 'Win32',
  cookieEnabled: true,
  doNotTrack: null,
  ipAddress: '192.168.1.1',
  networkType: 'unknown',
  hardwareConcurrency: 8,
  maxTouchPoints: 0,
  canvas: 'mock-canvas-hash',
  webgl: 'mock-webgl-hash',
  fonts: ['Arial', 'Helvetica'],
  plugins: [],
  localStorage: true,
  sessionStorage: true,
  indexedDB: true,
  cpuClass: undefined,
  deviceMemory: undefined,
  pixelRatio: 1,
  touchSupport: false,
  audioContext: 'mock-audio-hash',
  webRTC: 'mock-webrtc-hash',
  battery: undefined
};

describe('DeviceFingerprintService', () => {
  let service: DeviceFingerprintService;

  beforeEach(() => {
    service = DeviceFingerprintService.getInstance();
    service.clearCache();
    jest.clearAllMocks();
  });

  describe('generateFingerprint', () => {
    it('should generate a valid device fingerprint', async () => {
      const fingerprint = await service.generateFingerprint();
      
      expect(fingerprint).toBeDefined();
      expect(fingerprint.deviceId).toBeDefined();
      expect(fingerprint.userAgent).toBe(mockNavigator.userAgent);
      expect(fingerprint.screenResolution).toBe('1920x1080');
      expect(fingerprint.timezone).toBe('America/New_York');
    });

    it('should cache fingerprint for performance', async () => {
      const fingerprint1 = await service.generateFingerprint();
      const fingerprint2 = await service.generateFingerprint();
      
      expect(fingerprint1).toEqual(fingerprint2);
    });
  });

  describe('validateFingerprint', () => {
    it('should validate a complete fingerprint', () => {
      const isValid = service.validateFingerprint(mockFingerprint);
      expect(isValid).toBe(true);
    });

    it('should reject incomplete fingerprint', () => {
      const incompleteFingerprint = { ...mockFingerprint };
      delete incompleteFingerprint.deviceId;
      
      const isValid = service.validateFingerprint(incompleteFingerprint);
      expect(isValid).toBe(false);
    });
  });

  describe('compareFingerprints', () => {
    it('should return 1 for identical fingerprints', () => {
      const similarity = service.compareFingerprints(mockFingerprint, mockFingerprint);
      expect(similarity).toBe(1);
    });

    it('should return lower similarity for different fingerprints', () => {
      const differentFingerprint = {
        ...mockFingerprint,
        deviceId: 'different-device-id',
        userAgent: 'Different User Agent'
      };
      
      const similarity = service.compareFingerprints(mockFingerprint, differentFingerprint);
      expect(similarity).toBeLessThan(1);
      expect(similarity).toBeGreaterThan(0);
    });
  });

  describe('detectDeviceChanges', () => {
    it('should detect no changes for first-time user', () => {
      const changes = service.detectDeviceChanges(mockFingerprint, 'new-user');
      
      expect(changes.hasSignificantChanges).toBe(false);
      expect(changes.changeScore).toBe(0);
      expect(changes.riskLevel).toBe('LOW');
    });

    it('should detect significant changes', () => {
      // First fingerprint
      service.detectDeviceChanges(mockFingerprint, 'test-user');
      
      // Modified fingerprint
      const modifiedFingerprint = {
        ...mockFingerprint,
        deviceId: 'new-device-id',
        platform: 'Mac Intel',
        userAgent: 'Different Browser'
      };
      
      const changes = service.detectDeviceChanges(modifiedFingerprint, 'test-user');
      
      expect(changes.hasSignificantChanges).toBe(true);
      expect(changes.changeScore).toBeGreaterThan(30);
      expect(changes.changedComponents).toContain('deviceId');
    });

    it('should detect spoofed fingerprint', () => {
      // First fingerprint
      service.detectDeviceChanges(mockFingerprint, 'test-user');
      
      // Completely different fingerprint (spoofed)
      const spoofedFingerprint = {
        ...mockFingerprint,
        deviceId: 'spoofed-device',
        userAgent: 'Spoofed Browser',
        platform: 'Linux',
        canvas: 'spoofed-canvas',
        webgl: 'spoofed-webgl'
      };
      
      const changes = service.detectDeviceChanges(spoofedFingerprint, 'test-user');
      
      expect(changes.riskLevel).toBe('CRITICAL');
      expect(changes.details.complexAnalysis.suspiciousPatterns).toContain('COMPLETE_DEVICE_SPOOFING');
    });

    it('should detect automation indicators', () => {
      // First fingerprint
      service.detectDeviceChanges(mockFingerprint, 'test-user');
      
      // Bot-like fingerprint
      const botFingerprint = {
        ...mockFingerprint,
        userAgent: 'HeadlessChrome/91.0.4472.77',
        webgl: 'no-webgl',
        canvas: 'canvas-error',
        plugins: [],
        fonts: ['Arial']
      };
      
      const changes = service.detectDeviceChanges(botFingerprint, 'test-user');
      
      expect(changes.details.complexAnalysis.suspiciousPatterns).toContain('AUTOMATION_DETECTED');
    });
  });

  describe('calculateDeviceTrustScore', () => {
    it('should return neutral trust for new device', () => {
      const trustScore = service.calculateDeviceTrustScore(mockFingerprint, 'new-user');
      expect(trustScore).toBe(0.5);
    });

    it('should return high trust for consistent device', () => {
      // Establish baseline
      service.detectDeviceChanges(mockFingerprint, 'consistent-user');
      
      const trustScore = service.calculateDeviceTrustScore(mockFingerprint, 'consistent-user');
      expect(trustScore).toBeGreaterThan(0.7);
    });

    it('should return low trust for suspicious device', () => {
      // Establish baseline
      service.detectDeviceChanges(mockFingerprint, 'suspicious-user');
      
      const suspiciousFingerprint = {
        ...mockFingerprint,
        deviceId: 'new-device-id',
        userAgent: 'HeadlessChrome',
        canvas: 'canvas-error',
        webgl: 'no-webgl'
      };
      
      const trustScore = service.calculateDeviceTrustScore(suspiciousFingerprint, 'suspicious-user');
      expect(trustScore).toBeLessThan(0.5);
    });
  });

  describe('isDeviceTrusted', () => {
    it('should return true for trusted device', async () => {
      // Establish consistent usage
      service.detectDeviceChanges(mockFingerprint, 'trusted-user');
      
      const isTrusted = await service.isDeviceTrusted(mockFingerprint, 'trusted-user');
      expect(isTrusted).toBe(true);
    });

    it('should return false for untrusted device', async () => {
      const untrustedFingerprint = {
        ...mockFingerprint,
        userAgent: 'HeadlessChrome',
        webgl: 'no-webgl'
      };
      
      const isTrusted = await service.isDeviceTrusted(untrustedFingerprint, 'test-user');
      expect(isTrusted).toBe(false);
    });
  });

  describe('Device History Management', () => {
    it('should store and retrieve device history', () => {
      service.detectDeviceChanges(mockFingerprint, 'history-user');
      
      const history = service.getDeviceHistory('history-user');
      expect(history).toHaveLength(1);
      expect(history[0].deviceId).toBe(mockFingerprint.deviceId);
    });

    it('should limit device history size', () => {
      // Add more than MAX_DEVICE_HISTORY entries
      for (let i = 0; i < 15; i++) {
        const fp = { ...mockFingerprint, deviceId: `device-${i}` };
        service.detectDeviceChanges(fp, 'history-user');
      }
      
      const history = service.getDeviceHistory('history-user');
      expect(history.length).toBeLessOrEqual(10); // MAX_DEVICE_HISTORY
    });

    it('should clear device history', () => {
      service.detectDeviceChanges(mockFingerprint, 'clear-user');
      service.clearDeviceHistory('clear-user');
      
      const history = service.getDeviceHistory('clear-user');
      expect(history).toHaveLength(0);
    });
  });

  describe('generateDeviceAnalysisReport', () => {
    it('should generate comprehensive analysis report', () => {
      const report = service.generateDeviceAnalysisReport(mockFingerprint, 'test-user');
      
      expect(report).toHaveProperty('trustScore');
      expect(report).toHaveProperty('riskLevel');
      expect(report).toHaveProperty('changeAnalysis');
      expect(report).toHaveProperty('recommendations');
      expect(report).toHaveProperty('securityFlags');
    });

    it('should recommend blocking for critical risk', () => {
      // First establish baseline
      service.detectDeviceChanges(mockFingerprint, 'critical-user');
      
      const criticalFingerprint = {
        ...mockFingerprint,
        deviceId: 'malicious-device',
        userAgent: 'HeadlessChrome',
        platform: 'Linux',
        canvas: 'spoofed-canvas',
        webgl: 'spoofed-webgl'
      };
      
      const report = service.generateDeviceAnalysisReport(criticalFingerprint, 'critical-user');
      
      expect(report.riskLevel).toBe('CRITICAL');
      expect(report.recommendations).toContain('BLOCK_TRANSACTION');
      expect(report.securityFlags).toContain('UNTRUSTED_DEVICE');
    });
  });
});