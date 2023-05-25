const moment = require("moment");
const client = require("../config/postgre_client");
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
        original_order_total_amount: 0,
        line_price_total: "426969.35",
        line_ordered_qty: "3119",
        line_margin: 189373,
        line_inventory_cost: 251596,
        shipping_cost: 1860,
        discount: 23817,
        tax: 11388,
      },
      chartSeries: {
        enterprise_key: "MF",
        series: [
          {
            enterprise_key: "MF",
            datetime: "2023-05-05 00:00",
            original_order_total_amount: 8141.05,
            line_ordered_qty: 58,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-05-05 01:00",
            original_order_total_amount: 884.99,
            line_ordered_qty: 38,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-05-05 02:00",
            original_order_total_amount: 4286.59,
            line_ordered_qty: 26,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-05-05 03:00",
            original_order_total_amount: 4760.32,
            line_ordered_qty: 54,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-05-05 04:00",
            original_order_total_amount: 8732.73,
            line_ordered_qty: 118,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-05-05 05:00",
            original_order_total_amount: 25758.68,
            line_ordered_qty: 314,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-05-05 06:00",
            original_order_total_amount: 51775.81,
            line_ordered_qty: 143,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-05-05 07:00",
            original_order_total_amount: 62412.31,
            line_ordered_qty: 191,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-05-05 08:00",
            original_order_total_amount: 46259.23,
            line_ordered_qty: 171,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-05-05 09:00",
            original_order_total_amount: 63190.57,
            line_ordered_qty: 181,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-05-05 10:00",
            original_order_total_amount: 83008.18,
            line_ordered_qty: 229,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-05-05 11:00",
            original_order_total_amount: 72554.11,
            line_ordered_qty: 749,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-05-05 12:00",
            original_order_total_amount: 76843.06,
            line_ordered_qty: 195,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-05-05 13:00",
            original_order_total_amount: 62468.23,
            line_ordered_qty: 254,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-05-05 14:00",
            original_order_total_amount: 50757.43,
            line_ordered_qty: 119,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-05-05 15:00",
            original_order_total_amount: 58579.81,
            line_ordered_qty: 203,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-05-05 16:00",
            original_order_total_amount: 50539.76,
            line_ordered_qty: 76,
          },
        ],
      },
      salesCategories: {
        name: "MF",
        original_order_total_amount: 730944,
        line_ordered_qty: 3119,
        ORDER_CAPTURE_CHANNEL_GROUPED: [
          {
            name: "CallCenter",
            original_order_total_amount: 374260,
            line_ordered_qty: 639,
          },
          {
            name: "Web",
            original_order_total_amount: 356684,
            line_ordered_qty: 2480,
          },
        ],
        ITEM_INFO_GROUPED: [
          {
            name: "Regular",
            original_order_total_amount: 601829,
            line_ordered_qty: 2073,
          },
          {
            name: "E-Certificate",
            original_order_total_amount: 291,
            line_ordered_qty: 3,
          },
          {
            name: "Vendor-Fulfilled",
            original_order_total_amount: 794,
            line_ordered_qty: 13,
          },
          {
            name: "Warranty",
            original_order_total_amount: 14637,
            line_ordered_qty: 22,
          },
          {
            name: "Used-And-Vintage",
            original_order_total_amount: 30461,
            line_ordered_qty: 82,
          },
          {
            name: "Digital-Download",
            original_order_total_amount: 139,
            line_ordered_qty: 1,
          },
          {
            name: "Low-Value-Sale",
            original_order_total_amount: 82793,
            line_ordered_qty: 925,
          },
        ],
        LINE_FULFILLMENT_TYPE_GROUPED: [
          {
            name: "SHIP_2_CUSTOMER_KIT",
            original_order_total_amount: 64971,
            line_ordered_qty: 1158,
          },
          {
            name: "SHIP_2_CUSTOMER",
            original_order_total_amount: 583286,
            line_ordered_qty: 1088,
          },
          {
            name: "SHIP_2_CUSTOMER_LV",
            original_order_total_amount: 82687,
            line_ordered_qty: 873,
          },
        ],
      },
      topItemsData: {
        byVolume: [
          {
            web_category: "LKB",
            brand_name: "Gear One",
            item_id: "339877000090000",
            line_ordered_qty: "388",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "339877000090000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "LKB",
            brand_name: "Roland",
            item_id: "J37491000007001",
            line_ordered_qty: "272",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "J37491000007001-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "LKB",
            brand_name: "Roland",
            item_id: "L52080000000000",
            line_ordered_qty: "136",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L52080000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "LKJA",
            brand_name: "Mogami",
            item_id: "H92438000000000",
            line_ordered_qty: "120",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "H92438000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "LKB",
            brand_name: "Musician's Gear",
            item_id: "582060000000000",
            line_ordered_qty: "93",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "582060000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "LIC",
            brand_name: "Proline",
            item_id: "454308000000000",
            line_ordered_qty: "64",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "454308000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "YNBF",
            brand_name: "Gemini",
            item_id: "L86008000000000",
            line_ordered_qty: "60",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L86008000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "YBDA",
            brand_name: "Headliner",
            item_id: "L87137000000000",
            line_ordered_qty: "46",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L87137000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "AAH",
            brand_name: "D'Angelico",
            item_id: "L83760000003000",
            line_ordered_qty: "43",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L83760000003000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "HAADC",
            brand_name: "Line 6",
            item_id: "L69038000001000",
            line_ordered_qty: "34",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L69038000001000-00-180x180.jpg                                                                      ",
          },
        ],
        byValue: [
          {
            web_category: "AAH",
            brand_name: "D'Angelico",
            item_id: "L83760000003000",
            original_order_total_amount: "18941.46",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L83760000003000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "YAAB",
            brand_name: "Electro-Voice",
            item_id: "J20903000000000",
            original_order_total_amount: "15738.56",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "J20903000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "YAAB",
            brand_name: "Electro-Voice",
            item_id: "J20907000000000",
            original_order_total_amount: "8677.56",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "J20907000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "YAEB",
            brand_name: "QSC",
            item_id: "L68677000000000",
            original_order_total_amount: "7286.14",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L68677000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "LFMICA",
            brand_name: "Gibson",
            item_id: "115418154",
            original_order_total_amount: "7136.01",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "000000115418154-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "LKB",
            brand_name: "Roland",
            item_id: "J37491000007001",
            original_order_total_amount: "6383.33",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "J37491000007001-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "LKB",
            brand_name: "Roland",
            item_id: "L52080000000000",
            original_order_total_amount: "6383.33",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L52080000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "LIC",
            brand_name: "On-Stage",
            item_id: "450389000000000",
            original_order_total_amount: "6174.27",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "450389000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "CFAB",
            brand_name: "Nord",
            item_id: "M00633000000000",
            original_order_total_amount: "6174.27",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "M00633000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "LKB",
            brand_name: "Gear One",
            item_id: "339877000090000",
            original_order_total_amount: "5316.85",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "339877000090000-00-180x180.jpg                                                                      ",
          },
        ],
      },
    },
    GCData: {
      name: "GC",
      totalStats: {
        enterprise_key: "GC",
        original_order_total_amount: 1388243,
        line_price_total: "1809138.17",
        line_ordered_qty: "6530",
        line_margin: 803042,
        line_inventory_cost: 1025846,
        shipping_cost: 10824,
        discount: 11288,
        tax: 56054,
      },
      chartSeries: {
        enterprise_key: "GC",
        series: [
          {
            enterprise_key: "GC",
            datetime: "2023-05-05 00:00",
            original_order_total_amount: 23473.58,
            line_ordered_qty: 45,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-05-05 01:00",
            original_order_total_amount: 120341.51,
            line_ordered_qty: 884,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-05-05 02:00",
            original_order_total_amount: 16518.62,
            line_ordered_qty: 81,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-05-05 03:00",
            original_order_total_amount: 26855.62,
            line_ordered_qty: 59,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-05-05 04:00",
            original_order_total_amount: 14011.54,
            line_ordered_qty: 49,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-05-05 05:00",
            original_order_total_amount: 59932.75,
            line_ordered_qty: 111,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-05-05 06:00",
            original_order_total_amount: 175172.35,
            line_ordered_qty: 299,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-05-05 07:00",
            original_order_total_amount: 228429.77,
            line_ordered_qty: 247,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-05-05 08:00",
            original_order_total_amount: 257626.17,
            line_ordered_qty: 435,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-05-05 09:00",
            original_order_total_amount: 410393.24,
            line_ordered_qty: 499,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-05-05 10:00",
            original_order_total_amount: 581676.47,
            line_ordered_qty: 608,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-05-05 11:00",
            original_order_total_amount: 471817.55,
            line_ordered_qty: 734,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-05-05 12:00",
            original_order_total_amount: 544167.95,
            line_ordered_qty: 703,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-05-05 13:00",
            original_order_total_amount: 560451.12,
            line_ordered_qty: 586,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-05-05 14:00",
            original_order_total_amount: 367400.8,
            line_ordered_qty: 556,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-05-05 15:00",
            original_order_total_amount: 353465.05,
            line_ordered_qty: 448,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-05-05 16:00",
            original_order_total_amount: 106841.27,
            line_ordered_qty: 186,
          },
        ],
      },
      salesCategories: {
        name: "GC",
        original_order_total_amount: 4318537,
        line_ordered_qty: 6530,
        ORDER_CAPTURE_CHANNEL_GROUPED: [
          {
            name: "CallCenter",
            original_order_total_amount: 951597,
            line_ordered_qty: 989,
          },
          {
            name: "Web",
            original_order_total_amount: 1496369,
            line_ordered_qty: 3898,
          },
          {
            name: "GCSTORE",
            original_order_total_amount: 1870571,
            line_ordered_qty: 1643,
          },
        ],
        ITEM_INFO_GROUPED: [
          {
            name: "Free-Gift-Item",
            original_order_total_amount: 1375,
            line_ordered_qty: 2,
          },
          {
            name: "Regular",
            original_order_total_amount: 2942367,
            line_ordered_qty: 2782,
          },
          {
            name: "Warranty",
            original_order_total_amount: 329128,
            line_ordered_qty: 271,
          },
          {
            name: "Vendor-Fulfilled",
            original_order_total_amount: 395,
            line_ordered_qty: 9,
          },
          {
            name: "COA-Credit",
            original_order_total_amount: 34238,
            line_ordered_qty: 7,
          },
          {
            name: "Digital-Download",
            original_order_total_amount: 8987,
            line_ordered_qty: 16,
          },
          {
            name: "Low-Value-Sale",
            original_order_total_amount: 395399,
            line_ordered_qty: 1633,
          },
          {
            name: "Used-And-Vintage",
            original_order_total_amount: 456981,
            line_ordered_qty: 677,
          },
          {
            name: "Lessons",
            original_order_total_amount: 136425,
            line_ordered_qty: 1042,
          },
          {
            name: "Registration",
            original_order_total_amount: 12816,
            line_ordered_qty: 90,
          },
          {
            name: "Clearance-Sale",
            original_order_total_amount: 426,
            line_ordered_qty: 1,
          },
        ],
        LINE_FULFILLMENT_TYPE_GROUPED: [
          {
            name: "SHIP_2_CUSTOMER_NC",
            original_order_total_amount: 106974,
            line_ordered_qty: 106,
          },
          {
            name: "SHIP_2_CUSTOMER_LV",
            original_order_total_amount: 284477,
            line_ordered_qty: 1394,
          },
          {
            name: "SHIP_2_CUSTOMER",
            original_order_total_amount: 2005772,
            line_ordered_qty: 2862,
          },
          {
            name: "PICKUP_IN_STORE_LV",
            original_order_total_amount: 186863,
            line_ordered_qty: 439,
          },
          {
            name: "PICKUP_IN_STORE",
            original_order_total_amount: 1381634,
            line_ordered_qty: 1241,
          },
          {
            name: "PICKUP_IN_STORE_KIT",
            original_order_total_amount: 117055,
            line_ordered_qty: 59,
          },
          {
            name: "PICKUP_IN_STORE_DC",
            original_order_total_amount: 14187,
            line_ordered_qty: 18,
          },
          {
            name: "PICKUP_IN_STORE_NC",
            original_order_total_amount: 41389,
            line_ordered_qty: 41,
          },
          {
            name: "SHIP_2_CUSTOMER_KIT",
            original_order_total_amount: 179338,
            line_ordered_qty: 369,
          },
          {
            name: "SHIP_2_CUSTOMER_DC",
            original_order_total_amount: 848,
            line_ordered_qty: 1,
          },
        ],
      },
      topItemsData: {
        byVolume: [
          {
            web_category: "Z",
            brand_name: "Guitar Center",
            item_id: "L93246000000000",
            line_ordered_qty: "346",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L93246000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "LKJA",
            brand_name: "Rapco",
            item_id: "H89536000000000",
            line_ordered_qty: "200",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "H89536000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "Z",
            brand_name: "Guitar Center",
            item_id: "L93263000000000",
            line_ordered_qty: "123",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L93263000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "Z",
            brand_name: "Guitar Center",
            item_id: "L93266000000000",
            line_ordered_qty: "97",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L93266000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "Z",
            brand_name: "Guitar Center",
            item_id: "L74338000000000",
            line_ordered_qty: "90",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L74338000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "LKJA",
            brand_name: "Mogami",
            item_id: "H92438000000000",
            line_ordered_qty: "83",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "H92438000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "Z",
            brand_name: "Guitar Center",
            item_id: "L93264000000000",
            line_ordered_qty: "67",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L93264000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "Z",
            brand_name: "Guitar Center",
            item_id: "L93261000000000",
            line_ordered_qty: "58",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L93261000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "LAAAA",
            brand_name: "Ernie Ball",
            item_id: "100622000000000",
            line_ordered_qty: "51",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "100622000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "Z",
            brand_name: "Guitar Center",
            item_id: "L93245000000000",
            line_ordered_qty: "51",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L93245000000000-00-180x180.jpg                                                                      ",
          },
        ],
        byValue: [
          {
            web_category: "YAAB",
            brand_name: "QSC",
            item_id: "J51713000000000",
            original_order_total_amount: "115492.83",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "J51713000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "YAAB",
            brand_name: "RCF",
            item_id: "L84993000000000",
            original_order_total_amount: "52665.62",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L84993000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "YCB",
            brand_name: "Pioneer DJ",
            item_id: "L77643000000001",
            original_order_total_amount: "46314.88",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L77643000000001-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "YBDA",
            brand_name: "ADAM Audio",
            item_id: "L93323000000000",
            original_order_total_amount: "44421.00",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L93323000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "YAAB",
            brand_name: "QSC",
            item_id: "J51664000000000",
            original_order_total_amount: "38305.80",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "J51664000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "Z",
            brand_name: "Guitar Center",
            item_id: "L93246000000000",
            original_order_total_amount: "36684.52",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L93246000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "YAEB",
            brand_name: "QSC",
            item_id: "L68677000000000",
            original_order_total_amount: "35363.40",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L68677000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "YAAB",
            brand_name: "QSC",
            item_id: "L35652000000000",
            original_order_total_amount: "34447.38",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L35652000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "Z",
            brand_name: "Gift Card",
            item_id: "L96286000000000",
            original_order_total_amount: "34239.74",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L96286000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "YAAB",
            brand_name: "Harbinger",
            item_id: "L46546000000001",
            original_order_total_amount: "26351.03",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L46546000000001-00-180x180.jpg                                                                      ",
          },
        ],
      },
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
