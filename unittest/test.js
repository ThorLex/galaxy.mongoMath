const MongoStats = require("../MongoSpecificAnalyser.js");

async function connectToDatabase() {
  const stats = new MongoStats({
    uri: "mongodb://localhost:27017/be",
  });

  try {
    await stats.connect();
    return stats;
  } catch (error) {
    console.error("Erreur lors de la connexion à la base de données:", error);
    throw error; // Propager l'erreur pour que les fonctions appelantes sachent que la connexion a échoué
  }
}

// Fonction pour les statistiques générales
async function analyzeGeneralStatistics(stats) {
  try {
    const generalStats = await stats.calculateStatistics({
      collection: "users",
    });
    console.log("Statistiques générales:", generalStats);
  } catch (error) {
    console.error("Erreur dans les statistiques générales:", error);
  }
}

// Fonction pour les statistiques croisées entre deux champs
async function analyzeCrossFieldStatistics(stats) {
  try {
    const crossStats = await stats.calculateCrossFieldStatistics(
      "users",
      "age",
      "height"
    );
    console.log("Statistiques croisées:", crossStats);
  } catch (error) {
    console.error("Erreur dans les statistiques croisées:", error);
  }
}

// Fonction principale pour orchestrer les analyses
async function analyzeData() {
  const stats = await connectToDatabase();

  try {
    await analyzeGeneralStatistics(stats);
    await analyzeCrossFieldStatistics(stats);
  } catch (error) {
    console.error("Erreur dans l'analyse des données:", error);
  } finally {
    await stats.disconnect();
  }
}

analyzeData();
