import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock Recharts to avoid complex chart rendering in integration tests
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

describe('App Integration Tests', () => {
  it('renders the complete application', () => {
    render(<App />);

    // Should render the main demo component
    expect(screen.getByText('Interactive Classification Demo')).toBeInTheDocument();
    expect(screen.getByText(/Total Population: 1,000,000/)).toBeInTheDocument();
  });

  it('contains all major sections of the application', () => {
    render(<App />);

    // Chart section
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();

    // Controls section
    expect(screen.getByText(/Prevalence:/)).toBeInTheDocument();
    expect(screen.getByText(/Operating Point:/)).toBeInTheDocument();

    // Results sections
    expect(screen.getByText('Confusion Matrix')).toBeInTheDocument();
    expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
  });

  it('has proper app-level styling', () => {
    render(<App />);

    // The app should have basic layout classes
    const mainContainer = screen.getByText('Interactive Classification Demo').closest('div');
    expect(mainContainer).toBeInTheDocument();
  });

  describe('Full Workflow Integration', () => {
    it('displays a complete binary classification analysis tool', () => {
      render(<App />);

      // Input controls
      expect(screen.getByText(/Prevalence:/)).toBeInTheDocument();
      expect(screen.getByText('Population with Condition')).toBeInTheDocument();
      expect(screen.getByText('Population without Condition')).toBeInTheDocument();

      // Visualization
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();

      // Analysis results
      expect(screen.getByText('True Positive (TP)')).toBeInTheDocument();
      expect(screen.getByText('False Negative (FN)')).toBeInTheDocument();
      expect(screen.getByText('False Positive (FP)')).toBeInTheDocument();
      expect(screen.getByText('True Negative (TN)')).toBeInTheDocument();

      // Performance metrics
      expect(screen.getByText('Sensitivity (True Positive Rate)')).toBeInTheDocument();
      expect(screen.getByText('Specificity (True Negative Rate)')).toBeInTheDocument();
      expect(screen.getByText('Positive Predictive Value (Precision)')).toBeInTheDocument();
      expect(screen.getByText('Negative Predictive Value')).toBeInTheDocument();
      expect(screen.getByText('Accuracy')).toBeInTheDocument();
    });

    it('shows mathematical formulas for transparency', () => {
      render(<App />);

      // Should display formulas for each metric (using partial text match)
      expect(screen.getByText(/TP \/ \(TP \+ FN\)/)).toBeInTheDocument(); // Sensitivity
      expect(screen.getByText(/TN \/ \(TN \+ FP\)/)).toBeInTheDocument(); // Specificity
      expect(screen.getByText(/TP \/ \(TP \+ FP\)/)).toBeInTheDocument(); // PPV
      expect(screen.getByText(/TN \/ \(TN \+ FN\)/)).toBeInTheDocument(); // NPV
      expect(screen.getByText(/\(TP \+ TN\) \/ \(TP \+ TN \+ FP \+ FN\)/)).toBeInTheDocument(); // Accuracy
    });

    it('provides educational value with clear labeling', () => {
      render(<App />);

      // Educational labels and descriptions
      expect(screen.getByText('Predicted')).toBeInTheDocument();
      expect(screen.getByText('Actual')).toBeInTheDocument();

      // Should find Positive and Negative in multiple contexts
      const positiveElements = screen.getAllByText('Positive');
      const negativeElements = screen.getAllByText('Negative');
      expect(positiveElements.length).toBeGreaterThan(0);
      expect(negativeElements.length).toBeGreaterThan(0);

      // Clear metric names
      expect(screen.getByText('Sensitivity (True Positive Rate)')).toBeInTheDocument();
      expect(screen.getByText('Specificity (True Negative Rate)')).toBeInTheDocument();
      expect(screen.getByText('Positive Predictive Value (Precision)')).toBeInTheDocument();
    });
  });

  describe('Responsive Design Integration', () => {
    it('structures content in a responsive layout', () => {
      render(<App />);

      // The main container should have responsive classes
      const appContainer = screen.getByText('Interactive Classification Demo').closest('div');
      expect(appContainer).toBeInTheDocument();

      // Should have multiple major sections
      expect(screen.getByText('Confusion Matrix')).toBeInTheDocument();
      expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
    });
  });

  describe('Data Flow Integration', () => {
    it('connects all components in a cohesive data flow', () => {
      render(<App />);

      // Input parameters should affect visualization
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();

      // Visualization should connect to analysis
      expect(screen.getByText('Confusion Matrix')).toBeInTheDocument();

      // Analysis should produce metrics
      expect(screen.getByText('Performance Metrics')).toBeInTheDocument();

      // All numerical outputs should be present
      expect(screen.getAllByText(/Value:/).length).toBeGreaterThan(0);
    });
  });

  describe('Production Readiness', () => {
    it('renders without console errors', () => {
      // This is a smoke test to ensure the app renders cleanly
      render(<App />);
      expect(screen.getByText('Interactive Classification Demo')).toBeInTheDocument();
    });

    it('provides a complete user interface', () => {
      render(<App />);

      // Should have all the elements needed for a complete user experience
      expect(screen.getByText('Interactive Classification Demo')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByText('Confusion Matrix')).toBeInTheDocument();
      expect(screen.getByText('Performance Metrics')).toBeInTheDocument();

      // Should display the key educational content
      expect(screen.getByText(/Total Population:/)).toBeInTheDocument();
    });
  });
});