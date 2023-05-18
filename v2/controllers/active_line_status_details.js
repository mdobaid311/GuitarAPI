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
        original_order_total_amount: "1150469.10",
        line_ordered_qty: "3202",
        line_margin: 237166,
        line_inventory_cost: 386245,
        shipping_cost: 3720,
        discount: 27891,
        tax: 36428,
      },
      chartSeries: {
        enterprise_key: "MF",
        series: [
          {
            enterprise_key: "MF",
            datetime: "2023-01-01 00:00:00",
            original_order_total_amount: 8713.65,
            line_ordered_qty: 24,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-01-01 01:00:00",
            original_order_total_amount: 2414.94,
            line_ordered_qty: 12,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-01-01 02:00:00",
            original_order_total_amount: 8270.53,
            line_ordered_qty: 19,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-01-01 03:00:00",
            original_order_total_amount: 6732.06,
            line_ordered_qty: 11,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-01-01 04:00:00",
            original_order_total_amount: 4191.96,
            line_ordered_qty: 21,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-01-01 05:00:00",
            original_order_total_amount: 8276.74,
            line_ordered_qty: 38,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-01-01 06:00:00",
            original_order_total_amount: 11938.09,
            line_ordered_qty: 59,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-01-01 07:00:00",
            original_order_total_amount: 30513.1,
            line_ordered_qty: 127,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-01-01 08:00:00",
            original_order_total_amount: 57384.23,
            line_ordered_qty: 149,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-01-01 09:00:00",
            original_order_total_amount: 39186.96,
            line_ordered_qty: 171,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-01-01 10:00:00",
            original_order_total_amount: 83012.49,
            line_ordered_qty: 203,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-01-01 11:00:00",
            original_order_total_amount: 72993.89,
            line_ordered_qty: 226,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-01-01 12:00:00",
            original_order_total_amount: 61430.96,
            line_ordered_qty: 150,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-01-01 13:00:00",
            original_order_total_amount: 86394.29,
            line_ordered_qty: 233,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-01-01 14:00:00",
            original_order_total_amount: 77353.42,
            line_ordered_qty: 189,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-01-01 15:00:00",
            original_order_total_amount: 119097.64,
            line_ordered_qty: 244,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-01-01 16:00:00",
            original_order_total_amount: 132696.02,
            line_ordered_qty: 557,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-01-01 17:00:00",
            original_order_total_amount: 54944.48,
            line_ordered_qty: 177,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-01-01 18:00:00",
            original_order_total_amount: 81606.89,
            line_ordered_qty: 172,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-01-01 19:00:00",
            original_order_total_amount: 48296.03,
            line_ordered_qty: 124,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-01-01 20:00:00",
            original_order_total_amount: 58588.55,
            line_ordered_qty: 110,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-01-01 21:00:00",
            original_order_total_amount: 48856.39,
            line_ordered_qty: 99,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-01-01 22:00:00",
            original_order_total_amount: 27708.16,
            line_ordered_qty: 48,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-01-01 23:00:00",
            original_order_total_amount: 19867.63,
            line_ordered_qty: 39,
          },
        ],
      },
      salesCategories: {
        name: "MF",
        original_order_total_amount: 1150465,
        line_ordered_qty: 3202,
        ORDER_CAPTURE_CHANNEL_GROUPED: [
          {
            name: "CallCenter",
            original_order_total_amount: 343800,
            line_ordered_qty: 339,
          },
          {
            name: "Web",
            original_order_total_amount: 806665,
            line_ordered_qty: 2863,
          },
        ],
        LINE_FULFILLMENT_TYPE_GROUPED: [
          {
            name: "SHIP_2_CUSTOMER",
            original_order_total_amount: 868286,
            line_ordered_qty: 1356,
          },
          {
            name: "SHIP_2_CUSTOMER_DC",
            original_order_total_amount: 25558,
            line_ordered_qty: 59,
          },
          {
            name: "SHIP_2_CUSTOMER_KIT",
            original_order_total_amount: 107010,
            line_ordered_qty: 647,
          },
          {
            name: "SHIP_2_CUSTOMER_LV",
            original_order_total_amount: 149611,
            line_ordered_qty: 1140,
          },
        ],
      },
      topItemsData: [
        {
          web_category: "Z",
          brand_name: "Guitar Center",
          item_id: "L93246000000000",
          line_ordered_qty: "243",
          original_order_total_amount: "25138.56",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "L93246000000000-00-180x180.jpg                                                                      ",
        },
        {
          web_category: "NEA",
          brand_name: "Guitar Center",
          item_id: "L79218000000000",
          line_ordered_qty: "231",
          original_order_total_amount: "80122.35",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "L79218000000000-00-180x180.jpg                                                                      ",
        },
        {
          web_category: "Z",
          brand_name: "Guitar Center",
          item_id: "L93263000000000",
          line_ordered_qty: "103",
          original_order_total_amount: "12656.25",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "L93263000000000-00-180x180.jpg                                                                      ",
        },
        {
          web_category: "Z",
          brand_name: "Guitar Center",
          item_id: "L93266000000000",
          line_ordered_qty: "87",
          original_order_total_amount: "9877.00",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "L93266000000000-00-180x180.jpg                                                                      ",
        },
        {
          web_category: "Z",
          brand_name: "Guitar Center",
          item_id: "L74338000000000",
          line_ordered_qty: "78",
          original_order_total_amount: "8331.75",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "L74338000000000-00-180x180.jpg                                                                      ",
        },
        {
          web_category: "Z",
          brand_name: "Guitar Center",
          item_id: "L93261000000000",
          line_ordered_qty: "60",
          original_order_total_amount: "6349.25",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "L93261000000000-00-180x180.jpg                                                                      ",
        },
        {
          web_category: "Z",
          brand_name: "Guitar Center",
          item_id: "L93265000000000",
          line_ordered_qty: "59",
          original_order_total_amount: "7997.51",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "L93265000000000-00-180x180.jpg                                                                      ",
        },
        {
          web_category: "Z",
          brand_name: "Guitar Center",
          item_id: "L93264000000000",
          line_ordered_qty: "53",
          original_order_total_amount: "6772.50",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "L93264000000000-00-180x180.jpg                                                                      ",
        },
        {
          web_category: "LIAA",
          brand_name: "Musician's Gear",
          item_id: "451058000001000",
          line_ordered_qty: "52",
          original_order_total_amount: "5371.33",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "451058000001000-00-180x180.jpg                                                                      ",
        },
        {
          web_category: "JOYDK",
          brand_name: "Alfred",
          item_id: "H63061000000000",
          line_ordered_qty: "52",
          original_order_total_amount: "959.46",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "H63061000000000-00-180x180.jpg                                                                      ",
        },
      ],
    },
    GCData: {
      name: "GC",
      totalStats: {
        enterprise_key: "GC",
        original_order_total_amount: "4046677.00",
        line_ordered_qty: "6925",
        line_margin: 750467,
        line_inventory_cost: 962916,
        shipping_cost: 18581,
        discount: 24059,
        tax: 81929,
      },
      chartSeries: {
        enterprise_key: "GC",
        series: [
          {
            enterprise_key: "GC",
            datetime: "2023-01-01 00:00:00",
            original_order_total_amount: 59106.5,
            line_ordered_qty: 73,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-01-01 01:00:00",
            original_order_total_amount: 124826.47,
            line_ordered_qty: 768,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-01-01 02:00:00",
            original_order_total_amount: 82039.33,
            line_ordered_qty: 66,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-01-01 03:00:00",
            original_order_total_amount: 8239.98,
            line_ordered_qty: 18,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-01-01 04:00:00",
            original_order_total_amount: 6965.31,
            line_ordered_qty: 20,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-01-01 05:00:00",
            original_order_total_amount: 14501.26,
            line_ordered_qty: 61,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-01-01 06:00:00",
            original_order_total_amount: 48148.14,
            line_ordered_qty: 198,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-01-01 07:00:00",
            original_order_total_amount: 98300.11,
            line_ordered_qty: 181,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-01-01 08:00:00",
            original_order_total_amount: 113652.91,
            line_ordered_qty: 286,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-01-01 09:00:00",
            original_order_total_amount: 1227680.93,
            line_ordered_qty: 375,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-01-01 10:00:00",
            original_order_total_amount: 241351.79,
            line_ordered_qty: 492,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-01-01 11:00:00",
            original_order_total_amount: 252954.57,
            line_ordered_qty: 449,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-01-01 12:00:00",
            original_order_total_amount: 223381.92,
            line_ordered_qty: 470,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-01-01 13:00:00",
            original_order_total_amount: 251599.81,
            line_ordered_qty: 504,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-01-01 14:00:00",
            original_order_total_amount: 248386.79,
            line_ordered_qty: 466,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-01-01 15:00:00",
            original_order_total_amount: 206497.37,
            line_ordered_qty: 418,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-01-01 16:00:00",
            original_order_total_amount: 190878.89,
            line_ordered_qty: 448,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-01-01 17:00:00",
            original_order_total_amount: 113723.58,
            line_ordered_qty: 321,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-01-01 18:00:00",
            original_order_total_amount: 98917.08,
            line_ordered_qty: 299,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-01-01 19:00:00",
            original_order_total_amount: 112419.95,
            line_ordered_qty: 320,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-01-01 20:00:00",
            original_order_total_amount: 137961.37,
            line_ordered_qty: 278,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-01-01 21:00:00",
            original_order_total_amount: 111053.02,
            line_ordered_qty: 224,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-01-01 22:00:00",
            original_order_total_amount: 38175.58,
            line_ordered_qty: 99,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-01-01 23:00:00",
            original_order_total_amount: 35914.34,
            line_ordered_qty: 91,
          },
        ],
      },
      salesCategories: {
        name: "GC",
        original_order_total_amount: 4046665,
        line_ordered_qty: 6925,
        ORDER_CAPTURE_CHANNEL_GROUPED: [
          {
            name: "CallCenter",
            original_order_total_amount: 300019,
            line_ordered_qty: 248,
          },
          {
            name: "GCSTORE",
            original_order_total_amount: 642210,
            line_ordered_qty: 754,
          },
          {
            name: "Web",
            original_order_total_amount: 3104436,
            line_ordered_qty: 5923,
          },
        ],
        LINE_FULFILLMENT_TYPE_GROUPED: [
          {
            name: "PICKUP_IN_STORE",
            original_order_total_amount: 687571,
            line_ordered_qty: 954,
          },
          {
            name: "PICKUP_IN_STORE_DC",
            original_order_total_amount: 3555,
            line_ordered_qty: 9,
          },
          {
            name: "PICKUP_IN_STORE_LV",
            original_order_total_amount: 47818,
            line_ordered_qty: 313,
          },
          {
            name: "PICKUP_IN_STORE_NC",
            original_order_total_amount: 20181,
            line_ordered_qty: 57,
          },
          {
            name: "SHIP_2_CUSTOMER",
            original_order_total_amount: 1642156,
            line_ordered_qty: 3117,
          },
          {
            name: "SHIP_2_CUSTOMER_DC",
            original_order_total_amount: 25519,
            line_ordered_qty: 9,
          },
          {
            name: "SHIP_2_CUSTOMER_KIT",
            original_order_total_amount: 1259770,
            line_ordered_qty: 444,
          },
          {
            name: "SHIP_2_CUSTOMER_LV",
            original_order_total_amount: 231959,
            line_ordered_qty: 1793,
          },
          {
            name: "SHIP_2_CUSTOMER_NC",
            original_order_total_amount: 69234,
            line_ordered_qty: 151,
          },
          {
            name: "PICKUP_IN_STORE_KIT",
            original_order_total_amount: 58902,
            line_ordered_qty: 78,
          },
        ],
      },
      topItemsData: [
        {
          web_category: "LAABA",
          brand_name: "Ernie Ball",
          item_id: "L92558000000000",
          line_ordered_qty: "384",
          original_order_total_amount: "2211.96",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "L92558000000000-00-180x180.jpg                                                                      ",
        },
        {
          web_category: "TAU",
          brand_name: "Fender",
          item_id: "L86978000001000",
          line_ordered_qty: "60",
          original_order_total_amount: "8332.56",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "L86978000001000-00-180x180.jpg                                                                      ",
        },
        {
          web_category: "LIAA",
          brand_name: "Musician's Gear",
          item_id: "451058000001000",
          line_ordered_qty: "34",
          original_order_total_amount: "1486.36",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "451058000001000-00-180x180.jpg                                                                      ",
        },
        {
          web_category: "LCAAD",
          brand_name: "Promark",
          item_id: "L83432000001001",
          line_ordered_qty: "32",
          original_order_total_amount: "2474.12",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "L83432000001001-00-180x180.jpg                                                                      ",
        },
        {
          web_category: "LAABA",
          brand_name: "D'Addario",
          item_id: "100215000000000",
          line_ordered_qty: "31",
          original_order_total_amount: "522.54",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "100215000000000-00-180x180.jpg                                                                      ",
        },
        {
          web_category: "LROAAI",
          brand_name: "Fender",
          item_id: "L70352000003000",
          line_ordered_qty: "27",
          original_order_total_amount: "5350.40",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "L70352000003000-00-180x180.jpg                                                                      ",
        },
        {
          web_category: "LRABB",
          brand_name: "Fender",
          item_id: "H94518000000000",
          line_ordered_qty: "26",
          original_order_total_amount: "263.22",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "H94518000000000-00-180x180.jpg                                                                      ",
        },
        {
          web_category: "LAAAA",
          brand_name: "Musician's Gear",
          item_id: "101808000000000",
          line_ordered_qty: "25",
          original_order_total_amount: "61.11",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "101808000000000-00-180x180.jpg                                                                      ",
        },
        {
          web_category: "LAAAA",
          brand_name: "Ernie Ball",
          item_id: "H99157000000000",
          line_ordered_qty: "24",
          original_order_total_amount: "4624.16",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "H99157000000000-00-180x180.jpg                                                                      ",
        },
        {
          web_category: "LCAAA",
          brand_name: "Promark",
          item_id: "443030000281021",
          line_ordered_qty: "24",
          original_order_total_amount: "266.80",
          image_location: "http://media.guitarcenter.com/is/image/MMGS7",
          image_id:
            "443030000281021-00-180x180.jpg                                                                      ",
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
