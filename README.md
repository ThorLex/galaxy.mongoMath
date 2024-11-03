<p align="center">
  <a href="https://nodemon.io/"><img src="https://github.com/ThorLex/galaxy.mongoMath/blob/main/galaxy.png" alt="Galaxy Logo"></a>
</p>

# mongoMath

MongoMath [`MongoMath`](https://github.com/ThorLex/galaxy.mongoMath) is an advanced data analysis tool for MongoDB databases, allowing users to perform general database analysis and cross-field analysis on specified collections. It returns both basic and advanced statistical metrics, providing insights across different fields when specified.

Documentation: [mongomath.nettyfy.com (Unavailable)](http://mongomath.nettyfy.com)

Installation
Install MongoMath using npm:

```bash
npm install mongomath
```

Usage
Importing and Initializing
First, import and initialize MongoMath with a MongoDB URI:

```javascript
const MongoMath = require("mongomath");

const mongoMath = new MongoMath("mongodb://localhost:27017/your_database");
```

dataAnalyzer(params)
The `dataAnalyzer` method performs various analyses based on the provided parameters. It can return general statistics on collections or cross-field statistics between specified fields.

Parameters

- **`collection`** (string, optional): Specifies the collection to analyze. If no collection is provided, the entire database is analyzed.
- **`crossFieldAnalysis`** (object, optional): Used to perform cross-field analysis on two fields within the specified collection.
  - **`field1`** (string): The first field for cross-field analysis.
  - **`field2`** (string): The second field for cross-field analysis.
- **`includeIndexes`** (boolean, optional): If true, includes information on indexes.
- **`includeSchemas`** (boolean, optional): If true, includes schema information of the documents.

Examples

1. Cross-Field Analysis between Two Fields
   In this example, cross-field analysis is performed between `age` and `height` fields in the `users` collection.

```javascript
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
```

Expected Output:

{
"General Statistics": {
"totalDocuments": 121,
"mean": 93.5,
"median": 75,
// Additional basic and advanced statistics
},
"Cross Field Statistics": {
// Cross-field data
}
}

2. General Analysis of a Specific Collection
   When only a single collection is specified, the module returns statistics for that collection without cross-field analysis.

```javascript
(async () => {
  await mongoMath.dataAnalyzer({
    collection: "users",
    includeIndexes: true,
    includeSchemas: true,
  });
})();
```

3. Analysis of the Entire Database
   If no collection is specified, the module performs an analysis on the entire database, providing high-level database metrics and performance statistics.

```javascript
(async () => {
  await mongoMath.dataAnalyzer({
    includeIndexes: true,
    includeSchemas: true,
  });
})();
```

Error Handling
If an error occurs during analysis (e.g., invalid parameters, connection issues), an error message is returned, and the database connection is safely closed.

License
This module is licensed under MIT.

Contributing
We welcome contributors to help expand MongoMath! Check out our [documentation (Unavailable)](http://mongomath.nettyfy.com) for more details.
