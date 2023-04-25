const client = require("../config/scylla-client");
const moment = require("moment");

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
      const existingItem = acc.find(
        (i) => i.enterprise_key === item.enterprise_key
      );

      if (existingItem) {
        const existingChild = existingItem.children.find(
          (c) => c.order_capture_channel === item.order_capture_channel
        );

        if (existingChild) {
          existingChild.total_original_order_total_amount += Number(
            item.original_order_total_amount
          );
        } else {
          existingItem.children.push({
            order_capture_channel: item.order_capture_channel,
            total_original_order_total_amount: Number(
              item.original_order_total_amount
            ),
          });
        }

        existingItem.total_original_order_total_amount += Number(
          item.original_order_total_amount
        );
      } else {
        acc.push({
          enterprise_key: item.enterprise_key,
          total_original_order_total_amount: Number(
            item.original_order_total_amount
          ),
          children: [
            {
              order_capture_channel: item.order_capture_channel,
              total_original_order_total_amount: Number(
                item.original_order_total_amount
              ),
            },
          ],
        });
      }

      return acc;
    }, []);
    res.status(200).json(outputArray);
  } catch (err) {
    res.status(500).json(err);
  }
};

const getOrgChartData3 = async (req, res) => {
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

    const outputArray = records.reduce((acc, curr) => {
      const enterpriseKey = curr.enterprise_key;
      const orderTotalAmount = parseInt(curr.original_order_total_amount);

      let enterpriseObj = acc.find((e) => e.enterprise_key === enterpriseKey);

      if (!enterpriseObj) {
        enterpriseObj = {
          enterprise_key: enterpriseKey,
          total_original_order_total_amount: 0,
          children: [],
        };
        acc.push(enterpriseObj);
      }

      enterpriseObj.total_original_order_total_amount += orderTotalAmount;
      enterpriseObj.children.push({
        order_capture_channel: curr.order_capture_channel,
        total_original_order_total_amount: orderTotalAmount,
      });

      return acc;
    }, []);

    res.status(200).json(outputArray);
  } catch (err) {
    res.status(500).json(err);
  }
};

const getOrgChartData2 = async (req, res) => {
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

    const reduced = records.reduce((acc, cur) => {
      if (acc[cur.enterprise_key]) {
        acc[cur.enterprise_key] = {
          name: cur.enterprise_key,
          value:
            acc[cur.enterprise_key].value + cur.original_order_total_amount.low,
        };
      } else {
        acc[cur.enterprise_key] = {
          name: cur.enterprise_key,
          value: cur.original_order_total_amount.low,
        };
      }
      return acc;
    }, {});
    res.status(200).json(reduced);
  } catch (err) {
    res.status(500).json(err);
  }
};
const getOrgChartData1 = async (req, res) => {
  const { start_date, end_date, year } = req.query;
  const startYear = moment(start_date).format("YYYY");
  const startMonth = moment(start_date).format("MM");
  const startDay = moment(start_date).format("DD");

  const endYear = moment(end_date).format("YYYY");
  const endMonth = moment(end_date).format("MM");
  const endDay = moment(end_date).format("DD");

  try {
    const res1 = await client.execute(
      `select count(*) from alsd_aggregated_with_categories where enterprise_key='MF' ALLOW FILTERING`,
      null,
      {
        fetchSize: 60000,
      }
    );

    res.status(200).json({
      res1: res1.rowslength,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
  getOrgChartData,
};
