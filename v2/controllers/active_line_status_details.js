const moment = require("moment");
const connection = require("../config/mysql_client");

const getSalesData = async (req, res) => {
  const { interval, records_count, datetime } = req.query;

  const intervalKey =
    interval === "15min"
      ? "15*60"
      : interval === "30min"
      ? "30*60"
      : interval === "1hr"
      ? "60*60"
      : interval === "2hr"
      ? "120*60"
      : interval === "4hr"
      ? "240*60"
      : interval === "8hr"
      ? "480*60"
      : interval === "12hr"
      ? "720*60"
      : interval === "24hr"
      ? "1440*60"
      : "15*60";

  let query = `SELECT sec_to_time(time_to_sec(order_date_parsed)- time_to_sec(order_date_parsed)%(${intervalKey})) as datetime, sum(original_order_total_amount) as original_order_total_amount, sum(status_quantity) as status_quantity  from active_line_status where order_date LIKE '01-jan-23%' group by datetime;
      `;

  if (interval === "1day") {
    // 2023-01-01 00:03:20

    const monthAndYear = moment(datetime, "YYYY-MM-DD HH:mm:ss").format(
      "MM - YY"
    );
    query = ` SELECT DATE(order_date_parsed) AS datetime, SUM(original_order_total_amount) AS original_order_total_amount, SUM(status_quantity) AS status_quantity FROM active_line_status where DATE_FORMAT(order_date_parsed, '%m - %y') ='${monthAndYear}' GROUP BY datetime order by datetime;`;
  } else if (interval === "1mon") {
    // 2023-01-01 00:03:20
    const year = moment(datetime, "YYYY-MM-DD HH:mm:ss").format("YY");

    query = `SELECT DATE_FORMAT(order_date_parsed, '%Y-%m') AS datetime, SUM(original_order_total_amount) AS original_order_total_amount, SUM (status_quantity) AS status_quantity FROM active_line_status where DATE_FORMAT(order_date_parsed, '%y') = 23 GROUP BY datetime order by datetime`;
  }

  connection.query(query, (err, result) => {
    if (err) {
      res.status(500).json({ error: err });
    } else {
      const total_amount = result.reduce((acc, curr) => {
        return acc + curr.original_order_total_amount;
      }, 0);
      const total_quantity = result.reduce((acc, curr) => {
        return acc + curr.status_quantity;
      }, 0);

      const finalOutput = {
        total_amount,
        total_quantity,
        series: result.map((item) => {
          return {
            datetime:
              interval === "1day"
                ? moment(item.datetime).format("DD-MMM-YYYY")
                : interval === "1mon"
                ? moment(item.datetime).format("MMM-YYYY")
                : item.datetime,

            original_order_total_amount: item.original_order_total_amount,
            status_quantity: item.status_quantity,
          };
        }),
      };

      res.status(200).json(finalOutput);
    }
  });
};

const getSalesDataByRange = async (req, res) => {
  const { start_date, end_date } = req.query;

  const differeceInDays = moment(end_date).diff(moment(start_date), "days");

  let query = `SELECT DATE(order_date_parsed) AS datetime, SUM(original_order_total_amount) AS original_order_total_amount, SUM(status_quantity) AS status_quantity FROM active_line_status where order_date_parsed BETWEEN '${start_date}' AND '${end_date}' GROUP BY datetime order by datetime;`;

  console.log(differeceInDays, "differeceInDays")
  if (differeceInDays > 31) {
    const startMonthAndYear = moment(start_date).format("DD - MM - YY");
    const endMonthAndYear = moment(end_date).format("DD - MM - YY");
    console.log(startMonthAndYear, endMonthAndYear, "startMonthAndYear, endMonthAndYear")
    query = `SELECT DATE_FORMAT(order_date_parsed, '%Y-%m') AS datetime, SUM(original_order_total_amount) AS original_order_total_amount, SUM (status_quantity) AS status_quantity FROM active_line_status where DATE_FORMAT(order_date_parsed, '%d - %m - %y') BETWEEN '${startMonthAndYear}' AND '${endMonthAndYear}' GROUP BY datetime order by datetime`;
    // console.log(query, "query")
  }

  connection.query(query, (err, result) => {
    if (err) {
      res.status(500).json({ error: err });
    } else {
      const total_amount = result.reduce((acc, curr) => {
        return acc + curr.original_order_total_amount;
      }, 0);
      const total_quantity = result.reduce((acc, curr) => {
        return acc + curr.status_quantity;
      }, 0);

      const finalOutput = {
        total_amount,
        total_quantity,
        series: result.map((item) => {
          return {
            datetime: moment(item.datetime).format("DD-MMM-YYYY"),
            original_order_total_amount: item.original_order_total_amount,
            status_quantity: item.status_quantity,
          };
        }),
      };

      res.status(200).json(finalOutput);
    }
  });
};

module.exports = {
  getSalesData,
  getSalesDataByRange,
};
