const mongoose = require("mongoose");
const EventEmitter = require("events");

class DatabaseAnalyzer extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      uri: process.env.MONGO_URI,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        connectTimeoutMS: 10000,
        ...config.options,
      },
    };
    this.isConnected = false;
    this.connection = null;
  }

  /**
   * Établit la connexion à la base de données
   */
  async connect() {
    if (this.isConnected) return;

    try {
      this.connection = await mongoose.connect(
        this.config.uri,
        this.config.options
      );
      this.isConnected = true;
      this.emit("connected");
      console.log("✅ Connexion à la base de données établie");
    } catch (error) {
      this.emit("error", error);
      throw new Error(`Erreur de connexion: ${error.message}`);
    }
  }

  /**
   * Ferme la connexion à la base de données
   */
  async disconnect() {
    if (!this.isConnected) return;

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      this.emit("disconnected");
      console.log("❌ Connexion à la base de données fermée");
    } catch (error) {
      this.emit("error", error);
      throw new Error(`Erreur de déconnexion: ${error.message}`);
    }
  }

  /**
   * Liste toutes les collections et leurs documents
   * @param {Object} options Options de filtrage et de projection
   */
  async listCollectionsAndDocuments(options = {}) {
    await this.connect();
    const result = {
      timestamp: new Date(),
      collections: {},
    };

    try {
      const collections = await this.connection.connection.db
        .listCollections()
        .toArray();

      for (const collection of collections) {
        const collectionName = collection.name;
        const Model = this.getModelForCollection(collectionName);

        try {
          const query = options.query || {};
          const projection = options.projection || {};
          const documents = await Model.find(query, projection)
            .limit(options.limit || 0)
            .sort(options.sort || {})
            .exec();

          result.collections[collectionName] = documents;
        } catch (err) {
          this.emit("error", { collection: collectionName, error: err });
          result.collections[collectionName] = { error: err.message };
        }
      }

      return result;
    } catch (error) {
      this.emit("error", error);
      throw error;
    }
  }

  /**
   * Analyse détaillée de la base de données
   * @param {Object} options Options d'analyse
   */
  async analyzeDatabaseStats(options = {}) {
    await this.connect();
    const stats = {
      timestamp: new Date(),
      databaseName: this.connection.connection.db.databaseName,
      globalStats: {},
      collections: {},
      indexes: {},
      dataDistribution: {},
      performance: {},
    };

    try {
      // Statistiques globales
      stats.globalStats = await this.connection.connection.db.stats();

      // Analyse par collection
      const collections = await this.connection.connection.db
        .listCollections()
        .toArray();
      for (const collection of collections) {
        const collectionName = collection.name;
        const Model = this.getModelForCollection(collectionName);

        // Statistiques de la collection
        const collStats = await this.connection.connection.db
          .collection(collectionName)
          .stats();

        // Analyse des champs et types de données
        const sampleDocs = await Model.find().limit(100).exec();
        const fieldAnalysis = this.analyzeDocumentFields(sampleDocs);

        // Informations sur les index
        const indexes = await Model.listIndexes();

        stats.collections[collectionName] = {
          stats: collStats,
          fieldAnalysis,
          documentCount: await Model.countDocuments(),
          averageDocumentSize: collStats.size / collStats.count || 0,
          indexes: indexes,
        };
      }

      return stats;
    } catch (error) {
      this.emit("error", error);
      throw error;
    }
  }

  /**
   * Analyse les modifications récentes de la base de données
   * @param {Object} options Options de surveillance
   */
  async analyzeRecentChanges(options = {}) {
    await this.connect();
    const changes = {
      timestamp: new Date(),
      collections: {},
    };

    try {
      const collections = await this.connection.connection.db
        .listCollections()
        .toArray();
      const timeFrame = options.timeFrame || 24 * 60 * 60 * 1000; // 24 heures par défaut
      const sinceDate = new Date(Date.now() - timeFrame);

      for (const collection of collections) {
        const collectionName = collection.name;
        const Model = this.getModelForCollection(collectionName);

        // Recherche des documents récemment modifiés
        const recentChanges = await Model.find({
          $or: [
            { createdAt: { $gte: sinceDate } },
            { updatedAt: { $gte: sinceDate } },
            { deletedAt: { $gte: sinceDate } },
          ],
        })
          .select("createdAt updatedAt deletedAt")
          .exec();

        changes.collections[collectionName] = {
          created: recentChanges.filter((doc) => doc.createdAt >= sinceDate)
            .length,
          updated: recentChanges.filter((doc) => doc.updatedAt >= sinceDate)
            .length,
          deleted: recentChanges.filter((doc) => doc.deletedAt >= sinceDate)
            .length,
          documents: recentChanges,
        };
      }

      return changes;
    } catch (error) {
      this.emit("error", error);
      throw error;
    }
  }

  /**
   * Surveille les modifications en temps réel
   * @param {Array} collectionsToWatch Collections à surveiller
   */
  async watchCollections(collectionsToWatch = []) {
    await this.connect();

    try {
      const collections =
        collectionsToWatch.length > 0
          ? collectionsToWatch
          : (
              await this.connection.connection.db.listCollections().toArray()
            ).map((c) => c.name);

      for (const collectionName of collections) {
        const collection =
          this.connection.connection.db.collection(collectionName);
        const changeStream = collection.watch();

        changeStream.on("change", (change) => {
          this.emit("collectionChange", {
            collection: collectionName,
            changeType: change.operationType,
            timestamp: new Date(),
            details: change,
          });
        });

        this.emit("watching", { collection: collectionName });
      }
    } catch (error) {
      this.emit("error", error);
      throw error;
    }
  }

  /**
   * Crée un modèle mongoose pour une collection
   * @param {string} collectionName Nom de la collection
   * @returns {mongoose.Model}
   */
  getModelForCollection(collectionName) {
    try {
      return mongoose.model(collectionName);
    } catch {
      return mongoose.model(
        collectionName,
        new mongoose.Schema(
          {},
          {
            strict: false,
            timestamps: true,
          }
        )
      );
    }
  }

  /**
   * Analyse les champs et leurs types dans un ensemble de documents
   * @param {Array} documents Documents à analyser
   * @returns {Object} Analyse des champs
   */
  analyzeDocumentFields(documents) {
    const fieldAnalysis = {};

    for (const doc of documents) {
      const fields = this.getDocumentFields(doc._doc, "");

      for (const [field, type] of Object.entries(fields)) {
        if (!fieldAnalysis[field]) {
          fieldAnalysis[field] = {
            types: new Set(),
            occurrences: 0,
            nullCount: 0,
            examples: new Set(),
          };
        }

        fieldAnalysis[field].types.add(type);
        fieldAnalysis[field].occurrences++;
        if (doc[field] === null) fieldAnalysis[field].nullCount++;
        if (fieldAnalysis[field].examples.size < 3) {
          fieldAnalysis[field].examples.add(JSON.stringify(doc[field]));
        }
      }
    }

    // Convertir les Sets en Arrays pour la sérialisation
    for (const field in fieldAnalysis) {
      fieldAnalysis[field].types = Array.from(fieldAnalysis[field].types);
      fieldAnalysis[field].examples = Array.from(fieldAnalysis[field].examples);
    }

    return fieldAnalysis;
  }

  /**
   * Obtient récursivement les champs d'un document
   * @param {Object} obj Document à analyser
   * @param {string} prefix Préfixe pour les champs imbriqués
   * @returns {Object} Champs et leurs types
   */
  getDocumentFields(obj, prefix = "") {
    const fields = {};

    for (const [key, value] of Object.entries(obj)) {
      if (key === "_id" || key === "__v") continue;

      const fieldName = prefix ? `${prefix}.${key}` : key;

      if (value === null) {
        fields[fieldName] = "null";
      } else if (Array.isArray(value)) {
        fields[fieldName] = "array";
        if (value.length > 0 && typeof value[0] === "object") {
          Object.assign(
            fields,
            this.getDocumentFields(value[0], fieldName + "[0]")
          );
        }
      } else if (typeof value === "object" && !(value instanceof Date)) {
        Object.assign(fields, this.getDocumentFields(value, fieldName));
      } else {
        fields[fieldName] = typeof value;
      }
    }

    return fields;
  }
}

module.exports = DatabaseAnalyzer;
