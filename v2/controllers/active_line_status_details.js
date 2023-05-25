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
        original_order_total_amount: 46333872,
        line_price_total: "60173785.57",
        line_ordered_qty: "395582",
        line_margin: 27491991,
        line_inventory_cost: 40108841,
        shipping_cost: 299223,
        discount: 2164187,
        tax: 1674492,
      },
      chartSeries: {
        enterprise_key: "MF",
        series: [
          {
            enterprise_key: "MF",
            datetime: "2023-03-01 00:00",
            original_order_total_amount: 37063374.32,
            line_ordered_qty: 102829,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-02-01 00:00",
            original_order_total_amount: 36133862.29,
            line_ordered_qty: 92309,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-04-01 00:00",
            original_order_total_amount: 32410145.49,
            line_ordered_qty: 85856,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-01-01 00:00",
            original_order_total_amount: 33628994.66,
            line_ordered_qty: 96727,
          },
          {
            enterprise_key: "MF",
            datetime: "2023-05-01 00:00",
            original_order_total_amount: 5506899.14,
            line_ordered_qty: 17861,
          },
        ],
      },
      salesCategories: {
        name: "GC",
        original_order_total_amount: 657261167,
        line_ordered_qty: 1127199,
        ORDER_CAPTURE_CHANNEL_GROUPED: [
          {
            name: "GCSTORE",
            original_order_total_amount: 257809376,
            line_ordered_qty: 232815,
          },
          {
            name: "Web",
            original_order_total_amount: 278715715,
            line_ordered_qty: 773461,
          },
          {
            name: null,
            original_order_total_amount: 953,
            line_ordered_qty: 1,
          },
          {
            name: "CallCenter",
            original_order_total_amount: 120735123,
            line_ordered_qty: 120922,
          },
        ],
        ITEM_INFO_GROUPED: [
          {
            name: "Low-Value-Sale",
            original_order_total_amount: 64251558,
            line_ordered_qty: 280931,
          },
          {
            name: "Warranty",
            original_order_total_amount: 49488626,
            line_ordered_qty: 47203,
          },
          {
            name: "Regular",
            original_order_total_amount: 449299865,
            line_ordered_qty: 489053,
          },
          {
            name: "Free-Gift-Item",
            original_order_total_amount: 1058660,
            line_ordered_qty: 1963,
          },
          {
            name: "Digital-Download",
            original_order_total_amount: 957609,
            line_ordered_qty: 3518,
          },
          {
            name: "Vendor-Fulfilled",
            original_order_total_amount: 460479,
            line_ordered_qty: 2184,
          },
          {
            name: "Clearance-Sale",
            original_order_total_amount: 54506,
            line_ordered_qty: 55,
          },
          {
            name: "Lessons",
            original_order_total_amount: 21007908,
            line_ordered_qty: 167989,
          },
          {
            name: "Used-And-Vintage",
            original_order_total_amount: 64567275,
            line_ordered_qty: 101393,
          },
          {
            name: "GC-Gift-Card",
            original_order_total_amount: 19221,
            line_ordered_qty: 55,
          },
          {
            name: "COA-Credit",
            original_order_total_amount: 2541383,
            line_ordered_qty: 1020,
          },
          {
            name: "Registration",
            original_order_total_amount: 3554077,
            line_ordered_qty: 31835,
          },
        ],
      },
      topItemsData: {
        byVolume: [
          {
            web_category: "LKB",
            brand_name: "Gear One",
            item_id: "339877000090000",
            line_ordered_qty: "5628",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "339877000090000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "LIAA",
            brand_name: "Musician's Gear",
            item_id: "451058000001000",
            line_ordered_qty: "3495",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "451058000001000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "LAAAA",
            brand_name: "Musician's Gear",
            item_id: "101808000000000",
            line_ordered_qty: "3106",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "101808000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "LAABA",
            brand_name: "Musician's Gear",
            item_id: "101812000000000",
            line_ordered_qty: "3023",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "101812000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "LAAAA",
            brand_name: "Musician's Gear",
            item_id: "101811000000000",
            line_ordered_qty: "2510",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "101811000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "LIF",
            brand_name: "Musician's Gear",
            item_id: "451051000001000",
            line_ordered_qty: "2210",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "451051000001000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "LAAAA",
            brand_name: "Ernie Ball",
            item_id: "100622000000000",
            line_ordered_qty: "2093",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "100622000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "YDA",
            brand_name: "TASCAM",
            item_id: "J04052000000000",
            line_ordered_qty: "2036",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "J04052000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "LPA",
            brand_name: "Snark",
            item_id: "J01948000001000",
            line_ordered_qty: "1849",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "J01948000001000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "LAAAA",
            brand_name: "Ernie Ball",
            item_id: "100621000000000",
            line_ordered_qty: "1640",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "100621000000000-00-180x180.jpg                                                                      ",
          },
        ],
        byValue: [
          {
            web_category: "YBK",
            brand_name: "M-Audio",
            item_id: "L69990000000000",
            original_order_total_amount: "3212280.40",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L69990000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "DAC",
            brand_name: "TAMA",
            item_id: "L73177000001001",
            original_order_total_amount: "895489.68",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L73177000001001-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "LFMICA",
            brand_name: "Gibson",
            item_id: "115418154",
            original_order_total_amount: "862206.80",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "000000115418154-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "Z",
            brand_name: "Fender",
            item_id: "J33617000000000",
            original_order_total_amount: "603742.28",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "J33617000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "LFMICA",
            brand_name: "Gibson",
            item_id: "101464352",
            original_order_total_amount: "499442.97",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "000000101464352-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "LKB",
            brand_name: "Gear One",
            item_id: "339877000090000",
            original_order_total_amount: "484091.88",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "339877000090000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "LFMIDB",
            brand_name: "Ortega",
            item_id: "113999205",
            original_order_total_amount: "449942.66",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "000000113999205-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "ALA",
            brand_name: "Ortega",
            item_id: "116996968",
            original_order_total_amount: "442359.00",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "000000116996968-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "ALA",
            brand_name: "Ortega",
            item_id: "L83254000001001",
            original_order_total_amount: "442359.00",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L83254000001001-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "YBK",
            brand_name: "M-Audio",
            item_id: "L69993000000000",
            original_order_total_amount: "413933.71",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L69993000000000-00-180x180.jpg                                                                      ",
          },
        ],
      },
    },
    GCData: {
      name: "GC",
      totalStats: {
        enterprise_key: "GC",
        original_order_total_amount: 300323958,
        line_price_total: "265986706.93",
        line_ordered_qty: "1127199",
        line_margin: 129754681,
        line_inventory_cost: 165867329,
        shipping_cost: 1742884,
        discount: 2498335,
        tax: 7663771,
      },
      chartSeries: {
        enterprise_key: "GC",
        series: [
          {
            enterprise_key: "GC",
            datetime: "2023-02-01 00:00",
            original_order_total_amount: 152108405.97,
            line_ordered_qty: 257143,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-04-01 00:00",
            original_order_total_amount: 159454898.93,
            line_ordered_qty: 251936,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-05-01 00:00",
            original_order_total_amount: 29958514.2,
            line_ordered_qty: 46127,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-01-01 00:00",
            original_order_total_amount: 142584313.06,
            line_ordered_qty: 287846,
          },
          {
            enterprise_key: "GC",
            datetime: "2023-03-01 00:00",
            original_order_total_amount: 173155050.15,
            line_ordered_qty: 284147,
          },
        ],
      },
      salesCategories: {
        name: "MF",
        original_order_total_amount: 144743263,
        line_ordered_qty: 395582,
        ORDER_CAPTURE_CHANNEL_GROUPED: [
          {
            name: "Web",
            original_order_total_amount: 80511274,
            line_ordered_qty: 308987,
          },
          {
            name: "GCSTORE",
            original_order_total_amount: 76217,
            line_ordered_qty: 28,
          },
          {
            name: null,
            original_order_total_amount: 137124,
            line_ordered_qty: 95,
          },
          {
            name: "CallCenter",
            original_order_total_amount: 64018648,
            line_ordered_qty: 86472,
          },
        ],
        ITEM_INFO_GROUPED: [
          {
            name: "Digital-Download",
            original_order_total_amount: 238104,
            line_ordered_qty: 924,
          },
          {
            name: "Vendor-Fulfilled",
            original_order_total_amount: 248135,
            line_ordered_qty: 1214,
          },
          {
            name: "Regular",
            original_order_total_amount: 110563595,
            line_ordered_qty: 204041,
          },
          {
            name: "E-Certificate",
            original_order_total_amount: 110051,
            line_ordered_qty: 553,
          },
          {
            name: "Low-Value-Sale",
            original_order_total_amount: 24168348,
            line_ordered_qty: 172438,
          },
          {
            name: "Free-Gift-Item",
            original_order_total_amount: 317072,
            line_ordered_qty: 289,
          },
          {
            name: "Used-And-Vintage",
            original_order_total_amount: 7045548,
            line_ordered_qty: 14091,
          },
          {
            name: "Warranty",
            original_order_total_amount: 2052410,
            line_ordered_qty: 2032,
          },
        ],
      },
      topItemsData: {
        byVolume: [
          {
            web_category: "Z",
            brand_name: "Guitar Center",
            item_id: "L93246000000000",
            line_ordered_qty: "58405",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L93246000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "Z",
            brand_name: "Guitar Center",
            item_id: "L74338000000000",
            line_ordered_qty: "31835",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L74338000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "Z",
            brand_name: "Guitar Center",
            item_id: "L93263000000000",
            line_ordered_qty: "21739",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L93263000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "Z",
            brand_name: "Guitar Center",
            item_id: "L93266000000000",
            line_ordered_qty: "15074",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L93266000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "Z",
            brand_name: "Guitar Center",
            item_id: "L93261000000000",
            line_ordered_qty: "10254",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L93261000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "Z",
            brand_name: "Guitar Center",
            item_id: "L93264000000000",
            line_ordered_qty: "9513",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L93264000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "Z",
            brand_name: "Guitar Center",
            item_id: "L93260000000000",
            line_ordered_qty: "8664",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L93260000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "Z",
            brand_name: "Guitar Center",
            item_id: "L93245000000000",
            line_ordered_qty: "7414",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L93245000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "LIAA",
            brand_name: "Musician's Gear",
            item_id: "451058000001000",
            line_ordered_qty: "6359",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "451058000001000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "NEA",
            brand_name: "Guitar Center",
            item_id: "L79218000000000",
            line_ordered_qty: "6249",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L79218000000000-00-180x180.jpg                                                                      ",
          },
        ],
        byValue: [
          {
            web_category: "Z",
            brand_name: "Guitar Center",
            item_id: "L93246000000000",
            original_order_total_amount: "5978954.97",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L93246000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "YCD",
            brand_name: "Pioneer DJ",
            item_id: "L98225000000001",
            original_order_total_amount: "5843746.36",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L98225000000001-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "YAAB",
            brand_name: "QSC",
            item_id: "J51713000000000",
            original_order_total_amount: "4967517.76",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "J51713000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "YCB",
            brand_name: "Pioneer DJ",
            item_id: "L77643000000001",
            original_order_total_amount: "3939499.10",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L77643000000001-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "Z",
            brand_name: "Guitar Center",
            item_id: "L74338000000000",
            original_order_total_amount: "3554077.10",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L74338000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "YAEB",
            brand_name: "QSC",
            item_id: "L68677000000000",
            original_order_total_amount: "3201222.95",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L68677000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "Z",
            brand_name: "Guitar Center",
            item_id: "L93263000000000",
            original_order_total_amount: "2651791.51",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L93263000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "LFMICA",
            brand_name: "Gibson",
            item_id: "115418154",
            original_order_total_amount: "2640730.45",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "000000115418154-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "NEA",
            brand_name: "Guitar Center",
            item_id: "L79218000000000",
            original_order_total_amount: "2555909.29",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L79218000000000-00-180x180.jpg                                                                      ",
          },
          {
            web_category: "Z",
            brand_name: "Gift Card",
            item_id: "L96286000000000",
            original_order_total_amount: "2541384.23",
            image_location: "http://media.guitarcenter.com/is/image/MMGS7",
            image_id:
              "L96286000000000-00-180x180.jpg                                                                      ",
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
