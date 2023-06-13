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
  const data =  {
    "MFData": {
        "name": "MF",
        "totalStats": {
            "enterprise_key": "MF",
            "original_order_total_amount": 505254,
            "line_price_total": "516937.36",
            "line_ordered_qty": "2642",
            "line_margin": 225601,
            "line_inventory_cost": 369355,
            "shipping_cost": 2407,
            "discount": 12676,
            "tax": 14865
        },
        "chartSeries": {
            "enterprise_key": "MF",
            "series": [
                {
                    "enterprise_key": "MF",
                    "datetime": "Mar-30",
                    "original_order_total_amount": 12132.49,
                    "line_ordered_qty": 31
                },
                {
                    "enterprise_key": "MF",
                    "datetime": "01:00",
                    "original_order_total_amount": 8684.7,
                    "line_ordered_qty": 15
                },
                {
                    "enterprise_key": "MF",
                    "datetime": "02:00",
                    "original_order_total_amount": 12549.97,
                    "line_ordered_qty": 21
                },
                {
                    "enterprise_key": "MF",
                    "datetime": "03:00",
                    "original_order_total_amount": 1597.91,
                    "line_ordered_qty": 12
                },
                {
                    "enterprise_key": "MF",
                    "datetime": "04:00",
                    "original_order_total_amount": 5560.16,
                    "line_ordered_qty": 22
                },
                {
                    "enterprise_key": "MF",
                    "datetime": "05:00",
                    "original_order_total_amount": 5897.75,
                    "line_ordered_qty": 40
                },
                {
                    "enterprise_key": "MF",
                    "datetime": "06:00",
                    "original_order_total_amount": 32194.69,
                    "line_ordered_qty": 167
                },
                {
                    "enterprise_key": "MF",
                    "datetime": "07:00",
                    "original_order_total_amount": 49965.62,
                    "line_ordered_qty": 182
                },
                {
                    "enterprise_key": "MF",
                    "datetime": "08:00",
                    "original_order_total_amount": 69064.74,
                    "line_ordered_qty": 182
                },
                {
                    "enterprise_key": "MF",
                    "datetime": "09:00",
                    "original_order_total_amount": 97140.46,
                    "line_ordered_qty": 217
                },
                {
                    "enterprise_key": "MF",
                    "datetime": "10:00",
                    "original_order_total_amount": 72345.8,
                    "line_ordered_qty": 147
                },
                {
                    "enterprise_key": "MF",
                    "datetime": "11:00",
                    "original_order_total_amount": 96335.47,
                    "line_ordered_qty": 206
                },
                {
                    "enterprise_key": "MF",
                    "datetime": "12:00",
                    "original_order_total_amount": 130239.86,
                    "line_ordered_qty": 215
                },
                {
                    "enterprise_key": "MF",
                    "datetime": "13:00",
                    "original_order_total_amount": 116503.92,
                    "line_ordered_qty": 207
                },
                {
                    "enterprise_key": "MF",
                    "datetime": "14:00",
                    "original_order_total_amount": 127628.04,
                    "line_ordered_qty": 148
                },
                {
                    "enterprise_key": "MF",
                    "datetime": "15:00",
                    "original_order_total_amount": 62676.81,
                    "line_ordered_qty": 119
                },
                {
                    "enterprise_key": "MF",
                    "datetime": "16:00",
                    "original_order_total_amount": 51011.89,
                    "line_ordered_qty": 112
                },
                {
                    "enterprise_key": "MF",
                    "datetime": "17:00",
                    "original_order_total_amount": 34344.86,
                    "line_ordered_qty": 137
                },
                {
                    "enterprise_key": "MF",
                    "datetime": "18:00",
                    "original_order_total_amount": 53109.91,
                    "line_ordered_qty": 150
                },
                {
                    "enterprise_key": "MF",
                    "datetime": "19:00",
                    "original_order_total_amount": 23870.36,
                    "line_ordered_qty": 111
                },
                {
                    "enterprise_key": "MF",
                    "datetime": "20:00",
                    "original_order_total_amount": 21705.91,
                    "line_ordered_qty": 76
                },
                {
                    "enterprise_key": "MF",
                    "datetime": "21:00",
                    "original_order_total_amount": 29122.41,
                    "line_ordered_qty": 71
                },
                {
                    "enterprise_key": "MF",
                    "datetime": "22:00",
                    "original_order_total_amount": 17602.94,
                    "line_ordered_qty": 26
                },
                {
                    "enterprise_key": "MF",
                    "datetime": "23:00",
                    "original_order_total_amount": 11489.76,
                    "line_ordered_qty": 28
                }
            ]
        },
        "salesCategories": {
            "name": "MF",
            "original_order_total_amount": 1142764,
            "line_ordered_qty": 2642,
            "ORDER_CAPTURE_CHANNEL_GROUPED": [
                {
                    "name": "CallCenter",
                    "original_order_total_amount": 571968,
                    "line_ordered_qty": 713
                },
                {
                    "name": "Web",
                    "original_order_total_amount": 567868,
                    "line_ordered_qty": 1927
                },
                {
                    "name": null,
                    "original_order_total_amount": 2928,
                    "line_ordered_qty": 2
                }
            ],
            "ITEM_INFO_GROUPED": [
                {
                    "name": "Regular",
                    "original_order_total_amount": 898848,
                    "line_ordered_qty": 1358
                },
                {
                    "name": "Warranty",
                    "original_order_total_amount": 26058,
                    "line_ordered_qty": 26
                },
                {
                    "name": "E-Certificate",
                    "original_order_total_amount": 150,
                    "line_ordered_qty": 3
                },
                {
                    "name": "Vendor-Fulfilled",
                    "original_order_total_amount": 8867,
                    "line_ordered_qty": 5
                },
                {
                    "name": "Used-And-Vintage",
                    "original_order_total_amount": 45965,
                    "line_ordered_qty": 105
                },
                {
                    "name": "Low-Value-Sale",
                    "original_order_total_amount": 159508,
                    "line_ordered_qty": 1137
                },
                {
                    "name": "Digital-Download",
                    "original_order_total_amount": 1554,
                    "line_ordered_qty": 7
                },
                {
                    "name": "Free-Gift-Item",
                    "original_order_total_amount": 1814,
                    "line_ordered_qty": 1
                }
            ],
            "LINE_FULFILLMENT_TYPE_GROUPED": [
                {
                    "name": "Ship to Customer",
                    "original_order_total_amount": 1142764,
                    "line_ordered_qty": 2642
                }
            ]
        },
        "topItemsData": {
            "byVolume": [
                {
                    "web_category": "6 String Sets for Electric Guitar",
                    "brand_name": "Musician's Gear",
                    "item_id": "101811000000000",
                    "line_ordered_qty": "55",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "101811000000000-00-180x180.jpg                                                                      "
                },
                {
                    "web_category": "6 String Acoustic Guitars",
                    "brand_name": "Alvarez",
                    "item_id": "L30264000001000",
                    "line_ordered_qty": "35",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "L30264000001000-00-180x180.jpg                                                                      "
                },
                {
                    "web_category": "Tuners",
                    "brand_name": "Snark",
                    "item_id": "J01948000001000",
                    "line_ordered_qty": "22",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "J01948000001000-00-180x180.jpg                                                                      "
                },
                {
                    "web_category": "6 String Sets for Electric Guitar",
                    "brand_name": "Ernie Ball",
                    "item_id": "100621000000000",
                    "line_ordered_qty": "21",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "100621000000000-00-180x180.jpg                                                                      "
                },
                {
                    "web_category": "Instrument Cables",
                    "brand_name": "Musician's Gear",
                    "item_id": "361705000001154",
                    "line_ordered_qty": "20",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "361705000001154-00-180x180.jpg                                                                      "
                },
                {
                    "web_category": "6 String Acoustic Guitars",
                    "brand_name": "Rogue",
                    "item_id": "423794000010000",
                    "line_ordered_qty": "18",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "423794000010000-00-180x180.jpg                                                                      "
                },
                {
                    "web_category": "6 String Sets for Electric Guitar",
                    "brand_name": "Ernie Ball",
                    "item_id": "100622000000000",
                    "line_ordered_qty": "18",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "100622000000000-00-180x180.jpg                                                                      "
                },
                {
                    "web_category": "Tambourines",
                    "brand_name": "LMI",
                    "item_id": "443166000003611",
                    "line_ordered_qty": "18",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "443166000003611-00-180x180.jpg                                                                      "
                },
                {
                    "web_category": "Tambourines",
                    "brand_name": "LMI",
                    "item_id": "443166000007611",
                    "line_ordered_qty": "17",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "443166000007611-00-180x180.jpg                                                                      "
                },
                {
                    "web_category": "Tambourines",
                    "brand_name": "LMI",
                    "item_id": "443166000218611",
                    "line_ordered_qty": "17",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "443166000218611-00-180x180.jpg                                                                      "
                }
            ],
            "byValue": [
                {
                    "web_category": "4 String Electric Bass",
                    "brand_name": "Ernie Ball Music Man",
                    "item_id": "M00559000001000",
                    "original_order_total_amount": "18239.85",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "M00559000001000-00-180x180.jpg                                                                      "
                },
                {
                    "web_category": "4 String Electric Bass",
                    "brand_name": "Ernie Ball Music Man",
                    "item_id": "118999960",
                    "original_order_total_amount": "18239.85",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "000000118999960-00-180x180.jpg                                                                      "
                },
                {
                    "web_category": "Cases for Solid Body Electric Guitars",
                    "brand_name": "Ernie Ball Music Man",
                    "item_id": "118999796",
                    "original_order_total_amount": "18239.85",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "000000118999796-00-180x180.jpg                                                                      "
                },
                {
                    "web_category": "Powered PA Speakers",
                    "brand_name": "Alto",
                    "item_id": "L94619000000000",
                    "original_order_total_amount": "14822.40",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "L94619000000000-00-180x180.jpg                                                                      "
                },
                {
                    "web_category": "6 String Acoustic Guitars",
                    "brand_name": "Alvarez",
                    "item_id": "L30264000001000",
                    "original_order_total_amount": "14506.78",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "L30264000001000-00-180x180.jpg                                                                      "
                },
                {
                    "web_category": "DJ Controllers & Interfaces",
                    "brand_name": "Pioneer DJ",
                    "item_id": "M00278000000001",
                    "original_order_total_amount": "12365.39",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "M00278000000001-00-180x180.jpg                                                                      "
                },
                {
                    "web_category": "Condenser Microphones",
                    "brand_name": "Sterling Audio",
                    "item_id": "L21720000001000",
                    "original_order_total_amount": "11269.74",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "L21720000001000-00-180x180.jpg                                                                      "
                },
                {
                    "web_category": "Cases for Acoustic Guitars",
                    "brand_name": "Gibson",
                    "item_id": "101726073",
                    "original_order_total_amount": "10494.59",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "000000101726073-00-180x180.jpg                                                                      "
                },
                {
                    "web_category": "Mandolins",
                    "brand_name": "Gibson",
                    "item_id": "101726065",
                    "original_order_total_amount": "10494.59",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "000000101726065-00-180x180.jpg                                                                      "
                },
                {
                    "web_category": "Mandolins",
                    "brand_name": "Gibson",
                    "item_id": "517393000327000",
                    "original_order_total_amount": "10494.59",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "517393000327000-00-180x180.jpg                                                                      "
                }
            ]
        }
    },
    "GCData": {
        "name": "GC",
        "totalStats": {
            "enterprise_key": "GC",
            "original_order_total_amount": 2404683,
            "line_price_total": "2332722.19",
            "line_ordered_qty": "9553",
            "line_margin": 1093032,
            "line_inventory_cost": 1436186,
            "shipping_cost": 15891,
            "discount": 18141,
            "tax": 66441
        },
        "chartSeries": {
            "enterprise_key": "GC",
            "series": [
                {
                    "enterprise_key": "GC",
                    "datetime": "Mar-30",
                    "original_order_total_amount": 13812.62,
                    "line_ordered_qty": 47
                },
                {
                    "enterprise_key": "GC",
                    "datetime": "01:00",
                    "original_order_total_amount": 70083.86,
                    "line_ordered_qty": 368
                },
                {
                    "enterprise_key": "GC",
                    "datetime": "02:00",
                    "original_order_total_amount": 19064.65,
                    "line_ordered_qty": 38
                },
                {
                    "enterprise_key": "GC",
                    "datetime": "03:00",
                    "original_order_total_amount": 20242.38,
                    "line_ordered_qty": 50
                },
                {
                    "enterprise_key": "GC",
                    "datetime": "04:00",
                    "original_order_total_amount": 13713.66,
                    "line_ordered_qty": 50
                },
                {
                    "enterprise_key": "GC",
                    "datetime": "05:00",
                    "original_order_total_amount": 128038.34,
                    "line_ordered_qty": 777
                },
                {
                    "enterprise_key": "GC",
                    "datetime": "06:00",
                    "original_order_total_amount": 131237.51,
                    "line_ordered_qty": 200
                },
                {
                    "enterprise_key": "GC",
                    "datetime": "07:00",
                    "original_order_total_amount": 170574.72,
                    "line_ordered_qty": 283
                },
                {
                    "enterprise_key": "GC",
                    "datetime": "08:00",
                    "original_order_total_amount": 228288.52,
                    "line_ordered_qty": 390
                },
                {
                    "enterprise_key": "GC",
                    "datetime": "09:00",
                    "original_order_total_amount": 686961.49,
                    "line_ordered_qty": 812
                },
                {
                    "enterprise_key": "GC",
                    "datetime": "10:00",
                    "original_order_total_amount": 482962.79,
                    "line_ordered_qty": 629
                },
                {
                    "enterprise_key": "GC",
                    "datetime": "11:00",
                    "original_order_total_amount": 571768.63,
                    "line_ordered_qty": 692
                },
                {
                    "enterprise_key": "GC",
                    "datetime": "12:00",
                    "original_order_total_amount": 386922.13,
                    "line_ordered_qty": 699
                },
                {
                    "enterprise_key": "GC",
                    "datetime": "13:00",
                    "original_order_total_amount": 386361.7,
                    "line_ordered_qty": 627
                },
                {
                    "enterprise_key": "GC",
                    "datetime": "14:00",
                    "original_order_total_amount": 488314.86,
                    "line_ordered_qty": 634
                },
                {
                    "enterprise_key": "GC",
                    "datetime": "15:00",
                    "original_order_total_amount": 366623.79,
                    "line_ordered_qty": 846
                },
                {
                    "enterprise_key": "GC",
                    "datetime": "16:00",
                    "original_order_total_amount": 360508.58,
                    "line_ordered_qty": 605
                },
                {
                    "enterprise_key": "GC",
                    "datetime": "17:00",
                    "original_order_total_amount": 289678.57,
                    "line_ordered_qty": 497
                },
                {
                    "enterprise_key": "GC",
                    "datetime": "18:00",
                    "original_order_total_amount": 239069.54,
                    "line_ordered_qty": 341
                },
                {
                    "enterprise_key": "GC",
                    "datetime": "19:00",
                    "original_order_total_amount": 135284.77,
                    "line_ordered_qty": 260
                },
                {
                    "enterprise_key": "GC",
                    "datetime": "20:00",
                    "original_order_total_amount": 141169.49,
                    "line_ordered_qty": 254
                },
                {
                    "enterprise_key": "GC",
                    "datetime": "21:00",
                    "original_order_total_amount": 44246.64,
                    "line_ordered_qty": 154
                },
                {
                    "enterprise_key": "GC",
                    "datetime": "22:00",
                    "original_order_total_amount": 47712.13,
                    "line_ordered_qty": 216
                },
                {
                    "enterprise_key": "GC",
                    "datetime": "23:00",
                    "original_order_total_amount": 96676.05,
                    "line_ordered_qty": 84
                }
            ]
        },
        "salesCategories": {
            "name": "GC",
            "original_order_total_amount": 5519269,
            "line_ordered_qty": 9553,
            "ORDER_CAPTURE_CHANNEL_GROUPED": [
                {
                    "name": "CallCenter",
                    "original_order_total_amount": 1153835,
                    "line_ordered_qty": 1272
                },
                {
                    "name": "Web",
                    "original_order_total_amount": 2185218,
                    "line_ordered_qty": 6273
                },
                {
                    "name": "GCSTORE",
                    "original_order_total_amount": 2180216,
                    "line_ordered_qty": 2008
                }
            ],
            "ITEM_INFO_GROUPED": [
                {
                    "name": "Free-Gift-Item",
                    "original_order_total_amount": 8081,
                    "line_ordered_qty": 7
                },
                {
                    "name": "Regular",
                    "original_order_total_amount": 3676428,
                    "line_ordered_qty": 4276
                },
                {
                    "name": "Warranty",
                    "original_order_total_amount": 561251,
                    "line_ordered_qty": 396
                },
                {
                    "name": "COA-Credit",
                    "original_order_total_amount": 35365,
                    "line_ordered_qty": 17
                },
                {
                    "name": "Digital-Download",
                    "original_order_total_amount": 5862,
                    "line_ordered_qty": 20
                },
                {
                    "name": "Low-Value-Sale",
                    "original_order_total_amount": 517420,
                    "line_ordered_qty": 2466
                },
                {
                    "name": "Used-And-Vintage",
                    "original_order_total_amount": 523721,
                    "line_ordered_qty": 891
                },
                {
                    "name": "Vendor-Fulfilled",
                    "original_order_total_amount": 159,
                    "line_ordered_qty": 5
                },
                {
                    "name": "Lessons",
                    "original_order_total_amount": 165790,
                    "line_ordered_qty": 1282
                },
                {
                    "name": "Registration",
                    "original_order_total_amount": 25192,
                    "line_ordered_qty": 193
                }
            ],
            "LINE_FULFILLMENT_TYPE_GROUPED": [
                {
                    "name": "Ship to Customer",
                    "original_order_total_amount": 3128309,
                    "line_ordered_qty": 7046
                },
                {
                    "name": "Pickup in Store",
                    "original_order_total_amount": 2390960,
                    "line_ordered_qty": 2507
                }
            ]
        },
        "topItemsData": {
            "byVolume": [
                {
                    "web_category": "Vault",
                    "brand_name": "Guitar Center",
                    "item_id": "L93246000000000",
                    "line_ordered_qty": "436",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "L93246000000000-00-180x180.jpg                                                                      "
                },
                {
                    "web_category": "Microphone Stands",
                    "brand_name": "Musician's Gear",
                    "item_id": "J56505000001000",
                    "line_ordered_qty": "345",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "J56505000001000-00-180x180.jpg                                                                      "
                },
                {
                    "web_category": "Vault",
                    "brand_name": "Guitar Center",
                    "item_id": "L74338000000000",
                    "line_ordered_qty": "193",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "L74338000000000-00-180x180.jpg                                                                      "
                },
                {
                    "web_category": "Microphone Stands",
                    "brand_name": "Musician's Gear",
                    "item_id": "K46092000001000",
                    "line_ordered_qty": "167",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "K46092000001000-00-180x180.jpg                                                                      "
                },
                {
                    "web_category": "Bulk Cable and Kits",
                    "brand_name": "Mogami",
                    "item_id": "H92436000000000",
                    "line_ordered_qty": "162",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "H92436000000000-00-180x180.jpg                                                                      "
                },
                {
                    "web_category": "Classroom Wind Instruments",
                    "brand_name": "Trophy",
                    "item_id": "464232000000000",
                    "line_ordered_qty": "160",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "464232000000000-00-180x180.jpg                                                                      "
                },
                {
                    "web_category": "Vault",
                    "brand_name": "Guitar Center",
                    "item_id": "L93263000000000",
                    "line_ordered_qty": "153",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "L93263000000000-00-180x180.jpg                                                                      "
                },
                {
                    "web_category": "Vault",
                    "brand_name": "Guitar Center",
                    "item_id": "L93266000000000",
                    "line_ordered_qty": "104",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "L93266000000000-00-180x180.jpg                                                                      "
                },
                {
                    "web_category": "Vault",
                    "brand_name": "Guitar Center",
                    "item_id": "L93264000000000",
                    "line_ordered_qty": "95",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "L93264000000000-00-180x180.jpg                                                                      "
                },
                {
                    "web_category": "Vault",
                    "brand_name": "Guitar Center",
                    "item_id": "L93261000000000",
                    "line_ordered_qty": "85",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "L93261000000000-00-180x180.jpg                                                                      "
                }
            ],
            "byValue": [
                {
                    "web_category": "Powered PA Speakers",
                    "brand_name": "QSC",
                    "item_id": "J51713000000000",
                    "original_order_total_amount": "190468.46",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "J51713000000000-00-180x180.jpg                                                                      "
                },
                {
                    "web_category": "GC Live Sound & DJ Warranties",
                    "brand_name": "Warranty",
                    "item_id": "H67782000003000",
                    "original_order_total_amount": "119626.92",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "H67782000003000-00-180x180.jpg                                                                      "
                },
                {
                    "web_category": "DJ Controllers & Interfaces",
                    "brand_name": "Pioneer DJ",
                    "item_id": "M00278000000001",
                    "original_order_total_amount": "84815.11",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "M00278000000001-00-180x180.jpg                                                                      "
                },
                {
                    "web_category": "Powered Stage Subwoofers",
                    "brand_name": "QSC",
                    "item_id": "L68677000000000",
                    "original_order_total_amount": "77326.97",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "L68677000000000-00-180x180.jpg                                                                      "
                },
                {
                    "web_category": "Powered PA Speakers",
                    "brand_name": "Electro-Voice",
                    "item_id": "L44024000000001",
                    "original_order_total_amount": "60503.02",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "L44024000000001-00-180x180.jpg                                                                      "
                },
                {
                    "web_category": "DJ CD & Media Players",
                    "brand_name": "Pioneer DJ",
                    "item_id": "L77643000000001",
                    "original_order_total_amount": "56001.33",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "L77643000000001-00-180x180.jpg                                                                      "
                },
                {
                    "web_category": "Vault",
                    "brand_name": "Guitar Center",
                    "item_id": "L93246000000000",
                    "original_order_total_amount": "45877.22",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "L93246000000000-00-180x180.jpg                                                                      "
                },
                {
                    "web_category": "Vault",
                    "brand_name": "Gift Card",
                    "item_id": "L96286000000000",
                    "original_order_total_amount": "35366.77",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "L96286000000000-00-180x180.jpg                                                                      "
                },
                {
                    "web_category": "GC Live Sound & DJ Warranties",
                    "brand_name": "Warranty",
                    "item_id": "H67952000003000",
                    "original_order_total_amount": "31524.96",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "H67952000003000-00-180x180.jpg                                                                      "
                },
                {
                    "web_category": "GC Live Sound & DJ Warranties",
                    "brand_name": "Warranty",
                    "item_id": "H67790000001000",
                    "original_order_total_amount": "27621.44",
                    "image_location": "http://media.guitarcenter.com/is/image/MMGS7",
                    "image_id": "H67790000001000-00-180x180.jpg                                                                      "
                }
            ]
        }
    }
}
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
