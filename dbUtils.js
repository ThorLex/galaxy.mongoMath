const mongoose = require("mongoose");
require("dotenv").config();

async function listCollectionsAndDocuments() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connecté à la base de données");

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const result = {};

    for (let collection of collections) {
      const collectionName = collection.name;
      const Model = mongoose.model(
        collectionName,
        new mongoose.Schema({}, { strict: false })
      );

      try {
        const documents = await Model.find().exec();
        result[collectionName] = documents;
      } catch (err) {
        console.error(
          `Erreur lors de la récupération des documents pour la collection ${collectionName}:`,
          err
        );
      }
    }

    await mongoose.disconnect();
    return result;
  } catch (err) {
    console.error("Erreur de connexion à la base de données:", err);
    throw err;
  }
}

// Nouvelle fonction pour compter les documents par collection
async function countDocumentsPerCollection() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connecté à la base de données");

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const countResult = {};

    for (let collection of collections) {
      const collectionName = collection.name;
      const Model = mongoose.model(
        collectionName,
        new mongoose.Schema({}, { strict: false })
      );

      try {
        const count = await Model.countDocuments().exec();
        countResult[collectionName] = count;
        console.table(countResult);
      } catch (err) {
        console.error(
          `Erreur lors du comptage des documents pour la collection ${collectionName}:`,
          err
        );
      }
    }

    await mongoose.disconnect();
    return countResult;
  } catch (err) {
    console.error("Erreur de connexion à la base de données:", err);
    throw err;
  }
}

async function getDatabaseInfo(params) {
  // verrification des paramettre
  if (params === undefined) {
    params = {}; // or some other default value
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connecté à la base de données");

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const infoResult = {
      totalCollections: collections.length,
      collections: {},
      totalSizeBytes: 0,
    };

    for (let collection of collections) {
      const collectionName = collection.name;
      const Model = mongoose.model(
        collectionName,
        new mongoose.Schema({}, { strict: false })
      );

      try {

          const documents = await Model.find().select('createdAt updatedAt deletedAt').exec();
       resul[collectionName] = documents.map(doc => ({
        id: doc._id,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        deletedAt: doc.deletedAt
      }));
    
        // Nombre de documents dans la collection
        const count = await Model.countDocuments().exec();

        // Taille de la collection en octets
        const stats = await db.collection(collectionName);
        const size = stats.size;

        // Stocker les informations par collection
        infoResult.collections[collectionName] = {
          count,
          sizeBytes: size,
        };

        // Ajouter à la taille totale
        infoResult.totalSizeBytes += size;
      } catch (err) {
        console.error(
          `Erreur lors de l'obtention des informations pour la collection ${collectionName}:`,
          err
        );
      }
    }

    await mongoose.disconnect();
    return infoResult;
  } catch (err) {
    console.error("Erreur de connexion à la base de données:", err);
    throw err;
  }
}

module.exports = {
  listCollectionsAndDocuments,
  countDocumentsPerCollection,
  getDatabaseInfo,
};
