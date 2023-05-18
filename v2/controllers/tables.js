const client = require("../config/postgre_client");
const moment = require("moment");

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

  console.log(start_date_formatted, end_date_formatted, intervaltime);

  const query = `SELECT getsalesdata('${start_date_formatted}','${end_date_formatted}', ${intervaltime},'Ref1', 'Ref2','Ref3', 'Ref4','Ref5', 'Ref6' );FETCH ALL IN "Ref1"; FETCH ALL IN "Ref2"; FETCH ALL IN "Ref3"; FETCH ALL IN "Ref4"; FETCH ALL IN "Ref5"; FETCH ALL IN "Ref6"; 
  `;
  console.log(query);

  client.query(query, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
      return;
    } else {
      console.log(result[5]);
      const groupedChartSeries = result[2].rows.reduce((acc, order) => {
        const enterpriseKey = order.enterprise_key;

        if (!acc[enterpriseKey]) {
          acc[enterpriseKey] = {
            enterprise_key: enterpriseKey,
            series: [],
          };
        }
        // "2023-01-21T18:30:00.000Z"
        acc[enterpriseKey].series.push({
          enterprise_key: order.enterprise_key,
          datetime: moment(order.datetime).format("YYYY-MM-DD HH:mm:ss"),
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

          // Group by line_fulfillment_type
          let lineFulfillmentTypeGroup =
            enterpriseKeyGroup.LINE_FULFILLMENT_TYPE_GROUPED.find(
              (group) => group.name === line_fulfillment_type
            );

          if (!lineFulfillmentTypeGroup) {
            lineFulfillmentTypeGroup = {
              name: line_fulfillment_type,
              original_order_total_amount: 0,
              line_ordered_qty: 0,
            };
            enterpriseKeyGroup.LINE_FULFILLMENT_TYPE_GROUPED.push(
              lineFulfillmentTypeGroup
            );
          }

          // Update original_order_total_amount and line_ordered_qty within the line_fulfillment_type group
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

      const groupedTopItemsData = result[4].rows.reduce((result, item) => {
        const { enterprise_key, ...rest } = item;

        if (!result[enterprise_key]) {
          result[enterprise_key] = [];
        }

        result[enterprise_key].push(rest);
        return result;
      }, {});

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
        topItemsData: Object.values(groupedTopItemsData),
      };

      res.status(200).json({
        MFData: {
          name: "MF",
          totalStats: {
            ...data.totalStats[1],
            line_margin: +Math.round(data.totalStats[1].line_margin),
            line_inventory_cost: +Math.round(
              data.totalStats[1].line_inventory_cost
            ),
            shipping_cost: +Math.round(shippingCost.mf[0].sum),
            discount: +Math.round(discount.mf[0].sum),
            tax: +Math.round(tax.mf[0].sum),
          },
          chartSeries: data.chartSeries[1],
          salesCategories: {
            ...data.salesCategories[1],
            ORDER_CAPTURE_CHANNEL_GROUPED: Object.values(
              data.salesCategories[1].ORDER_CAPTURE_CHANNEL_GROUPED
            ),
            LINE_FULFILLMENT_TYPE_GROUPED: Object.values(
              data.salesCategories[1].LINE_FULFILLMENT_TYPE_GROUPED
            ),
          },
          topItemsData: data.topItemsData[1],
        },
        GCData: {
          name: "GC",
          totalStats: {
            ...data.totalStats[0],
            line_margin: +Math.round(data.totalStats[0].line_margin),
            line_inventory_cost: +Math.round(
              data.totalStats[0].line_inventory_cost
            ),
            shipping_cost: +Math.round(shippingCost.gc[0].sum),
            discount: +Math.round(discount.gc[0].sum),
            tax: +Math.round(tax.gc[0].sum),
          },
          chartSeries: data.chartSeries[0],
          salesCategories: {
            ...data.salesCategories[0],
            ORDER_CAPTURE_CHANNEL_GROUPED: Object.values(
              data.salesCategories[0].ORDER_CAPTURE_CHANNEL_GROUPED
            ),
            LINE_FULFILLMENT_TYPE_GROUPED: Object.values(
              data.salesCategories[0].LINE_FULFILLMENT_TYPE_GROUPED
            ),
          },
          topItemsData: data.topItemsData[0],
        },
      });
    }
  });
};

module.exports = {
  getTableData,
  getFullSalesData,
};
