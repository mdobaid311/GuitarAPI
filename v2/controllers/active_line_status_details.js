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
    MFData: {
      name: "MF",
      totalStats: {
        enterprise_key: "MF",
        original_order_total_amount: 531402,
        line_price_total: "464662.28",
        line_ordered_qty: "2819",
        line_margin: 215085,
        line_inventory_cost: 340328,
        shipping_cost: 4784,
        discount: 46200,
        tax: 33922,
      },
      chartSeries: {
        enterprise_key: "MF",
        series: [
          {
            enterprise_key: "MF",
            datetime: "01 Feb 00:00",
            original_order_total_amount: 8317.05,
            line_ordered_qty: 26,
          },
          {
            enterprise_key: "MF",
            datetime: "01 Feb 01:00",
            original_order_total_amount: 1966.68,
            line_ordered_qty: 7,
          },
          {
            enterprise_key: "MF",
            datetime: "01 Feb 02:00",
            original_order_total_amount: 372.8,
            line_ordered_qty: 7,
          },
          {
            enterprise_key: "MF",
            datetime: "01 Feb 03:00",
            original_order_total_amount: 1311.56,
            line_ordered_qty: 7,
          },
          {
            enterprise_key: "MF",
            datetime: "01 Feb 04:00",
            original_order_total_amount: 3128.85,
            line_ordered_qty: 14,
          },
          {
            enterprise_key: "MF",
            datetime: "01 Feb 05:00",
            original_order_total_amount: 11682.96,
            line_ordered_qty: 57,
          },
          {
            enterprise_key: "MF",
            datetime: "01 Feb 06:00",
            original_order_total_amount: 28709.76,
            line_ordered_qty: 116,
          },
          {
            enterprise_key: "MF",
            datetime: "01 Feb 07:00",
            original_order_total_amount: 42310.51,
            line_ordered_qty: 129,
          },
          {
            enterprise_key: "MF",
            datetime: "01 Feb 08:00",
            original_order_total_amount: 102844.17,
            line_ordered_qty: 272,
          },
          {
            enterprise_key: "MF",
            datetime: "01 Feb 09:00",
            original_order_total_amount: 97567.18,
            line_ordered_qty: 181,
          },
          {
            enterprise_key: "MF",
            datetime: "01 Feb 10:00",
            original_order_total_amount: 87426.52,
            line_ordered_qty: 169,
          },
          {
            enterprise_key: "MF",
            datetime: "01 Feb 11:00",
            original_order_total_amount: 86251.23,
            line_ordered_qty: 222,
          },
          {
            enterprise_key: "MF",
            datetime: "01 Feb 12:00",
            original_order_total_amount: 161851.23,
            line_ordered_qty: 197,
          },
          {
            enterprise_key: "MF",
            datetime: "01 Feb 13:00",
            original_order_total_amount: 117604.12,
            line_ordered_qty: 195,
          },
          {
            enterprise_key: "MF",
            datetime: "01 Feb 14:00",
            original_order_total_amount: 116426.21,
            line_ordered_qty: 202,
          },
          {
            enterprise_key: "MF",
            datetime: "01 Feb 15:00",
            original_order_total_amount: 55238.46,
            line_ordered_qty: 215,
          },
          {
            enterprise_key: "MF",
            datetime: "01 Feb 16:00",
            original_order_total_amount: 64524.02,
            line_ordered_qty: 149,
          },
          {
            enterprise_key: "MF",
            datetime: "01 Feb 17:00",
            original_order_total_amount: 48774.61,
            line_ordered_qty: 153,
          },
          {
            enterprise_key: "MF",
            datetime: "01 Feb 18:00",
            original_order_total_amount: 35741.69,
            line_ordered_qty: 166,
          },
          {
            enterprise_key: "MF",
            datetime: "01 Feb 19:00",
            original_order_total_amount: 25526,
            line_ordered_qty: 144,
          },
          {
            enterprise_key: "MF",
            datetime: "01 Feb 20:00",
            original_order_total_amount: 20271.61,
            line_ordered_qty: 77,
          },
          {
            enterprise_key: "MF",
            datetime: "01 Feb 21:00",
            original_order_total_amount: 9365.66,
            line_ordered_qty: 53,
          },
          {
            enterprise_key: "MF",
            datetime: "01 Feb 22:00",
            original_order_total_amount: 13716.12,
            line_ordered_qty: 35,
          },
          {
            enterprise_key: "MF",
            datetime: "01 Feb 23:00",
            original_order_total_amount: 5454.43,
            line_ordered_qty: 26,
          },
        ],
      },
      salesCategories: {
        name: "MF",
        original_order_total_amount: 1146376,
        line_ordered_qty: 2819,
        ORDER_CAPTURE_CHANNEL_GROUPED: [
          {
            name: "CallCenter",
            original_order_total_amount: 567616,
            line_ordered_qty: 791,
          },
          {
            name: "Web",
            original_order_total_amount: 578651,
            line_ordered_qty: 2028,
          },
          {
            name: null,
            original_order_total_amount: 109,
            line_ordered_qty: 0,
          },
        ],
        ITEM_INFO_GROUPED: [
          {
            name: "Digital-Download",
            original_order_total_amount: 398,
            line_ordered_qty: 3,
          },
          {
            name: "Low-Value-Sale",
            original_order_total_amount: 147371,
            line_ordered_qty: 1203,
          },
          {
            name: "Regular",
            original_order_total_amount: 918046,
            line_ordered_qty: 1466,
          },
          {
            name: "Used-And-Vintage",
            original_order_total_amount: 51083,
            line_ordered_qty: 115,
          },
          {
            name: "Warranty",
            original_order_total_amount: 28870,
            line_ordered_qty: 22,
          },
          {
            name: "E-Certificate",
            original_order_total_amount: 583,
            line_ordered_qty: 7,
          },
          {
            name: "Vendor-Fulfilled",
            original_order_total_amount: 25,
            line_ordered_qty: 3,
          },
        ],
      },
      topItemsData: [
        {
          web_category: "LDXB",
          brand_name: "Walrus Audio",
          item_id: "L87316000000000",
          line_ordered_qty: "111",
          original_order_total_amount: "14440.16",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "L87316000000000-00-180x180.jpg                                                                      ",
        },
        {
          web_category: "VJD",
          brand_name: "Lyons",
          item_id: "H81928000008000",
          line_ordered_qty: "75",
          original_order_total_amount: "225.51",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "H81928000008000-00-180x180.jpg                                                                      ",
        },
        {
          web_category: "LKJA",
          brand_name: "Mogami",
          item_id: "H92438000000000",
          line_ordered_qty: "40",
          original_order_total_amount: "64.63",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "H92438000000000-00-180x180.jpg                                                                      ",
        },
        {
          web_category: "LAAAA",
          brand_name: "Musician's Gear",
          item_id: "101808000000000",
          line_ordered_qty: "35",
          original_order_total_amount: "104.28",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "101808000000000-00-180x180.jpg                                                                      ",
        },
        {
          web_category: "LKB",
          brand_name: "Gear One",
          item_id: "339877000090000",
          line_ordered_qty: "28",
          original_order_total_amount: "3569.73",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "339877000090000-00-180x180.jpg                                                                      ",
        },
        {
          web_category: "LAAAA",
          brand_name: "Ernie Ball",
          item_id: "L56956000001000",
          line_ordered_qty: "21",
          original_order_total_amount: "99.02",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "L56956000001000-00-180x180.jpg                                                                      ",
        },
        {
          web_category: "LPA",
          brand_name: "Fishman",
          item_id: "L76002000001000",
          line_ordered_qty: "17",
          original_order_total_amount: "2465.45",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "L76002000001000-00-180x180.jpg                                                                      ",
        },
        {
          web_category: "YDA",
          brand_name: "Sterling Audio",
          item_id: "L59900000001000",
          line_ordered_qty: "16",
          original_order_total_amount: "9169.53",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "L59900000001000-00-180x180.jpg                                                                      ",
        },
        {
          web_category: "LIAA",
          brand_name: "Musician's Gear",
          item_id: "451058000001000",
          line_ordered_qty: "14",
          original_order_total_amount: "4214.10",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "451058000001000-00-180x180.jpg                                                                      ",
        },
        {
          web_category: "LKA",
          brand_name: "Musician's Gear",
          item_id: "361705000001154",
          line_ordered_qty: "13",
          original_order_total_amount: "178.51",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "361705000001154-00-180x180.jpg                                                                      ",
        },
      ],
    },
    GCData: {
      name: "GC",
      totalStats: {
        enterprise_key: "GC",
        original_order_total_amount: 2165217,
        line_price_total: "2029210.02",
        line_ordered_qty: "8882",
        line_margin: 1010446,
        line_inventory_cost: 1284900,
        shipping_cost: 29736,
        discount: 41355,
        tax: 126969,
      },
      chartSeries: {
        enterprise_key: "GC",
        series: [
          {
            enterprise_key: "GC",
            datetime: "01 Feb 00:00",
            original_order_total_amount: 8890.49,
            line_ordered_qty: 29,
          },
          {
            enterprise_key: "GC",
            datetime: "01 Feb 01:00",
            original_order_total_amount: 96763.36,
            line_ordered_qty: 643,
          },
          {
            enterprise_key: "GC",
            datetime: "01 Feb 02:00",
            original_order_total_amount: 105647.3,
            line_ordered_qty: 428,
          },
          {
            enterprise_key: "GC",
            datetime: "01 Feb 03:00",
            original_order_total_amount: 13400.8,
            line_ordered_qty: 47,
          },
          {
            enterprise_key: "GC",
            datetime: "01 Feb 04:00",
            original_order_total_amount: 27950.86,
            line_ordered_qty: 63,
          },
          {
            enterprise_key: "GC",
            datetime: "01 Feb 05:00",
            original_order_total_amount: 32686.65,
            line_ordered_qty: 69,
          },
          {
            enterprise_key: "GC",
            datetime: "01 Feb 06:00",
            original_order_total_amount: 98674.09,
            line_ordered_qty: 202,
          },
          {
            enterprise_key: "GC",
            datetime: "01 Feb 07:00",
            original_order_total_amount: 127598.28,
            line_ordered_qty: 275,
          },
          {
            enterprise_key: "GC",
            datetime: "01 Feb 08:00",
            original_order_total_amount: 245895.43,
            line_ordered_qty: 391,
          },
          {
            enterprise_key: "GC",
            datetime: "01 Feb 09:00",
            original_order_total_amount: 407686.18,
            line_ordered_qty: 666,
          },
          {
            enterprise_key: "GC",
            datetime: "01 Feb 10:00",
            original_order_total_amount: 354273.75,
            line_ordered_qty: 675,
          },
          {
            enterprise_key: "GC",
            datetime: "01 Feb 11:00",
            original_order_total_amount: 511192.76,
            line_ordered_qty: 732,
          },
          {
            enterprise_key: "GC",
            datetime: "01 Feb 12:00",
            original_order_total_amount: 328638.09,
            line_ordered_qty: 565,
          },
          {
            enterprise_key: "GC",
            datetime: "01 Feb 13:00",
            original_order_total_amount: 1388810.48,
            line_ordered_qty: 743,
          },
          {
            enterprise_key: "GC",
            datetime: "01 Feb 14:00",
            original_order_total_amount: 390914.98,
            line_ordered_qty: 692,
          },
          {
            enterprise_key: "GC",
            datetime: "01 Feb 15:00",
            original_order_total_amount: 311195.25,
            line_ordered_qty: 621,
          },
          {
            enterprise_key: "GC",
            datetime: "01 Feb 16:00",
            original_order_total_amount: 312169.93,
            line_ordered_qty: 438,
          },
          {
            enterprise_key: "GC",
            datetime: "01 Feb 17:00",
            original_order_total_amount: 195294.21,
            line_ordered_qty: 419,
          },
          {
            enterprise_key: "GC",
            datetime: "01 Feb 18:00",
            original_order_total_amount: 163735.28,
            line_ordered_qty: 317,
          },
          {
            enterprise_key: "GC",
            datetime: "01 Feb 19:00",
            original_order_total_amount: 200070.08,
            line_ordered_qty: 312,
          },
          {
            enterprise_key: "GC",
            datetime: "01 Feb 20:00",
            original_order_total_amount: 128860.71,
            line_ordered_qty: 243,
          },
          {
            enterprise_key: "GC",
            datetime: "01 Feb 21:00",
            original_order_total_amount: 74984.05,
            line_ordered_qty: 151,
          },
          {
            enterprise_key: "GC",
            datetime: "01 Feb 22:00",
            original_order_total_amount: 67876.39,
            line_ordered_qty: 87,
          },
          {
            enterprise_key: "GC",
            datetime: "01 Feb 23:00",
            original_order_total_amount: 16814.64,
            line_ordered_qty: 74,
          },
        ],
      },
      salesCategories: {
        name: "GC",
        original_order_total_amount: 5610011,
        line_ordered_qty: 8882,
        ORDER_CAPTURE_CHANNEL_GROUPED: [
          {
            name: "CallCenter",
            original_order_total_amount: 1309517,
            line_ordered_qty: 1123,
          },
          {
            name: "GCSTORE",
            original_order_total_amount: 2237470,
            line_ordered_qty: 1741,
          },
          {
            name: "Web",
            original_order_total_amount: 2063024,
            line_ordered_qty: 6018,
          },
        ],
        ITEM_INFO_GROUPED: [
          {
            name: "COA-Credit",
            original_order_total_amount: 11513,
            line_ordered_qty: 8,
          },
          {
            name: "Digital-Download",
            original_order_total_amount: 21939,
            line_ordered_qty: 47,
          },
          {
            name: "Free-Gift-Item",
            original_order_total_amount: 11780,
            line_ordered_qty: 10,
          },
          {
            name: "Low-Value-Sale",
            original_order_total_amount: 699550,
            line_ordered_qty: 2323,
          },
          {
            name: "Regular",
            original_order_total_amount: 3890844,
            line_ordered_qty: 3631,
          },
          {
            name: "Used-And-Vintage",
            original_order_total_amount: 507512,
            line_ordered_qty: 830,
          },
          {
            name: "Vendor-Fulfilled",
            original_order_total_amount: 3162,
            line_ordered_qty: 37,
          },
          {
            name: "Warranty",
            original_order_total_amount: 261636,
            line_ordered_qty: 333,
          },
          {
            name: "Clearance-Sale",
            original_order_total_amount: 127,
            line_ordered_qty: 1,
          },
          {
            name: "Lessons",
            original_order_total_amount: 170142,
            line_ordered_qty: 1368,
          },
          {
            name: "Registration",
            original_order_total_amount: 31806,
            line_ordered_qty: 294,
          },
        ],
      },
      topItemsData: [
        {
          web_category: "Z",
          brand_name: "Guitar Center",
          item_id: "L93246000000000",
          line_ordered_qty: "446",
          original_order_total_amount: "44731.33",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "L93246000000000-00-180x180.jpg                                                                      ",
        },
        {
          web_category: "Z",
          brand_name: "Guitar Center",
          item_id: "L74338000000000",
          line_ordered_qty: "294",
          original_order_total_amount: "31806.81",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "L74338000000000-00-180x180.jpg                                                                      ",
        },
        {
          web_category: "Z",
          brand_name: "Guitar Center",
          item_id: "L93263000000000",
          line_ordered_qty: "170",
          original_order_total_amount: "20475.00",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "L93263000000000-00-180x180.jpg                                                                      ",
        },
        {
          web_category: "Z",
          brand_name: "Guitar Center",
          item_id: "L93266000000000",
          line_ordered_qty: "119",
          original_order_total_amount: "13497.58",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "L93266000000000-00-180x180.jpg                                                                      ",
        },
        {
          web_category: "Z",
          brand_name: "Guitar Center",
          item_id: "L93261000000000",
          line_ordered_qty: "105",
          original_order_total_amount: "10872.75",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "L93261000000000-00-180x180.jpg                                                                      ",
        },
        {
          web_category: "Z",
          brand_name: "Guitar Center",
          item_id: "L93245000000000",
          line_ordered_qty: "78",
          original_order_total_amount: "15078.00",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "L93245000000000-00-180x180.jpg                                                                      ",
        },
        {
          web_category: "LIAA",
          brand_name: "Musician's Gear",
          item_id: "451058000001000",
          line_ordered_qty: "78",
          original_order_total_amount: "9147.15",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "451058000001000-00-180x180.jpg                                                                      ",
        },
        {
          web_category: "Z",
          brand_name: "Guitar Center",
          item_id: "L93260000000000",
          line_ordered_qty: "76",
          original_order_total_amount: "8452.50",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "L93260000000000-00-180x180.jpg                                                                      ",
        },
        {
          web_category: "Z",
          brand_name: "Guitar Center",
          item_id: "L93264000000000",
          line_ordered_qty: "69",
          original_order_total_amount: "8681.70",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "L93264000000000-00-180x180.jpg                                                                      ",
        },
        {
          web_category: "LFMIDB",
          brand_name: "Road Runner",
          item_id: "L53100000001000",
          line_ordered_qty: "51",
          original_order_total_amount: "31.89",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "L53100000001000-00-180x180.jpg                                                                      ",
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
