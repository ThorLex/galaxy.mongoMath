const MongoAnalyzer = require("./mongoMath");
const MongoStats = require("./mongoSpecificAnalyser.js");
const MongoInterpreter = require("./mongoInterpreter.js");
const MongoNlAnalyser = require("./mongoNlanalyser.js");

class MongoMath {
  constructor(uri) {
    this.uri = uri;
  }

  async dataAnalyzer(params) {
    const analyzer = new MongoAnalyzer({ uri: this.uri });
    const stats = new MongoStats({ uri: this.uri });

    try {
      await analyzer.connect();
      const results = await analyzer.analyzeDatabaseComplete(params);
      console.log("Database Analysis Results:", results);
    } catch (error) {
      console.error("An error occurred during database analysis:", error);
    } finally {
      await analyzer.disconnect();
    }

    try {
      await stats.connect();
      const generalStats = await stats.calculateStatistics({
        collection: params.collection,
      });
      console.log("General Statistics:", generalStats);

      if (params.crossFieldAnalysis) {
        const crossStats = await stats.calculateCrossFieldStatistics(
          params.collection,
          params.crossFieldAnalysis.field1,
          params.crossFieldAnalysis.field2
        );
        console.log("Cross Field Statistics:", crossStats);
      }
    } catch (error) {
      console.error("An error occurred during statistics analysis:", error);
    } finally {
      await stats.disconnect();
    }
  }
}
module.exports = MongoMath;

//ok
