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
  getAllUser,
  getTimeSeriesData,
  getCityData,
  getDataForTimeSeries,
  thresholdInfo,
  getThresholdInfo
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
router.get("/users",getAllUser)
router.get("/timeSeriesData", getTimeSeriesData);
router.get("/getCityData", getCityData);
router.get("/getDataForTimeSeries", getDataForTimeSeries);
router.get("/getThresholdInfo", getThresholdInfo);
router.post("/thresholdInfo", thresholdInfo);

module.exports = router;
