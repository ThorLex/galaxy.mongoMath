// mathUtils.js

// Fonction de calcul de la moyenne
function calculateMean(arr) {
  return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

// Fonction de calcul de la médiane
function calculateMedian(arr) {
  const sorted = arr.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

// Fonction de calcul du mode
function calculateMode(arr) {
  const frequency = {};
  let maxFreq = 0;
  let mode;
  for (const num of arr) {
    frequency[num] = (frequency[num] || 0) + 1;
    if (frequency[num] > maxFreq) {
      maxFreq = frequency[num];
      mode = num;
    }
  }
  return mode;
}

// Fonction de calcul de la variance
function calculateVariance(arr) {
  if (arr.length === 0) return 0;
  const mean = calculateMean(arr);
  const deviations = arr.map((x) => (x - mean) ** 2);
  return calculateMean(deviations);
}

// Fonction de calcul de l'écart-type
function calculateStandardDeviation(arr) {
  return Math.sqrt(calculateVariance(arr));
}

// Fonction de calcul de l'étendue
function calculateRange(arr) {
  return arr.length > 0 ? Math.max(...arr) - Math.min(...arr) : 0;
}

// Fonction de calcul du coefficient de variation
function calculateCoefficientOfVariation(arr) {
  const mean = calculateMean(arr);
  const stdDev = calculateStandardDeviation(arr);
  return mean !== 0 ? (stdDev / mean) * 100 : 0;
}

// Fonction de calcul des quartiles
function calculateQuartiles(arr) {
  const sorted = arr.slice().sort((a, b) => a - b);
  const Q1 = calculateMedian(sorted.slice(0, Math.floor(sorted.length / 2)));
  const Q2 = calculateMedian(sorted);
  const Q3 = calculateMedian(sorted.slice(Math.ceil(sorted.length / 2)));
  return { Q1, Q2, Q3 };
}

// Fonction de calcul de l'écart interquartile (IQR)
function calculateInterquartileRange(arr) {
  const { Q1, Q3 } = calculateQuartiles(arr);
  return Q3 - Q1;
}

// Fonction de calcul de l'asymétrie (skewness)
function calculateSkewness(arr) {
  const mean = calculateMean(arr);
  const stdDev = calculateStandardDeviation(arr);
  const n = arr.length;
  return (
    (n * arr.reduce((acc, val) => acc + (val - mean) ** 3, 0)) /
    ((n - 1) * (n - 2) * stdDev ** 3)
  );
}

// Fonction de calcul de l'aplatissement (kurtosis)
function calculateKurtosis(arr) {
  const mean = calculateMean(arr);
  const stdDev = calculateStandardDeviation(arr);
  const n = arr.length;
  return (
    (n * (n + 1) * arr.reduce((acc, val) => acc + (val - mean) ** 4, 0)) /
      ((n - 1) * (n - 2) * (n - 3) * stdDev ** 4) -
    (3 * (n - 1) ** 2) / ((n - 2) * (n - 3))
  );
}

// Fonction de calcul des statistiques croisées
function calculateCrossTabulation(arr1, arr2) {
  const result = {};
  arr1.forEach((val1, index) => {
    const val2 = arr2[index];
    if (!result[val1]) {
      result[val1] = {};
    }
    result[val1][val2] = (result[val1][val2] || 0) + 1;
  });
  return result;
}

module.exports = {
  calculateMean,
  calculateMedian,
  calculateMode,
  calculateVariance,
  calculateStandardDeviation,
  calculateRange,
  calculateCoefficientOfVariation,
  calculateQuartiles,
  calculateInterquartileRange,
  calculateSkewness,
  calculateKurtosis,
  calculateCrossTabulation, // Nouvelle fonction ajoutée
};
