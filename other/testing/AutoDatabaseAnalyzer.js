const mongoose = require("mongoose");
const EventEmitter = require("events");

class AutoDatabaseAnalyzer extends EventEmitter {
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
  }

  /**
   * Analyse complète et automatique de la base de données
   */
  async analyzeAll() {
    const analysis = {
      timestamp: new Date(),
      databaseInfo: {},
      collectionsAnalysis: {},
      relationships: [],
      dataQuality: {},
      performance: {},
      summary: {},
    };

    try {
      await this.connect();
      console.log("🔍 Début de l'analyse complète...");

      // 1. Informations générales de la base de données
      analysis.databaseInfo = await this.getDatabaseInfo();
      console.log("✅ Informations générales récupérées");

      // 2. Analyse détaillée de chaque collection
      analysis.collectionsAnalysis = await this.analyzeAllCollections();
      console.log("✅ Collections analysées");

      // 3. Détection des relations entre collections
      analysis.relationships = await this.detectRelationships();
      console.log("✅ Relations détectées");

      // 4. Analyse de la qualité des données
      analysis.dataQuality = await this.analyzeDataQuality();
      console.log("✅ Qualité des données analysée");

      // 5. Analyse des performances
      analysis.performance = await this.analyzePerformance();
      console.log("✅ Performances analysées");

      // 6. Création du résumé
      analysis.summary = this.generateSummary(analysis);
      console.log("✅ Résumé généré");

      await this.disconnect();
      return analysis;
    } catch (error) {
      console.error("❌ Erreur lors de l'analyse:", error);
      await this.disconnect();
      throw error;
    }
  }

  async connect() {
    try {
      this.connection = await mongoose.connect(
        this.config.uri,
        this.config.options
      );
      this.db = this.connection.connection.db;
      this.emit("connected");
    } catch (error) {
      this.emit("error", error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await mongoose.disconnect();
      this.emit("disconnected");
    } catch (error) {
      this.emit("error", error);
      throw error;
    }
  }

  async getDatabaseInfo() {
    const dbStats = await this.db.stats();
    const buildInfo = await this.db.admin().buildInfo();

    return {
      name: this.db.databaseName,
      size: dbStats.dataSize,
      storageSize: dbStats.storageSize,
      collections: dbStats.collections,
      indexes: dbStats.indexes,
      avgObjSize: dbStats.avgObjSize,
      mongoVersion: buildInfo.version,
      engine: buildInfo.storageEngine,
      encoding: buildInfo.encoding,
    };
  }

  async analyzeAllCollections() {
    const collections = await this.db.listCollections().toArray();
    const analysisResult = {};

    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`📊 Analyse de la collection: ${collectionName}`);

      try {
        const Model = this.getModelForCollection(collectionName);
        analysisResult[collectionName] = await this.analyzeCollection(
          Model,
          collectionName
        );
      } catch (error) {
        console.error(
          `❌ Erreur lors de l'analyse de ${collectionName}:`,
          error
        );
        analysisResult[collectionName] = { error: error.message };
      }
    }

    return analysisResult;
  }

  async analyzeCollection(Model, collectionName) {
    const analysis = {
      basic: await this.getBasicCollectionInfo(Model, collectionName),
      schema: await this.detectSchema(Model),
      statistics: await this.getCollectionStatistics(Model),
      samples: await this.getSampleDocuments(Model),
      dateRanges: await this.getDateRanges(Model),
      uniqueValues: await this.getUniqueValuesStats(Model),
      nullStats: await this.getNullStats(Model),
    };

    return analysis;
  }

  async getBasicCollectionInfo(Model, collectionName) {
    const stats = await this.db.collection(collectionName).stats();
    const indexes = await Model.listIndexes();

    return {
      documentCount: stats.count,
      totalSize: stats.size,
      avgDocumentSize: stats.avgObjSize,
      indexes: indexes.map((index) => ({
        name: index.name,
        fields: index.key,
        unique: index.unique || false,
      })),
    };
  }

  async detectSchema(Model) {
    const sample = await Model.findOne().lean();
    if (!sample) return {};

    const schema = this.analyzeDocumentStructure(sample);
    const frequencies = await this.analyzeFieldFrequencies(Model);

    return {
      structure: schema,
      frequencies,
    };
  }

  analyzeDocumentStructure(doc, path = "") {
    const structure = {};

    for (const [key, value] of Object.entries(doc)) {
      if (key === "_id" || key === "__v") continue;

      const fullPath = path ? `${path}.${key}` : key;
      const type = this.getDetailedType(value);

      if (type === "object" && value !== null) {
        structure[key] = {
          type: "object",
          fields: this.analyzeDocumentStructure(value, fullPath),
        };
      } else if (type === "array" && value.length > 0) {
        structure[key] = {
          type: "array",
          itemType: this.getDetailedType(value[0]),
          sample: value.slice(0, 3),
        };
      } else {
        structure[key] = { type };
      }
    }

    return structure;
  }

  async analyzeFieldFrequencies(Model) {
    const pipeline = [
      { $sample: { size: 1000 } },
      { $project: { fieldNames: { $objectToArray: "$$ROOT" } } },
      { $unwind: "$fieldNames" },
      {
        $group: {
          _id: "$fieldNames.k",
          count: { $sum: 1 },
        },
      },
    ];

    const frequencies = await Model.aggregate(pipeline);
    return frequencies.reduce((acc, { _id, count }) => {
      acc[_id] = count / 1000;
      return acc;
    }, {});
  }

  async detectRelationships() {
    const collections = await this.db.listCollections().toArray();
    const relationships = [];

    for (const collection of collections) {
      const Model = this.getModelForCollection(collection.name);
      const sample = await Model.findOne().lean();

      if (sample) {
        const potentialRefs = this.findPotentialReferences(
          sample,
          collections.map((c) => c.name)
        );
        relationships.push(
          ...potentialRefs.map((ref) => ({
            from: collection.name,
            ...ref,
          }))
        );
      }
    }

    return relationships;
  }

  findPotentialReferences(doc, collectionNames, path = "") {
    const refs = [];

    for (const [key, value] of Object.entries(doc)) {
      if (key === "_id" || key === "__v") continue;

      const fullPath = path ? `${path}.${key}` : key;

      if (this.isObjectId(value)) {
        const potentialCollection = this.guessCollectionFromField(
          key,
          collectionNames
        );
        if (potentialCollection) {
          refs.push({
            field: fullPath,
            to: potentialCollection,
            type: "single",
          });
        }
      } else if (
        Array.isArray(value) &&
        value.length > 0 &&
        this.isObjectId(value[0])
      ) {
        const potentialCollection = this.guessCollectionFromField(
          key,
          collectionNames
        );
        if (potentialCollection) {
          refs.push({
            field: fullPath,
            to: potentialCollection,
            type: "many",
          });
        }
      } else if (typeof value === "object" && value !== null) {
        refs.push(
          ...this.findPotentialReferences(value, collectionNames, fullPath)
        );
      }
    }

    return refs;
  }

  async analyzeDataQuality() {
    const collections = await this.db.listCollections().toArray();
    const quality = {};

    for (const collection of collections) {
      const Model = this.getModelForCollection(collection.name);
      quality[collection.name] = await this.analyzeCollectionQuality(Model);
    }

    return quality;
  }

  async analyzeCollectionQuality(Model) {
    return {
      completeness: await this.analyzeCompleteness(Model),
      consistency: await this.analyzeConsistency(Model),
      validity: await this.analyzeValidity(Model),
    };
  }

  async analyzePerformance() {
    const collections = await this.db.listCollections().toArray();
    const performance = {
      indexes: {},
      queriesStats: {},
      recommendations: [],
    };

    for (const collection of collections) {
      const stats = await this.db.collection(collection.name).stats();
      performance.indexes[collection.name] = {
        totalIndexSize: stats.totalIndexSize,
        indexSizes: stats.indexSizes,
      };
    }

    return performance;
  }

  generateSummary(analysis) {
    const summary = {
      databaseOverview: {
        totalSize: analysis.databaseInfo.size,
        collectionsCount: Object.keys(analysis.collectionsAnalysis).length,
        totalDocuments: Object.values(analysis.collectionsAnalysis).reduce(
          (sum, col) => sum + (col.basic?.documentCount || 0),
          0
        ),
      },
      topCollections: this.getTopCollections(analysis),
      potentialIssues: this.identifyPotentialIssues(analysis),
      recommendations: this.generateRecommendations(analysis),
    };

    return summary;
  }

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

  getDetailedType(value) {
    if (value === null) return "null";
    if (Array.isArray(value)) return "array";
    if (value instanceof Date) return "date";
    if (value instanceof mongoose.Types.ObjectId) return "objectId";
    return typeof value;
  }

  isObjectId(value) {
    return (
      value instanceof mongoose.Types.ObjectId ||
      (typeof value === "string" && /^[a-f\d]{24}$/i.test(value))
    );
  }

  guessCollectionFromField(fieldName, collectionNames) {
    const singularField = fieldName.replace(/s$/, "");
    const pluralField = fieldName + "s";

    return collectionNames.find(
      (name) =>
        name === fieldName || name === singularField || name === pluralField
    );
  }

  getTopCollections(analysis) {
    return Object.entries(analysis.collectionsAnalysis)
      .map(([name, data]) => ({
        name,
        documentCount: data.basic?.documentCount || 0,
        size: data.basic?.totalSize || 0,
      }))
      .sort((a, b) => b.documentCount - a.documentCount)
      .slice(0, 5);
  }

  identifyPotentialIssues(analysis) {
    const issues = [];
    // Logique pour identifier les problèmes potentiels
    return issues;
  }

  generateRecommendations(analysis) {
    const recommendations = [];
    // Logique pour générer des recommandations
    return recommendations;
  }
}

module.exports = AutoDatabaseAnalyzer;
