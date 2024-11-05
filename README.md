<p align="center">
  <a href="http://mongomath.netlyfy.com/"><img src="https://github.com/ThorLex/galaxy.mongoMath/blob/main/galaxy.png" alt="Galaxy Logo"></a>
</p>

# mongomath

**Documentation en ligne** : [https://galaxy-docs.mongomath.com](unavailable)

## Introduction

Le module `mongomath` fait partie du projet **Galaxy**, un ensemble de projets visant à fournir des outils performants pour le développement. `mongomath` est un outil d'analyse statistique de données MongoDB, conçu pour aider les développeurs à obtenir des statistiques avancées sur leurs collections de données.

Si vous souhaitez contribuer au projet, contactez-nous à **b.galaxy.dev@gmail.com**.

---

## Fonctionnalité de selfloading

Chaque fonction du module `mongomath` prend un paramètre `selfloading`, un booléen qui contrôle la gestion automatique de la connexion à la base de données.

- **selfloading = true** : La connexion est automatiquement établie et fermée à chaque appel de fonction.
- **selfloading = false** : L'utilisateur doit gérer la connexion et la déconnexion manuellement.

---

## Paramètres de connexion et d'analyse

| Paramètre     | Type    | Description                                                      |
| ------------- | ------- | ---------------------------------------------------------------- |
| `selfloading` | Boolean | Active la connexion/déconnexion automatique si défini à `true`.  |
| `uri`         | String  | URI de connexion à MongoDB.                                      |
| `params`      | Object  | Contient les paramètres pour des calculs spécifiques de données. |
| `collection`  | String  | Nom de la collection cible pour l'analyse.                       |
| `field1`      | String  | Premier champ pour les statistiques croisées.                    |
| `field2`      | String  | Deuxième champ pour les statistiques croisées.                   |
| `options`     | Object  | Options spécifiques pour la collecte de statistiques détaillées. |

---

## Classes et méthodes principales

### 1. `connect()`

Établit la connexion à MongoDB manuellement.

```javascript
const mongoMath = new MongoMath("mongodb://localhost:27017");
await mongoMath.connect();
```

### 2. `disconnect()`

Ferme la connexion à MongoDB manuellement.

```javascript
await mongoMath.disconnect();
```

### 3. `dataAnalyzer(params, selfloading)`

Analyse complète de la base de données.

- **params** : Object, paramètres d'analyse.
- **selfloading** : Booléen.

```javascript
const analysis = await mongoMath.dataAnalyzer({ collection: "users" }, true);
```

### 4. `getDatabaseInfo(options, selfloading)`

Récupère les informations de base sur la base de données.

- **options** : Object, options d'analyse.
- **selfloading** : Booléen.

```javascript
const dbInfo = await mongoMath.getDatabaseInfo({}, true);
```

### 5. `getDetailedCollectionStats(selfloading)`

Obtient les statistiques détaillées des collections.

```javascript
const collectionStats = await mongoMath.getDetailedCollectionStats(true);
```

### 6. `analyzeDataDistribution(collectionName, selfloading)`

Analyse la distribution des données d’une collection spécifique.

```javascript
const distribution = await mongoMath.analyzeDataDistribution("users", true);
```

### 7. `analyzeFieldStatistics(collectionName, selfloading)`

Analyse les statistiques de champ dans une collection.

```javascript
const fieldStats = await mongoMath.analyzeFieldStatistics("users", true);
```

### 8. `getPerformanceMetrics(selfloading)`

Récupère les métriques de performance de la base de données.

```javascript
const metrics = await mongoMath.getPerformanceMetrics(true);
```

### 9. `getStorageAnalysis(selfloading)`

Obtient l'analyse du stockage de la base de données.

```javascript
const storageAnalysis = await mongoMath.getStorageAnalysis(true);
```

### 10. `alyzeDatabaseComplete(options, selfloading)`

Analyse complète de la base de données.

```javascript
const completeAnalysis = await mongoMath.alyzeDatabaseComplete({}, true);
```

### 11. `calculateStatistics(params, selfloading)`

Calcule des statistiques générales pour une collection.

```javascript
const stats = await mongoMath.calculateStatistics(
  { collection: "users" },
  true
);
```

---

## Logger

Le module `mongomath` inclut un logger pour surveiller les activités de connexion, de déconnexion et d'analyse. Cela permet un suivi des opérations pour un débogage plus simple et une meilleure transparence.

### Utilisation du Logger

Le logger enregistre :

- **Connexion/Déconnexion** : lorsqu'une connexion est établie ou fermée.
- **Analyses et requêtes** : chaque analyse de données est suivie d'un enregistrement des paramètres utilisés.
- **Erreurs** : les erreurs rencontrées sont également enregistrées.

Exemple d'un log de connexion automatique :

```text
[INFO] - Connection established to MongoDB
[INFO] - Data analysis started for collection: users
[INFO] - Data analysis completed for collection: users
[INFO] - Connection closed to MongoDB
```

---

## Gestion des erreurs

Le module `mongomath` gère les erreurs et envoie des messages explicites pour aider à la résolution des problèmes.

### Types d'erreurs

- **Erreur de connexion** : Se produit si `selfloading` est défini à `false` mais qu'aucune connexion n’a été établie.
- **Erreur d'analyse** : Toute erreur survenant lors de l'analyse des données (ex. champ ou collection inexistante).
- **Erreur de déconnexion** : Peut survenir si la connexion n'est pas active.

### Exemples de gestion des erreurs

```javascript
try {
  const stats = await mongoMath.calculateStatistics(
    { collection: "nonexistent" },
    true
  );
} catch (error) {
  console.error("Error during analysis:", error.message);
}
```

---

## Exemples d'utilisation

Pour analyser plusieurs statistiques sans gérer manuellement les connexions :

```javascript
const mongoMath = new MongoMath("mongodb://localhost:27017");

// Analyse de la distribution des données
const distribution = await mongoMath.analyzeDataDistribution("users", true);

// Récupération des statistiques générales
const stats = await mongoMath.calculateStatistics(
  { collection: "users" },
  true
);
```

Si vous souhaitez gérer manuellement la connexion et la déconnexion :

```javascript
const mongoMath = new MongoMath("mongodb://localhost:27017");
await mongoMath.connect();

try {
  const distribution = await mongoMath.analyzeDataDistribution("users", false);
  const stats = await mongoMath.calculateStatistics(
    { collection: "users" },
    false
  );
} finally {
  await mongoMath.disconnect();
}
```

---

## À propos de Galaxy et de `mongomath`

Le projet Galaxy vise à créer un écosystème innovant pour les développeurs et les utilisateurs finaux. Notre mission est de fournir des outils de qualité, pour des applications modernes et performantes. `mongomath` est l'un des premiers produits de Galaxy, et nous invitons toute contribution pour développer davantage cet outil.

---

© 2024 galaxy.MongoMath. Tous droits réservés.
