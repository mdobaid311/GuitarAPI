const client = require("../config/scylla-client");
const columnNames = require("../utils/columnNames");

const executeQuery = async (req, res) => {
  const query = req.body.query;
  client.execute(query, async (err, result) => {
    if (err) {
      res.status(400).json(err);
    }
    res.status(200).json(result.rows);
  });
};

const excludeColumnQuery = async (req, res) => {
  const excludeColumns = req.body.columns;
  const filteredColumns = columnNames.filter((column) => {
    return !excludeColumns.includes(column);
  });
  const finalColumns = filteredColumns.map((column) => {
    return `\"${column}\"`;
  });
  const columns = finalColumns.join(",");
  const finalQuery = `SELECT ${columns} FROM container_details`;
  client.execute(finalQuery, async (err, result) => {
    if (err) {
      res.status(400).json(err);  
    }
    res.status(200).json(result);
  });
};

const includeColumnQuery = async (req, res) => {
  const includeColumns = req.body.columns;
  const filteredColumns = columnNames.filter((column) => {
    return includeColumns.includes(column);
  });
  const finalColumns = filteredColumns.map((column) => {
    return `\"${column}\"`;
  });
  const columns = finalColumns.join(",");
  const finalQuery = `SELECT ${columns} FROM container_details`;
  client.execute(finalQuery, async (err, result) => {
    if (err) {
      res.status(400).json(err);
    }
    res.status(200).json(result);
  });
};

module.exports = {
  executeQuery,
  excludeColumnQuery,
  includeColumnQuery,
};
