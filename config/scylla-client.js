let cassandra = require("cassandra-driver");
let client;
try {
  client = new cassandra.Client({
    contactPoints: ["43.204.234.254"],
    localDataCenter: "ap-south",
    keyspace: "guitardb",
    socketOptions: {
      connectTimeout: 100000,
      readTimeout: 100000,
    },
  });
} catch (error) {
  console.log(error);
}

module.exports = client;
