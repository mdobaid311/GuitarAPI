const client = require("../config/postgre_client");
const moment = require("moment");

const getTotalStats = async (req, res) => {
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
  console.log(new Date() + " initial ");
  const query = `select enterprise_key,sum(original_order_total_amount) as original_order_total_amount,
  sum(line_unit_price * line_ordered_qty) as line_price_total
  ,sum(line_ordered_qty) as line_ordered_qty,
   sum(line_margin) as line_margin, TRUNC(sum(line_inventory_cost),2) as line_inventory_cost
   from order_book_line where order_date_parsed>='${start_date_formatted}' 
  and  order_date_parsed<='${end_date_formatted}' group by enterprise_key;
  select enterprise_key,is_discount, sum(line_charge) from order_book_charges
  where order_date_parsed>='${start_date_formatted}' 
  and  order_date_parsed<='${end_date_formatted}' group by enterprise_key,is_discount;
  SELECT enterprise_key, sum(original_order_total_amount) AS original_order_total_amount from order_book_header where order_date_parsed>='${start_date_formatted}' and order_date_parsed<='${end_date_formatted}' group by enterprise_key;
  select enterprise_key, sum(line_level_tax) from order_book_taxes where order_date_parsed>='${start_date_formatted}' and order_date_parsed<='${end_date_formatted}' group by enterprise_key ;`;

  try {
    client.query(query, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      } else {
        console.log(new Date() + " res ");
        const shippingCost = {
          gc: result[1].rows.filter(
            (item) => item.enterprise_key === "GC" && item.is_discount === "N"
          ),
          mf: result[1].rows.filter(
            (item) => item.enterprise_key === "MF" && item.is_discount === "N"
          ),
        };

        const discount = {
          gc: result[1].rows.filter(
            (item) => item.enterprise_key === "GC" && item.is_discount === "Y"
          ),
          mf: result[1].rows.filter(
            (item) => item.enterprise_key === "MF" && item.is_discount === "Y"
          ),
        };

        const tax = {
          gc: result[3].rows.filter((item) => item.enterprise_key === "GC"),
          mf: result[3].rows.filter((item) => item.enterprise_key === "MF"),
        };

        const data = {
          totalStats: result[0].rows,
        };

        console.log(new Date() + " return ");

        res.status(200).json({
          MFData: {
            name: "MF",
            totalStats: {
              ...data.totalStats[1],
              line_margin: +Math.round(data.totalStats[1]?.line_margin)
                ? +Math.round(data.totalStats[1]?.line_margin)
                : 0,
              line_inventory_cost: +Math.round(
                data.totalStats[1].line_inventory_cost
              ),
              original_order_total_amount: +Math.round(
                result[2].rows[1].original_order_total_amount
              ),
              shipping_cost: +Math.round(shippingCost.mf[0].sum),
              discount: +Math.round(discount.mf[0].sum),
              tax: +Math.round(tax.mf[0].sum),
            },
          },
          GCData: {
            name: "GC",
            totalStats: {
              ...data.totalStats[0],
              line_margin: +Math.round(data.totalStats[0]?.line_margin)
                ? +Math.round(data.totalStats[0]?.line_margin)
                : 0,
              line_inventory_cost: +Math.round(
                data.totalStats[0].line_inventory_cost
              ),
              original_order_total_amount: +Math.round(
                result[2].rows[0].original_order_total_amount
              ),
              shipping_cost: +Math.round(shippingCost.gc[0].sum),
              discount: +Math.round(discount.gc[0].sum),
              tax: +Math.round(tax.gc[0].sum),
            },
          },
        });
      }
    });
  } catch (e) {
    console.log(e);
  }
};

const getChartData = async (req, res) => {
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
  let query = "";

  if (+intervaltime === 15 * 60) {
    console.log(15 * 60);
    // 15 minutes
    query = `
    SELECT 
    enterprise_key,
    date_trunc('hour', order_date_parsed) + 
      (date_part('minute', order_date_parsed)::int / 15) * interval '15 minutes' AS datetime,
    sum(original_order_total_amount) AS original_order_total_amount,
    sum(line_ordered_qty) AS line_ordered_qty
  FROM 
    order_book_line 
    where order_date_parsed>='${start_date_formatted}' and order_date_parsed<='${end_date_formatted}'
  GROUP BY 
    enterprise_key, 
    date_trunc('hour', order_date_parsed) + 
      (date_part('minute', order_date_parsed)::int / 15) * interval '15 minutes';`;
  } else if (+intervaltime === 3600) {
    console.log(3600);
    // 1 hour
    query = `
SELECT 
  enterprise_key,
  date_trunc('hour', order_date_parsed) AS datetime,
  sum(original_order_total_amount) AS original_order_total_amount,
  sum(line_ordered_qty) AS line_ordered_qty
FROM 
  order_book_line 
  where order_date_parsed>='${start_date_formatted}' and order_date_parsed<='${end_date_formatted}'
GROUP BY 
  enterprise_key, date_trunc('hour', order_date_parsed);`;
  } else if (+intervaltime === 86400) {
    console.log(86400);
    // 1 day
    query = `
    SELECT
    enterprise_key,
    DATE_TRUNC('day', order_date_parsed) AS datetime,
    sum(original_order_total_amount) AS original_order_total_amount,
    sum(line_ordered_qty) AS line_ordered_qty
FROM
    order_book_line 
    where order_date_parsed>='${start_date_formatted}' and order_date_parsed<='${end_date_formatted}' GROUP BY
    enterprise_key,
    DATE_TRUNC('day', order_date_parsed); `;
  } else if (+intervaltime === 172800) {
    console.log(17400);
    query = `
    SELECT
    enterprise_key,
    DATE_TRUNC('month', order_date_parsed) AS datetime,
    sum(original_order_total_amount) AS original_order_total_amount,
    sum(line_ordered_qty) AS line_ordered_qty
FROM
    order_book_line 
    where order_date_parsed>='${start_date_formatted}' and order_date_parsed<='${end_date_formatted}' GROUP BY
    enterprise_key,
    DATE_TRUNC('month', order_date_parsed); `;
  }

  try {
    client.query(query, (err, result) => {
      if (err) {
        res.status(500).send(err);
      } else {
        const groupedChartSeries = result.rows.reduce((acc, order) => {
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
            datetime:
              +intervaltime === 86400
                ? moment(order.datetime).format("YYYY-MM-DD")
                : +intervaltime === 3600
                ? moment(order.datetime).format("DD MMM HH:mm")
                : +intervaltime === 172800
                ? moment(order.datetime).format("MMM YYYY")
                : moment(order.datetime).format("DD MMM HH:mm"),

            original_order_total_amount: +order.original_order_total_amount,
            line_ordered_qty: +order.line_ordered_qty,
          });

          return acc;
        }, {});
        res.status(200).json(groupedChartSeries);
      }
    });
  } catch (e) {
    console.log(e);
  }
};

const getSalesCategories = async (req, res) => {
  const start_date = req.query.start_date;
  const end_date = req.query.end_date;

  // 2022-11-17 22:12
  const start_date_formatted = moment(start_date, "YYYY-MM-DD HH:mm").format(
    "YYYY-MM-DD HH:mm:ss"
  );
  const end_date_formatted = moment(end_date, "YYYY-MM-DD HH:mm").format(
    "YYYY-MM-DD HH:mm:ss"
  );

  const query = `select ENTERPRISE_KEY,ORDER_CAPTURE_CHANNEL,ITEM_INFO, sum(original_order_total_amount) as original_order_total_amount ,
  sum(line_ordered_qty) as line_ordered_qty from order_book_line 
  WHERE order_date_parsed>='${start_date_formatted}' and order_date_parsed<='${end_date_formatted}'
  group by ENTERPRISE_KEY,ORDER_CAPTURE_CHANNEL,ITEM_INFO;  `;

  try {
    client.query(query, (err, result) => {
      if (err) {
        res.status(500).send(err);
      } else {
        const groupedSalesCategoriesData = result.rows.reduce(
          (result, item) => {
            const { enterprise_key, order_capture_channel, item_info } = item;

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

            return result;
          },
          []
        );

        res.status(200).json(groupedSalesCategoriesData);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

const getTopItems = async (req, res) => {
  const start_date = req.query.start_date;
  const end_date = req.query.end_date;

  // 2022-11-17 22:12
  const start_date_formatted = moment(start_date, "YYYY-MM-DD HH:mm").format(
    "YYYY-MM-DD HH:mm:ss"
  );
  const end_date_formatted = moment(end_date, "YYYY-MM-DD HH:mm").format(
    "YYYY-MM-DD HH:mm:ss"
  );

  const query = `(select enterprise_key,web_category,brand_name,item_id,sum(line_ordered_qty) as line_ordered_qty,image_location,image_id
  from order_book_line where enterprise_key ='AWD' and order_date_parsed>='${start_date_formatted}' and order_date_parsed<='${end_date_formatted}'
  group by item_id,enterprise_key,web_category,brand_name,image_location,image_id order by line_ordered_qty desc limit 10) UNION ALL
  select enterprise_key,web_category,brand_name,item_id,sum(line_ordered_qty) as line_ordered_qty, image_location,image_id  
  from order_book_line where enterprise_key ='AWW' and order_date_parsed>='${start_date_formatted}' and order_date_parsed<='${end_date_formatted}'
  group by item_id,enterprise_key,web_category,brand_name,image_location,image_id order by line_ordered_qty desc limit 20;
  
  (select enterprise_key,web_category,brand_name,item_id,sum(original_order_total_amount) as original_order_total_amount,image_location,image_id  
   from order_book_line where enterprise_key ='AWD' and order_date_parsed>='${start_date_formatted}' and order_date_parsed<='${end_date_formatted}'
  group by item_id,enterprise_key,web_category,brand_name,image_location,image_id order by original_order_total_amount desc limit 10) UNION ALL
  select enterprise_key,web_category,brand_name,item_id,sum(original_order_total_amount) as original_order_total_amount, image_location,image_id  
  from order_book_line where enterprise_key ='AWW' and order_date_parsed>='${start_date_formatted}' and order_date_parsed<='${end_date_formatted}'
  group by item_id,enterprise_key,web_category,brand_name,image_location,image_id order by original_order_total_amount desc limit 20;
  `;

  try {
    client.query(query, (err, result) => {
      if (err) {
        res.status(500).send(err);
      } else {
        console.log(result[0].rows)
        const groupedTopItemsDataByVolume = result[0].rows.reduce(
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
        const groupedTopItemsDataByValue = result[1].rows.reduce(
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

        res.json({
          byVolume: groupedTopItemsDataByVolume,
          byValue: groupedTopItemsDataByValue,
        });
      }
    });
  } catch (error) {
    console.log(error);
  }
};

const getSalesAverage = async (req, res) => {
  const fulldate = req.query.date;
  let interval = req.query.interval;

  const extractDay = fulldate.split("-")[2];
  if (!interval) {
    interval = "hourly";
  }

  let query;
  if (interval === "hourly") {
    query = `SELECT enterprise_key,CAST(date_hour AS TIME) AS time_only,avg(total_sum_by_day) as final_total from (
  SELECT
      enterprise_key,
      date_hour,
      SUM(total_sum) AS total_sum_by_day
  FROM (
      SELECT
          enterprise_key,
          DATE_TRUNC('hour', order_date_parsed) AS date_hour,
          SUM(original_order_total_amount) AS total_sum
      FROM
          order_book_line
    WHERE
      EXTRACT(DAY FROM order_date_parsed) = ${extractDay}
      GROUP BY
          DATE_TRUNC('hour', order_date_parsed),
          enterprise_key
      ORDER BY
          date_hour
  
  ) AS subquery
  GROUP BY
      date_hour,
      enterprise_key ) as subquery_2 
    group by enterprise_key, time_only;
    `;
  } else if (interval === "daily") {
    query = `
    SELECT enterprise_key, CAST(date_hour AS DATE) AS date_only, avg(final_total_by_day) AS final_total
FROM (
    SELECT enterprise_key, date_hour, SUM(total_sum) AS final_total_by_day
    FROM (
        SELECT enterprise_key, DATE_TRUNC('day', order_date_parsed) AS date_hour, SUM(original_order_total_amount) AS total_sum
        FROM order_book_line
        WHERE EXTRACT(MONTH FROM order_date_parsed) = ${extractDay}
        GROUP BY DATE_TRUNC('day', order_date_parsed), enterprise_key
    ) AS subquery
    GROUP BY date_hour, enterprise_key
) AS subquery_2
GROUP BY enterprise_key, date_only
ORDER BY date_only;
`;
  } else if (interval === "quarter-hour") {
    query = `
    SELECT enterprise_key,CAST(date_hour AS TIME) AS time_only,avg(total_sum_by_day) as final_total from (
      SELECT
          enterprise_key,
          date_hour,
          SUM(total_sum) AS total_sum_by_day
      FROM (
          SELECT
              enterprise_key,
              date_trunc('hour', order_date_parsed) + 
        (date_part('minute', order_date_parsed)::int / 15) * interval '15 minutes' AS date_hour,
              SUM(original_order_total_amount) AS total_sum
          FROM
              order_book_line
        WHERE
          EXTRACT(DAY FROM order_date_parsed) = ${extractDay}
          GROUP BY
              date_hour,
              enterprise_key
          ORDER BY
              date_hour
      
      ) AS subquery
      GROUP BY
          date_hour,
          enterprise_key ) as subquery_2 
        group by enterprise_key, time_only;`;
  }

  try {
    const result = await client.query(query);

    const series = result.rows.reduce((result, item) => {
      if (!result[item.enterprise_key]) {
        result[item.enterprise_key] = [];
      }

      result[item.enterprise_key].push({
        enterprise_key: item.enterprise_key,
        datetime: moment(fulldate + " " + item.time_only).format(
          "MMM-DD HH:mm"
        ),
        // get two decimal places
        original_order_total_amount: Math.round(item.final_total * 100) / 100,
      });
      return result;
    }, {});

    const totals = result.rows.reduce((result, item) => {
      if (!result[item.enterprise_key]) {
        result[item.enterprise_key] = 0;
      }

      result[item.enterprise_key] += +item.final_total;
      return result;
    }, {});

    res.status(200).send({ total: totals, series: series });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

module.exports = {
  getChartData,
  getTotalStats,
  getSalesCategories,
  getTopItems,
  getSalesAverage,
};
