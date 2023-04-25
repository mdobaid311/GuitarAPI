const express = require("express");
const { getOrgChartData } = require("../controllers/org-chart");
const router = express.Router();

router.get("/", getOrgChartData);

module.exports = router;
