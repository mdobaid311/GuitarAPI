const express = require("express");
const {
  getOriginalOrderTotalAmount,
} = require("../controllers/active-line-status-details");

const router = express.Router();

router.get("/original-order-total", getOriginalOrderTotalAmount);

module.exports = router;
