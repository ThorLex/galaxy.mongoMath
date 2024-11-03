const AutoDatabaseAnalyzer = require("./AutoDatabaseAnalyzer.js");

async function analyzeDatabase() {
  const analyzer = new AutoDatabaseAnalyzer();

  try {
    console.log("Début de l'analyse...");
    const analysis = await analyzer.analyzeAll();

    // Afficher les résultats
    console.log("\nRésumé de la base de données:");
    console.log(JSON.stringify(analysis.summary, null, 2));

    // Sauvegarder l'analyse complète
    const fs = require("fs");
    fs.writeFileSync(
      `db-analysis-${new Date().toISOString()}.json`,
      JSON.stringify(analysis, null, 2)
    );

    console.log("\nAnalyse terminée et sauvegardée !");
  } catch (error) {
    console.error("Erreur lors de l'analyse:", error);
  }
}

analyzeDatabase();
