const mongoose = require("mongoose");
const logger = require("./utils/logger");

class MongoMath {
  constructor(config = {}) {
    this.isConnected = false;
    this.dbUri = config.uri || process.env.MONGO_URI;
    this.connectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ...config.mongooseOptions,
    };
  }

  /**
   * Vérifie si la connexion à la base de données est établie
   * @throws {Error} Si non connecté à MongoDB
   */
  checkConnection() {
    if (!this.isConnected) {
      throw new Error("MongoMath: Non connecté à MongoDB");
    }
  }

  /**
   * Établit la connexion à la base de données MongoDB
   * @param {string} uri - URI de connexion (optionnel, peut être fourni dans le constructeur)
   * @returns {Promise<void>}
   * @throws {Error} Si la connexion échoue
   */
  async connect(uri) {
    try {
      if (this.isConnected) {
        logger.info("MongoMath: Connexion déjà établie");
        return;
      }

      const connectionUri = uri || this.dbUri;

      if (!connectionUri) {
        throw new Error("MongoMath: URI de connexion requis");
      }

      await mongoose.connect(connectionUri, this.connectionOptions);
      this.isConnected = true;
      this.dbUri = connectionUri;
      logger.info("MongoMath: Connexion établie avec succès");
    } catch (error) {
      logger.error("MongoMath: Erreur de connexion", error);
      throw new Error("Échec de la connexion à MongoDB");
    }
  }

  /**
   * Déconnecte de la base de données MongoDB
   * @returns {Promise<void>}
   * @throws {Error} Si la déconnexion échoue
   */
  async disconnect() {
    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info("MongoMath: Déconnexion réussie");
    } catch (error) {
      logger.error("MongoMath: Erreur lors de la déconnexion", error);
      throw new Error("Échec de la déconnexion de MongoDB");
    }
  }
}

module.exports = MongoMath;
