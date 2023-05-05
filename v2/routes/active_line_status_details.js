const express = require("express");
const { getSalesData, getSalesDataByRange } = require("../controllers/active_line_status_details");

const router = express.Router();

router.get("/get-sales-data", getSalesData);
router.get("/get-sales-data-by-range", getSalesDataByRange);


module.exports = router;
