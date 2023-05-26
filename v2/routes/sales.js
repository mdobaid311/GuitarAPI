const express = require("express");
const {
  getChartData,
  getTotalStats,
  getSalesCategories,
  getTopItems,
} = require("../controllers/sales");
const { getOrgChartDataRange } = require("../controllers/org-chart");

const router = express.Router();

router.get("/getChartData", getChartData);
router.get("/getTotalStats", getTotalStats);
router.get("/getSalesCategories", getSalesCategories);
router.get("/getTopItems", getTopItems);
router.get("/getOrgChartData", getOrgChartDataRange);

module.exports = router;
