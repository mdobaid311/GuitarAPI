const client = require("../config/scylla-client");
const moment = require("moment");

const getOriginalOrderTotalAmount = async (req, res) => {
  const { start_date, end_date, year } = req.query;
  console.log("start_date", start_date);
  console.log("end_date", end_date);
  try {
    if (year) {
      const result = await client.execute(
        `select sum(invoiced_line_total) as original_orders_total from temp_table where order_date >= '${year}-01-01 00:00:00' and order_date <= '${year}-12-31 23:59:59' ALLOW FILTERING`
      );
      res.status(200).json(result.rows);
      return;
    }

    if (!start_date && !end_date) {
      console.log("first");
      const result = await client.execute(
        "select sum(invoiced_line_total) as original_orders_total from temp_table ALLOW FILTERING"
      );

      res.status(200).json(result.rows);
    } else if (start_date && end_date) {
      console.log("second");
      const result = await client.execute(
        `select sum(invoiced_line_total) as original_orders_total from temp_table where order_date >= ${start_date} and order_date <= ${end_date} ALLOW FILTERING`
      );

      res.status(200).json(result.rows);
    } else if (start_date) {
      console.log("third");
      const result = await client.execute(
        `select sum(invoiced_line_total) as original_orders_total from temp_table where order_date >= ${start_date} ALLOW FILTERING`
      );

      res.status(200).json(result.rows);
    } else if (end_date) {
      console.log("last");
      const result = await client.execute(
        `select sum(invoiced_line_total) as original_orders_total from temp_table where order_date <= ${end_date} ALLOW FILTERING`
      );

      res.status(200).json(result.rows);
    }
  } catch (error) {
    res.status(400).send(error);
  }
};

const getOriginalOrderTotalByMonth = async (req, res) => {
  const { forYear } = req.query;
  const results = [];

  const fullDate = moment(forYear).format("YYYY-MM-DD HH:mm:ss");

  try {
    for (let i = 0; i < 12; i++) {
      const startDate = moment(fullDate)
        .add(i, "months")
        .format("YYYY-MM-DD HH:mm:ss");

      const result = await client.execute(
        `select sum(invoiced_line_total) as original_orders_total from temp_table where order_date > '${startDate}' ALLOW FILTERING`
      );
      results.push({
        monthName: moment(startDate).format("MMMM"),
        total: result.rows[0].original_orders_total,
      });
    }
    res.status(200).json(results);
  } catch (error) {
    res.status(401).json(error);
  }
};

module.exports = {
  getOriginalOrderTotalAmount,
  getOriginalOrderTotalByMonth,
};
