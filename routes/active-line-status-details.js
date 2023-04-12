const express = require("express");
const {
  getOriginalOrderTotalAmount, getOriginalOrderTotalByMonth,
} = require("../controllers/active-line-status-details");

const router = express.Router();

router.get("/original-order-total", getOriginalOrderTotalAmount);
router.get("/original-order-total-by-month", getOriginalOrderTotalByMonth);

module.exports = router;
