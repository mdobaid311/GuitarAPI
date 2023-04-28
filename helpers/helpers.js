const moment = require("moment");

const split_years = (startDate, endDate) => {
  startDate = moment(startDate, "YYYY-MM-DD HH:mm").format("YYYY-MM-DD HH:mm");
  endDate = moment(endDate, "YYYY-MM-DD HH:mm").format("YYYY-MM-DD HH:mm");
  const startYear = moment(startDate).year();
  const endYear = moment(endDate).year();

  const years = [];
  for (let year = startYear; year <= endYear; year++) {
    let yearStart = moment(`${year}-01-01 00:00`, "YYYY-MM-DD HH:mm").format(
      "YYYY-MM-DD HH:mm"
    );
    let yearEnd = moment(`${year}-12-31 23:59`, "YYYY-MM-DD HH:mm").format(
      "YYYY-MM-DD HH:mm"
    );

    if (year === startYear) {
      yearStart = startDate;
    }
    if (year === endYear) {
      yearEnd = endDate;
    }

    years.push({ startDate: yearStart, endDate: yearEnd });
  }

  return years;
};

const split_months = (startDate, endDate) => {
  startDate = moment(startDate, "YYYY-MM-DD HH:mm")
    .startOf("month")
    .format("YYYY-MM-DD HH:mm");
  endDate = moment(endDate, "YYYY-MM-DD HH:mm")
    .endOf("month")
    .format("YYYY-MM-DD HH:mm");
  const startMonth = moment(startDate).month();
  const endMonth = moment(endDate).month();
  const startYear = moment(startDate).year();
  const endYear = moment(endDate).year();

  const months = [];
  for (let year = startYear; year <= endYear; year++) {
    const monthStart = year === startYear ? startMonth : 0;
    const monthEnd = year === endYear ? endMonth : 11;

    for (let month = monthStart; month <= monthEnd; month++) {
      let monthStart = moment(
        `${year}-${month + 1}-01 00:00`,
        "YYYY-MM-DD HH:mm"
      ).format("YYYY-MM-DD HH:mm");
      let monthEnd = moment(
        `${year}-${month + 1}-${moment(
          `${year}-${month + 1}`,
          "YYYY-MM"
        ).daysInMonth()} 23:59`,
        "YYYY-MM-DD HH:mm"
      ).format("YYYY-MM-DD HH:mm");

      if (year === startYear && month === startMonth) {
        monthStart = startDate;
      }
      if (year === endYear && month === endMonth) {
        monthEnd = endDate;
      }

      months.push({ startDate: monthStart, endDate: monthEnd });
    }
  }

  return months;
};

module.exports = {
  split_years,
  split_months,
};
