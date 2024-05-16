const express = require("express");
const {
  getChartData,
  getTotalStats,
  getSalesCategories,
  getTopItems,
  getSalesAverage,
} = require("../controllers/sales");
const { getOrgChartDataRange } = require("../controllers/org-chart");
const { GetDashboardData } = require("../controllers/dashboard.controller");

const router = express.Router();

router.get("/getChartData", getChartData);
router.get("/getTotalStats", getTotalStats);
router.get("/getSalesCategories", getSalesCategories);
router.get("/getTopItems", getTopItems);
router.get("/getOrgChartData", getOrgChartDataRange);
router.get("/getSalesAverage",getSalesAverage)
router.get("/GetDashboardData",GetDashboardData)


module.exports = router;
