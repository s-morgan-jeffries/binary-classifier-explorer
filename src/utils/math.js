export const TOTAL_POPULATION = 1000000;

/**
 * Calculate Gaussian (normal) distribution probability density
 * @param {number} mean - Mean of the distribution
 * @param {number} stdev - Standard deviation of the distribution
 * @param {number} x - Value to calculate probability for
 * @returns {number} Probability density at x
 */
export const gaussian = (mean, stdev, x) => {
  const a = 1 / (stdev * Math.sqrt(2 * Math.PI));
  const b = -1 * (Math.pow(x - mean, 2) / (2 * Math.pow(stdev, 2)));
  return a * Math.exp(b);
};

/**
 * Generate data points for visualization
 * @param {Object} params - Parameters for data generation
 * @param {number} params.prevalence - Prevalence of positive cases (0-1)
 * @param {number} params.positiveMean - Mean for positive distribution
 * @param {number} params.positiveSd - Standard deviation for positive distribution
 * @param {number} params.negativeMean - Mean for negative distribution
 * @param {number} params.negativeSd - Standard deviation for negative distribution
 * @returns {Array} Array of data points with x, positiveY, negativeY
 */
export const generateData = ({ prevalence, positiveMean, positiveSd, negativeMean, negativeSd }) => {
  const data = [];
  const oneMinusPrevalence = 1 - prevalence;
  const posStdevSqrt2Pi = positiveSd * Math.sqrt(2 * Math.PI);
  const negStdevSqrt2Pi = negativeSd * Math.sqrt(2 * Math.PI);
  const twoPosSdSquared = 2 * positiveSd * positiveSd;
  const twoNegSdSquared = 2 * negativeSd * negativeSd;

  for (let x = 0; x <= 100; x++) {
    const positiveDiff = x - positiveMean;
    const negativeDiff = x - negativeMean;

    const positiveY = (prevalence / posStdevSqrt2Pi) * Math.exp(-(positiveDiff * positiveDiff) / twoPosSdSquared);
    const negativeY = (oneMinusPrevalence / negStdevSqrt2Pi) * Math.exp(-(negativeDiff * negativeDiff) / twoNegSdSquared);

    data.push({ x, positiveY, negativeY });
  }
  return data;
};

/**
 * Calculate confusion matrix metrics
 * @param {Array} data - Data points from generateData
 * @param {number} operatingPoint - Operating point threshold
 * @returns {Object} Confusion matrix values {tp, fn, fp, tn}
 */
export const calculateMetrics = (data, operatingPoint) => {
  const totalPositive = data.reduce((sum, d) => sum + d.positiveY, 0);
  const totalNegative = data.reduce((sum, d) => sum + d.negativeY, 0);
  const scaleFactor = TOTAL_POPULATION / (totalPositive + totalNegative);

  const tp = Math.round(data.filter(d => d.x >= operatingPoint).reduce((sum, d) => sum + d.positiveY, 0) * scaleFactor);
  const fn = Math.round(data.filter(d => d.x < operatingPoint).reduce((sum, d) => sum + d.positiveY, 0) * scaleFactor);
  const fp = Math.round(data.filter(d => d.x >= operatingPoint).reduce((sum, d) => sum + d.negativeY, 0) * scaleFactor);
  const tn = Math.round(data.filter(d => d.x < operatingPoint).reduce((sum, d) => sum + d.negativeY, 0) * scaleFactor);

  const diff = TOTAL_POPULATION - (tp + fn + fp + tn);
  return { tp: tp + diff, fn, fp, tn };
};

/**
 * Calculate performance metrics from confusion matrix
 * @param {Object} confusionMatrix - Confusion matrix {tp, fn, fp, tn}
 * @returns {Object} Performance metrics {sensitivity, specificity, ppv, npv, accuracy}
 */
export const calculatePerformanceMetrics = ({ tp, fn, fp, tn }) => {
  const sensitivity = tp / (tp + fn);
  const specificity = tn / (tn + fp);
  const ppv = tp / (tp + fp);
  const npv = tn / (tn + fn);
  const accuracy = (tp + tn) / (tp + tn + fp + fn);

  return { sensitivity, specificity, ppv, npv, accuracy };
};