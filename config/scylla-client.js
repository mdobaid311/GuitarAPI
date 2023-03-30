let cassandra = require("cassandra-driver");
 
const client = new cassandra.Client({
  contactPoints: ["13.233.104.169"],
  localDataCenter: "ap-south",
  keyspace: "guitardb",
});

module.exports = client;