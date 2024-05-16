const client = require("../config/postgre_client");
const {
  getFulfillmentDescription,
} = require("../utils/fulfillment_type_details");

const getOrgChartDataRange = async (req, res) => {
  // select enterprise_key, line_fulfillment_type, original_order_total_amount from order_book_line where order_date_parsed>='2023-01-01' and order_date_parsed<='2023-01-31';

  const { start_date, end_date, type } = req.query;

  if (type === "order_capture_channel") {
    try {
      const query = `select enterprise_key, order_capture_channel, sum(original_order_total_amount) as original_order_total_amount  from order_book_line
    where order_date_parsed>='${start_date}' and order_date_parsed<='${end_date}' group by order_capture_channel,
    enterprise_key;`;


      await client.query(query, (err, result) => {
        if (err) {
          res.status(500).json(err);
          return;
        } else {
          const outputArray = result.rows.reduce((acc, item) => {
            const existingItem = acc.find((i) => i.key === item.enterprise_key);
            // console.log("existingItem", existingItem);

            if (existingItem) {
              const existingChild = existingItem.children.find(
                (c) => c.key === item.order_capture_channel
              );

              if (existingChild) {
                existingChild.original_order_total_amount += Number(
                  item.original_order_total_amount
                );
              } else {
                existingItem.children.push({
                  key: item.order_capture_channel,
                  original_order_total_amount: Number(
                    item.original_order_total_amount
                  ),
                  children: [],
                });
              }

              existingItem.original_order_total_amount += Number(
                item.original_order_total_amount
              );
            } else {
              acc.push({
                key: item.enterprise_key,
                original_order_total_amount: Number(
                  item.original_order_total_amount
                ),
                children: [
                  {
                    key: item.order_capture_channel,
                    original_order_total_amount: Number(
                      item.original_order_total_amount
                    ),
                    children: [],
                  },
                ],
              });
            }

            return acc;
          }, []);
          const finalTotal = outputArray.reduce((acc, item) => {
            return (acc += item.original_order_total_amount);
          }, 0);

          res.status(200).json([
            {
              key: "Sales",
              original_order_total_amount: finalTotal,
              children: outputArray,
            },
          ]);
        }
      });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  } else if (type === "fulfillment") {
    try {
      const query = `select enterprise_key, line_fulfillment_type, sum(original_order_total_amount) as original_order_total_amount  from order_book_line
    where order_date_parsed>='${start_date}' and order_date_parsed<='${end_date}' group by line_fulfillment_type,
    enterprise_key;`;

      await client.query(query, (err, result) => {
        if (err) {
          res.status(500).json(err);
          return;
        } else {
          const outputArray = result.rows.reduce((acc, item) => {
            const existingItem = acc.find((i) => i.key === item.enterprise_key);
            // console.log("existingItem", existingItem);

            if (existingItem) {
              const existingChild = existingItem.children.find(
                (c) =>
                  c.key ===
                  getFulfillmentDescription(item.line_fulfillment_type)
              );

              if (existingChild) {
                existingChild.original_order_total_amount += Number(
                  item.original_order_total_amount
                );
              } else {
                existingItem.children.push({
                  key: getFulfillmentDescription(item.line_fulfillment_type),
                  original_order_total_amount: Number(
                    item.original_order_total_amount
                  ),
                  children: [],
                });
              }

              existingItem.original_order_total_amount += Number(
                item.original_order_total_amount
              );
            } else {
              acc.push({
                key: item.enterprise_key,
                original_order_total_amount: Number(
                  item.original_order_total_amount
                ),
                children: [
                  {
                    key: getFulfillmentDescription(item.line_fulfillment_type),
                    original_order_total_amount: Number(
                      item.original_order_total_amount
                    ),
                    children: [],
                  },
                ],
              });
            }

            return acc;
          }, []);
          const finalTotal = outputArray.reduce((acc, item) => {
            return (acc += item.original_order_total_amount);
          }, 0);

          res.status(200).json([
            {
              key: "Sales",
              original_order_total_amount: finalTotal,
              children: outputArray,
            },
          ]);
        }
      });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  } else {
    try {
      const query = `select enterprise_key, item_info, sum(original_order_total_amount) as original_order_total_amount  from order_book_line
    where order_date_parsed>='${start_date}' and order_date_parsed<='${end_date}' group by item_info,
    enterprise_key;`;

    console.log(query)
      await client.query(query, (err, result) => {
        if (err) {
          res.status(500).json(err);
          return;
        } else {
          const outputArray = result.rows.reduce((acc, item) => {
            const existingItem = acc.find((i) => i.key === item.enterprise_key);
            // console.log("existingItem", existingItem);

            if (existingItem) {
              const existingChild = existingItem.children.find(
                (c) => c.key === item.item_info
              );

              if (existingChild) {
                existingChild.original_order_total_amount += Number(
                  item.original_order_total_amount
                );
              } else {
                existingItem.children.push({
                  key: item.item_info,
                  original_order_total_amount: Number(
                    item.original_order_total_amount
                  ),
                  children: [],
                });
              }

              existingItem.original_order_total_amount += Number(
                item.original_order_total_amount
              );
            } else {
              acc.push({
                key: item.enterprise_key,
                original_order_total_amount: Number(
                  item.original_order_total_amount
                ),
                children: [
                  {
                    key: item.item_info,
                    original_order_total_amount: Number(
                      item.original_order_total_amount
                    ),
                    children: [],
                  },
                ],
              });
            }

            return acc;
          }, []);
          const finalTotal = outputArray.reduce((acc, item) => {
            return (acc += item.original_order_total_amount);
          }, 0);

          res.status(200).json([
            {
              key: "Sales",
              original_order_total_amount: finalTotal,
              children: outputArray,
            },
          ]);
        }
      });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }
};

module.exports = {
  getOrgChartDataRange,
};
