const client = require("../config/postgre_client");
const moment = require("moment");
const bcrypt = require("bcrypt");

const {
  formatDate,
  getFulfillmentDescription,
} = require("../utils/fulfillment_type_details");
const { mergeData } = require("../utils/state_mapping");

const getTableData = (req, res) => {
  const { table } = req.query;
  const query = `SELECT * FROM ${table} limit 100`;
  client.query(query, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error fetching data");
    } else {
      res.send(result.rows);
    }
  });
};

const getCustomQueryDate = (req, res) => {
  const { query } = req.body;
  client.query(`${query} limit 100`, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error fetching data");
    } else {
      res.send(result.rows);
    }
  });
};
const getFullSalesData = (req, res) => {
  // if (client.connection._events != null) {
  //   client.end();
  //   client.connect();
  // }

  const start_date = req.query.start_date;
  const end_date = req.query.end_date;
  const intervaltime = req.query.intervaltime;

  // 2022-11-17 22:12
  const start_date_formatted = moment(start_date, "YYYY-MM-DD HH:mm").format(
    "YYYY-MM-DD HH:mm:ss"
  );
  const end_date_formatted = moment(end_date, "YYYY-MM-DD HH:mm").format(
    "YYYY-MM-DD HH:mm:ss"
  );

  const query = `SELECT gettotalsalesdata('${start_date_formatted}','${end_date_formatted}', ${intervaltime},'Ref1', 'Ref2','Ref3', 'Ref4','Ref5', 'Ref6','Ref7', 'Ref8' );
  FETCH ALL IN "Ref1";
  FETCH ALL IN "Ref2";
  FETCH ALL IN "Ref3";
  FETCH ALL IN "Ref4";
  FETCH ALL IN "Ref5";
  FETCH ALL IN "Ref6";
  FETCH ALL IN "Ref7";
  FETCH ALL IN "Ref8";
   `;

  console.log(query);
  try {
    client.query(query, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
        return;
      } else {
        const groupedChartSeries = result[2].rows.reduce((acc, order, i) => {
          const enterpriseKey = order.enterprise_key;

          if (!acc[enterpriseKey]) {
            acc[enterpriseKey] = {
              enterprise_key: enterpriseKey,
              series: [],
            };
            i = 0;
          }

          acc[enterpriseKey].series.push({
            enterprise_key: order.enterprise_key,
            datetime: formatDate(order.datetime, intervaltime, i),
            original_order_total_amount: +order.original_order_total_amount,
            line_ordered_qty: +order.line_ordered_qty,
          });

          return acc;
        }, {});

        const groupedSalesCategoriesData = result[3].rows.reduce(
          (result, item) => {
            const {
              enterprise_key,
              order_capture_channel,
              item_info,
              line_fulfillment_type,
            } = item;

            // Find existing enterprise key group
            let enterpriseKeyGroup = result.find(
              (group) => group.name === enterprise_key
            );

            if (!enterpriseKeyGroup) {
              // Create a new enterprise key group if not found
              enterpriseKeyGroup = {
                name: enterprise_key,
                original_order_total_amount: 0,
                line_ordered_qty: 0,
                ORDER_CAPTURE_CHANNEL_GROUPED: [],
                ITEM_INFO_GROUPED: [],
                LINE_FULFILLMENT_TYPE_GROUPED: [],
              };
              result.push(enterpriseKeyGroup);
            }

            // Update original_order_total_amount and line_ordered_qty
            enterpriseKeyGroup.original_order_total_amount += parseInt(
              item.original_order_total_amount
            );
            enterpriseKeyGroup.line_ordered_qty += parseInt(
              item.line_ordered_qty
            );

            // Group by order_capture_channel
            let orderCaptureChannelGroup =
              enterpriseKeyGroup.ORDER_CAPTURE_CHANNEL_GROUPED.find(
                (group) => group.name === order_capture_channel
              );

            if (!orderCaptureChannelGroup) {
              orderCaptureChannelGroup = {
                name: order_capture_channel,
                original_order_total_amount: 0,
                line_ordered_qty: 0,
              };
              enterpriseKeyGroup.ORDER_CAPTURE_CHANNEL_GROUPED.push(
                orderCaptureChannelGroup
              );
            }

            // Update original_order_total_amount and line_ordered_qty within the order_capture_channel group
            orderCaptureChannelGroup.original_order_total_amount += parseInt(
              item.original_order_total_amount
            );
            orderCaptureChannelGroup.line_ordered_qty += parseInt(
              item.line_ordered_qty
            );

            // Group by ITEM_INFO
            let itemInfoGroup = enterpriseKeyGroup.ITEM_INFO_GROUPED.find(
              (group) => group.name === item_info
            );

            if (!itemInfoGroup) {
              itemInfoGroup = {
                name: item_info,
                original_order_total_amount: 0,
                line_ordered_qty: 0,
              };
              enterpriseKeyGroup.ITEM_INFO_GROUPED.push(itemInfoGroup);
            }

            // Update original_order_total_amount and line_ordered_qty within the ITEM_INFO group
            itemInfoGroup.original_order_total_amount += parseInt(
              item.original_order_total_amount
            );
            itemInfoGroup.line_ordered_qty += parseInt(item.line_ordered_qty);

            // Group by LINE_FULFILLMENT_TYPE
            let lineFulfillmentTypeGroup =
              enterpriseKeyGroup.LINE_FULFILLMENT_TYPE_GROUPED.find(
                (group) =>
                  group.name ===
                  getFulfillmentDescription(line_fulfillment_type)
              );

            if (!lineFulfillmentTypeGroup) {
              lineFulfillmentTypeGroup = {
                name: getFulfillmentDescription(line_fulfillment_type),
                original_order_total_amount: 0,
                line_ordered_qty: 0,
              };
              enterpriseKeyGroup.LINE_FULFILLMENT_TYPE_GROUPED.push(
                lineFulfillmentTypeGroup
              );
            }

            // Update original_order_total_amount and line_ordered_qty within the LINE_FULFILLMENT_TYPE group
            lineFulfillmentTypeGroup.original_order_total_amount += parseInt(
              item.original_order_total_amount
            );
            lineFulfillmentTypeGroup.line_ordered_qty += parseInt(
              item.line_ordered_qty
            );

            return result;
          },
          []
        );

        const groupedTopItemsDataByVolume = result[4].rows.reduce(
          (result, item) => {
            const { enterprise_key, ...rest } = item;

            if (!result[enterprise_key]) {
              result[enterprise_key] = [];
            }

            result[enterprise_key].push(rest);
            return result;
          },
          {}
        );

        const groupedTopItemsDataByValue = result[8].rows.reduce(
          (result, item) => {
            const { enterprise_key, ...rest } = item;

            if (!result[enterprise_key]) {
              result[enterprise_key] = [];
            }

            result[enterprise_key].push(rest);
            return result;
          },
          {}
        );

        const groupedTopItemData = {
          mf: {
            byVolume: groupedTopItemsDataByVolume["MF"],
            byValue: groupedTopItemsDataByValue["MF"],
          },
          gc: {
            byVolume: groupedTopItemsDataByVolume["GC"],
            byValue: groupedTopItemsDataByValue["GC"],
          },
        };

        const shippingCost = {
          gc: result[5].rows.filter(
            (item) => item.enterprise_key === "GC" && item.is_discount === "N"
          ),
          mf: result[5].rows.filter(
            (item) => item.enterprise_key === "MF" && item.is_discount === "N"
          ),
        };

        const discount = {
          gc: result[5].rows.filter(
            (item) => item.enterprise_key === "GC" && item.is_discount === "Y"
          ),
          mf: result[5].rows.filter(
            (item) => item.enterprise_key === "MF" && item.is_discount === "Y"
          ),
        };

        const tax = {
          gc: result[6].rows.filter((item) => item.enterprise_key === "GC"),
          mf: result[6].rows.filter((item) => item.enterprise_key === "MF"),
        };

        const data = {
          totalStats: result[1].rows,
          chartSeries: Object.values(groupedChartSeries),
          salesCategories: groupedSalesCategoriesData,
          topItemsData: groupedTopItemData,
        };

        res.status(200).json({
          MFData: {
            name: "MF",
            totalStats: {
              ...data.totalStats[1],
              line_margin: +Math.round(data.totalStats[1]?.line_margin)
                ? +Math.round(data.totalStats[1]?.line_margin)
                : 0,
              line_inventory_cost: +Math.round(
                data.totalStats[1]?.line_inventory_cost
              )
                ? +Math.round(data.totalStats[1]?.line_inventory_cost)
                : 0,
              original_order_total_amount: +Math.round(
                result[7]?.rows[1]?.original_order_total_amount
              )
                ? +Math.round(result[7]?.rows[1]?.original_order_total_amount)
                : 0,
              shipping_cost: +Math.round(shippingCost.mf[0]?.sum)
                ? +Math.round(shippingCost.mf[0]?.sum)
                : 0,
              discount: +Math.round(discount.mf[0]?.sum)
                ? +Math.round(discount.mf[0]?.sum)
                : 0,
              tax: +Math.round(tax.mf[0]?.sum)
                ? +Math.round(tax.mf[0]?.sum)
                : 0,
            },
            chartSeries: data.chartSeries[1],
            salesCategories: {
              ...data.salesCategories[1],
              ORDER_CAPTURE_CHANNEL_GROUPED: data.salesCategories[1]
                ?.ORDER_CAPTURE_CHANNEL_GROUPED
                ? Object.values(
                    data.salesCategories[1]?.ORDER_CAPTURE_CHANNEL_GROUPED
                  )
                : [],
              ITEM_INFO_GROUPED: data.salesCategories[1]?.ITEM_INFO_GROUPED
                ? Object.values(data.salesCategories[1]?.ITEM_INFO_GROUPED)
                : [],
            },
            topItemsData: groupedTopItemData.mf,
          },
          GCData: {
            name: "GC",
            totalStats: {
              ...data.totalStats[0],
              line_margin: +Math.round(data.totalStats[0]?.line_margin)
                ? +Math.round(data.totalStats[0]?.line_margin)
                : 0,
              line_inventory_cost: +Math.round(
                data.totalStats[0]?.line_inventory_cost
              )
                ? +Math.round(data.totalStats[0]?.line_inventory_cost)
                : 0,
              original_order_total_amount: +Math.round(
                result[7]?.rows[0]?.original_order_total_amount
              )
                ? +Math.round(result[7]?.rows[0]?.original_order_total_amount)
                : 0,
              shipping_cost: +Math.round(shippingCost.gc[0]?.sum)
                ? +Math.round(shippingCost.gc[0]?.sum)
                : 0,
              discount: +Math.round(discount.gc[0]?.sum)
                ? +Math.round(discount.gc[0]?.sum)
                : 0,
              tax: +Math.round(tax.gc[0]?.sum)
                ? +Math.round(tax.gc[0]?.sum)
                : 0,
            },
            chartSeries: data.chartSeries[0],
            salesCategories: {
              ...data.salesCategories[0],
              ORDER_CAPTURE_CHANNEL_GROUPED: data.salesCategories[0]
                ?.ORDER_CAPTURE_CHANNEL_GROUPED
                ? Object.values(
                    data.salesCategories[0]?.ORDER_CAPTURE_CHANNEL_GROUPED
                  )
                : [],
              ITEM_INFO_GROUPED: data.salesCategories[0]?.ITEM_INFO_GROUPED
                ? Object.values(data.salesCategories[0]?.ITEM_INFO_GROUPED)
                : [],
            },
            topItemsData: groupedTopItemData.gc,
          },
        });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getFullSalesDataTEST = (req, res) => {
  // if (client.connection._events != null) {
  //   client.end();
  //   client.connect();
  // }

  const start_date = req.query.start_date;
  const end_date = req.query.end_date;
  const intervaltime = req.query.intervaltime;

  // 2022-11-17 22:12
  const start_date_formatted = moment(start_date, "YYYY-MM-DD HH:mm").format(
    "YYYY-MM-DD HH:mm:ss"
  );
  const end_date_formatted = moment(end_date, "YYYY-MM-DD HH:mm").format(
    "YYYY-MM-DD HH:mm:ss"
  );

  const query = `SELECT gettotalsalesdata('${start_date_formatted}','${end_date_formatted}', ${intervaltime},'Ref1', 'Ref2','Ref3', 'Ref4','Ref5', 'Ref6','Ref7', 'Ref8');
  FETCH ALL IN "Ref1";
  FETCH ALL IN "Ref2";
  FETCH ALL IN "Ref3";
  FETCH ALL IN "Ref4";
  FETCH ALL IN "Ref5";
  FETCH ALL IN "Ref6";
  FETCH ALL IN "Ref7";
  FETCH ALL IN "Ref8";
  `;

  console.log(query);
  try {
    client.query(query, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
        return;
      } else {
        const groupedChartSeries = result[2].rows.reduce((acc, order, i) => {
          const enterpriseKey = order.enterprise_key;

          if (!acc[enterpriseKey]) {
            acc[enterpriseKey] = {
              enterprise_key: enterpriseKey,
              series: [],
            };
            i = 0;
          }
          // "2023-01-21T18:30:00.000Z"
          acc[enterpriseKey].series.push({
            enterprise_key: order.enterprise_key,
            datetime: formatDate(order.datetime, intervaltime),
            original_order_total_amount: +order.original_order_total_amount,
            line_ordered_qty: +order.line_ordered_qty,
          });

          return acc;
        }, {});

        const groupedSalesCategoriesData = result[3].rows.reduce(
          (result, item) => {
            const {
              enterprise_key,
              order_capture_channel,
              item_info,
              line_fulfillment_type,
            } = item;

            // Find existing enterprise key group
            let enterpriseKeyGroup = result.find(
              (group) => group.name === enterprise_key
            );

            if (!enterpriseKeyGroup) {
              // Create a new enterprise key group if not found
              enterpriseKeyGroup = {
                name: enterprise_key,
                original_order_total_amount: 0,
                line_ordered_qty: 0,
                ORDER_CAPTURE_CHANNEL_GROUPED: [],
                ITEM_INFO_GROUPED: [],
                LINE_FULFILLMENT_TYPE_GROUPED: [],
              };
              result.push(enterpriseKeyGroup);
            }

            // Update original_order_total_amount and line_ordered_qty
            enterpriseKeyGroup.original_order_total_amount += parseInt(
              item.original_order_total_amount
            );
            enterpriseKeyGroup.line_ordered_qty += parseInt(
              item.line_ordered_qty
            );

            // Group by order_capture_channel
            let orderCaptureChannelGroup =
              enterpriseKeyGroup.ORDER_CAPTURE_CHANNEL_GROUPED.find(
                (group) => group.name === order_capture_channel
              );

            if (!orderCaptureChannelGroup) {
              orderCaptureChannelGroup = {
                name: order_capture_channel,
                original_order_total_amount: 0,
                line_ordered_qty: 0,
              };
              enterpriseKeyGroup.ORDER_CAPTURE_CHANNEL_GROUPED.push(
                orderCaptureChannelGroup
              );
            }

            // Update original_order_total_amount and line_ordered_qty within the order_capture_channel group
            orderCaptureChannelGroup.original_order_total_amount += parseInt(
              item.original_order_total_amount
            );
            orderCaptureChannelGroup.line_ordered_qty += parseInt(
              item.line_ordered_qty
            );

            // Group by ITEM_INFO
            let itemInfoGroup = enterpriseKeyGroup.ITEM_INFO_GROUPED.find(
              (group) => group.name === item_info
            );

            if (!itemInfoGroup) {
              itemInfoGroup = {
                name: item_info,
                original_order_total_amount: 0,
                line_ordered_qty: 0,
              };
              enterpriseKeyGroup.ITEM_INFO_GROUPED.push(itemInfoGroup);
            }

            // Update original_order_total_amount and line_ordered_qty within the ITEM_INFO group
            itemInfoGroup.original_order_total_amount += parseInt(
              item.original_order_total_amount
            );
            itemInfoGroup.line_ordered_qty += parseInt(item.line_ordered_qty);

            // Group by LINE_FULFILLMENT_TYPE
            let lineFulfillmentTypeGroup =
              enterpriseKeyGroup.LINE_FULFILLMENT_TYPE_GROUPED.find(
                (group) =>
                  group.name ===
                  getFulfillmentDescription(line_fulfillment_type)
              );

            if (!lineFulfillmentTypeGroup) {
              lineFulfillmentTypeGroup = {
                name: getFulfillmentDescription(line_fulfillment_type),
                original_order_total_amount: 0,
                line_ordered_qty: 0,
              };
              enterpriseKeyGroup.LINE_FULFILLMENT_TYPE_GROUPED.push(
                lineFulfillmentTypeGroup
              );
            }

            // Update original_order_total_amount and line_ordered_qty within the LINE_FULFILLMENT_TYPE group
            lineFulfillmentTypeGroup.original_order_total_amount += parseInt(
              item.original_order_total_amount
            );
            lineFulfillmentTypeGroup.line_ordered_qty += parseInt(
              item.line_ordered_qty
            );

            return result;
          },
          []
        );

        const groupedTopItemsDataByVolume = result[4].rows.reduce(
          (result, item) => {
            const { enterprise_key, ...rest } = item;

            if (!result[enterprise_key]) {
              result[enterprise_key] = [];
            }

            result[enterprise_key].push(rest);
            return result;
          },
          {}
        );

        const groupedTopItemsDataByValue = result[8].rows.reduce(
          (result, item) => {
            const { enterprise_key, ...rest } = item;

            if (!result[enterprise_key]) {
              result[enterprise_key] = [];
            }

            result[enterprise_key].push(rest);
            return result;
          },
          {}
        );

        const groupedTopItemData = {
          mf: {
            byVolume: groupedTopItemsDataByVolume["MF"],
            byValue: groupedTopItemsDataByValue["MF"],
          },
          gc: {
            byVolume: groupedTopItemsDataByVolume["GC"],
            byValue: groupedTopItemsDataByValue["GC"],
          },
        };

        const shippingCost = {
          gc: result[5].rows.filter(
            (item) => item.enterprise_key === "GC" && item.is_discount === "N"
          ),
          mf: result[5].rows.filter(
            (item) => item.enterprise_key === "MF" && item.is_discount === "N"
          ),
        };

        const discount = {
          gc: result[5].rows.filter(
            (item) => item.enterprise_key === "GC" && item.is_discount === "Y"
          ),
          mf: result[5].rows.filter(
            (item) => item.enterprise_key === "MF" && item.is_discount === "Y"
          ),
        };

        const tax = {
          gc: result[6].rows.filter((item) => item.enterprise_key === "GC"),
          mf: result[6].rows.filter((item) => item.enterprise_key === "MF"),
        };

        const data = {
          totalStats: result[1].rows,
          chartSeries: Object.values(groupedChartSeries),
          salesCategories: groupedSalesCategoriesData,
          topItemsData: groupedTopItemData,
        };

        res.status(200).json({
          MFData: {
            name: "MF",
            totalStats: {
              ...data.totalStats[1],
              line_margin: +Math.round(data.totalStats[1]?.line_margin)
                ? +Math.round(data.totalStats[1]?.line_margin)
                : 0,
              line_inventory_cost: +Math.round(
                data.totalStats[1]?.line_inventory_cost
              )
                ? +Math.round(data.totalStats[1]?.line_inventory_cost)
                : 0,
              original_order_total_amount: +Math.round(
                result[7]?.rows[1]?.original_order_total_amount
              )
                ? +Math.round(result[7]?.rows[1]?.original_order_total_amount)
                : 0,
              shipping_cost: +Math.round(shippingCost.mf[0]?.sum)
                ? +Math.round(shippingCost.mf[0]?.sum)
                : 0,
              discount: +Math.round(discount.mf[0]?.sum)
                ? +Math.round(discount.mf[0]?.sum)
                : 0,
              tax: +Math.round(tax.mf[0]?.sum)
                ? +Math.round(tax.mf[0]?.sum)
                : 0,
            },
            chartSeries: data.chartSeries[1],
            salesCategories: {
              ...data.salesCategories[1],
              ORDER_CAPTURE_CHANNEL_GROUPED: data.salesCategories[1]
                ?.ORDER_CAPTURE_CHANNEL_GROUPED
                ? Object.values(
                    data.salesCategories[1]?.ORDER_CAPTURE_CHANNEL_GROUPED
                  )
                : [],
              ITEM_INFO_GROUPED: data.salesCategories[1]?.ITEM_INFO_GROUPED
                ? Object.values(data.salesCategories[1]?.ITEM_INFO_GROUPED)
                : [],
            },
            topItemsData: groupedTopItemData.mf,
          },
          GCData: {
            name: "GC",
            totalStats: {
              ...data.totalStats[0],
              line_margin: +Math.round(data.totalStats[0]?.line_margin)
                ? +Math.round(data.totalStats[0]?.line_margin)
                : 0,
              line_inventory_cost: +Math.round(
                data.totalStats[0]?.line_inventory_cost
              )
                ? +Math.round(data.totalStats[0]?.line_inventory_cost)
                : 0,
              original_order_total_amount: +Math.round(
                result[7]?.rows[0]?.original_order_total_amount
              )
                ? +Math.round(result[7]?.rows[0]?.original_order_total_amount)
                : 0,
              shipping_cost: +Math.round(shippingCost.gc[0]?.sum)
                ? +Math.round(shippingCost.gc[0]?.sum)
                : 0,
              discount: +Math.round(discount.gc[0]?.sum)
                ? +Math.round(discount.gc[0]?.sum)
                : 0,
              tax: +Math.round(tax.gc[0]?.sum)
                ? +Math.round(tax.gc[0]?.sum)
                : 0,
            },
            chartSeries: data.chartSeries[0],
            salesCategories: {
              ...data.salesCategories[0],
              ORDER_CAPTURE_CHANNEL_GROUPED: data.salesCategories[0]
                ?.ORDER_CAPTURE_CHANNEL_GROUPED
                ? Object.values(
                    data.salesCategories[0]?.ORDER_CAPTURE_CHANNEL_GROUPED
                  )
                : [],
              ITEM_INFO_GROUPED: data.salesCategories[0]?.ITEM_INFO_GROUPED
                ? Object.values(data.salesCategories[0]?.ITEM_INFO_GROUPED)
                : [],
            },
            topItemsData: groupedTopItemData.gc,
          },
        });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const UserRegistration = async (req, res) => {
  const { firstname, lastname, username, password, role } = req.body;
  try {
    const query = "SELECT * FROM users WHERE username = $1";
    const result = await client.query(query, [username]);

    if (result.rows.length > 0) {
      return res.status(401).json({ message: "Username already exists" });
    }
    const saltRounds = 10;
    let secPass = await bcrypt.hash(password, saltRounds);

    const values = [
      firstname,
      lastname,
      username,
      secPass,
      role,
      Math.floor(Math.random() * 100),
    ];
    const InsertQuery =
      "INSERT INTO users(firstname, lastname, username, password, role,id) VALUES($1, $2, $3, $4, $5,$6)";
    await client.query(InsertQuery, values);
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const UserLogin = async (req, res) => {
  const { username, password } = req.body;
  const originalPass = password;
  try {
    const query = "SELECT * FROM users WHERE username = $1";
    const values = [username];
    const result = await client.query(query, values);
    if (result.rows.length === 1) {
      const isMatch = await bcrypt.compare(password, result.rows[0].password);
      if (isMatch) {
        const { password, ...rest } = result.rows[0];
        res.status(200).json({ ...rest, password: originalPass });
      } else {
        res.status(401).json({ message: "Invalid username or password" });
      }
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMinMaxValues = async (req, res) => {
  const start_date = req.query.start_date;
  const end_date = req.query.end_date;
  const intervaltime = req.query.intervaltime;

  // 2022-11-17 22:12
  const start_date_formatted = moment(start_date, "YYYY-MM-DD HH:mm").format(
    "YYYY-MM-DD HH:mm:ss"
  );
  const end_date_formatted = moment(end_date, "YYYY-MM-DD HH:mm").format(
    "YYYY-MM-DD HH:mm:ss"
  );

  const query = `SELECT getminmaxvalues('${start_date_formatted}','${end_date_formatted}', 'Ref1', 'Ref2','Ref3', 'Ref4');
  FETCH ALL IN "Ref1";
  FETCH ALL IN "Ref2";
  FETCH ALL IN "Ref3";
  FETCH ALL IN "Ref4";
   `;

  try {
    client.query(query, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
        return;
      } else {
        const OrderBookLineResult = result[1].rows;
        const OrderBookHeaderResult = result[2].rows;
        const OrderBookChargesResult = result[3].rows;
        const OrderBookTaxesResult = result[4].rows;
        res.status(200).json({
          OrderBookLineResult,
          OrderBookHeaderResult,
          OrderBookChargesResult,
          OrderBookTaxesResult,
        });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMapData = async (req, res) => {
  const start_date = req.query.start_date;
  const end_date = req.query.end_date;

  // 2022-11-17 22:12
  const start_date_formatted = moment(start_date, "YYYY-MM-DD HH:mm").format(
    "YYYY-MM-DD HH:mm:ss"
  );

  const end_date_formatted = moment(end_date, "YYYY-MM-DD HH:mm").format(
    "YYYY-MM-DD HH:mm:ss"
  );

  const query = `select ship_to_state,sum(original_order_total_amount) from order_book_line where order_date_parsed>='${start_date_formatted}' and order_date_parsed <='${end_date_formatted}'  group by ship_to_state  `;

  try {
    client.query(query, (err, result) => {
      const totalSum = result.rows.reduce((acc, item) => {
        return acc + +item.sum;
      }, 0);

      const output = result.rows.map((item) => {
        // third value should be the percentage of the total with only two decimal places
        return [
          ("us-" + item.ship_to_state.trim()).toLowerCase(),
          +item.sum,
          Math.round((+item.sum / totalSum) * 10000) / 100,
        ];
      });

      const sortedArray = output.sort((a, b) => {
        return b[1] - a[1];
      });

      res.status(200).json(sortedArray.slice(0, 10));
    });
  } catch (error) {}
};

const getAllUser = async (req, res) => {
  try {
    const query = `SELECT * FROM users`;
    client.query(query, (err, result) => {
      res.status(200).json(result.rows);
    });
  } catch (error) {}
};

const getTimeSeriesData = async (req, res) => {
  const date = req.query.date;

  try {
    const query = `SELECT * FROM order_status_time_series WHERE actual_order_date = '${date}' ORDER BY status,actual_status_date;`;
    const result = await client.query(query);
    if (result.rows.length < 1) {
      return res.status(401).json({ success: false, message: "No data found" });
    } else {
      const data = result.rows;
      const statusNames = [...new Set(data.map((item) => item.status_name))];

      // Generate date range based on the data
      const startDate = new Date(data[0].actual_status_date);
      const endDate = new Date(data[data.length - 1].actual_status_date);
      const dateRange = [];
      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        dateRange.push(currentDate.toISOString().split("T")[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Create the time series output
      const timeSeriesOutput = statusNames.map((statusName) => {
        return {
          status_name: statusName,
          date_values: dateRange.map((date) => {
            const matchingData = data.find(
              (item) =>
                item.status_name === statusName &&
                new Date(item.actual_status_date)
                  .toISOString()
                  .split("T")[0] === date
            );

            return matchingData ? +matchingData.original_ordered_qty : 0;
          }),
        };
      });

      const response = {
        dates: dateRange.map((date) => {
          const dateObj = new Date(date);
          dateObj.setDate(dateObj.getDate() + 1);
          return dateObj.toISOString().split("T")[0];
        }),
        timeSeries: timeSeriesOutput,
      };

      response.timeSeries.forEach((item) => {
        console.log(item.date_values.length);
      });

      return res.status(200).json(response);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCityData = async (req, res) => {
  const start_date = req.query.start_date;
  const end_date = req.query.end_date;

  // 2022-11-17 22:12
  const start_date_formatted = moment(start_date, "YYYY-MM-DD HH:mm").format(
    "YYYY-MM-DD HH:mm:ss"
  );

  const end_date_formatted = moment(end_date, "YYYY-MM-DD HH:mm").format(
    "YYYY-MM-DD HH:mm:ss"
  );

  const city = req.query.city.split("-")[1].toUpperCase();

  console.log();

  const query = `select TRIM(ship_to_city) as city,sum(original_order_total_amount) as original_order_total_amount  from order_book_line where  TRIM(ship_to_state) ='${city}' group by ship_to_city ;`;
  console.log(query);
  try {
    client.query(query, (err, result) => {
      res.status(200).json(result.rows);
    });
  } catch (error) {
    console.log(error);
  }
};

const getDataForTimeSeies = async(req, res) => {
    const orderDate = req.query.date;
    const query = `SELECT getTimeSeriesData('${orderDate}','Ref1', 'Ref2','Ref3', 'Ref4','Ref5','Ref6');
    FETCH ALL IN "Ref1";
    FETCH ALL IN "Ref2";
    FETCH ALL IN "Ref3";
    FETCH ALL IN "Ref4";
    FETCH ALL IN "Ref5";
    FETCH ALL IN "Ref6";
   `;
   const timeLineDates = [];
   const originalDate = new Date(orderDate);
   const firstDate1 = new Date(originalDate);
   const  firstDate2 = new Date(originalDate);
   const firstDate3 = new Date(originalDate);
   const firstDate4 = new Date(originalDate);
   const firstDate5 = new Date(originalDate);
   firstDate1.setDate(originalDate.getDate() + 4);   
   firstDate2.setDate(originalDate.getDate() + 14);   
   firstDate3.setDate(originalDate.getDate() + 19);   
   firstDate4.setDate(originalDate.getDate() + 29);    
  timeLineDates.push(firstDate1.toISOString().split('T')[0],
  firstDate2.toISOString().split('T')[0],
  firstDate3.toISOString().split('T')[0],
  firstDate4.toISOString().split('T')[0],
  );   

    try {     
   client.query(query, (err, result) => {
    if (err) {
      return res.status(500).send(err);      
    } else {
      const firstTimeLineData = result[1].rows;
      const secondTimeLineData = result[2].rows;
      const thirdTimeLineData = result[3].rows;
      const fourthTimeLineData = result[4].rows;
      const fifthTimeLineData = result[5].rows;
      const sixthTimeLineData = result[6].rows;

      const mergedData = firstTimeLineData.map((first) => {
        const status_name = first.status_name;
        let lastDate =0;
        const QtySum = [];
        const lineTotalSum = [];

        secondTimeLineData.forEach((second) => {
          if (first.status_name === second.status_name) {
            thirdTimeLineData.forEach((third) => {
              if (first.status_name === third.status_name) {
                fourthTimeLineData.forEach((fourth) => {
                  if (first.status_name === fourth.status_name) {
                    fifthTimeLineData.forEach((fifth) => {
                      if (first.status_name === fifth.status_name) {
                        const sixth = sixthTimeLineData.find(
                          (item) => item.status_name === first.status_name
                        );
                        if (sixth) {
                        QtySum.push(parseInt(first.qtysum), parseInt(second.qtysum), parseInt(third.qtysum), parseInt(fourth.qtysum),parseInt(fifth.qtysum));

                        lineTotalSum.push(parseInt(first.linetotalsum),parseInt(second.linetotalsum),parseInt(third.linetotalsum),parseInt(fourth.linetotalsum),
                        parseInt(fifth.linetotalsum));
                        lastDate = sixth.maxdate.toISOString().split('T')[0];                      
                        }
                      }
                    });
                  }
                });
              }
            });
          }
        });

        return { status_name,lastDate, QtySum, lineTotalSum };
      });

      res.status(200).json({timeLineDates, mergedData });
    }
  });      
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};


module.exports = {
  getTableData,
  getFullSalesData,
  getFullSalesDataTEST,
  getCustomQueryDate,
  UserLogin,
  getMinMaxValues,
  UserRegistration,
  getMapData,
  getAllUser,
  getTimeSeriesData,
  getCityData,
  getDataForTimeSeies
};
