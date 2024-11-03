const mongoose = require("mongoose");
const logger = require("./utils/logger");

class MongoAnalyzer {
  constructor(config = {}) {
    this.isConnected = false;
    this.uri = config.uri || process.env.MONGO_URI;
    this.connectionOptions = {
      ...config.mongooseOptions,
    };
    this.modelCache = new Map();
    this.setupEventListeners();
  }

  /**
   * Configure les écouteurs d'événements MongoDB
   * @private
   */
  setupEventListeners() {
    mongoose.connection.on("disconnected", () => this.clearModelCache());
    mongoose.connection.on("error", (error) => {
      logger.error("MongoDB connection error:", error);
    });
  }

  /**
   * Établit la connexion à MongoDB
   */
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

  /**
   * Déconnexion de la base de données
   */
  async disconnect() {
    try {
      await mongoose.disconnect();
      this.isConnected = false;
      this.clearModelCache();
      logger.info("Successfully disconnected from database");
    } catch (error) {
      logger.error("Disconnection error:", error);
      throw error;
    }
  }

  /**
   * Obtient des informations de base sur la base de données.
   * @param {Object} options Options d'analyse.
   * @returns {Promise<Object>} Informations de la base de données.
   */
  async getDatabaseInfo(options) {
    try {
      const stats = await mongoose.connection.db.stats();
      return {
        dbName: stats.db,
        collections: stats.collections,
        objects: stats.objects,
        avgObjSize: stats.avgObjSize,
        dataSize: stats.dataSize,
      };
    } catch (error) {
      logger.error("Error getting database info:", error);
      throw error;
    }
  }

  /**
   * Analyse complète de la base de données
   * @param {Object} options Options d'analyse
   * @returns {Promise<Object>} Résultats d'analyse
   */
  async analyzeDatabaseComplete(options = {}) {
    this.checkConnection();

    try {
      const basicInfo = await this.getDatabaseInfo(options);
      const collectionStats = await this.getDetailedCollectionStats();
      const performanceMetrics = await this.getPerformanceMetrics();
      const storageAnalysis = await this.getStorageAnalysis();

      return {
        timestamp: new Date(),
        databaseInfo: basicInfo,
        collectionStatistics: collectionStats,
        performanceMetrics,
        storageAnalysis,
      };
    } catch (error) {
      logger.error("Error during complete database analysis:", error);
      throw error;
    }
  }

  /**
   * Obtient les statistiques détaillées des collections
   * @returns {Promise<Object>} Statistiques des collections
   */
  async getDetailedCollectionStats() {
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    const stats = {};

    for (const collection of collections) {
      const collectionName = collection.name;
      const collStats = await this.getCollectionStats(collectionName);

      if (collStats) {
        stats[collectionName] = {
          ...collStats,
          dataDistribution: await this.analyzeDataDistribution(collectionName),
          fieldStats: await this.analyzeFieldStatistics(collectionName),
        };
      }
    }

    return stats;
  }

  /**
   * Analyse la distribution des données d'une collection
   * @param {string} collectionName Nom de la collection
   * @returns {Promise<Object>} Statistiques de distribution
   */
  async analyzeDataDistribution(collectionName) {
    const collection = mongoose.connection.db.collection(collectionName);
    const sampleSize = 1000;
    const sample = await collection
      .aggregate([{ $sample: { size: sampleSize } }])
      .toArray();

    return {
      documentSizes: this.calculateStatistics(
        sample.map((doc) => JSON.stringify(doc).length)
      ),
      fieldCounts: this.calculateStatistics(
        sample.map((doc) => Object.keys(doc).length)
      ),
      updateFrequency: await this.getUpdateFrequency(collectionName),
    };
  }

  /**
   * Analyse les statistiques des champs d'une collection
   * @param {string} collectionName Nom de la collection
   * @returns {Promise<Object>} Statistiques des champs
   */
  async analyzeFieldStatistics(collectionName) {
    const collection = mongoose.connection.db.collection(collectionName);
    const sample = await collection
      .aggregate([
        { $sample: { size: 1000 } },
        { $project: { fieldTypes: { $objectToArray: "$$ROOT" } } },
      ])
      .toArray();

    const fieldTypes = {};
    sample.forEach((doc) => {
      doc.fieldTypes.forEach((field) => {
        if (!fieldTypes[field.k]) {
          fieldTypes[field.k] = {};
        }
        const type = typeof field.v;
        fieldTypes[field.k][type] = (fieldTypes[field.k][type] || 0) + 1;
      });
    });

    return {
      fieldTypes,
      totalFields: Object.keys(fieldTypes).length,
      commonFields: this.getMostCommonFields(fieldTypes),
    };
  }

  /**
   * Obtient les métriques de performance
   * @returns {Promise<Object>} Métriques de performance
   */
  async getPerformanceMetrics() {
    try {
      const serverStatus = await mongoose.connection.db.admin().serverStatus();
      const dbStats = await mongoose.connection.db.stats();

      return {
        operations: {
          totalOperations: serverStatus.opcounters,
          activeConnections: serverStatus.connections,
          networkStats: serverStatus.network,
        },
        memory: {
          virtualMemory: serverStatus.mem.virtual,
          residentMemory: serverStatus.mem.resident,
          mappedMemory: serverStatus.mem.mapped,
        },
        storage: {
          dataSize: dbStats.dataSize,
          storageSize: dbStats.storageSize,
          indexes: dbStats.indexes,
          indexSize: dbStats.indexSize,
        },
      };
    } catch (error) {
      logger.error("Error getting performance metrics:", error);
      return null;
    }
  }

  /**
   * Obtient l'analyse du stockage
   * @returns {Promise<Object>} Analyse du stockage
   */
  async getStorageAnalysis() {
    try {
      const collections = await mongoose.connection.db
        .listCollections()
        .toArray();
      const storageStats = {};
      let totalSize = 0;
      let totalIndexSize = 0;

      for (const collection of collections) {
        const stats = await this.getCollectionStats(collection.name);
        if (stats) {
          storageStats[collection.name] = {
            size: stats.sizeBytes,
            indexSize: stats.indexSize,
            avgDocumentSize: stats.avgDocumentSize,
            utilization: (stats.sizeBytes / stats.storageSize) * 100,
          };
          totalSize += stats.sizeBytes;
          totalIndexSize += stats.indexSize;
        }
      }

      return {
        collections: storageStats,
        summary: {
          totalSize,
          totalIndexSize,
          totalCollections: collections.length,
          averageCollectionSize: totalSize / collections.length,
        },
      };
    } catch (error) {
      logger.error("Error during storage analysis:", error);
      return null;
    }
  }

  /**
   * Calcule des statistiques sur un ensemble de données
   * @param {Array<number>} data Données à analyser
   * @returns {Object} Statistiques calculées
   */
  calculateStatistics(data) {
    const sorted = [...data].sort((a, b) => a - b);
    const sum = data.reduce((a, b) => a + b, 0);
    const mean = sum / data.length;
    const median = sorted[Math.floor(data.length / 2)];

    const variance =
      data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);

    return {
      min: Math.min(...data),
      max: Math.max(...data),
      mean,
      median,
      stdDev,
      q1: sorted[Math.floor(data.length * 0.25)],
      q3: sorted[Math.floor(data.length * 0.75)],
    };
  }

  // Méthodes utilitaires

  /**
   * Vérifie la connexion à la base de données
   * @private
   */
  checkConnection() {
    if (!this.isConnected) {
      throw new Error("Not connected to database");
    }
  }

  /**
   * Nettoie le cache des modèles
   * @private
   */
  clearModelCache() {
    this.modelCache.clear();
    logger.debug("Model cache cleared");
  }

  /**
   * Obtient les statistiques d'une collection
   * @private
   */
  async getCollectionStats(collectionName) {
    try {
      return await mongoose.connection.db.collection(collectionName).stats;
    } catch (error) {
      logger.error(
        `Failed to get stats for collection ${collectionName}:`,
        error
      );
      return null;
    }
  }

  /**
   * Obtient la fréquence des mises à jour d'une collection
   * @private
   */
  async getUpdateFrequency(collectionName) {
    // Implémentez la logique pour suivre la fréquence des mises à jour
    // Par exemple, en analysant les journaux ou les historiques de mise à jour
    return {}; // Retournez les statistiques appropriées
  }

  /**
   * Obtient les champs les plus communs d'une collection
   * @private
   */
  getMostCommonFields(fieldTypes) {
    const commonFields = Object.entries(fieldTypes)
      .map(([field, types]) => ({
        field,
        mostCommonType: Object.entries(types).reduce((a, b) =>
          a[1] > b[1] ? a : b
        ),
      }))
      .sort((a, b) => b.mostCommonType[1] - a.mostCommonType[1]);

    return commonFields.slice(0, 5); // Retourne les 5 champs les plus communs
  }
}

module.exports = MongoAnalyzer;

// ok
