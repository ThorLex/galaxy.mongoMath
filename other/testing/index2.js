const DatabaseAnalyzer = require("./DatabaseAnalyzer.js");

async function main() {
  const analyzer = new DatabaseAnalyzer({
    options: {
      connectTimeoutMS: 5000,
    },
  });

  // Écoute des événements
  analyzer.on("connected", () => console.log("Connecté !"));
  analyzer.on("error", (error) => console.error("Erreur:", error));
  analyzer.on("collectionChange", (change) =>
    console.log("Changement:", change)
  );

  try {
    // Analyse complète
    const stats = await analyzer.analyzeDatabaseStats();
    console.log("Statistiques:", stats);

    // Surveillance des modifications
    await analyzer.watchCollections(["users", "products"]);

    // Analyse des changements récents
    const changes = await analyzer.analyzeRecentChanges({
      timeFrame: 12 * 60 * 60 * 1000, // 12 heures
    });
    console.log("Changements récents:", changes);
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    await analyzer.disconnect();
  }
}

main();
