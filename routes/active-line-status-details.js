const express = require("express");
// const {
//   getOriginalOrderTotalAmount,
//   getOriginalOrderTotalByMonth,
//   getOriginalOrderTotalByYear,
//   getOriginalOrderTotalByDay,
//   getOriginalOrderTotalByHour,
// } = require("../controllers/active-line-status-details");

const {
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
} = require("../controllers/alsd");

const router = express.Router();

router.get("/original-order-total", getOriginalOrderTotalAmount);
router.get("/original-order-total-by-month", getOriginalOrderTotalByMonth);
router.get("/original-order-total-by-year", getOriginalOrderTotalByYear);
router.get("/original-order-total-by-day", getOriginalOrderTotalByDay);
router.get("/original-order-total-by-hour", getOriginalOrderTotalByHour);
router.get(
  "/original-order-total-by-tenmin-range",
  getOriginalOrderTotalByTenMinRange
);
router.get(
  "/original-order-total-by-hour-range",
  getOriginalOrderTotalByHourRange
);
router.get(
  "/original-order-total-by-day-range",
  getOriginalOrderTotalByDayRange
);
router.get(
  "/original-order-total-by-month-range",
  getOriginalOrderTotalByMonthRange
);
router.get(
  "/original-order-total-by-year-range",
  getOriginalOrderTotalByYearRange
);

module.exports = router;
