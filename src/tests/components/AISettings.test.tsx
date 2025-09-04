import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AISettings } from '../../components/AISettings';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { DEFAULT_AI_CONFIG } from '../../types/aiConfig';

// Mock the aiConfigManager
const mockConfigManager = {
  getConfig: vi.fn(() => DEFAULT_AI_CONFIG),
  getUsageMetrics: vi.fn(() => ({
    totalRequests: 1250,
    successfulRequests: 1180,
    failedRequests: 70,
    averageResponseTime: 1850,
    cacheHitRate: 75.5,
    errorRate: 5.6,
    lastResetDate: '2024-01-01T00:00:00Z',
    fraudAnalysisCount: 450,
    creditScoringCount: 380,
    securityAnalysisCount: 220,
    generalInsightsCount: 200,
    estimatedCost: 12.45,
    costPerRequest: 0.00996
  })),
  updateConfig: vi.fn(() => Promise.resolve({ isValid: true, errors: [], warnings: [] })),
  testConfiguration: vi.fn(() => Promise.resolve({ success: true, message: 'Test successful' })),
  getDefaultConfig: vi.fn(() => DEFAULT_AI_CONFIG),
  resetUsageMetrics: vi.fn()
};

vi.mock('../../utils/aiConfigManager', () => ({
  aiConfigManager: mockConfigManager
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('AISettings Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when open', () => {
      renderWithTheme(<AISettings {...defaultProps} />);
      
      expect(screen.getByText('AI Configuration')).toBeInTheDocument();
      expect(screen.getByText('Manage AI service settings and preferences')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      renderWithTheme(<AISettings {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByText('AI Configuration')).not.toBeInTheDocument();
    });

    it('should render all tabs', () => {
      renderWithTheme(<AISettings {...defaultProps} />);
      
      expect(screen.getByText('General')).toBeInTheDocument();
      expect(screen.getByText('Features')).toBeInTheDocument();
      expect(screen.getByText('Performance')).toBeInTheDocument();
      expect(screen.getByText('Usage & Costs')).toBeInTheDocument();
    });
  });

  describe('General Tab', () => {
    it('should display API key input', () => {
      renderWithTheme(<AISettings {...defaultProps} />);
      
      expect(screen.getByLabelText('Gemini API Key')).toBeInTheDocument();
    });

    it('should toggle API key visibility', async () => {
      renderWithTheme(<AISettings {...defaultProps} />);
      
      const apiKeyInput = screen.getByLabelText('Gemini API Key') as HTMLInputElement;
      const toggleButton = screen.getByRole('button', { name: /toggle api key visibility/i });
      
      expect(apiKeyInput.type).toBe('password');
      
      fireEvent.click(toggleButton);
      expect(apiKeyInput.type).toBe('text');
    });

    it('should handle API key changes', async () => {
      renderWithTheme(<AISettings {...defaultProps} />);
      
      const apiKeyInput = screen.getByLabelText('Gemini API Key');
      fireEvent.change(apiKeyInput, { target: { value: 'new-api-key' } });
      
      expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
    });

    it('should test configuration', async () => {
      renderWithTheme(<AISettings {...defaultProps} />);
      
      const testButton = screen.getByText('Test Connection');
      fireEvent.click(testButton);
      
      await waitFor(() => {
        expect(mockConfigManager.testConfiguration).toHaveBeenCalled();
      });
    });
  });

  describe('Features Tab', () => {
    it('should display all AI features', () => {
      renderWithTheme(<AISettings {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Features'));
      
      expect(screen.getByText('Fraud Detection')).toBeInTheDocument();
      expect(screen.getByText('Credit Scoring')).toBeInTheDocument();
      expect(screen.getByText('Security Analysis')).toBeInTheDocument();
      expect(screen.getByText('General Insights')).toBeInTheDocument();
    });

    it('should toggle feature switches', async () => {
      renderWithTheme(<AISettings {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Features'));
      
      const fraudToggle = screen.getAllByRole('checkbox')[0];
      fireEvent.click(fraudToggle);
      
      expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
    });
  });

  describe('Performance Tab', () => {
    it('should display performance settings', () => {
      renderWithTheme(<AISettings {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Performance'));
      
      expect(screen.getByLabelText('Max Retries')).toBeInTheDocument();
      expect(screen.getByLabelText('Timeout (ms)')).toBeInTheDocument();
      expect(screen.getByLabelText('Cache Size')).toBeInTheDocument();
      expect(screen.getByLabelText('Confidence Threshold (%)')).toBeInTheDocument();
    });

    it('should handle numeric input changes', () => {
      renderWithTheme(<AISettings {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Performance'));
      
      const retriesInput = screen.getByLabelText('Max Retries');
      fireEvent.change(retriesInput, { target: { value: '5' } });
      
      expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
    });
  });

  describe('Usage & Costs Tab', () => {
    it('should display usage metrics', () => {
      renderWithTheme(<AISettings {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Usage & Costs'));
      
      expect(screen.getByText('1,250')).toBeInTheDocument(); // Total requests
      expect(screen.getByText('94.4%')).toBeInTheDocument(); // Success rate
      expect(screen.getByText('1850ms')).toBeInTheDocument(); // Avg response time
      expect(screen.getByText('$12.45')).toBeInTheDocument(); // Estimated cost
    });

    it('should display feature usage breakdown', () => {
      renderWithTheme(<AISettings {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Usage & Costs'));
      
      expect(screen.getByText('450')).toBeInTheDocument(); // Fraud detection count
      expect(screen.getByText('380')).toBeInTheDocument(); // Credit scoring count
      expect(screen.getByText('220')).toBeInTheDocument(); // Security analysis count
      expect(screen.getByText('200')).toBeInTheDocument(); // General insights count
    });
  });

  describe('Actions', () => {
    it('should save configuration', async () => {
      renderWithTheme(<AISettings {...defaultProps} />);
      
      // Make a change to enable save button
      const apiKeyInput = screen.getByLabelText('Gemini API Key');
      fireEvent.change(apiKeyInput, { target: { value: 'new-key' } });
      
      const saveButton = screen.getByText('Save Changes');
      expect(saveButton).not.toBeDisabled();
      
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(mockConfigManager.updateConfig).toHaveBeenCalled();
      });
    });

    it('should reset to defaults', () => {
      renderWithTheme(<AISettings {...defaultProps} />);
      
      const resetButton = screen.getByText('Reset to Defaults');
      fireEvent.click(resetButton);
      
      expect(mockConfigManager.getDefaultConfig).toHaveBeenCalled();
    });

    it('should close modal', () => {
      const onClose = vi.fn();
      renderWithTheme(<AISettings {...defaultProps} onClose={onClose} />);
      
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      
      expect(onClose).toHaveBeenCalled();
    });

    it('should close modal on backdrop click', () => {
      const onClose = vi.fn();
      renderWithTheme(<AISettings {...defaultProps} onClose={onClose} />);
      
      const backdrop = screen.getByRole('dialog').parentElement;
      fireEvent.click(backdrop!);
      
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle configuration save errors', async () => {
      mockConfigManager.updateConfig.mockResolvedValueOnce({
        isValid: false,
        errors: ['Invalid API key'],
        warnings: []
      });

      renderWithTheme(<AISettings {...defaultProps} />);
      
      // Make a change and save
      const apiKeyInput = screen.getByLabelText('Gemini API Key');
      fireEvent.change(apiKeyInput, { target: { value: 'invalid-key' } });
      
      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Invalid API key/)).toBeInTheDocument();
      });
    });

    it('should handle test configuration errors', async () => {
      mockConfigManager.testConfiguration.mockResolvedValueOnce({
        success: false,
        message: 'Connection failed'
      });

      renderWithTheme(<AISettings {...defaultProps} />);
      
      const testButton = screen.getByText('Test Connection');
      fireEvent.click(testButton);
      
      await waitFor(() => {
        expect(screen.getByText('Connection failed')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state during save', async () => {
      mockConfigManager.updateConfig.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ isValid: true, errors: [], warnings: [] }), 100))
      );

      renderWithTheme(<AISettings {...defaultProps} />);
      
      // Make a change and save
      const apiKeyInput = screen.getByLabelText('Gemini API Key');
      fireEvent.change(apiKeyInput, { target: { value: 'new-key' } });
      
      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);
      
      expect(screen.getByText('Saving...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByText('Save Changes')).toBeInTheDocument();
      });
    });

    it('should show loading state during test', async () => {
      mockConfigManager.testConfiguration.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true, message: 'Success' }), 100))
      );

      renderWithTheme(<AISettings {...defaultProps} />);
      
      const testButton = screen.getByText('Test Connection');
      fireEvent.click(testButton);
      
      expect(screen.getByText('Testing...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByText('Test Connection')).toBeInTheDocument();
      });
    });
  });
});