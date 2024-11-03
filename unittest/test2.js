const DatabaseAnalyzer = require("../mongoMath");

const analyzer = new DatabaseAnalyzer({
  uri: "mongodb://localhost:27017/test",
});

async function dbAnalyser() {
  try {
    await analyzer.connect();
    const results = await analyzer.analyzeDatabaseComplete();
    console.log(results);
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    await analyzer.disconnect();
  }
}

dbAnalyser();
