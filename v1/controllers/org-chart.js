const client = require("../config/scylla-client");
const moment = require("moment");
const { split_years } = require("../helpers/helpers");

const getOrgChartData = async (req, res) => {
  const { start_date, end_date, year } = req.query;
  const startYear = moment(start_date).format("YYYY");
  const startMonth = moment(start_date).format("MM");
  const startDay = moment(start_date).format("DD");

  const endYear = moment(end_date).format("YYYY");
  const endMonth = moment(end_date).format("MM");
  const endDay = moment(end_date).format("DD");

  try {
    const pageSize = 20000;
    const query = "SELECT * FROM alsd_aggregated_with_categories";
    let pageState = null;
    let records = [];

    do {
      const options = { prepare: true, fetchSize: pageSize };
      if (pageState) {
        options.pageState = pageState;
      }

      const result = await client.execute(query, [], options);
      records = records.concat(result.rows);
      pageState = result.pageState;
    } while (pageState);

    const outputArray = records.reduce((acc, item) => {
      const existingItem = acc.find((i) => i.key === item.enterprise_key);

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
          original_order_total_amount: Number(item.original_order_total_amount),
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
  } catch (err) {
    res.status(500).json(err);
  }
};

const getOrgChartDataRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dates = split_years(startDate, endDate);
    const results = [];
    for (let i = 0; i < dates.length; i++) {
      const startYear = moment(dates[i].startDate, "YYYY-MM-DD HH:mm").format(
        "YYYY"
      );
      const startMonth = moment(dates[i].startDate, "YYYY-MM-DD HH:mm").format(
        "MM"
      );
      const startDay = moment(dates[i].startDate, "YYYY-MM-DD HH:mm").format(
        "DD"
      );

      const endYear = moment(dates[i].endDate, "YYYY-MM-DD HH:mm").format(
        "YYYY"
      );
      const endMonth = moment(dates[i].endDate, "YYYY-MM-DD HH:mm").format(
        "MM"
      );
      const endDay = moment(dates[i].endDate, "YYYY-MM-DD HH:mm").format("DD");
      console.log(startYear, startMonth, startDay, endYear, endMonth, endDay);
      const pageSize = 20000;
      const query = `SELECT * FROM alsd_aggregated_with_categories where year>=${startYear} and month>=${startMonth} and day>=${startDay}    ALLOW FILTERING`;

      let pageState = null;
      let records = [];

      do {
        const options = { prepare: true, fetchSize: pageSize };
        if (pageState) {
          options.pageState = pageState;
        }

        const result = await client.execute(query, [], options);
        console.log(result.rows)
        records = records.concat(result.rows);
        pageState = result.pageState;
      } while (pageState);
      results.push(...records);
    }
    const outputArray = results.reduce((acc, item) => {
      const existingItem = acc.find((i) => i.key === item.enterprise_key);

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
          original_order_total_amount: Number(item.original_order_total_amount),
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
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

module.exports = {
  getOrgChartData,
  getOrgChartDataRange,
};
