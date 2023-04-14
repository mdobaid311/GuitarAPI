const express = require("express");
const {
  getOriginalOrderTotalAmount,
  getOriginalOrderTotalByMonth,
  getOriginalOrderTotalByYear,
  getOriginalOrderTotalByDay,
  getOriginalOrderTotalByHour,
} = require("../controllers/active-line-status-details");

const router = express.Router();

router.get("/original-order-total", getOriginalOrderTotalAmount);
router.get("/original-order-total-by-month", getOriginalOrderTotalByMonth);
router.get("/original-order-total-by-year", getOriginalOrderTotalByYear);
router.get("/original-order-total-by-day", getOriginalOrderTotalByDay);
router.get("/original-order-total-by-hour", getOriginalOrderTotalByHour);

module.exports = router;
