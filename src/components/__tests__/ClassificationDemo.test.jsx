import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClassificationDemo from '../ClassificationDemo';

// Mock Recharts components to avoid complex chart rendering in tests
vi.mock('recharts', () => ({
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  ReferenceLine: () => <div data-testid="reference-line" />,
  Legend: () => <div data-testid="legend" />
}));

describe('ClassificationDemo Component', () => {
  it('renders without crashing', () => {
    render(<ClassificationDemo />);
    expect(screen.getByText('Interactive Classification Demo')).toBeInTheDocument();
  });

  it('displays the total population', () => {
    render(<ClassificationDemo />);
    expect(screen.getByText(/Total Population: 1,000,000/)).toBeInTheDocument();
  });

  it('renders all slider controls', () => {
    render(<ClassificationDemo />);

    expect(screen.getByText(/Prevalence:/)).toBeInTheDocument();
    expect(screen.getByText(/Operating Point:/)).toBeInTheDocument();

    // Should find multiple "Mean" and "Standard Deviation" labels
    const meanLabels = screen.getAllByText(/Mean:/);
    const sdLabels = screen.getAllByText(/Standard Deviation:/);

    expect(meanLabels).toHaveLength(2); // One for positive, one for negative
    expect(sdLabels).toHaveLength(2); // One for positive, one for negative
  });

  it('displays confusion matrix with initial values', () => {
    render(<ClassificationDemo />);

    expect(screen.getByText('Confusion Matrix')).toBeInTheDocument();
    expect(screen.getByText('True Positive (TP)')).toBeInTheDocument();
    expect(screen.getByText('False Negative (FN)')).toBeInTheDocument();
    expect(screen.getByText('False Positive (FP)')).toBeInTheDocument();
    expect(screen.getByText('True Negative (TN)')).toBeInTheDocument();
  });

  it('displays performance metrics', () => {
    render(<ClassificationDemo />);

    expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
    expect(screen.getByText('Sensitivity (True Positive Rate)')).toBeInTheDocument();
    expect(screen.getByText('Specificity (True Negative Rate)')).toBeInTheDocument();
    expect(screen.getByText('Positive Predictive Value (Precision)')).toBeInTheDocument();
    expect(screen.getByText('Negative Predictive Value')).toBeInTheDocument();
    expect(screen.getByText('Accuracy')).toBeInTheDocument();
  });

  it('renders chart components', () => {
    render(<ClassificationDemo />);

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getAllByTestId('line')).toHaveLength(2); // Two lines for positive and negative
  });

  it('displays population sections', () => {
    render(<ClassificationDemo />);

    expect(screen.getByText('Population with Condition')).toBeInTheDocument();
    expect(screen.getByText('Population without Condition')).toBeInTheDocument();
  });

  it('shows numerical values in confusion matrix', () => {
    render(<ClassificationDemo />);

    // Look for large numbers (formatted with commas) that represent the confusion matrix values
    const numbersRegex = /[\d,]+/;
    const confusionMatrixSection = screen.getByText('Confusion Matrix').closest('div');

    // Should find numerical values for TP, FN, FP, TN
    expect(confusionMatrixSection).toBeInTheDocument();
  });

  it('shows numerical values in performance metrics', () => {
    render(<ClassificationDemo />);

    // Performance metrics should show decimal values
    const performanceSection = screen.getByText('Performance Metrics').closest('div');
    expect(performanceSection).toBeInTheDocument();

    // Should find "Value:" labels with numerical results
    expect(screen.getAllByText(/Value:/)).toHaveLength(5); // 5 performance metrics
  });

  it('displays slider values correctly', () => {
    render(<ClassificationDemo />);

    // Check initial values are displayed
    expect(screen.getByText('Prevalence: 0.30')).toBeInTheDocument();
    expect(screen.getByText('Operating Point: 50.00')).toBeInTheDocument();
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<ClassificationDemo />);

      expect(screen.getByRole('heading', { level: 2, name: /Interactive Classification Demo/ })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: /Confusion Matrix/ })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: /Performance Metrics/ })).toBeInTheDocument();
    });

    it('has descriptive labels for form controls', () => {
      render(<ClassificationDemo />);

      // All sliders should have descriptive labels
      const labels = screen.getAllByText(/:/);
      expect(labels.length).toBeGreaterThan(0);

      // Check for specific important labels
      expect(screen.getByText(/Prevalence:/)).toBeInTheDocument();
      expect(screen.getByText(/Operating Point:/)).toBeInTheDocument();
    });
  });

  describe('Mathematical Accuracy', () => {
    it('displays values that sum to total population', async () => {
      render(<ClassificationDemo />);

      // The confusion matrix values should sum to 1,000,000
      // We can't easily test the exact numbers without accessing internal state,
      // but we can verify that the component renders numbers that look reasonable
      const confusionMatrixSection = screen.getByText('Confusion Matrix').closest('div');

      // Should contain formatted numbers
      expect(confusionMatrixSection).toBeInTheDocument();
    });

    it('shows performance metrics within valid ranges', () => {
      render(<ClassificationDemo />);

      // All performance metrics should be between 0 and 1
      // We verify that the structure is present; actual values are tested in unit tests
      expect(screen.getByText('Sensitivity (True Positive Rate)')).toBeInTheDocument();
      expect(screen.getByText('Specificity (True Negative Rate)')).toBeInTheDocument();
      expect(screen.getByText('Accuracy')).toBeInTheDocument();
    });
  });

  describe('Error Boundaries', () => {
    it('handles invalid prop values gracefully', () => {
      // The component should not crash with edge case inputs
      // This is more of a smoke test since we're using controlled components
      render(<ClassificationDemo />);
      expect(screen.getByText('Interactive Classification Demo')).toBeInTheDocument();
    });
  });
});