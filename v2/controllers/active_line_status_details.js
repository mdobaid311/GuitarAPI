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

    query = `SELECT DATE_FORMAT(order_date_parsed, '%Y-%m') AS datetime, SUM(original_order_total_amount) AS original_order_total_amount, SUM(status_quantity) AS status_quantity FROM active_line_status where DATE_FORMAT(order_date_parsed, '%y') = 23 GROUP BY datetime order by datetime`;
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

  const differenceInDays = moment(end_date).diff(moment(start_date), "days");

  let query = `SELECT DATE(order_date_parsed) AS datetime, SUM(original_order_total_amount) AS original_order_total_amount, SUM(status_quantity) AS status_quantity FROM active_line_status where order_date_parsed BETWEEN '${start_date}' AND '${end_date}' GROUP BY datetime order by datetime;`;

  console.log(differenceInDays, "differenceInDays ");
  // start_date = 2023-01-01
  // end_date = 2023-02-15
  if (differenceInDays > 31 && differenceInDays < 365) {
    query = `SELECT DATE_FORMAT(order_date_parsed, '%Y-%m') AS datetime, 
                    SUM(original_order_total_amount) AS original_order_total_amount,
                    SUM(status_quantity) AS status_quantity
             FROM active_line_status 
             WHERE order_date_parsed >= '${start_date}' AND order_date_parsed <= '${end_date}' 
             GROUP BY datetime 
             ORDER BY datetime`;
  } else if (differenceInDays > 365) {
    query = `SELECT DATE_FORMAT(order_date_parsed, '%Y') AS datetime, 
                    SUM(original_order_total_amount) AS original_order_total_amount,
                    SUM(status_quantity) AS status_quantity
             FROM active_line_status 
             WHERE order_date_parsed >= '${start_date}' AND order_date_parsed <= '${end_date}' 
             GROUP BY datetime 
             ORDER BY datetime`;
  }

  console.log(query);

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
              differenceInDays > 31 && differenceInDays < 365
                ? moment(item.datetime).format("MMM-YYYY")
                : differenceInDays > 365
                ? moment(item.datetime).format("YYYY")
                : moment(item.datetime).format("DD-MMM-YYYY"),
            original_order_total_amount: item.original_order_total_amount,
            status_quantity: item.status_quantity,
          };
        }),
      };

      res.status(200).json(finalOutput);
    }
  });
};

const getFullSalesData1 = async (req, res) => {
  const query =
    "select ENTERPRISE_KEY,ORDER_CAPTURE_CHANNEL,LINE_FULFILLMENT_TYPE, sum(original_order_total_amount) as original_order_total_amount ,sum(status_quantity) as status_quantity from active_line_status group by ENTERPRISE_KEY,ORDER_CAPTURE_CHANNEL,LINE_FULFILLMENT_TYPE;  ";

  connection.query(query, (err, result) => {
    if (err) {
      res.status(500).json({ error: err });
    } else {
      const groupedData = result.reduce((acc, curr) => {
        // Group by enterprise key
        if (!acc[curr.ENTERPRISE_KEY]) {
          acc[curr.ENTERPRISE_KEY] = {
            original_order_total_amount: 0,
            status_quantity: 0,
            ORDER_CAPTURE_CHANNEL_GROUPED: {},
            LINE_FULFILLMENT_TYPE_GROUPED: {},
          };
        }

        // Group by order capture channel
        if (
          !acc[curr.ENTERPRISE_KEY].ORDER_CAPTURE_CHANNEL_GROUPED[
            curr.ORDER_CAPTURE_CHANNEL
          ]
        ) {
          acc[curr.ENTERPRISE_KEY].ORDER_CAPTURE_CHANNEL_GROUPED[
            curr.ORDER_CAPTURE_CHANNEL
          ] = {
            original_order_total_amount: 0,
            status_quantity: 0,
          };
        }

        // Group by line fulfillment type
        if (
          !acc[curr.ENTERPRISE_KEY].LINE_FULFILLMENT_TYPE_GROUPED[
            curr.LINE_FULFILLMENT_TYPE
          ]
        ) {
          acc[curr.ENTERPRISE_KEY].LINE_FULFILLMENT_TYPE_GROUPED[
            curr.LINE_FULFILLMENT_TYPE
          ] = {
            original_order_total_amount: 0,
            status_quantity: 0,
          };
        }

        // Update original_order_total_amount and status_quantity for each group
        acc[curr.ENTERPRISE_KEY].original_order_total_amount +=
          curr.original_order_total_amount;
        acc[curr.ENTERPRISE_KEY].status_quantity += curr.status_quantity;
        acc[curr.ENTERPRISE_KEY].ORDER_CAPTURE_CHANNEL_GROUPED[
          curr.ORDER_CAPTURE_CHANNEL
        ].original_order_total_amount += curr.original_order_total_amount;
        acc[curr.ENTERPRISE_KEY].ORDER_CAPTURE_CHANNEL_GROUPED[
          curr.ORDER_CAPTURE_CHANNEL
        ].status_quantity += curr.status_quantity;
        acc[curr.ENTERPRISE_KEY].LINE_FULFILLMENT_TYPE_GROUPED[
          curr.LINE_FULFILLMENT_TYPE
        ].original_order_total_amount += curr.original_order_total_amount;
        acc[curr.ENTERPRISE_KEY].LINE_FULFILLMENT_TYPE_GROUPED[
          curr.LINE_FULFILLMENT_TYPE
        ].status_quantity += curr.status_quantity;

        return acc;
      }, {});

      res.status(200).json(groupedData);
    }
  });
};

const getFullSalesData2 = async (req, res) => {
  const { start_date, end_date } = req.query;

  const differenceInDays = moment(end_date).diff(moment(start_date), "days");

  const differenceInHours = moment(end_date).diff(moment(start_date), "hours");

  let interval;
  if (
    (differenceInHours > 8 &&
      differenceInHours <= 24 &&
      differenceInDays === 1) ||
    differenceInDays === 0
  ) {
    interval = 60 * 60;
  } else {
    console.log("first");
    interval =
      differenceInDays === 1
        ? 15 * 60
        : differenceInDays > 1 && differenceInDays <= 31
        ? 1440 * 60
        : differenceInDays > 31 && differenceInDays <= 365
        ? 1440 * 60 * 30
        : 24 * 60 * 60 * 365;
  }

  const query = `CALL getData('${start_date}','${end_date}',${interval})`;
  console.log(interval);
  connection.query(query, (err, result) => {
    if (err) {
      res.status(500).json({ error: err });
    } else {
      console.log(result[1]);
      const groupedChartSeries = result[1].reduce((acc, order) => {
        const enterpriseKey = order.enterprise_key;

        if (!acc[enterpriseKey]) {
          acc[enterpriseKey] = {
            enterprise_key: enterpriseKey,
            series: [],
          };
        }

        acc[enterpriseKey].series.push(order);

        return acc;
      }, {});

      const groupedData = result[2].reduce((acc, curr) => {
        // Group by enterprise key
        if (!acc[curr.ENTERPRISE_KEY]) {
          acc[curr.ENTERPRISE_KEY] = {
            name: curr.ENTERPRISE_KEY,
            original_order_total_amount: 0,
            status_quantity: 0,
            ORDER_CAPTURE_CHANNEL_GROUPED: {},
            LINE_FULFILLMENT_TYPE_GROUPED: {},
          };
        }

        // Group by order capture channel
        if (
          !acc[curr.ENTERPRISE_KEY].ORDER_CAPTURE_CHANNEL_GROUPED[
            curr.ORDER_CAPTURE_CHANNEL
          ]
        ) {
          acc[curr.ENTERPRISE_KEY].ORDER_CAPTURE_CHANNEL_GROUPED[
            curr.ORDER_CAPTURE_CHANNEL
          ] = {
            name: curr.ORDER_CAPTURE_CHANNEL
              ? curr.ORDER_CAPTURE_CHANNEL
              : "OTHERS",
            original_order_total_amount: 0,
            status_quantity: 0,
          };
        }

        // Group by line fulfillment type
        if (
          !acc[curr.ENTERPRISE_KEY].LINE_FULFILLMENT_TYPE_GROUPED[
            curr.LINE_FULFILLMENT_TYPE
          ]
        ) {
          acc[curr.ENTERPRISE_KEY].LINE_FULFILLMENT_TYPE_GROUPED[
            curr.LINE_FULFILLMENT_TYPE
          ] = {
            name: curr.LINE_FULFILLMENT_TYPE
              ? curr.LINE_FULFILLMENT_TYPE
              : "OTHERS",
            original_order_total_amount: 0,
            status_quantity: 0,
          };
        }

        // Update original_order_total_amount and status_quantity for each group
        acc[curr.ENTERPRISE_KEY].original_order_total_amount += Math.round(
          curr.original_order_total_amount
        );
        acc[curr.ENTERPRISE_KEY].status_quantity += curr.status_quantity;
        acc[curr.ENTERPRISE_KEY].ORDER_CAPTURE_CHANNEL_GROUPED[
          curr.ORDER_CAPTURE_CHANNEL
        ].original_order_total_amount += Math.round(
          curr.original_order_total_amount
        );
        acc[curr.ENTERPRISE_KEY].ORDER_CAPTURE_CHANNEL_GROUPED[
          curr.ORDER_CAPTURE_CHANNEL
        ].status_quantity += curr.status_quantity;
        acc[curr.ENTERPRISE_KEY].LINE_FULFILLMENT_TYPE_GROUPED[
          curr.LINE_FULFILLMENT_TYPE
        ].original_order_total_amount += Math.round(
          curr.original_order_total_amount
        );
        acc[curr.ENTERPRISE_KEY].LINE_FULFILLMENT_TYPE_GROUPED[
          curr.LINE_FULFILLMENT_TYPE
        ].status_quantity += curr.status_quantity;

        return acc;
      }, {});
      res.status(200).json({
        totalStats: result[0],
        chartSeries: Object.values(groupedChartSeries),
        salesCategories: Object.values(groupedData),
      });
    }
  });
};

const getFullSalesData = async (req, res) => {
  res.status(200).json({
    totalStats: [
      {
        enterprise_key: "MF",
        original_order_total_amount: 87114.18,
        status_quantity: 322,
      },
      {
        enterprise_key: "GC",
        original_order_total_amount: 393873.15,
        status_quantity: 1404,
      },
    ],
    chartSeries: [
      {
        enterprise_key: "MF",
        series: [
          {
            enterprise_key: "MF",
            datetime: "00:00:00",
            original_order_total_amount: 9123.37,
            status_quantity: 25,
          },
          {
            enterprise_key: "MF",
            datetime: "01:00:00",
            original_order_total_amount: 1738.96,
            status_quantity: 12,
          },
          {
            enterprise_key: "MF",
            datetime: "02:00:00",
            original_order_total_amount: 8615.85,
            status_quantity: 20,
          },
          {
            enterprise_key: "MF",
            datetime: "03:00:00",
            original_order_total_amount: 6308.2,
            status_quantity: 11,
          },
          {
            enterprise_key: "MF",
            datetime: "04:00:00",
            original_order_total_amount: 4040.49,
            status_quantity: 20,
          },
          {
            enterprise_key: "MF",
            datetime: "05:00:00",
            original_order_total_amount: 7541.2,
            status_quantity: 39,
          },
          {
            enterprise_key: "MF",
            datetime: "06:00:00",
            original_order_total_amount: 7742.64,
            status_quantity: 51,
          },
          {
            enterprise_key: "MF",
            datetime: "07:00:00",
            original_order_total_amount: 26256.47,
            status_quantity: 118,
          },
          {
            enterprise_key: "MF",
            datetime: "08:00:00",
            original_order_total_amount: 15747,
            status_quantity: 26,
          },
        ],
      },
      {
        enterprise_key: "GC",
        series: [
          {
            enterprise_key: "GC",
            datetime: "00:00:00",
            original_order_total_amount: 39621.64,
            status_quantity: 70,
          },
          {
            enterprise_key: "GC",
            datetime: "01:00:00",
            original_order_total_amount: 113682.66,
            status_quantity: 754,
          },
          {
            enterprise_key: "GC",
            datetime: "02:00:00",
            original_order_total_amount: 43405.54,
            status_quantity: 68,
          },
          {
            enterprise_key: "GC",
            datetime: "03:00:00",
            original_order_total_amount: 6724.01,
            status_quantity: 17,
          },
          {
            enterprise_key: "GC",
            datetime: "04:00:00",
            original_order_total_amount: 6450.56,
            status_quantity: 20,
          },
          {
            enterprise_key: "GC",
            datetime: "05:00:00",
            original_order_total_amount: 13542.1,
            status_quantity: 61,
          },
          {
            enterprise_key: "GC",
            datetime: "06:00:00",
            original_order_total_amount: 44151.08,
            status_quantity: 198,
          },
          {
            enterprise_key: "GC",
            datetime: "07:00:00",
            original_order_total_amount: 92610.07,
            status_quantity: 163,
          },
          {
            enterprise_key: "GC",
            datetime: "08:00:00",
            original_order_total_amount: 33685.49,
            status_quantity: 53,
          },
        ],
      },
    ],
    salesCategories: [
      {
        name: "MF",
        original_order_total_amount: 87114,
        status_quantity: 322,
        ORDER_CAPTURE_CHANNEL_GROUPED: {
          Web: {
            name: "Web",
            original_order_total_amount: 64954,
            status_quantity: 297,
          },
          CallCenter: {
            name: "CallCenter",
            original_order_total_amount: 22160,
            status_quantity: 25,
          },
        },
        LINE_FULFILLMENT_TYPE_GROUPED: {
          SHIP_2_CUSTOMER_LV: {
            name: "SHIP_2_CUSTOMER_LV",
            original_order_total_amount: 10878,
            status_quantity: 129,
          },
          SHIP_2_CUSTOMER: {
            name: "SHIP_2_CUSTOMER",
            original_order_total_amount: 70759,
            status_quantity: 172,
          },
          SHIP_2_CUSTOMER_KIT: {
            name: "SHIP_2_CUSTOMER_KIT",
            original_order_total_amount: 5477,
            status_quantity: 21,
          },
        },
      },
      {
        name: "GC",
        original_order_total_amount: 393871,
        status_quantity: 1404,
        ORDER_CAPTURE_CHANNEL_GROUPED: {
          Web: {
            name: "Web",
            original_order_total_amount: 369710,
            status_quantity: 1385,
          },
          CallCenter: {
            name: "CallCenter",
            original_order_total_amount: 12705,
            status_quantity: 11,
          },
          GCSTORE: {
            name: "GCSTORE",
            original_order_total_amount: 11456,
            status_quantity: 8,
          },
        },
        LINE_FULFILLMENT_TYPE_GROUPED: {
          SHIP_2_CUSTOMER: {
            name: "SHIP_2_CUSTOMER",
            original_order_total_amount: 289559,
            status_quantity: 983,
          },
          SHIP_2_CUSTOMER_KIT: {
            name: "SHIP_2_CUSTOMER_KIT",
            original_order_total_amount: 12672,
            status_quantity: 34,
          },
          SHIP_2_CUSTOMER_LV: {
            name: "SHIP_2_CUSTOMER_LV",
            original_order_total_amount: 36768,
            status_quantity: 260,
          },
          PICKUP_IN_STORE: {
            name: "PICKUP_IN_STORE",
            original_order_total_amount: 44215,
            status_quantity: 85,
          },
          PICKUP_IN_STORE_LV: {
            name: "PICKUP_IN_STORE_LV",
            original_order_total_amount: 3178,
            status_quantity: 14,
          },
          PICKUP_IN_STORE_NC: {
            name: "PICKUP_IN_STORE_NC",
            original_order_total_amount: 1131,
            status_quantity: 5,
          },
          SHIP_2_CUSTOMER_NC: {
            name: "SHIP_2_CUSTOMER_NC",
            original_order_total_amount: 5883,
            status_quantity: 22,
          },
          SHIP_2_CUSTOMER_DC: {
            name: "SHIP_2_CUSTOMER_DC",
            original_order_total_amount: 465,
            status_quantity: 1,
          },
        },
      },
    ],
  });
};

module.exports = {
  getSalesData,
  getSalesDataByRange,
  getFullSalesData,
};
