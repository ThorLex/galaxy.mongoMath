const mongoose = require("mongoose");
const logger = require("./utils/logger.js");
const {
  listCollectionsAndDocuments,
  countDocumentsPerCollection,
  getDatabaseInfo,
} = require("./lib/dbUtils.js");

const {
  calculateStatistics,
  calculateFieldStatistics,
  calculateCrossFieldStatistics,
} = require("./lib/dbStats.js");

let isConnected = false;
const connectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

/**
 * Vérifie si la connexion est établie
 * @private
 * @throws {Error} Si non connecté
 */
const checkConnection = () => {
  if (!isConnected) {
    throw new Error("MongoMath: Non connecté à MongoDB");
  }
};

/**
 * Gère les opérations asynchrones avec gestion d'erreur
 * @private
 * @param {Function} asyncFunction Fonction asynchrone à exécuter
 * @param {string} errorMessage Message d'erreur personnalisé
 * @returns {Promise<Object>} Résultat de la fonction asynchrone
 */
const handleAsyncOperation = async (asyncFunction, errorMessage) => {
  try {
    return await asyncFunction();
  } catch (error) {
    logger.error(`MongoMath: ${errorMessage}`, error);
    throw new Error(`${errorMessage}: ${error.message}`);
  }
};

/**
 * Établit la connexion à la base de données MongoDB
 * @param {string} uri - URI de connexion MongoDB
 * @returns {Promise<void>}
 * @throws {Error} Si la connexion échoue
 */
const connect = async (uri) => {
  try {
    if (isConnected) {
      logger.info("MongoMath: Connexion déjà établie");
      return;
    }

    await mongoose.connect(uri, connectionOptions);
    isConnected = true;
    logger.info("MongoMath: Connexion établie avec succès");
  } catch (error) {
    logger.error("MongoMath: Erreur de connexion", error);
    throw new Error("Échec de la connexion à MongoDB");
  }
};

/**
 * Déconnecte de la base de données
 * @returns {Promise<void>}
 */
const disconnect = async () => {
  try {
    await mongoose.disconnect();
    isConnected = false;
    logger.info("MongoMath: Déconnexion réussie");
  } catch (error) {
    logger.error("MongoMath: Erreur lors de la déconnexion", error);
    throw new Error("Échec de la déconnexion de MongoDB");
  }
};

/**
 * Liste toutes les collections et leurs documents
 * @returns {Promise<Object>} Collections et documents
 */
const listCollections = async () => {
  checkConnection();
  return handleAsyncOperation(
    listCollectionsAndDocuments,
    "Échec de la récupération des collections"
  );
};

/**
 * Compte les documents par collection
 * @returns {Promise<Object>} Nombre de documents par collection
 */
const countDocuments = async () => {
  checkConnection();
  return handleAsyncOperation(
    countDocumentsPerCollection,
    "Échec du comptage des documents"
  );
};

/**
 * Récupère les informations de la base de données
 * @returns {Promise<Object>} Informations de la base de données
 */
const getDatabaseInformation = async () => {
  checkConnection();
  return handleAsyncOperation(
    getDatabaseInfo,
    "Échec de la récupération des informations"
  );
};

/**
 * Calcule les statistiques pour une période donnée
 * @param {Object} options Options de calcul
 * @param {string} [options.period='day'] Période de calcul ('day', 'week', 'month')
 * @returns {Promise<Object>} Statistiques calculées
 */
const calculateStats = async (options = { period: "day" }) => {
  checkConnection();
  return handleAsyncOperation(
    () => calculateStatistics(options),
    "Échec du calcul des statistiques"
  );
};

/**
 * Calcule les statistiques pour un champ spécifique
 * @param {string} collection Nom de la collection
 * @param {string} field Nom du champ
 * @returns {Promise<Object>} Statistiques du champ
 */
const getFieldStats = async (collection, field) => {
  checkConnection();
  return handleAsyncOperation(
    () => calculateFieldStatistics(collection, field),
    `Échec du calcul des statistiques pour ${field}`
  );
};

/**
 * Calcule les statistiques croisées entre deux champs
 * @param {string} collection Nom de la collection
 * @param {string} field1 Premier champ
 * @param {string} field2 Second champ
 * @returns {Promise<Object>} Statistiques croisées
 */
const getCrossFieldStats = async (collection, field1, field2) => {
  checkConnection();
  return handleAsyncOperation(
    () => calculateCrossFieldStatistics(collection, field1, field2),
    "Échec du calcul des statistiques croisées"
  );
};

// Export des fonctions
module.exports = {
  connect,
  disconnect,
  listCollections,
  countDocuments,
  getDatabaseInformation,
  calculateStats,
  getFieldStats,
  getCrossFieldStats,
};
