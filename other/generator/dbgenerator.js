const fs = require("fs");
const path = require("path");
const { faker } = require("@faker-js/faker");

// Fonction pour générer des données aléatoires
const generateRandomData = (numDocuments) => {
  const data = [];

  for (let i = 0; i < numDocuments; i++) {
    const document = {
      name: faker.person.fullName(), // Nom complet
      age: faker.number.int({ min: 18, max: 65 }), // Âge entre 18 et 65 ans
      height: faker.number.int({ min: 150, max: 200 }), // Taille en cm
      weight: faker.number.int({ min: 50, max: 120 }), // Poids en kg
      createdAt: faker.date.past(), // Date de création
      updatedAt: faker.date.recent(), // Date de mise à jour1cd
    };
    data.push(document);
  }

  return data;
};

// Fonction pour écrire des données dans un fichier JSON
const writeDataToFile = (filePath, data) => {
  fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error("Erreur lors de l'écriture du fichier:", err);
    } else {
      console.log(`Données sauvegardées dans ${filePath}`);
    }
  });
};

// Spécifiez le chemin du fichier JSON
const jsonFilePath = path.join(__dirname, "data.json");

// Générer des données aléatoires
const numDocuments = 100; // Nombre de documents à générer
const generatedData = generateRandomData(numDocuments);

// Vérifier si le fichier existe déjà
fs.access(jsonFilePath, fs.constants.F_OK, (err) => {
  if (err) {
    // Le fichier n'existe pas, on le crée
    writeDataToFile(jsonFilePath, generatedData);
  } else {
    console.log("Le fichier JSON existe déjà. Aucune action effectuée.");
  }
});
