const { Client } = require("pg");

const credentials = {
  user: "postgres",
  host: "13.233.98.14",
  database: "postgres",
  password: "postgres",
  port: 5432,
  keepAlive:true,
  idle_timeout:7200,
};

// Create a connection pool
const client = new Client(credentials);

// Connect to the database
client.connect((err) => {
  if (err) {
    console.error("Error connecting: " + err.stack);
    return;
  }
  console.log("Connected as id " + client.user);
});

module.exports = client;
