let cassandra = require("cassandra-driver");

const client = new cassandra.Client({
  contactPoints: ["13.233.104.169"],
  localDataCenter: "ap-south",
  keyspace: "guitardb",
});

const query = `select * from container_details where "CONTAINER_DETAILS_KEY"='202211291628342935697871'`;
client.execute(query, async (err, result) => {
  if (err) {
    console.error(err);
    return;
  }

  console.log(result.rows);
});

// const test = require("./Container_sample_with_data_int.json");
// const fs = require("fs");

// fs.writeFileSync("keys.js", JSON.stringify(Object.keys(test)));


// demo githib