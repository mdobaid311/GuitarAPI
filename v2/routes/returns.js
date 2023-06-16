const express = require("express");

const {
    getReturnsData,
    mileStoneInfo,
    getMileStoneInfo,
    scheduleExportData,
    createWidgetsInfo,
    getUserConfigurations,
    createStatusInfo,
    createQueriesInfo
} = require("../controllers/returns");

const router = express.Router();

router.get("/getReturnsData", getReturnsData);
router.post("/mileStoneInfo", mileStoneInfo);
router.get("/getMileStoneInfo", getMileStoneInfo);
router.post("/scheduleExportData", scheduleExportData);
router.post("/createWidgetsInfo", createWidgetsInfo);
router.post("/createStatusInfo", createStatusInfo);
router.post("/createQueriesInfo", createQueriesInfo);
router.get("/getUserConfigurations", getUserConfigurations);

module.exports = router;