const client = require("../config/scylla-client");

// CREATE TABLE widgets(column TEXT PRIMARY KEY, widget_name TEXT, chart_type TEXT);

const createWidget = async (req, res) => {
  const { column, widgetName, chartType } = req.body;
  const query = `INSERT INTO widgets (column, widget_name, chart_type) VALUES ('${column}', '${widgetName}', '${chartType}')`;
  client.execute(query, (err, result) => {
    if (err) {
      res.status(400).json({ message: "Widget Creation Failed" });
      return;
    }
    res.status(200).json({ message: "Widget Created" });
  });
};

const getWidgets = async (req, res) => {
  const query = "SELECT * FROM widgets";
  client.execute(query, (err, result) => {
    if (err) {
      res.status(400).json({ message: "Widgets Fetch Failed" });
      return;
    }
    res.status(200).json(result.rows);
  });
};

module.exports = { createWidget, getWidgets };
