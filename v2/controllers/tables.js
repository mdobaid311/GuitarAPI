const client = require("../config/postgre_client");
const moment = require("moment");
const {
  formatDate,
  getFulfillmentDescription,
} = require("../utils/fulfillment_type_details");

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

        console.log(result[3].rows);

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

const UserLogin = async(req, res) => {
  const {username, userpassword} = req.body;
  try {
    const query = 'SELECT * FROM users WHERE username = $1 AND userpassword = $2';
    const values = [username, userpassword];
    const result = await client.query(query, values);
    console.log(query);
    if (result.rows.length === 1) {
      res.status(200).json({ message: 'Login successful' });
      console.log(result.rows);
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMinMaxValues = async(req, res) => {
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
        res.status(200).json({ OrderBookLineResult, OrderBookHeaderResult, OrderBookChargesResult, OrderBookTaxesResult });
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
  UserLogin,
  getMinMaxValues
};
