<p align="center">
  <a href="http://mongomath.nettyfy.com/"><img src="https://github.com/ThorLex/galaxy.mongoMath/blob/main/galaxy.png" alt="Galaxy Logo"></a>
</p>

# mongoMath

MongoMath [`MongoMath`](https://github.com/ThorLex/galaxy.mongoMath) is an advanced data analysis tool for MongoDB databases, allowing users to perform general database analysis and cross-field analysis on specified collections. It returns both basic and advanced statistical metrics, providing insights across different fields when specified.

Documentation: [mongomath.nettyfy.com (Unavailable)](http://mongomath.nettyfy.com)

Installation
Install MongoMath using npm:

```bash
npm install mongomath
```

Usage
Importing and Initializing
First, import and initialize MongoMath with a MongoDB URI:

```javascript
const MongoMath = require("mongoGeneralAnalyser");

const mongoMath = new MongoMath("mongodb://localhost:27017/your_database");
```

dataAnalyzer(params)
The `dataAnalyzer` method performs various analyses based on the provided parameters. It can return general statistics on collections or cross-field statistics between specified fields.

Parameters

- **`collection`** (string, optional): Specifies the collection to analyze. If no collection is provided, the entire database is analyzed.
- **`crossFieldAnalysis`** (object, optional): Used to perform cross-field analysis on two fields within the specified collection.
  - **`field1`** (string): The first field for cross-field analysis.
  - **`field2`** (string): The second field for cross-field analysis.
- **`includeIndexes`** (boolean, optional): If true, includes information on indexes.
- **`includeSchemas`** (boolean, optional): If true, includes schema information of the documents.

Examples

1. Cross-Field Analysis between Two Fields
   In this example, cross-field analysis is performed between `age` and `height` fields in the `users` collection.

```javascript
const mongoMath = new MongoMath("mongodb://localhost:27017/be");

(async () => {
  await mongoMath.dataAnalyzer({
    collection: "users",
    crossFieldAnalysis: {
      field1: "age",
      field2: "height",
    },
    includeIndexes: true,
    includeSchemas: true,
  });
})();
```

Expected Output:

{
"General Statistics": {
"totalDocuments": 121,
"mean": 93.5,
"median": 75,
// Additional basic and advanced statistics
},
"Cross Field Statistics": {
// Cross-field data
}
}

2. General Analysis of a Specific Collection
   When only a single collection is specified, the module returns statistics for that collection without cross-field analysis.

```javascript
(async () => {
  await mongoMath.dataAnalyzer({
    collection: "users",
    includeIndexes: true,
    includeSchemas: true,
  });
})();
```

3. Analysis of the Entire Database
   If no collection is specified, the module performs an analysis on the entire database, providing high-level database metrics and performance statistics.

```javascript
(async () => {
  await mongoMath.dataAnalyzer({
    includeIndexes: true,
    includeSchemas: true,
  });
})();
```

Error Handling
If an error occurs during analysis (e.g., invalid parameters, connection issues), an error message is returned, and the database connection is safely closed.

License
This module is licensed under MIT.

Contributing
We welcome contributors to help expand MongoMath! Check out our [documentation (Unavailable)](http://mongomath.nettyfy.com) for more details.
# MongoAnalyzer
Documentation technique
Version 1.0
___

## Table des matières

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [API de référence](#api-de-référence)
5. [Exemples d'utilisation](#exemples-dutilisation)
6. [Gestion des erreurs](#gestion-des-erreurs)

___

## 1. Introduction

MongoAnalyzer est un outil d'analyse avancé pour MongoDB qui permet d'obtenir des statistiques détaillées et des métriques sur votre base de données. Cet outil est conçu pour fournir une vision complète de la santé et des performances de votre base de données MongoDB.

## 2. Installation

### 2.1 Prérequis
- Node.js (version 12 ou supérieure)
- MongoDB (version 4.0 ou supérieure)
- mongoose

### 2.2 Procédure d'installation
```bash
npm install mongo-analyzer
```

## 3. Configuration

### 3.1 Création d'une instance

La classe MongoAnalyzer peut être initialisée avec différentes options de configuration :

```javascript
const MongoAnalyzer = require('mongo-analyzer');

const analyzer = new MongoAnalyzer({
    uri: 'mongodb://localhost:27017/mydatabase',
    mongooseOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
});
```

### 3.2 Options de configuration

| Option | Type | Description | Obligatoire |
|--------|------|-------------|-------------|
| uri | String | URI de connexion MongoDB | Oui |
| mongooseOptions | Object | Options de configuration Mongoose | Non |

## 4. API de référence

### 4.1 Gestion de la connexion

#### connect()
**Description :** Établit la connexion à la base de données MongoDB.

**Retourne :** Promise<void>

**Exemple :**
```javascript
await analyzer.connect();
```

#### disconnect()
**Description :** Ferme la connexion à la base de données.

**Retourne :** Promise<void>

**Exemple :**
```javascript
await analyzer.disconnect();
```

### 4.2 Analyse de base de données

#### getDatabaseInfo(options)
**Description :** Récupère les informations de base sur la base de données.

**Paramètres :**
- options (Object, optionnel) : Options d'analyse

**Retourne :** 
```javascript
{
    dbName: String,
    collections: Number,
    objects: Number,
    avgObjSize: Number,
    dataSize: Number
}
```

#### analyzeDatabaseComplete(options)
**Description :** Effectue une analyse complète de la base de données.

**Paramètres :**
- options (Object, optionnel) : Options d'analyse

**Retourne :**
```javascript
{
    timestamp: Date,
    databaseInfo: Object,
    collectionStatistics: Object,
    performanceMetrics: Object,
    storageAnalysis: Object
}
```

### 4.3 Analyse des collections

#### getDetailedCollectionStats()
**Description :** Fournit des statistiques détaillées pour toutes les collections.

**Retourne :**
```javascript
{
    [collectionName]: {
        dataDistribution: Object,
        fieldStats: Object
    }
}
```

#### analyzeDataDistribution(collectionName)
**Description :** Analyse la distribution des données dans une collection spécifique.

**Paramètres :**
- collectionName (String) : Nom de la collection à analyser

**Retourne :**
```javascript
{
    documentSizes: Object,
    fieldCounts: Object,
    updateFrequency: Object
}
```

### 4.4 Analyse des performances

#### getPerformanceMetrics()
**Description :** Récupère les métriques de performance de l'instance MongoDB.

**Retourne :**
```javascript
{
    operations: {
        totalOperations: Object,
        activeConnections: Object,
        networkStats: Object
    },
    memory: {
        virtualMemory: Number,
        residentMemory: Number,
        mappedMemory: Number
    },
    storage: {
        dataSize: Number,
        storageSize: Number,
        indexes: Number,
        indexSize: Number
    }
}
```

#### getStorageAnalysis()
**Description :** Effectue une analyse du stockage pour toutes les collections.

**Retourne :**
```javascript
{
    collections: {
        [collectionName]: {
            size: Number,
            indexSize: Number,
            avgDocumentSize: Number,
            utilization: Number
        }
    },
    summary: {
        totalSize: Number,
        totalIndexSize: Number,
        totalCollections: Number,
        averageCollectionSize: Number
    }
}
```

## 5. Exemples d'utilisation

### 5.1 Analyse complète de la base de données

```javascript
const MongoAnalyzer = require('mongo-analyzer');

async function analyzeDatabase() {
    const analyzer = new MongoAnalyzer({
        uri: 'mongodb://localhost:27017/mydatabase'
    });

    try {
        await analyzer.connect();
        
        // Analyse complète
        const analysis = await analyzer.analyzeDatabaseComplete();
        console.log('Analyse complète:', analysis);
        
        // Analyse du stockage
        const storage = await analyzer.getStorageAnalysis();
        console.log('Analyse du stockage:', storage);
        
        // Métriques de performance
        const metrics = await analyzer.getPerformanceMetrics();
        console.log('Métriques de performance:', metrics);
        
    } catch (error) {
        console.error('Erreur lors de l'analyse:', error);
    } finally {
        await analyzer.disconnect();
    }
}
```

### 5.2 Analyse d'une collection spécifique

```javascript
async function analyzeCollection(collectionName) {
    const analyzer = new MongoAnalyzer({
        uri: 'mongodb://localhost:27017/mydatabase'
    });

    try {
        await analyzer.connect();
        
        const distribution = await analyzer.analyzeDataDistribution(collectionName);
        console.log('Distribution des données:', distribution);
        
        const fieldStats = await analyzer.analyzeFieldStatistics(collectionName);
        console.log('Statistiques des champs:', fieldStats);
        
    } catch (error) {
        console.error('Erreur lors de l'analyse:', error);
    } finally {
        await analyzer.disconnect();
    }
}
```

## 6. Gestion des erreurs

### 6.1 Types d'erreurs courants

| Type d'erreur | Description | Solution |
|---------------|-------------|----------|
| ConnectionError | Échec de connexion à la base de données | Vérifier l'URI et la connectivité réseau |
| AuthenticationError | Échec d'authentification | Vérifier les identifiants |
| OperationError | Échec d'une opération d'analyse | Vérifier les permissions et la disponibilité des ressources |

### 6.2 Bonnes pratiques

```javascript
try {
    await analyzer.connect();
    const analysis = await analyzer.analyzeDatabaseComplete();
} catch (error) {
    if (error instanceof mongoose.Error.ConnectionError) {
        console.error('Erreur de connexion:', error);
    } else if (error instanceof mongoose.Error.ValidationError) {
        console.error('Erreur de validation:', error);
    } else {
        console.error('Erreur inattendue:', error);
    }
} finally {
    await analyzer.disconnect();
}
```

___

© 2024 MongoAnalyzer. Tous droits réservés.