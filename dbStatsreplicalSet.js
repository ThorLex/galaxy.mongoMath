const mongoose = require("mongoose");
require("dotenv").config();

const statistics = {
  totalCreated: 0,
  totalUpdated: 0,
  totalDeleted: 0,
  hourly: {},
  daily: {},
  monthly: {},
  lifetimeDurations: [], // Durée de vie de chaque document (en ms)
  totalCreatedPerMinute: 0,
  totalDeletedPerMinute: 0,
};

/**
 * Initialisation du Change Stream pour écouter les changements en direct de la base de données
 */
async function watchDatabaseChanges() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(
      "Connecté à la base de données et écoute des changements en direct"
    );

    const db = mongoose.connection.db;
    const changeStream = db.watch();

    changeStream.on("change", async (change) => {
      const timestamp = new Date(change.clusterTime.getTime());
      const hour = timestamp.getHours();
      const day = timestamp.toISOString().slice(0, 10); // Date formatée
      const month = timestamp.toISOString().slice(0, 7); // Mois formaté

      switch (change.operationType) {
        case "insert":
          updateStatistics("created", hour, day, month, timestamp);
          break;

        case "update":
          statistics.totalUpdated += 1;
          break;

        case "delete":
          updateStatistics("deleted", hour, day, month, timestamp);

          const docId = change.documentKey._id;
          const lifetime = await calculateDocumentLifetime(docId, timestamp);
          if (lifetime !== null) statistics.lifetimeDurations.push(lifetime);

          await saveDeletionEvent(docId, timestamp);
          break;

        default:
          console.log("Changement ignoré :", change.operationType);
      }
    });
  } catch (err) {
    console.error(
      "Erreur lors de la connexion ou de l'écoute des changements:",
      err
    );
  }
}

/**
 * Met à jour les statistiques en fonction de l'événement
 * @param {string} type - Type d'événement ('created' ou 'deleted')
 * @param {number} hour - Heure de l'événement
 * @param {string} day - Jour de l'événement
 * @param {string} month - Mois de l'événement
 */
function updateStatistics(type, hour, day, month, timestamp) {
  if (type === "created") statistics.totalCreated += 1;
  if (type === "deleted") statistics.totalDeleted += 1;

  // Mise à jour des statistiques horaires
  statistics.hourly[hour] = (statistics.hourly[hour] || 0) + 1;
  statistics.daily[day] = (statistics.daily[day] || 0) + 1;
  statistics.monthly[month] = (statistics.monthly[month] || 0) + 1;

  // Calcul des taux par minute
  const minutesElapsed = (Date.now() - timestamp.getTime()) / (1000 * 60);
  if (type === "created")
    statistics.totalCreatedPerMinute += 1 / minutesElapsed;
  if (type === "deleted")
    statistics.totalDeletedPerMinute += 1 / minutesElapsed;
}

/**
 * Sauvegarder les informations de suppression pour un document donné
 * @param {ObjectId} docId - ID du document supprimé
 * @param {Date} timestamp - Heure de suppression
 */
async function saveDeletionEvent(docId, timestamp) {
  const DeletionLog = mongoose.model(
    "DeletionLog",
    new mongoose.Schema({
      documentId: mongoose.Schema.Types.ObjectId,
      deletedAt: Date,
    })
  );

  const log = new DeletionLog({ documentId: docId, deletedAt: timestamp });
  await log.save();
}

/**
 * Calcule la durée de vie d'un document en ms
 * @param {ObjectId} docId - ID du document
 * @param {Date} deletedAt - Date de suppression
 * @returns {number|null} - Durée de vie en ms ou null si indisponible
 */
async function calculateDocumentLifetime(docId, deletedAt) {
  const DocumentModel = mongoose.model(
    "Document",
    new mongoose.Schema({}, { timestamps: true })
  );
  const doc = await DocumentModel.findById(docId).select("createdAt");
  if (!doc) return null;
  return deletedAt - doc.createdAt;
}

/**
 * Fonction pour obtenir les statistiques actuelles, avec calcul des moyennes
 */
async function getStatistics() {
 try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(
      "Connecté à la base de données et écoute des changements en direct"
    );

  
  const avgLifetime =
    statistics.lifetimeDurations.length > 0
      ? statistics.lifetimeDurations.reduce((a, b) => a + b) /
        statistics.lifetimeDurations.length
      : 0;

  return {
    ...statistics,
    averageLifetimeMs: avgLifetime,
    creationRatePerMinute: statistics.totalCreatedPerMinute,
    deletionRatePerMinute: statistics.totalDeletedPerMinute,
  }
}

catch{
  console.log("nn")
}}
module.exports = {
  watchDatabaseChanges,
  getStatistics,
};
