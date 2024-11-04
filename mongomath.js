const MongoAnalyzer = require("./mongoGeneralAnalyser");
const MongoStats = require("./mongoSpecificAnalyser.js");
const MongoInterpreter = require("./mongoInterpreter.js");
const MongoNlAnalyser = require("./mongoNlanalyser.js");

class MongoMath {
  constructor(uri) {
    this.uri = uri;
    this.analyzer = new MongoAnalyzer({ uri: this.uri });
    this.stats = new MongoStats({ uri: this.uri });
    this.isConnected = false;
  }

  /**
   * Gère la connexion automatique si selfloading est activé
   * @private
   */
  async ensureConnection(selfloading = false) {
    if (!this.isConnected && !selfloading) {
      throw new Error(
        "Database connection not established. Please connect manually or use selfloading=true"
      );
    }

    if (selfloading && !this.isConnected) {
      await this.analyzer.connect();
      await this.stats.connect();
      this.isConnected = true;
      return true;
    }
    return false;
  }

  /**
   * Gère la déconnexion automatique si selfloading était activé
   * @private
   */
  async handleSelfloadingDisconnection(
    selfloading = false,
    wasConnected = false
  ) {
    if (selfloading && wasConnected) {
      await this.analyzer.disconnect();
      await this.stats.disconnect();
      this.isConnected = false;
    }
  }

  /**
   * Établit la connexion à MongoDB manuellement
   */
  async connect() {
    if (!this.isConnected) {
      await this.analyzer.connect();
      await this.stats.connect();
      this.isConnected = true;
    }
  }

  /**
   * Ferme la connexion à MongoDB manuellement
   */
  async disconnect() {
    if (this.isConnected) {
      await this.analyzer.disconnect();
      await this.stats.disconnect();
      this.isConnected = false;
    }
  }

  /**
   * Analyse complète de la base de données
   * @param {Object} params - Paramètres d'analyse
   * @param {boolean} selfloading - Si true, gère automatiquement la connexion/déconnexion
   */
  async dataAnalyzer(params, selfloading = false) {
    const wasConnected = await this.ensureConnection(selfloading);
    try {
      const results = await this.analyzer.analyzeDatabaseComplete(params);
      const generalStats = await this.stats.calculateStatistics({
        collection: params.collection,
      });

      let crossStats = null;
      if (params.crossFieldAnalysis) {
        crossStats = await this.stats.calculateCrossFieldStatistics(
          params.collection,
          params.crossFieldAnalysis.field1,
          params.crossFieldAnalysis.field2
        );
      }

      return {
        databaseAnalysis: results,
        statistics: generalStats,
        crossFieldStatistics: crossStats,
      };
    } catch (error) {
      throw new Error(`Analysis error: ${error.message}`);
    } finally {
      await this.handleSelfloadingDisconnection(selfloading, wasConnected);
    }
  }

  /**
   * Obtient des informations de base sur la base de données
   * @param {Object} options - Options d'analyse
   * @param {boolean} selfloading - Si true, gère automatiquement la connexion/déconnexion
   */
  async getDatabaseInfo(options = {}, selfloading = false) {
    const wasConnected = await this.ensureConnection(selfloading);
    try {
      return await this.analyzer.getDatabaseInfo(options);
    } finally {
      await this.handleSelfloadingDisconnection(selfloading, wasConnected);
    }
  }

  /**
   * Obtient les statistiques détaillées des collections
   * @param {boolean} selfloading - Si true, gère automatiquement la connexion/déconnexion
   */
  async getDetailedCollectionStats(selfloading = false) {
    const wasConnected = await this.ensureConnection(selfloading);
    try {
      return await this.analyzer.getDetailedCollectionStats();
    } finally {
      await this.handleSelfloadingDisconnection(selfloading, wasConnected);
    }
  }

  /**
   * Analyse la distribution des données d'une collection
   * @param {string} collectionName - Nom de la collection
   * @param {boolean} selfloading - Si true, gère automatiquement la connexion/déconnexion
   */
  async analyzeDataDistribution(collectionName, selfloading = false) {
    const wasConnected = await this.ensureConnection(selfloading);
    try {
      return await this.analyzer.analyzeDataDistribution(collectionName);
    } finally {
      await this.handleSelfloadingDisconnection(selfloading, wasConnected);
    }
  }

  /**
   * Analyse les statistiques des champs d'une collection
   * @param {string} collectionName - Nom de la collection
   * @param {boolean} selfloading - Si true, gère automatiquement la connexion/déconnexion
   */
  async analyzeFieldStatistics(collectionName, selfloading = false) {
    const wasConnected = await this.ensureConnection(selfloading);
    try {
      return await this.analyzer.analyzeFieldStatistics(collectionName);
    } finally {
      await this.handleSelfloadingDisconnection(selfloading, wasConnected);
    }
  }

  /**
   * Obtient les métriques de performance
   * @param {boolean} selfloading - Si true, gère automatiquement la connexion/déconnexion
   */
  async getPerformanceMetrics(selfloading = false) {
    const wasConnected = await this.ensureConnection(selfloading);
    try {
      return await this.analyzer.getPerformanceMetrics();
    } finally {
      await this.handleSelfloadingDisconnection(selfloading, wasConnected);
    }
  }

  /**
   * Obtient l'analyse du stockage
   * @param {boolean} selfloading - Si true, gère automatiquement la connexion/déconnexion
   */
  async getStorageAnalysis(selfloading = false) {
    const wasConnected = await this.ensureConnection(selfloading);
    try {
      return await this.analyzer.getStorageAnalysis();
    } finally {
      await this.handleSelfloadingDisconnection(selfloading, wasConnected);
    }
  }

  /**
   * Analyse complète de la base de données
   * @param {Object} options - Options d'analyse
   * @param {boolean} selfloading - Si true, gère automatiquement la connexion/déconnexion
   */
  async analyzeDatabaseComplete(selfloading = false) {
    const wasConnected = await this.ensureConnection(selfloading);
    try {
      return await this.analyzer.analyzeDatabaseComplete();
    } finally {
      await this.handleSelfloadingDisconnection(selfloading, wasConnected);
    }
  }

  /**
   * Calcule des statistiques croisées entre deux champs
   * @param {string} collection - Nom de la collection
   * @param {string} field1 - Premier champ
   * @param {string} field2 - Second champ
   * @param {boolean} selfloading - Si true, gère automatiquement la connexion/déconnexion
   */
  async calculateCrossFieldStatistics(
    collection,
    field1,
    field2,
    selfloading = false
  ) {
    const wasConnected = await this.ensureConnection(selfloading);
    try {
      return await this.stats.calculateCrossFieldStatistics(
        collection,
        field1,
        field2
      );
    } finally {
      await this.handleSelfloadingDisconnection(selfloading, wasConnected);
    }
  }

  /**
   * Calcule les statistiques générales d'une collection
   * @param {Object} params - Paramètres de calcul
   * @param {boolean} selfloading - Si true, gère automatiquement la connexion/déconnexion
   */
  async calculateStatistics(params, selfloading = false) {
    const wasConnected = await this.ensureConnection(selfloading);
    try {
      return await this.stats.calculateStatistics(params);
    } finally {
      await this.handleSelfloadingDisconnection(selfloading, wasConnected);
    }
  }
}

module.exports = MongoMath;
