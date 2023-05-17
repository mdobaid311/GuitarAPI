const moment = require("moment");
// const connection = require("../config/mysql_client");

// const getSalesData = async (req, res) => {
//   const { interval, records_count, datetime } = req.query;

//   const intervalKey =
//     interval === "15min"
//       ? "15*60"
//       : interval === "30min"
//       ? "30*60"
//       : interval === "1hr"
//       ? "60*60"
//       : interval === "2hr"
//       ? "120*60"
//       : interval === "4hr"
//       ? "240*60"
//       : interval === "8hr"
//       ? "480*60"
//       : interval === "12hr"
//       ? "720*60"
//       : interval === "24hr"
//       ? "1440*60"
//       : "15*60";

//   let query = `SELECT sec_to_time(time_to_sec(order_date_parsed)- time_to_sec(order_date_parsed)%(${intervalKey})) as datetime, sum(original_order_total_amount) as original_order_total_amount, sum(status_quantity) as status_quantity  from active_line_status where order_date LIKE '01-jan-23%' group by datetime;
//       `;

//   if (interval === "1day") {
//     // 2023-01-01 00:03:20

//     const monthAndYear = moment(datetime, "YYYY-MM-DD HH:mm:ss").format(
//       "MM - YY"
//     );
//     query = ` SELECT DATE(order_date_parsed) AS datetime, SUM(original_order_total_amount) AS original_order_total_amount, SUM(status_quantity) AS status_quantity FROM active_line_status where DATE_FORMAT(order_date_parsed, '%m - %y') ='${monthAndYear}' GROUP BY datetime order by datetime;`;
//   } else if (interval === "1mon") {
//     // 2023-01-01 00:03:20
//     const year = moment(datetime, "YYYY-MM-DD HH:mm:ss").format("YY");

//     query = `SELECT DATE_FORMAT(order_date_parsed, '%Y-%m') AS datetime, SUM(original_order_total_amount) AS original_order_total_amount, SUM(status_quantity) AS status_quantity FROM active_line_status where DATE_FORMAT(order_date_parsed, '%y') = 23 GROUP BY datetime order by datetime`;
//   }

//   connection.query(query, (err, result) => {
//     if (err) {
//       res.status(500).json({ error: err });
//     } else {
//       const total_amount = result.reduce((acc, curr) => {
//         return acc + curr.original_order_total_amount;
//       }, 0);
//       const total_quantity = result.reduce((acc, curr) => {
//         return acc + curr.status_quantity;
//       }, 0);

//       const finalOutput = {
//         total_amount,
//         total_quantity,
//         series: result.map((item) => {
//           return {
//             datetime:
//               interval === "1day"
//                 ? moment(item.datetime).format("DD-MMM-YYYY")
//                 : interval === "1mon"
//                 ? moment(item.datetime).format("MMM-YYYY")
//                 : item.datetime,

//             original_order_total_amount: item.original_order_total_amount,
//             status_quantity: item.status_quantity,
//           };
//         }),
//       };

//       res.status(200).json(finalOutput);
//     }
//   });
// };

// const getSalesDataByRange = async (req, res) => {
//   const { start_date, end_date } = req.query;

//   const differenceInDays = moment(end_date).diff(moment(start_date), "days");

//   let query = `SELECT DATE(order_date_parsed) AS datetime, SUM(original_order_total_amount) AS original_order_total_amount, SUM(status_quantity) AS status_quantity FROM active_line_status where order_date_parsed BETWEEN '${start_date}' AND '${end_date}' GROUP BY datetime order by datetime;`;

//   console.log(differenceInDays, "differenceInDays ");
//   // start_date = 2023-01-01
//   // end_date = 2023-02-15
//   if (differenceInDays > 31 && differenceInDays < 365) {
//     query = `SELECT DATE_FORMAT(order_date_parsed, '%Y-%m') AS datetime,
//                     SUM(original_order_total_amount) AS original_order_total_amount,
//                     SUM(status_quantity) AS status_quantity
//              FROM active_line_status
//              WHERE order_date_parsed >= '${start_date}' AND order_date_parsed <= '${end_date}'
//              GROUP BY datetime
//              ORDER BY datetime`;
//   } else if (differenceInDays > 365) {
//     query = `SELECT DATE_FORMAT(order_date_parsed, '%Y') AS datetime,
//                     SUM(original_order_total_amount) AS original_order_total_amount,
//                     SUM(status_quantity) AS status_quantity
//              FROM active_line_status
//              WHERE order_date_parsed >= '${start_date}' AND order_date_parsed <= '${end_date}'
//              GROUP BY datetime
//              ORDER BY datetime`;
//   }

//   console.log(query);

//   connection.query(query, (err, result) => {
//     if (err) {
//       res.status(500).json({ error: err });
//     } else {
//       const total_amount = result.reduce((acc, curr) => {
//         return acc + curr.original_order_total_amount;
//       }, 0);
//       const total_quantity = result.reduce((acc, curr) => {
//         return acc + curr.status_quantity;
//       }, 0);

//       const finalOutput = {
//         total_amount,
//         total_quantity,
//         series: result.map((item) => {
//           return {
//             datetime:
//               differenceInDays > 31 && differenceInDays < 365
//                 ? moment(item.datetime).format("MMM-YYYY")
//                 : differenceInDays > 365
//                 ? moment(item.datetime).format("YYYY")
//                 : moment(item.datetime).format("DD-MMM-YYYY"),
//             original_order_total_amount: item.original_order_total_amount,
//             status_quantity: item.status_quantity,
//           };
//         }),
//       };

//       res.status(200).json(finalOutput);
//     }
//   });
// };

// const getFullSalesData2 = async (req, res) => {
//   const query =
//     "select ENTERPRISE_KEY,ORDER_CAPTURE_CHANNEL,LINE_FULFILLMENT_TYPE, sum(original_order_total_amount) as original_order_total_amount ,sum(status_quantity) as status_quantity from active_line_status group by ENTERPRISE_KEY,ORDER_CAPTURE_CHANNEL,LINE_FULFILLMENT_TYPE;  ";

//   connection.query(query, (err, result) => {
//     if (err) {
//       res.status(500).json({ error: err });
//     } else {
//       const groupedData = result.reduce((acc, curr) => {
//         // Group by enterprise key
//         if (!acc[curr.ENTERPRISE_KEY]) {
//           acc[curr.ENTERPRISE_KEY] = {
//             original_order_total_amount: 0,
//             status_quantity: 0,
//             ORDER_CAPTURE_CHANNEL_GROUPED: {},
//             LINE_FULFILLMENT_TYPE_GROUPED: {},
//           };
//         }

//         // Group by order capture channel
//         if (
//           !acc[curr.ENTERPRISE_KEY].ORDER_CAPTURE_CHANNEL_GROUPED[
//             curr.ORDER_CAPTURE_CHANNEL
//           ]
//         ) {
//           acc[curr.ENTERPRISE_KEY].ORDER_CAPTURE_CHANNEL_GROUPED[
//             curr.ORDER_CAPTURE_CHANNEL
//           ] = {
//             original_order_total_amount: 0,
//             status_quantity: 0,
//           };
//         }

//         // Group by line fulfillment type
//         if (
//           !acc[curr.ENTERPRISE_KEY].LINE_FULFILLMENT_TYPE_GROUPED[
//             curr.LINE_FULFILLMENT_TYPE
//           ]
//         ) {
//           acc[curr.ENTERPRISE_KEY].LINE_FULFILLMENT_TYPE_GROUPED[
//             curr.LINE_FULFILLMENT_TYPE
//           ] = {
//             original_order_total_amount: 0,
//             status_quantity: 0,
//           };
//         }

//         // Update original_order_total_amount and status_quantity for each group
//         acc[curr.ENTERPRISE_KEY].original_order_total_amount +=
//           curr.original_order_total_amount;
//         acc[curr.ENTERPRISE_KEY].status_quantity += curr.status_quantity;
//         acc[curr.ENTERPRISE_KEY].ORDER_CAPTURE_CHANNEL_GROUPED[
//           curr.ORDER_CAPTURE_CHANNEL
//         ].original_order_total_amount += curr.original_order_total_amount;
//         acc[curr.ENTERPRISE_KEY].ORDER_CAPTURE_CHANNEL_GROUPED[
//           curr.ORDER_CAPTURE_CHANNEL
//         ].status_quantity += curr.status_quantity;
//         acc[curr.ENTERPRISE_KEY].LINE_FULFILLMENT_TYPE_GROUPED[
//           curr.LINE_FULFILLMENT_TYPE
//         ].original_order_total_amount += curr.original_order_total_amount;
//         acc[curr.ENTERPRISE_KEY].LINE_FULFILLMENT_TYPE_GROUPED[
//           curr.LINE_FULFILLMENT_TYPE
//         ].status_quantity += curr.status_quantity;

//         return acc;
//       }, {});

//       res.status(200).json(groupedData);
//     }
//   });
// };

// const getFullSalesData1 = async (req, res) => {
//   const { start_date, end_date } = req.query;

//   const differenceInDays = moment(end_date).diff(moment(start_date), "days");

//   const differenceInHours = moment(end_date).diff(moment(start_date), "hours");

//   let interval;
//   if (
//     (differenceInHours > 8 &&
//       differenceInHours <= 24 &&
//       differenceInDays === 1) ||
//     differenceInDays === 0
//   ) {
//     interval = 60 * 60;
//   } else {
//     console.log("first");
//     interval =
//       differenceInDays === 1
//         ? 15 * 60
//         : differenceInDays > 1 && differenceInDays <= 31
//         ? 1440 * 60
//         : differenceInDays > 31 && differenceInDays <= 365
//         ? 1440 * 60 * 30
//         : 24 * 60 * 60 * 365;
//   }

//   const query = `CALL getData('${start_date}','${end_date}',${interval})`;
//   console.log(interval);
//   connection.query(query, (err, result) => {
//     if (err) {
//       res.status(500).json({ error: err });
//     } else {
//       console.log(result[1]);
//       const groupedChartSeries = result[1].reduce((acc, order) => {
//         const enterpriseKey = order.enterprise_key;

//         if (!acc[enterpriseKey]) {
//           acc[enterpriseKey] = {
//             enterprise_key: enterpriseKey,
//             series: [],
//           };
//         }

//         acc[enterpriseKey].series.push(order);

//         return acc;
//       }, {});

//       const groupedData = result[2].reduce((acc, curr) => {
//         // Group by enterprise key
//         if (!acc[curr.ENTERPRISE_KEY]) {
//           acc[curr.ENTERPRISE_KEY] = {
//             name: curr.ENTERPRISE_KEY,
//             original_order_total_amount: 0,
//             status_quantity: 0,
//             ORDER_CAPTURE_CHANNEL_GROUPED: {},
//             LINE_FULFILLMENT_TYPE_GROUPED: {},
//           };
//         }

//         // Group by order capture channel
//         if (
//           !acc[curr.ENTERPRISE_KEY].ORDER_CAPTURE_CHANNEL_GROUPED[
//             curr.ORDER_CAPTURE_CHANNEL
//           ]
//         ) {
//           acc[curr.ENTERPRISE_KEY].ORDER_CAPTURE_CHANNEL_GROUPED[
//             curr.ORDER_CAPTURE_CHANNEL
//           ] = {
//             name: curr.ORDER_CAPTURE_CHANNEL
//               ? curr.ORDER_CAPTURE_CHANNEL
//               : "OTHERS",
//             original_order_total_amount: 0,
//             status_quantity: 0,
//           };
//         }

//         // Group by line fulfillment type
//         if (
//           !acc[curr.ENTERPRISE_KEY].LINE_FULFILLMENT_TYPE_GROUPED[
//             curr.LINE_FULFILLMENT_TYPE
//           ]
//         ) {
//           acc[curr.ENTERPRISE_KEY].LINE_FULFILLMENT_TYPE_GROUPED[
//             curr.LINE_FULFILLMENT_TYPE
//           ] = {
//             name: curr.LINE_FULFILLMENT_TYPE
//               ? curr.LINE_FULFILLMENT_TYPE
//               : "OTHERS",
//             original_order_total_amount: 0,
//             status_quantity: 0,
//           };
//         }

//         // Update original_order_total_amount and status_quantity for each group
//         acc[curr.ENTERPRISE_KEY].original_order_total_amount += Math.round(
//           curr.original_order_total_amount
//         );
//         acc[curr.ENTERPRISE_KEY].status_quantity += curr.status_quantity;
//         acc[curr.ENTERPRISE_KEY].ORDER_CAPTURE_CHANNEL_GROUPED[
//           curr.ORDER_CAPTURE_CHANNEL
//         ].original_order_total_amount += Math.round(
//           curr.original_order_total_amount
//         );
//         acc[curr.ENTERPRISE_KEY].ORDER_CAPTURE_CHANNEL_GROUPED[
//           curr.ORDER_CAPTURE_CHANNEL
//         ].status_quantity += curr.status_quantity;
//         acc[curr.ENTERPRISE_KEY].LINE_FULFILLMENT_TYPE_GROUPED[
//           curr.LINE_FULFILLMENT_TYPE
//         ].original_order_total_amount += Math.round(
//           curr.original_order_total_amount
//         );
//         acc[curr.ENTERPRISE_KEY].LINE_FULFILLMENT_TYPE_GROUPED[
//           curr.LINE_FULFILLMENT_TYPE
//         ].status_quantity += curr.status_quantity;

//         return acc;
//       }, {});

//       // enterprise_key, item_id, status_quantity, original_order_total_amount
//       // 'GC', 'L74338000000000', '23665', '2630655.05'

//       const topItemsData = result[3].reduce((acc, curr) => {
//         // Group by enterprise key
//         console.log(curr.enterprise_key);
//         if (!acc[curr.enterprise_key]) {
//           acc[curr.enterprise_key] = {
//             name: curr.enterprise_key,
//             topItems: [],
//           };
//         }

//         acc[curr.enterprise_key].topItems.push(curr);
//         return acc;
//       }, {});
//       // console.log(topItemsData);
//       // console.log(result[3]);

//       const data = {
//         totalStats: result[0],
//         chartSeries: Object.values(groupedChartSeries),
//         salesCategories: Object.values(groupedData),
//         topItemsData: Object.values(topItemsData),
//       };

//       res.status(200).json({
//         MFData: {
//           name: "MF",
//           totalStats: data.totalStats[0],
//           chartSeries: data.chartSeries[0],
//           salesCategories: {
//             ...data.salesCategories[0],
//             ORDER_CAPTURE_CHANNEL_GROUPED: Object.values(
//               data.salesCategories[0].ORDER_CAPTURE_CHANNEL_GROUPED
//             ),
//             LINE_FULFILLMENT_TYPE_GROUPED: Object.values(
//               data.salesCategories[0].LINE_FULFILLMENT_TYPE_GROUPED
//             ),
//           },
//           topItemsData: data.topItemsData[0],
//         },
//         GCData: {
//           name: "GC",
//           totalStats: data.totalStats[1],
//           chartSeries: data.chartSeries[1],
//           salesCategories: {
//             ...data.salesCategories[1],
//             ORDER_CAPTURE_CHANNEL_GROUPED: Object.values(
//               data.salesCategories[1].ORDER_CAPTURE_CHANNEL_GROUPED
//             ),
//             LINE_FULFILLMENT_TYPE_GROUPED: Object.values(
//               data.salesCategories[1].LINE_FULFILLMENT_TYPE_GROUPED
//             ),
//           },
//           topItemsData: data.topItemsData[1],
//         },
//       });
//     }
//   });
// };

const getFullSalesData = async (req, res) => {
  const data = {
    GCData: {
      name: "GC",
      totalStats: {
        enterprise_key: "GC",
        original_order_total_amount: "3758902.59",
        line_ordered_qty: "5161",
        line_margin: 723607,
        line_roi: 309960894,
      },
      chartSeries: {
        enterprise_key: "GC",
        series: [
          {
            enterprise_key: "GC",
            datetime: "2023-01-22 00:00:00",
            original_order_total_amount: 415398.55,
            line_ordered_qty: 637,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-01-22 01:00:00",
            original_order_total_amount: 435750.22,
            line_ordered_qty: 1299,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-01-22 02:00:00",
            original_order_total_amount: 359881.9,
            line_ordered_qty: 653,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-01-22 03:00:00",
            original_order_total_amount: 339630.77,
            line_ordered_qty: 523,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-01-22 04:00:00",
            original_order_total_amount: 237515.35,
            line_ordered_qty: 594,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-01-22 05:00:00",
            original_order_total_amount: 266548.59,
            line_ordered_qty: 488,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-01-22 06:00:00",
            original_order_total_amount: 213107.09,
            line_ordered_qty: 430,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-01-22 07:00:00",
            original_order_total_amount: 204516.79,
            line_ordered_qty: 482,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-01-22 08:00:00",
            original_order_total_amount: 213813.03,
            line_ordered_qty: 535,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-01-22 09:00:00",
            original_order_total_amount: 263873.89,
            line_ordered_qty: 683,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-01-22 10:00:00",
            original_order_total_amount: 383950.1,
            line_ordered_qty: 699,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-01-22 11:00:00",
            original_order_total_amount: 327586.16,
            line_ordered_qty: 650,
          },
        ],
      },
      salesCategories: {
        name: "GC",
        original_order_total_amount: 3661558,
        status_quantity: 7673,
        ORDER_CAPTURE_CHANNEL_GROUPED: [
          {
            name: "CallCenter",
            original_order_total_amount: 266898,
            status_quantity: 303,
          },
          {
            name: "GCSTORE",
            original_order_total_amount: 1244705,
            status_quantity: 1352,
          },
          {
            name: "Web",
            original_order_total_amount: 2149955,
            status_quantity: 6018,
          },
        ],
        LINE_FULFILLMENT_TYPE_GROUPED: [
          {
            name: "PICKUP_IN_STORE",
            original_order_total_amount: 1143309,
            status_quantity: 1282,
          },
          {
            name: "PICKUP_IN_STORE_DC",
            original_order_total_amount: 34107,
            status_quantity: 14,
          },
          {
            name: "PICKUP_IN_STORE_LV",
            original_order_total_amount: 109450,
            status_quantity: 365,
          },
          {
            name: "PICKUP_IN_STORE_NC",
            original_order_total_amount: 21266,
            status_quantity: 41,
          },
          {
            name: "SHIP_2_CUSTOMER",
            original_order_total_amount: 1722306,
            status_quantity: 3283,
          },
          {
            name: "SHIP_2_CUSTOMER_DC",
            original_order_total_amount: 4166,
            status_quantity: 12,
          },
          {
            name: "SHIP_2_CUSTOMER_KIT",
            original_order_total_amount: 275299,
            status_quantity: 793,
          },
          {
            name: "SHIP_2_CUSTOMER_LV",
            original_order_total_amount: 265825,
            status_quantity: 1678,
          },
          {
            name: "SHIP_2_CUSTOMER_NC",
            original_order_total_amount: 35423,
            status_quantity: 121,
          },
          {
            name: "PICKUP_IN_STORE_KIT",
            original_order_total_amount: 50407,
            status_quantity: 84,
          },
        ],
      },
      topItemsData: [
        {
          item_id: "L93246000000000",
          line_ordered_qty: "58405",
          original_order_total_amount: "5983966.25",
        },
        {
          item_id: "L74338000000000",
          line_ordered_qty: "31835",
          original_order_total_amount: "3560848.94",
        },
        {
          item_id: "L93263000000000",
          line_ordered_qty: "21739",
          original_order_total_amount: "2653446.51",
        },
        {
          item_id: "L93266000000000",
          line_ordered_qty: "15074",
          original_order_total_amount: "1750187.61",
        },
        {
          item_id: "L93261000000000",
          line_ordered_qty: "10254",
          original_order_total_amount: "1084867.53",
        },
        {
          item_id: "L93264000000000",
          line_ordered_qty: "9513",
          original_order_total_amount: "1201318.07",
        },
        {
          item_id: "L93260000000000",
          line_ordered_qty: "8664",
          original_order_total_amount: "971102.02",
        },
        {
          item_id: "L93247000000000",
          line_ordered_qty: "7478",
          original_order_total_amount: "856552.89",
        },
        {
          item_id: "L93245000000000",
          line_ordered_qty: "7414",
          original_order_total_amount: "1494686.16",
        },
        {
          item_id: "L79218000000000",
          line_ordered_qty: "6249",
          original_order_total_amount: "2618314.21",
        },
      ],
    },
    MFData: {
      name: "MF",
      totalStats: {
        enterprise_key: "MF",
        original_order_total_amount: "531374.71",
        line_ordered_qty: "1591",
        line_margin: 108852,
        line_roi: 235178,
      },
      chartSeries: {
        enterprise_key: "MF",
        series: [
          {
            enterprise_key: "MF",
            datetime: "2023-01-22 00:00:00",
            original_order_total_amount: 91508.73,
            line_ordered_qty: 220,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-01-22 01:00:00",
            original_order_total_amount: 64386.62,
            line_ordered_qty: 233,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-01-22 02:00:00",
            original_order_total_amount: 63920.99,
            line_ordered_qty: 210,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-01-22 03:00:00",
            original_order_total_amount: 45937.29,
            line_ordered_qty: 197,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-01-22 04:00:00",
            original_order_total_amount: 33573.89,
            line_ordered_qty: 191,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-01-22 05:00:00",
            original_order_total_amount: 58191.14,
            line_ordered_qty: 251,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-01-22 06:00:00",
            original_order_total_amount: 62192.44,
            line_ordered_qty: 234,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-01-22 07:00:00",
            original_order_total_amount: 137321.74,
            line_ordered_qty: 291,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-01-22 08:00:00",
            original_order_total_amount: 126071.24,
            line_ordered_qty: 334,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-01-22 09:00:00",
            original_order_total_amount: 97928.45,
            line_ordered_qty: 417,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-01-22 10:00:00",
            original_order_total_amount: 93601.9,
            line_ordered_qty: 213,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-01-22 11:00:00",
            original_order_total_amount: 60600.17,
            line_ordered_qty: 176,
          },
        ],
      },
      salesCategories: {
        name: "MF",
        original_order_total_amount: 935231,
        status_quantity: 2967,
        ORDER_CAPTURE_CHANNEL_GROUPED: [
          {
            name: "CallCenter",
            original_order_total_amount: 192901,
            status_quantity: 301,
          },
          {
            name: "Web",
            original_order_total_amount: 742330,
            status_quantity: 2666,
          },
        ],
        LINE_FULFILLMENT_TYPE_GROUPED: [
          {
            name: "SHIP_2_CUSTOMER",
            original_order_total_amount: 621030,
            status_quantity: 1098,
          },
          {
            name: "SHIP_2_CUSTOMER_DC",
            original_order_total_amount: 25633,
            status_quantity: 18,
          },
          {
            name: "SHIP_2_CUSTOMER_KIT",
            original_order_total_amount: 111225,
            status_quantity: 541,
          },
          {
            name: "SHIP_2_CUSTOMER_LV",
            original_order_total_amount: 177343,
            status_quantity: 1310,
          },
        ],
      },
      topItemsData: [
        {
          item_id: "451058000001000",
          line_ordered_qty: "2428",
          original_order_total_amount: "68384.52",
        },
        {
          item_id: "339877000090000",
          line_ordered_qty: "2282",
          original_order_total_amount: "225325.95",
        },
        {
          item_id: "101812000000000",
          line_ordered_qty: "2243",
          original_order_total_amount: "28407.59",
        },
        {
          item_id: "101811000000000",
          line_ordered_qty: "2046",
          original_order_total_amount: "17575.50",
        },
        {
          item_id: "101808000000000",
          line_ordered_qty: "1865",
          original_order_total_amount: "14860.57",
        },
        {
          item_id: "J04052000000000",
          line_ordered_qty: "1711",
          original_order_total_amount: "171660.74",
        },
        {
          item_id: "451051000001000",
          line_ordered_qty: "1473",
          original_order_total_amount: "237918.90",
        },
        {
          item_id: "L79953000001001",
          line_ordered_qty: "1451",
          original_order_total_amount: "55731.05",
        },
        {
          item_id: "L87042000000000",
          line_ordered_qty: "1401",
          original_order_total_amount: "117435.14",
        },
        {
          item_id: "J26823000000000",
          line_ordered_qty: "1311",
          original_order_total_amount: "79982.27",
        },
      ],
    },
  };

  res.status(200).json(data);

  // console.log(result);
  // res.status(200).json(data);
};

// const getFullSalesData2 = async (req, res) => {
//   const { start_date, end_date } = req.query;

//   const differenceInDays = moment(end_date).diff(moment(start_date), "days");

//   const differenceInHours = moment(end_date).diff(moment(start_date), "hours");

//   let interval;
//   if (
//     (differenceInHours > 8 &&
//       differenceInHours <= 24 &&
//       differenceInDays === 1) ||
//     differenceInDays === 0
//   ) {
//     interval = 60 * 60;
//   } else {
//     console.log("first");
//     interval =
//       differenceInDays === 1
//         ? 15 * 60
//         : differenceInDays > 1 && differenceInDays <= 31
//         ? 1440 * 60
//         : differenceInDays > 31 && differenceInDays <= 365
//         ? 1440 * 60 * 30
//         : 24 * 60 * 60 * 365;
//   }

//   const query = `CALL getData('${start_date}','${end_date}',${interval})`;
//   console.log(interval);
//   connection.query(query, (err, result) => {
//     if (err) {
//       res.status(500).json({ error: err });
//     } else {
//       console.log(result[1]);
//       const groupedChartSeries = result[1].reduce((acc, order) => {
//         const enterpriseKey = order.enterprise_key;

//         if (!acc[enterpriseKey]) {
//           acc[enterpriseKey] = {
//             enterprise_key: enterpriseKey,
//             series: [],
//           };
//         }

//         acc[enterpriseKey].series.push(order);

//         return acc;
//       }, {});

//       const groupedData = result[2].reduce((acc, curr) => {
//         // Group by enterprise key
//         if (!acc[curr.ENTERPRISE_KEY]) {
//           acc[curr.ENTERPRISE_KEY] = {
//             name: curr.ENTERPRISE_KEY,
//             original_order_total_amount: 0,
//             status_quantity: 0,
//             ORDER_CAPTURE_CHANNEL_GROUPED: {},
//             LINE_FULFILLMENT_TYPE_GROUPED: {},
//           };
//         }

//         // Group by order capture channel
//         if (
//           !acc[curr.ENTERPRISE_KEY].ORDER_CAPTURE_CHANNEL_GROUPED[
//             curr.ORDER_CAPTURE_CHANNEL
//           ]
//         ) {
//           acc[curr.ENTERPRISE_KEY].ORDER_CAPTURE_CHANNEL_GROUPED[
//             curr.ORDER_CAPTURE_CHANNEL
//           ] = {
//             name: curr.ORDER_CAPTURE_CHANNEL
//               ? curr.ORDER_CAPTURE_CHANNEL
//               : "OTHERS",
//             original_order_total_amount: 0,
//             status_quantity: 0,
//           };
//         }

//         // Group by line fulfillment type
//         if (
//           !acc[curr.ENTERPRISE_KEY].LINE_FULFILLMENT_TYPE_GROUPED[
//             curr.LINE_FULFILLMENT_TYPE
//           ]
//         ) {
//           acc[curr.ENTERPRISE_KEY].LINE_FULFILLMENT_TYPE_GROUPED[
//             curr.LINE_FULFILLMENT_TYPE
//           ] = {
//             name: curr.LINE_FULFILLMENT_TYPE
//               ? curr.LINE_FULFILLMENT_TYPE
//               : "OTHERS",
//             original_order_total_amount: 0,
//             status_quantity: 0,
//           };
//         }

//         // Update original_order_total_amount and status_quantity for each group
//         acc[curr.ENTERPRISE_KEY].original_order_total_amount += Math.round(
//           curr.original_order_total_amount
//         );
//         acc[curr.ENTERPRISE_KEY].status_quantity += curr.status_quantity;
//         acc[curr.ENTERPRISE_KEY].ORDER_CAPTURE_CHANNEL_GROUPED[
//           curr.ORDER_CAPTURE_CHANNEL
//         ].original_order_total_amount += Math.round(
//           curr.original_order_total_amount
//         );
//         acc[curr.ENTERPRISE_KEY].ORDER_CAPTURE_CHANNEL_GROUPED[
//           curr.ORDER_CAPTURE_CHANNEL
//         ].status_quantity += curr.status_quantity;
//         acc[curr.ENTERPRISE_KEY].LINE_FULFILLMENT_TYPE_GROUPED[
//           curr.LINE_FULFILLMENT_TYPE
//         ].original_order_total_amount += Math.round(
//           curr.original_order_total_amount
//         );
//         acc[curr.ENTERPRISE_KEY].LINE_FULFILLMENT_TYPE_GROUPED[
//           curr.LINE_FULFILLMENT_TYPE
//         ].status_quantity += curr.status_quantity;

//         return acc;
//       }, {});
//       res.status(200).json({
//         totalStats: result[0],
//         chartSeries: Object.values(groupedChartSeries),
//         salesCategories: Object.values(groupedData),
//       });
//     }
//   });
// };

module.exports = {
  // getSalesData,
  // getSalesDataByRange,
  getFullSalesData,
};
