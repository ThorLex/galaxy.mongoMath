const MongoMath = require("./mongomath");
const mongoMath = new MongoMath("mongodb://localhost:27017/be");

(async () => {
  // Mode manuel - gestion explicite de la connexion
  //   await mongoMath.connect();
  const results = await mongoMath.analyzeDatabaseComplete((selfloading = true));
  console.log("result ", results);
  //   await mongoMath.disconnect();
})();

// (async () => {
//   const mongoMath = new MongoMath("mongodb://localhost:27017/test");
//   // Mode automatique avec onlyOne=true
//   //   const results = await mongoMath.analyzeDatabaseComplete({}, true);
//   // La connexion est automatiquement fermée après l'opération

//   // Chaînage d'opérations avec connexions individuelles
//   //   const analysis1 = await mongoMath.getStorageAnalysis(false);
//   const analysis2 = await mongoMath.getPerformanceMetrics(true);
//   //   console.log("ici", analysis1);
//   console.log(
//     "----------------------------------------------------------------------"
//   );
//   console.log(
//     "----------------------------------------------------------------------"
//   );
//   console.log(
//     "----------------------------------------------------------------------"
//   );

//   console.log(analysis2);
// })();
