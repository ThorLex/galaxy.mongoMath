const mongoose = require("mongoose");
const moment = require("moment");
const logger = require("./utils/logger");

class MongoStats {
  constructor(config = {}) {
    this.isConnected = false;
    this.uri = config.uri || process.env.MONGO_URI;
    this.connectionOptions = {
      ...config.mongooseOptions,
    };
  }

  // Méthodes de connexion
  async connect() {
    try {
      if (this.isConnected) {
        logger.info("Already connected to database");
        return;
      }

      if (!this.uri) {
        throw new Error("Database URI is required");
      }

      await mongoose.connect(this.uri, this.connectionOptions);
      this.isConnected = true;
      logger.info("Successfully connected to database");
    } catch (error) {
      logger.error("Connection error:", error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info("Successfully disconnected from database");
    } catch (error) {
      logger.error("Disconnection error:", error);
      throw error;
    }
  }

  checkConnection() {
    if (!this.isConnected) {
      throw new Error("Not connected to database");
    }
  }

  // Méthodes statistiques principales
  async calculateStatistics(options = {}) {
    this.checkConnection();

    const { collection, document, period = "month", periodCount = 1 } = options;

    try {
      let query = {};
      let collections = [];

      if (collection) {
        if (document) {
          query = { _id: document };
        }
        collections = [collection];
      } else {
        collections = await mongoose.connection.db.listCollections().toArray();
        collections = collections.map((col) => col.name);
      }

      const statistics = {};

      for (const collectionName of collections) {
        const model =
          mongoose.models[collectionName] ||
          mongoose.model(
            collectionName,
            new mongoose.Schema({}, { strict: false })
          );

        const documents = await model.find(query).lean();

        statistics[collectionName] = await this.processCollectionStatistics(
          documents,
          { period, periodCount }
        );
      }

      return statistics;
    } catch (error) {
      logger.error("Error calculating statistics:", error);
      throw error;
    }
  }

  async processCollectionStatistics(documents, options) {
    const stats = {
      totalDocuments: documents.length,
      creationDates: [],
      documentDetails: [],
      modificationCounts: {},
      modificationsByPeriod: {},
      basicStats: {},
      advancedStats: {},
    };

    // Extraction des données numériques pour les calculs
    const numericData = this.extractNumericData(documents);

    // Calcul des statistiques de base
    stats.basicStats = {
      mean: this.calculateMean(numericData),
      median: this.calculateMedian(numericData),
      mode: this.calculateMode(numericData),
      variance: this.calculateVariance(numericData),
      standardDeviation: this.calculateStandardDeviation(numericData),
      range: this.calculateRange(numericData),
    };

    // Calcul des statistiques avancées
    stats.advancedStats = {
      coefficientOfVariation: this.calculateCoefficientOfVariation(numericData),
      quartiles: this.calculateQuartiles(numericData),
      interquartileRange: this.calculateInterquartileRange(numericData),
      skewness: this.calculateSkewness(numericData),
      kurtosis: this.calculateKurtosis(numericData),
    };

    return stats;
  }

  // Méthodes utilitaires statistiques
  calculateMean(arr) {
    return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  }

  calculateMedian(arr) {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
      ? sorted[middle]
      : (sorted[middle - 1] + sorted[middle]) / 2;
  }

  calculateMode(arr) {
    if (arr.length === 0) return 0;
    const frequency = {};
    let maxFreq = 0;
    let mode = arr[0];

    arr.forEach((value) => {
      frequency[value] = (frequency[value] || 0) + 1;
      if (frequency[value] > maxFreq) {
        maxFreq = frequency[value];
        mode = value;
      }
    });

    return mode;
  }

  calculateVariance(arr) {
    if (arr.length === 0) return 0;
    const mean = this.calculateMean(arr);
    return this.calculateMean(arr.map((x) => Math.pow(x - mean, 2)));
  }

  calculateStandardDeviation(arr) {
    return Math.sqrt(this.calculateVariance(arr));
  }

  calculateRange(arr) {
    return arr.length > 0 ? Math.max(...arr) - Math.min(...arr) : 0;
  }

  calculateCoefficientOfVariation(arr) {
    const mean = this.calculateMean(arr);
    const stdDev = this.calculateStandardDeviation(arr);
    return mean !== 0 ? (stdDev / mean) * 100 : 0;
  }

  calculateQuartiles(arr) {
    const sorted = arr.slice().sort((a, b) => a - b);
    const Q1 = this.calculateMedian(
      sorted.slice(0, Math.floor(sorted.length / 2))
    );
    const Q2 = this.calculateMedian(sorted);
    const Q3 = this.calculateMedian(sorted.slice(Math.ceil(sorted.length / 2)));
    return { Q1, Q2, Q3 };
  }

  calculateInterquartileRange(arr) {
    const { Q1, Q3 } = this.calculateQuartiles(arr);
    return Q3 - Q1;
  }

  calculateSkewness(arr) {
    const mean = this.calculateMean(arr);
    const stdDev = this.calculateStandardDeviation(arr);
    const n = arr.length;

    if (n < 3 || stdDev === 0) return 0;

    return (
      (n * arr.reduce((acc, val) => acc + Math.pow(val - mean, 3), 0)) /
      ((n - 1) * (n - 2) * Math.pow(stdDev, 3))
    );
  }

  calculateKurtosis(arr) {
    const mean = this.calculateMean(arr);
    const stdDev = this.calculateStandardDeviation(arr);
    const n = arr.length;

    if (n < 4 || stdDev === 0) return 0;

    return (
      (n *
        (n + 1) *
        arr.reduce((acc, val) => acc + Math.pow(val - mean, 4), 0)) /
        ((n - 1) * (n - 2) * (n - 3) * Math.pow(stdDev, 4)) -
      (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3))
    );
  }

  calculateCrossTabulation(arr1, arr2) {
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

  // Méthodes utilitaires pour le traitement des données
  extractNumericData(documents) {
    const numericValues = [];
    documents.forEach((doc) => {
      Object.values(doc).forEach((value) => {
        if (typeof value === "number" && !isNaN(value)) {
          numericValues.push(value);
        }
      });
    });
    return numericValues;
  }

  // Utilitaires pour les périodes
  getPeriodKey(date, period, periodCount) {
    const startDate = moment().subtract(periodCount, period);
    return `${startDate.format("YYYY-MM-DD")}-${date.format("YYYY-MM-DD")}`;
  }

  // Méthodes d'analyse croisée
  async calculateCrossFieldStatistics(collection, field1, field2) {
    this.checkConnection();

    try {
      const model =
        mongoose.models[collection] ||
        mongoose.model(collection, new mongoose.Schema({}, { strict: false }));

      const documents = await model.find().lean();
      const field1Values = documents
        .map((doc) => doc[field1])
        .filter((v) => v !== undefined);
      const field2Values = documents
        .map((doc) => doc[field2])
        .filter((v) => v !== undefined);

      return {
        crossTabulation: this.calculateCrossTabulation(
          field1Values,
          field2Values
        ),
        field1Statistics: {
          basic: {
            mean: this.calculateMean(field1Values),
            median: this.calculateMedian(field1Values),
            mode: this.calculateMode(field1Values),
          },
          advanced: {
            skewness: this.calculateSkewness(field1Values),
            kurtosis: this.calculateKurtosis(field1Values),
          },
        },
        field2Statistics: {
          basic: {
            mean: this.calculateMean(field2Values),
            median: this.calculateMedian(field2Values),
            mode: this.calculateMode(field2Values),
          },
          advanced: {
            skewness: this.calculateSkewness(field2Values),
            kurtosis: this.calculateKurtosis(field2Values),
          },
        },
      };
    } catch (error) {
      logger.error("Error in cross field statistics:", error);
      throw error;
    }
  }
}

module.exports = MongoStats;
//  okk
