const client = require("../config/scylla-client");

const login = async (req, res) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM users WHERE user_name = '${username}' AND password = '${password}' ALLOW FILTERING`;
  client.execute(query, async (err, result) => {
    if (err || result.rows.length === 0) {
      res.status(400).json({ message: "Invalid Credentials" });
      return
    }
    res.status(200).json(result.rows);
  });
};

const register = async (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin") {
    res.status(200).json({ message: "Register Successful" });
  } else {
    res.status(400).json({ message: "Invalid Credentials" });
  }
};

module.exports = {
  login,
  register,
};
