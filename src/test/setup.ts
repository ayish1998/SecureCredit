import '@testing-library/jest-dom';

// Mock environment variables for testing
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_GEMINI_API_KEY: 'test-api-key-AIzaSyTest123',
    VITE_AI_ENABLED: 'true',
    VITE_AI_RATE_LIMIT_PER_MINUTE: '60',
    VITE_AI_TIMEOUT_MS: '10000',
    VITE_AI_RETRY_ATTEMPTS: '3',
  },
  writable: true,
});