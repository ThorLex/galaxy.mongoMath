const mongoose = require("mongoose");

const moment = require("moment");
const mathUtils = require("./mathUtils");
const { forEach, count } = require("mathjs");

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
    console.log("Connecté à la base de données 1");

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

// Fonction pour obtenir la clé de période en fonction de la date et de la référence de période
function getPeriodKey(date, period, periodCount) {
  const startDate = moment().subtract(periodCount, period); // Calcul de la période
  return `${startDate.format("YYYY-MM-DD")}-${date.format("YYYY-MM-DD")}`;
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

async function calculateFieldStatistics(
  collectionName,
  fieldName,
  options = {}
) {
  const { databaseUrl = process.env.MONGO_URI } = options;
  try {
    // Connexion à la base de données
    await mongoose.connect(databaseUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connecté à la base de données");

    const model = mongoose.model(
      collectionName,
      new mongoose.Schema({}, { strict: false })
    );
    const documents = await model.find().lean();

    const values = documents
      .map((doc) => doc[fieldName])
      .filter((val) => val !== null);

    return {
      totalDocuments: documents.length,
      mean: mathUtils.calculateMean(values),
      median: mathUtils.calculateMedian(values),
      mode: mathUtils.calculateMode(values),
      variance: mathUtils.calculateVariance(values),
      standardDeviation: mathUtils.calculateStandardDeviation(values),
      nullCount: documents.length - values.length,
    };
  } catch (err) {
    console.error(
      `Erreur lors de la récupération des statistiques pour ${collectionName}.${fieldName}:`,
      err
    );
    throw err;
  } finally {
    await mongoose.disconnect(); // Déconnexion de la base de données
  }
}

async function calculateFieldStatistics(
  collectionName,
  fieldName,
  options = {}
) {
  const { databaseUrl = process.env.MONGO_URI } = options;
  try {
    // Connexion à la base de données
    await mongoose.connect(databaseUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connecté à la base de données");

    // Vérifiez si le modèle existe déjà
    const model =
      mongoose.models[collectionName] ||
      mongoose.model(
        collectionName,
        new mongoose.Schema({}, { strict: false })
      );

    const documents = await model.find().lean();

    const values = documents
      .map((doc) => doc[fieldName])
      .filter((val) => val !== null);

    return {
      totalDocuments: documents.length,
      mean: mathUtils.calculateMean(values),
      median: mathUtils.calculateMedian(values),
      mode: mathUtils.calculateMode(values),
      variance: mathUtils.calculateVariance(values),
      standardDeviation: mathUtils.calculateStandardDeviation(values),
      nullCount: documents.length - values.length,
    };
  } catch (err) {
    console.error(
      `Erreur lors de la récupération des statistiques pour ${collectionName}.${fieldName}:`,
      err
    );
    throw err;
  } finally {
    await mongoose.disconnect(); // Déconnexion de la base de données
  }
}

async function calculateCrossFieldStatistics(
  collectionName,
  field1,
  field2,
  options = {}
) {
  const { databaseUrl = process.env.MONGO_URI } = options;
  try {
    // Connexion à la base de données
    await mongoose.connect(databaseUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connecté à la base de données");

    // Vérifiez si le modèle existe déjà
    const model =
      mongoose.models[collectionName] ||
      mongoose.model(
        collectionName,
        new mongoose.Schema({}, { strict: false })
      );

    const documents = await model.find().lean();

    // Extraction des valeurs des champs
    const field1Values = documents
      .map((doc) => doc[field1])
      .filter((v) => v !== undefined);
    const field2Values = documents
      .map((doc) => doc[field2])
      .filter((v) => v !== undefined);

    // Comptage des occurrences
    const field1Count = {};
    const field2Count = {};

    field1Values.forEach((value) => {
      field1Count[value] = (field1Count[value] || 0) + 1;
    });

    field2Values.forEach((value) => {
      field2Count[value] = (field2Count[value] || 0) + 1;
    });

    // Calcul des statistiques pour field1 et field2
    const field1Stats = {
      mean: mathUtils.calculateMean(Object.values(field1Count)),
      standardDeviation: mathUtils.calculateStandardDeviation(
        Object.values(field1Count)
      ),
      variance: mathUtils.calculateVariance(Object.values(field1Count)),
      totalCount: Object.values(field1Count).reduce((a, b) => a + b, 0),
      counts: field1Count,
    };
    let result = 0;
    for (let i = 0; i < field1Values.length; i++) {
      result += field1Values[i];
    }
    console.log("voici le resultat", result / 121);
    const field2Stats = {
      mean: mathUtils.calculateMean(Object.values(field2Count)),
      standardDeviation: mathUtils.calculateStandardDeviation(
        Object.values(field2Count)
      ),
      variance: mathUtils.calculateVariance(Object.values(field2Count)),
      totalCount: Object.values(field2Count).reduce((a, b) => a + b, 0),
      counts: field2Count,
    };

    // Calcul de la table de contingence
    const crossTabulation = mathUtils.calculateCrossTabulation(
      field1Values,
      field2Values
    );

    return {
      totalDocuments: documents.length,
      field1Stats,
      field2Stats,
      crossTabulation,
    };
  } catch (err) {
    console.error(
      `Erreur lors de la récupération des statistiques croisées pour ${collectionName}:`,
      err
    );
    throw err;
  } finally {
    await mongoose.disconnect(); // Déconnexion de la base de données
  }
}

module.exports = { calculateCrossFieldStatistics };

module.exports = {
  calculateStatistics,
  calculateFieldStatistics,
  calculateCrossFieldStatistics,
};
