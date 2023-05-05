const mysql = require("mysql");

// Create a connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Obaid311",
  database: "mydb",
});

// Connect to MySQL
connection.connect(function (err) {
  if (err) {
    console.error("Error connecting: " + err.stack);
    return;
  }
  console.log("Connected as id " + connection.threadId);
});

module.exports = connection;
