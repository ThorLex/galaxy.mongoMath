const mongoose = require("mongoose");
const moment = require("moment");

async function calculateStatistics(options = {}) {
  const {
    period = "month",
    periodCount = 1,
    databaseUrl = process.env.MONGO_URI,
  } = options;
  try {
    // Connexion à la base de données
    await mongoose.connect(databaseUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connecté à la base de données");

    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    const statistics = {};

    for (const collection of collections) {
      const model = mongoose.model(
        collection.name,
        new mongoose.Schema({}, { strict: false })
      );

      try {
        const documents = await model.find().lean();
        statistics[collection.name] = {
          totalDocuments: documents.length,
          creationDates: [],
          documentDetails: [],
          modificationCounts: {},
          modificationsByPeriod: {},
          meanModifications: 0,
          medianModifications: 0,
          modeModifications: 0,
          standardDeviation: 0,
          variance: 0,
          minModificationsDocumentId: null,
          maxModificationsDocumentId: null,
          nullModificationsCount: 0,
          nullValuesCount: 0,
        };

        // Collecter des informations sur les documents
        for (const doc of documents) {
          const createdAt = moment(doc.createdAt);
          const updatedAt = doc.updatedAt ? moment(doc.updatedAt) : null;
          const modificationCount =
            updatedAt && updatedAt !== createdAt
              ? (statistics[collection.name].modificationCounts[
                  createdAt.toString()
                ] || 0) + 1
              : 0;

          statistics[collection.name].creationDates.push(createdAt);
          statistics[collection.name].documentDetails.push({
            id: doc._id,
            createdAt: createdAt.format("YYYY-MM-DD HH:mm:ss"),
            updatedAt: updatedAt
              ? updatedAt.format("YYYY-MM-DD HH:mm:ss")
              : null,
            modificationCount: modificationCount,
          });

          // Calcul des modifications par période
          const periodKey = getPeriodKey(createdAt, period, periodCount);
          statistics[collection.name].modificationsByPeriod[periodKey] =
            (statistics[collection.name].modificationsByPeriod[periodKey] ||
              0) + modificationCount;

          // Compter les valeurs nulles
          for (const key in doc) {
            if (doc[key] === null) {
              statistics[collection.name].nullValuesCount++;
            }
          }

          // Mise à jour des statistiques sur les modifications
          if (modificationCount > 0) {
            statistics[collection.name].modificationCounts[
              createdAt.toString()
            ] = modificationCount;

            if (
              !statistics[collection.name].minModificationsDocumentId ||
              modificationCount <
                statistics[collection.name].modificationCounts[
                  statistics[collection.name].minModificationsDocumentId
                ]
            ) {
              statistics[collection.name].minModificationsDocumentId =
                createdAt.toString();
            }

            if (
              !statistics[collection.name].maxModificationsDocumentId ||
              modificationCount >
                statistics[collection.name].modificationCounts[
                  statistics[collection.name].maxModificationsDocumentId
                ]
            ) {
              statistics[collection.name].maxModificationsDocumentId =
                createdAt.toString();
            }
          } else {
            statistics[collection.name].nullModificationsCount++;
          }
        }

        // Calcul des statistiques sur les modifications
        const modCountsArray = Object.values(
          statistics[collection.name].modificationCounts
        );
        const totalCounts = modCountsArray.length;

        statistics[collection.name].meanModifications =
          calculateMean(modCountsArray);
        statistics[collection.name].medianModifications =
          calculateMedian(modCountsArray);
        statistics[collection.name].modeModifications =
          calculateMode(modCountsArray);
        statistics[collection.name].standardDeviation =
          calculateStandardDeviation(modCountsArray);
        statistics[collection.name].variance =
          calculateVariance(modCountsArray);
      } catch (err) {
        console.error(
          `Erreur lors de la récupération des documents pour la collection ${collection.name}:`,
          err
        );
      }
    }

    return statistics;
  } catch (err) {
    console.error("Erreur de connexion à la base de données:", err);
    throw err;
  } finally {
    await mongoose.disconnect(); // Déconnexion de la base de données
  }
}

// Fonction pour obtenir la clé de période en fonction de la date et du nombre de périodes
function getPeriodKey(date, period, periodCount) {
  const periodDuration = getPeriodDuration(period);
  const startDate = date
    .clone()
    .startOf(period)
    .subtract((periodCount - 1) * periodDuration, period);
  const endDate = startDate
    .clone()
    .add(periodCount * periodDuration - 1, period);
  return `${startDate.format("YYYY-MM-DD")}-${endDate.format("YYYY-MM-DD")}`;
}

// Fonction pour obtenir la durée d'une période en jours
function getPeriodDuration(period) {
  switch (period) {
    case "day":
      return 1;
    case "month":
      return 30;
    case "year":
      return 365;
    default:
      return 1;
  }
}

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

// Fonction de calcul de l'écart-type
function calculateStandardDeviation(arr) {
  if (arr.length === 0) return 0;
  const mean = calculateMean(arr);
  const variance = calculateVariance(arr);
  return Math.sqrt(variance);
}

// Fonction de calcul de la variance
function calculateVariance(arr) {
  if (arr.length === 0) return 0;
  const mean = calculateMean(arr);
  const deviations = arr.map((x) => (x - mean) ** 2);
  return calculateMean(deviations);
}

module.exports = { calculateStatistics };
