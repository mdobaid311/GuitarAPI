const { Client } = require("pg");

const credentials = {
  user: "postgres",
  host: "43.204.234.254",
  database: "postgres",
  password: "admin",
  port: 5432,
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
