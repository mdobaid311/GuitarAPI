const express = require("express");
const {
  // getSalesData,
  // getSalesDataByRange,
  getFullSalesData,
} = require("../controllers/active_line_status_details");

const router = express.Router();

// router.get("/get-sales-data", getSalesData);
// router.get("/get-sales-data-by-range", getSalesDataByRange);
router.get("/get-full-sales-data", getFullSalesData);

module.exports = router;
