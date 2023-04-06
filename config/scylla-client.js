let cassandra = require("cassandra-driver");
let client;
try {
  client = new cassandra.Client({
    contactPoints: ["13.233.104.169"],
    localDataCenter: "ap-south",
    keyspace: "guitardb",
  });
} catch (error) {
  console.log(error);
}

module.exports = client;
