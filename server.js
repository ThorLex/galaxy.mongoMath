const {
  countDocumentsPerCollection,
  listCollectionsAndDocuments,
  getDatabaseInfo,
} = require("./dbUtils.js");

const {
  watchDatabaseChanges,
  getStatistics,
} = require("./dbStatsreplicalSet.js");
const { calculateStatistics } = require("./dbStats.js");

async function main() {
  try {
    const data = await listCollectionsAndDocuments();
    console.log("Toutes les collections et leurs documents:", data);
  } catch (err) {
    console.error("Erreur:", err);
  }
}
async function counting() {
  try {
    const counts = await countDocumentsPerCollection();
    console.log("Nombre de documents par collection:", counts);
  } catch (err) {
    console.error("Erreur:", err);
  }
}

async function getInfo() {
  try {
    const info = await getDatabaseInfo();
    console.log("Informations sur la base de données:", info);
  } catch (err) {
    console.error("Erreur:", err);
  }
}

// async function statsss() {
//   await watchDatabaseChanges();

//   // Exemples d'affichage des statistiques toutes les 10 secondes
//   setInterval(() => {
//     const statss = getStatistics();
//     console.log("Statistiques en temps réel :", statss);
//   }, 10000);
// }
// statsss();
async function calculate() {
  try {
    const period = "year"; // Change ce paramètre pour 'month' ou 'year' selon ton besoin
    const stats = await calculateStatistics(period);
    console.log("Statistiques des collections :");
    console.log(stats.taches);
  } catch (err) {
    console.error("Erreur lors de l'exécution principale:", err);
  }
}
calculate();

// we need to activate and configure a replical set  before using this stats();
// fonction main  pas ok getInfo() probeleme de recuperationde la taille de chaque collection ;
// fontion main ok  main()
// fonction counting ok counting();
// // server.js

// const express = require("express");
// const bodyParser = require("body-parser");

// require("dotenv").config();

// const app = express();
// const PORT = process.env.PORT || 3000;

// app.set("view engine", "ejs");
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static("public")); // Pour servir les fichiers statiques

// app.get("/", (req, res) => {
//   res.render("index", { statistics: null, error: null, stats });
// });

// app.post("/calculate", async (req, res) => {
//   const period = req.body.period || "day";
//   const periodCount = parseInt(req.body.periodCount) || 1;

//   try {
//     const stats = await calculateStatistics({ period, periodCount });
//     res.render("index", { statistics: stats });
//   } catch (err) {
//     console.error("Erreur lors du calcul des statistiques:", err);
//     res.render("index", {
//       statistics: null,
//       error: "Erreur lors du calcul des statistiques.",
//     });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
// });
