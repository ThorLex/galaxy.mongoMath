const MongoMath = require("./mongomath");
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