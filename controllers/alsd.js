const client = require("../config/scylla-client");
const moment = require("moment");

const getOriginalOrderTotalAmount = async (req, res) => {
  const { start_date, end_date, year } = req.query;
  try {
    if (year) {
      const result = await client.execute(
        `select sum(original_order_total_amount) as original_orders_total from alsd_aggregated where year=${year} ALLOW FILTERING`
      );
      const total = [
        {
          original_orders_total: +result.rows[0].original_orders_total,
        },
      ];
      res.status(200).json(total);
      return;
    }

    if (!start_date && !end_date) {
      const result = await client.execute(
        "select sum(original_order_total_amount) as original_orders_total from alsd_aggregated ALLOW FILTERING"
      );

      const total = [
        {
          original_orders_total: +result.rows[0].original_orders_total,
        },
      ];
      res.status(200).json(total);
    } else if (start_date && end_date) {
      const startYear = moment(start_date).format("YYYY");
      const startMonth = moment(start_date).format("MM");
      const startDay = moment(start_date).format("DD");

      const endYear = moment(end_date).format("YYYY");
      const endMonth = moment(end_date).format("MM");
      const endDay = moment(end_date).format("DD");

      const result = await client.execute(
        `SELECT sum(original_order_total_amount) as original_orders_total from alsd_aggregated where year>=${startYear} and month>=${startMonth} and day>=${startDay} and year<=${endYear} and month<=${endMonth} and day<=${endDay} limit 10 ALLOW FILTERING ;`
      );

      const total = [
        {
          original_orders_total: +result.rows[0].original_orders_total,
        },
      ];
      res.status(200).json(total);
    } else if (start_date) {
      console.log("} else if (start_date) {");
      const result = await client.execute(
        `select sum(original_order_total_amount) as original_orders_total from temp_table where order_date >= ${start_date} ALLOW FILTERING`
      );

      res.status(200).json(result.rows);
    } else if (end_date) {
      console.log("} else if (end_date) {");
      const result = await client.execute(
        `select sum(original_order_total_amount) as original_orders_total from temp_table where order_date <= ${end_date} ALLOW FILTERING`
      );

      res.status(200).json(result.rows);
    }
  } catch (error) {
    res.status(400).send(error);
  }
};

const getOriginalOrderTotalByMonth = async (req, res) => {
  const { forYear } = req.query;

  try {
    const result = await client.execute(
      `select * from alsd_aggregated where year=${forYear} ALLOW FILTERING`,
      null,
      {
        prepare: true,
        fetchSize: 10000,
      }
    );

    const monthlyOrderTotal = result.rows.reduce((acc, order) => {
      const month = order.month.low;
      const total = order.original_order_total_amount.low;
      acc[month] = (acc[month] || 0) + total;
      return acc;
    }, {});

    const monthlyOrderTotalArray = Object.keys(monthlyOrderTotal).map(
      (month) => {
        return {
          monthName: moment(month, "MM").format("MMMM"),
          total: monthlyOrderTotal[month],
        };
      }
    );
    res.status(200).json(monthlyOrderTotalArray);
  } catch (error) {
    res.status(401).json(error);
  }
};

const getOriginalOrderTotalByYear = async (req, res) => {
  try {
    const result = await client.execute(
      `select * from alsd_aggregated ALLOW FILTERING`,
      null,
      {
        prepare: true,
        fetchSize: 10000,
      }
    );

    const yearlyOrderTotal = result.rows.reduce((acc, order) => {
      const year = order.year.low;
      const total = order.original_order_total_amount.low;
      acc[year] = (acc[year] || 0) + total;
      return acc;
    }, {});

    const yearlyOrderTotalArray = Object.keys(yearlyOrderTotal).map((year) => {
      return {
        year: year,
        total: yearlyOrderTotal[year],
      };
    });
    res.status(200).json(yearlyOrderTotalArray);
  } catch (error) {
    res.status(401).json(error);
  }
};

const getOriginalOrderTotalByDay = async (req, res) => {
  const { year, month } = req.query;

  try {
    const result = await client.execute(
      `select * from alsd_aggregated where year=${year} and month=${month} ALLOW FILTERING`,
      null,
      {
        prepare: true,
        fetchSize: 10000,
      }
    );

    const dailyOrderTotal = result.rows.reduce((acc, order) => {
      const day = order.day.low;
      const total = order.original_order_total_amount.low;
      acc[day] = (acc[day] || 0) + total;
      return acc;
    }, {});
    console.log(Object.keys(dailyOrderTotal));

    const dailyOrderTotalArray = Object.keys(dailyOrderTotal).map((day) => {
      return {
        day: day,
        total: dailyOrderTotal[day],
      };
    });
    res.status(200).json(dailyOrderTotalArray);
  } catch (error) {
    res.status(401).json(error);
  }
};

const getOriginalOrderTotalByHour = async (req, res) => {
  const { year, month, day } = req.query;

  try {
    const result = await client.execute(
      `select * from alsd_aggregated where year=${year} and month=${month} and day=${day} ALLOW FILTERING`,
      null,
      {
        prepare: true,
        fetchSize: 10000,
      }
    );

    const hourlyOrderTotal = result.rows.reduce((acc, order) => {
      const hour = order.hour.low;
      const total = order.original_order_total_amount.low;
      acc[hour] = (acc[hour] || 0) + total;
      return acc;
    }, {});

    const hourlyOrderTotalArray = Object.keys(hourlyOrderTotal).map((hour) => {
      return {
        hour: moment(hour, "HH").format("HH A"),
        total: hourlyOrderTotal[hour],
      };
    });
    res.status(200).json(hourlyOrderTotalArray);
  } catch (error) {
    res.status(401).json(error);
  }
};

module.exports = {
  getOriginalOrderTotalAmount,
  getOriginalOrderTotalByMonth,
  getOriginalOrderTotalByYear,
  getOriginalOrderTotalByDay,
  getOriginalOrderTotalByHour,
};
