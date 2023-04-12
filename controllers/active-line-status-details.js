const client = require("../config/scylla-client");

const getOriginalOrderTotalAmount = async (req, res) => {
  const { start_date, end_date } = req.query;
  console.log("start_date", start_date);
  console.log("end_date", end_date);
  try {
    if (!start_date && !end_date) {
      console.log("first");
      const result = await client.execute(
        "select sum(invoiced_line_total) as original_orders_total from temp_table ALLOW FILTERING"
      );

      res.json(result.rows);
    } else if (start_date && end_date) {
      console.log("second");
      const result = await client.execute(
        `select sum(invoiced_line_total) as original_orders_total from temp_table where order_date >= ${start_date} and order_date <= ${end_date} ALLOW FILTERING`
      );

      res.json(result.rows);
    } else if (start_date) {
      console.log("third");
      const result = await client.execute(
        `select sum(invoiced_line_total) as original_orders_total from temp_table where order_date >= ${start_date} ALLOW FILTERING`
      );

      res.json(result.rows);
    } else if (end_date) {
      console.log("last");
      const result = await client.execute(
        `select sum(invoiced_line_total) as original_orders_total from temp_table where order_date <= ${end_date} ALLOW FILTERING`
      );

      res.json(result.rows);
    }
  } catch (error) {
    res.status(400).send(error);
  }
};

module.exports = {
  getOriginalOrderTotalAmount,
};
