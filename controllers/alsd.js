const client = require("../config/scylla-client");
const moment = require("moment");
const { split_years, split_months } = require("../helpers/helpers");

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

const getOriginalOrderTotalByTenMinRange = async (req, res) => {
  const { startDate, endDate } = req.query;
  const startYear = moment(startDate, "YYYY-MM-DD HH:mm").format("YYYY");
  const startMonth = moment(startDate, "YYYY-MM-DD HH:mm").format("MM");
  const startDay = moment(startDate, "YYYY-MM-DD HH:mm").format("DD");
  const startHour = moment(startDate, "YYYY-MM-DD HH:mm").format("HH");
  const endYear = moment(endDate, "YYYY-MM-DD HH:mm").format("YYYY");
  const endMonth = moment(endDate, "YYYY-MM-DD HH:mm").format("MM");
  const endDay = moment(endDate, "YYYY-MM-DD HH:mm").format("DD");
  const endHour = moment(endDate, "YYYY-MM-DD HH:mm").format("HH");

  try {
    const result = await client.execute(
      `select * from alsd_aggregated where year>=${startYear} and month>=${startMonth} and day>=${startDay} and hour>=${startHour} and year<=${endYear} and month<=${endMonth} and day<=${endDay} and hour<=${endHour} ALLOW FILTERING`,
      null,
      {
        prepare: true,
        fetchSize: 10000,
      }
    );

    if (result.rows.length === 0) {
      return res.status(200).json({ totalAmount: 0, data: [] });
    }
    const tenMinOrderTotal = result.rows.reduce((acc, order) => {
      const ten_min = order.ten_min.low;
      const total = order.original_order_total_amount.low;
      acc[ten_min] = (acc[ten_min] || 0) + total;
      return acc;
    }, {});

    const totalAmount = Object.values(tenMinOrderTotal).reduce(
      (acc, total) => acc + total
    );

    const tenMinOrderTotalArray = Object.keys(tenMinOrderTotal).map(
      (ten_min) => {
        console.log(ten_min);
        return {
          ten_min: moment(ten_min, "mm").format("mm"),
          total: tenMinOrderTotal[ten_min],
        };
      }
    );
    res.status(200).json({ totalAmount, data: tenMinOrderTotalArray });
  } catch (error) {
    res.status(401).json(error);
  }
};

const getOriginalOrderTotalByHourRange = async (req, res) => {
  const { startDate, endDate } = req.query;
  const startYear = moment(startDate, "YYYY-MM-DD HH:mm").format("YYYY");
  const startMonth = moment(startDate, "YYYY-MM-DD HH:mm").format("MM");
  const startDay = moment(startDate, "YYYY-MM-DD HH:mm").format("DD");
  const startHour = moment(startDate, "YYYY-MM-DD HH:mm").format("HH");
  const endYear = moment(endDate, "YYYY-MM-DD HH:mm").format("YYYY");
  const endMonth = moment(endDate, "YYYY-MM-DD HH:mm").format("MM");
  const endDay = moment(endDate, "YYYY-MM-DD HH:mm").format("DD");
  const endHour = moment(endDate, "YYYY-MM-DD HH:mm").format("HH");

  try {
    const result = await client.execute(
      `select * from alsd_aggregated where year>=${startYear} and month>=${startMonth} and day>=${startDay} and hour>=${startHour} and year<=${endYear} and month<=${endMonth} and day<=${endDay} and hour<=${endHour} ALLOW FILTERING`,
      null,
      {
        prepare: true,
        fetchSize: 10000,
      }
    );
    if (result.rows.length === 0) {
      return res.status(200).json({ totalAmount: 0, data: [] });
    }

    const HourlyOrderTotal = result.rows.reduce((acc, order) => {
      const hour = order.hour.low;
      const total = order.original_order_total_amount.low;
      acc[hour] = (acc[hour] || 0) + total;
      return acc;
    }, {});

    const totalAmount = Object.values(HourlyOrderTotal).reduce(
      (acc, total) => acc + total
    );

    const HourlyOrderTotalArray = Object.keys(HourlyOrderTotal).map((hour) => {
      console.log(hour);
      return {
        hour: moment(hour, "HH").format("HH A"),
        total: HourlyOrderTotal[hour],
      };
    });
    res.status(200).json({ totalAmount, data: HourlyOrderTotalArray });
  } catch (error) {
    res.status(401).json(error);
  }
};

const getOriginalOrderTotalByDayRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dates = split_months(startDate, endDate);
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

      const result = await client.execute(
        `select * from alsd_aggregated where year>=${startYear} and month>=${startMonth} and day>=${startDay} and year<=${endYear} and month<=${endMonth} and day<=${endDay}  ALLOW FILTERING`,
        null,
        {
          prepare: true,
          fetchSize: 10000,
        }
      );
      results.unshift(...result.rows);
    }
    if (results.length === 0) {
      return res.status(200).json({ totalAmount: 0, data: [] });
    }
    const daylyOrderTotal = results.reduce((acc, order) => {
      const day = order.day.low;
      const total = order.original_order_total_amount.low;
      acc[day] = (acc[day] || 0) + total;
      return acc;
    }, {});

    const totalAmount = Object.values(daylyOrderTotal).reduce(
      (acc, total) => acc + total
    );

    const daylyOrderTotalArray = Object.keys(daylyOrderTotal).map((day) => {
      console.log(day);
      return {
        day: day,
        total: daylyOrderTotal[day],
      };
    });
    res.status(200).json({ totalAmount, data: daylyOrderTotalArray });
  } catch (error) {
    res.status(401).json(error);
  }
};

const getOriginalOrderTotalByMonthRange = async (req, res) => {
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
      const endYear = moment(dates[i].endDate, "YYYY-MM-DD HH:mm").format(
        "YYYY"
      );
      const endMonth = moment(dates[i].endDate, "YYYY-MM-DD HH:mm").format(
        "MM"
      );

      const result = await client.execute(
        `select * from alsd_aggregated where year>=${startYear} and month>= ${startMonth} and year<=${endYear} and month<=${endMonth}  ALLOW FILTERING`,
        null,
        {
          prepare: true,
          fetchSize: 10000,
        }
      );
      results.unshift(...result.rows);
    }

    if (results.length === 0) {
      return res.status(200).json({ totalAmount: 0, data: [] });
    }
    console.log(results[0]);

    const monthlyOrderTotal = results.reduce((acc, order) => {
      const month = order.month.low;
      const total = order.original_order_total_amount.low;
      acc[month] = (acc[month] || 0) + total;
      return acc;
    }, {});
    const totalAmount = Object.values(monthlyOrderTotal).reduce(
      (acc, total) => acc + total
    );

    const monthlyOrderTotalArray = Object.keys(monthlyOrderTotal).map(
      (month) => {
        console.log(month);
        return {
          month: moment(month, "MM").format("MM"),
          total: monthlyOrderTotal[month],
        };
      }
    );
    res.status(200).json({ totalAmount, data: monthlyOrderTotalArray });
  } catch (error) {
    res.status(401).json(error);
  }
};

const getOriginalOrderTotalByYearRange = async (req, res) => {
  const { startDate, endDate } = req.query;
  const startYear = moment(startDate, "YYYY-MM-DD HH:mm").format("YYYY");
  const startMonth = moment(startDate, "YYYY-MM-DD HH:mm").format("MM");
  const endYear = moment(endDate, "YYYY-MM-DD HH:mm").format("YYYY");
  const endMonth = moment(endDate, "YYYY-MM-DD HH:mm").format("MM");
  try {
    const result = await client.execute(
      `select * from alsd_aggregated where year>=${startYear} and month>=${startMonth}  and year<=${endYear} and month<=${endMonth}   ALLOW FILTERING`,
      null,
      {
        prepare: true,
        fetchSize: 10000,
      }
    );
    if (result.rows.length === 0) {
      return res.status(200).json({ totalAmount: 0, data: [] });
    }
    const yearlyOrderTotal = result.rows.reduce((acc, order) => {
      const year = order.year.low;
      const total = order.original_order_total_amount.low;
      acc[year] = (acc[year] || 0) + total;
      return acc;
    }, {});

    const totalAmount = Object.values(yearlyOrderTotal).reduce(
      (acc, total) => acc + total
    );

    const yearlyOrderTotalArray = Object.keys(yearlyOrderTotal).map((year) => {
      return {
        year: moment(year, "YYYY").format("YYYY"),
        total: yearlyOrderTotal[year],
      };
    });
    res.status(200).json({ totalAmount, data: yearlyOrderTotalArray });
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
  getOriginalOrderTotalByTenMinRange,
  getOriginalOrderTotalByHourRange,
  getOriginalOrderTotalByDayRange,
  getOriginalOrderTotalByMonthRange,
  getOriginalOrderTotalByYearRange,
};
