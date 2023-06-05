const express = require("express");

const {
  getTableData,
  getFullSalesData,
  getFullSalesDataTEST,
  UserLogin,
  getMinMaxValues,
  UserRegistration,
  getCustomQueryDate,
  getMapData,
  getTimeSeriesData
} = require("../controllers/tables");

const router = express.Router();

router.get("/", getTableData);
router.get("/getFullSalesData", getFullSalesData);
router.get("/getFullSalesDatatest", getFullSalesDataTEST);
router.post("/query", getCustomQueryDate);
router.post("/login", UserLogin);
router.get("/getMinMaxValues", getMinMaxValues);
router.post("/register", UserRegistration);
router.get("/map", getMapData);
router.get("/timeSeriesData", getTimeSeriesData);

module.exports = router;
