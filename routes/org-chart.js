const express = require("express");
const { getOrgChartData, getOrgChartDataRange } = require("../controllers/org-chart");
const router = express.Router();

router.get("/", getOrgChartData);
router.get("/range", getOrgChartDataRange);

module.exports = router;
