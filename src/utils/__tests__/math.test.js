import { describe, it, expect } from 'vitest';
import {
  TOTAL_POPULATION,
  gaussian,
  generateData,
  calculateMetrics,
  calculatePerformanceMetrics
} from '../math';

describe('Mathematical Functions', () => {
  describe('gaussian', () => {
    it('should calculate correct probability density for normal distribution', () => {
      // Test with mean=0, stdev=1, x=0 (standard normal at mean)
      const result = gaussian(0, 1, 0);
      expect(result).toBeCloseTo(0.3989, 4); // 1/√(2π) ≈ 0.3989
    });

    it('should be symmetric around the mean', () => {
      const mean = 50;
      const stdev = 10;
      const offset = 5;

      const leftSide = gaussian(mean, stdev, mean - offset);
      const rightSide = gaussian(mean, stdev, mean + offset);

      expect(leftSide).toBeCloseTo(rightSide, 10);
    });

    it('should have maximum value at the mean', () => {
      const mean = 50;
      const stdev = 10;

      const atMean = gaussian(mean, stdev, mean);
      const awayFromMean = gaussian(mean, stdev, mean + stdev);

      expect(atMean).toBeGreaterThan(awayFromMean);
    });

    it('should approach zero as x moves away from mean', () => {
      const mean = 50;
      const stdev = 10;

      const farAway = gaussian(mean, stdev, mean + 5 * stdev);

      expect(farAway).toBeLessThan(0.001);
    });
  });

  describe('generateData', () => {
    const defaultParams = {
      prevalence: 0.3,
      positiveMean: 60,
      positiveSd: 10,
      negativeMean: 40,
      negativeSd: 10
    };

    it('should generate 101 data points (0 to 100)', () => {
      const data = generateData(defaultParams);
      expect(data).toHaveLength(101);
      expect(data[0].x).toBe(0);
      expect(data[100].x).toBe(100);
    });

    it('should have higher positive values near positive mean', () => {
      const data = generateData(defaultParams);

      const nearPositiveMean = data.find(d => d.x === 60);
      const farFromPositiveMean = data.find(d => d.x === 20);

      expect(nearPositiveMean.positiveY).toBeGreaterThan(farFromPositiveMean.positiveY);
    });

    it('should have higher negative values near negative mean', () => {
      const data = generateData(defaultParams);

      const nearNegativeMean = data.find(d => d.x === 40);
      const farFromNegativeMean = data.find(d => d.x === 80);

      expect(nearNegativeMean.negativeY).toBeGreaterThan(farFromNegativeMean.negativeY);
    });

    it('should scale positive values by prevalence', () => {
      const lowPrevalence = generateData({ ...defaultParams, prevalence: 0.1 });
      const highPrevalence = generateData({ ...defaultParams, prevalence: 0.9 });

      const lowPosValue = lowPrevalence.find(d => d.x === 60).positiveY;
      const highPosValue = highPrevalence.find(d => d.x === 60).positiveY;

      expect(highPosValue).toBeGreaterThan(lowPosValue);
    });

    it('should scale negative values by (1 - prevalence)', () => {
      const lowPrevalence = generateData({ ...defaultParams, prevalence: 0.1 });
      const highPrevalence = generateData({ ...defaultParams, prevalence: 0.9 });

      const lowNegValue = lowPrevalence.find(d => d.x === 40).negativeY;
      const highNegValue = highPrevalence.find(d => d.x === 40).negativeY;

      expect(lowNegValue).toBeGreaterThan(highNegValue);
    });
  });

  describe('calculateMetrics', () => {
    const testData = generateData({
      prevalence: 0.5,
      positiveMean: 60,
      positiveSd: 10,
      negativeMean: 40,
      negativeSd: 10
    });

    it('should sum to total population', () => {
      const metrics = calculateMetrics(testData, 50);
      const total = metrics.tp + metrics.fn + metrics.fp + metrics.tn;
      expect(total).toBe(TOTAL_POPULATION);
    });

    it('should have more true positives with lower operating point', () => {
      const lowThreshold = calculateMetrics(testData, 30);
      const highThreshold = calculateMetrics(testData, 70);

      expect(lowThreshold.tp).toBeGreaterThan(highThreshold.tp);
    });

    it('should have more true negatives with higher operating point', () => {
      const lowThreshold = calculateMetrics(testData, 30);
      const highThreshold = calculateMetrics(testData, 70);

      expect(highThreshold.tn).toBeGreaterThan(lowThreshold.tn);
    });

    it('should classify correctly with perfect separation', () => {
      const perfectData = generateData({
        prevalence: 0.5,
        positiveMean: 80,
        positiveSd: 5,
        negativeMean: 20,
        negativeSd: 5
      });

      const metrics = calculateMetrics(perfectData, 50);

      // With good separation, should have high TP and TN, low FP and FN
      expect(metrics.tp + metrics.tn).toBeGreaterThan(metrics.fp + metrics.fn);
    });
  });

  describe('calculatePerformanceMetrics', () => {
    const perfectClassification = { tp: 400, fn: 0, fp: 0, tn: 600 };
    const poorClassification = { tp: 200, fn: 200, fp: 300, tn: 300 };

    it('should calculate perfect sensitivity with no false negatives', () => {
      const metrics = calculatePerformanceMetrics(perfectClassification);
      expect(metrics.sensitivity).toBe(1);
    });

    it('should calculate perfect specificity with no false positives', () => {
      const metrics = calculatePerformanceMetrics(perfectClassification);
      expect(metrics.specificity).toBe(1);
    });

    it('should calculate perfect accuracy with no errors', () => {
      const metrics = calculatePerformanceMetrics(perfectClassification);
      expect(metrics.accuracy).toBe(1);
    });

    it('should calculate 50% accuracy for poor classification', () => {
      const metrics = calculatePerformanceMetrics(poorClassification);
      expect(metrics.accuracy).toBe(0.5);
    });

    it('should calculate sensitivity correctly', () => {
      // Sensitivity = TP / (TP + FN)
      const metrics = calculatePerformanceMetrics(poorClassification);
      expect(metrics.sensitivity).toBe(0.5); // 200 / (200 + 200)
    });

    it('should calculate specificity correctly', () => {
      // Specificity = TN / (TN + FP)
      const metrics = calculatePerformanceMetrics(poorClassification);
      expect(metrics.specificity).toBe(0.5); // 300 / (300 + 300)
    });

    it('should calculate PPV correctly', () => {
      // PPV = TP / (TP + FP)
      const metrics = calculatePerformanceMetrics(poorClassification);
      expect(metrics.ppv).toBe(0.4); // 200 / (200 + 300)
    });

    it('should calculate NPV correctly', () => {
      // NPV = TN / (TN + FN)
      const metrics = calculatePerformanceMetrics(poorClassification);
      expect(metrics.npv).toBe(0.6); // 300 / (300 + 200)
    });

    it('should handle edge cases gracefully', () => {
      const edgeCase = { tp: 0, fn: 0, fp: 0, tn: 1000 };
      const metrics = calculatePerformanceMetrics(edgeCase);

      // When no positives exist, sensitivity and PPV should be NaN or handled gracefully
      expect(metrics.specificity).toBe(1);
      expect(metrics.accuracy).toBe(1);
    });
  });

  describe('Integration Tests', () => {
    it('should work correctly with typical clinical scenario', () => {
      // Simulate a medical test scenario
      const clinicalData = generateData({
        prevalence: 0.1, // 10% disease prevalence
        positiveMean: 70, // Diseased individuals score higher
        positiveSd: 15,
        negativeMean: 30, // Healthy individuals score lower
        negativeSd: 12
      });

      const metrics = calculateMetrics(clinicalData, 50); // Operating point at 50
      const performance = calculatePerformanceMetrics(metrics);

      // Basic sanity checks
      expect(performance.sensitivity).toBeGreaterThan(0);
      expect(performance.sensitivity).toBeLessThanOrEqual(1);
      expect(performance.specificity).toBeGreaterThan(0);
      expect(performance.specificity).toBeLessThanOrEqual(1);
      expect(performance.accuracy).toBeGreaterThan(0);
      expect(performance.accuracy).toBeLessThanOrEqual(1);

      // With good separation and reasonable threshold, should perform well
      expect(performance.accuracy).toBeGreaterThan(0.7);
    });

    it('should show trade-off between sensitivity and specificity', () => {
      const data = generateData({
        prevalence: 0.3,
        positiveMean: 60,
        positiveSd: 10,
        negativeMean: 40,
        negativeSd: 10
      });

      const conservativeMetrics = calculateMetrics(data, 30); // Low threshold - more sensitive
      const liberalMetrics = calculateMetrics(data, 70); // High threshold - more specific

      const conservativePerf = calculatePerformanceMetrics(conservativeMetrics);
      const liberalPerf = calculatePerformanceMetrics(liberalMetrics);

      // Conservative approach should be more sensitive, less specific
      expect(conservativePerf.sensitivity).toBeGreaterThan(liberalPerf.sensitivity);
      expect(conservativePerf.specificity).toBeLessThan(liberalPerf.specificity);
    });
  });
});