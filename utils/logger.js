// src/utils/logger.js
const mongoose = require("mongoose");
const { createLogger, format, transports } = require("winston");

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(({ timestamp, level, message, stack }) => {
      return `${timestamp} [${level.toUpperCase()}] ${stack || message}`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "logs/mongoMath.log" }),
  ],
});

// Intercepte et enregistre les erreurs non capturées
logger.exceptions.handle(
  new transports.Console(),
  new transports.File({ filename: "logs/exceptions.log" })
);

/**
 * Fonction pour se connecter à la base de données MongoDB
 * @param {string} uri - URI de connexion MongoDB
 * @param {object} [options] - Options de connexion pour mongoose
 * @returns {Promise<void>}
 */
logger.connectToDatabase = async function (uri, options = {}) {
  try {
    // Paramètres par défaut de connexion
    const defaultOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    await mongoose.connect(uri, { ...defaultOptions, ...options });
    this.info(`Connexion réussie à la base de données: ${uri}`);
  } catch (error) {
    this.error(`Erreur de connexion à la base de données: ${error.message}`);
    throw new Error("Échec de la connexion à MongoDB");
  }
};

/**
 * Fonction pour déconnecter la base de données MongoDB
 * @returns {Promise<void>}
 */
logger.disconnectDatabase = async function () {
  try {
    await mongoose.disconnect();
    this.info("Déconnexion réussie de la base de données");
  } catch (error) {
    this.error("Erreur lors de la déconnexion de la base de données:", error);
  }
};

module.exports = logger;
