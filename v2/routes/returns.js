const express = require("express");

const {
    getReturnsData,
    mileStoneInfo,
    getMileStoneInfo,
    scheduleExportData,
    createUserConfigurations,
    getUserConfigurations
} = require("../controllers/returns");

const router = express.Router();

router.get("/getReturnsData", getReturnsData);
router.post("/mileStoneInfo", mileStoneInfo);
router.get("/getMileStoneInfo", getMileStoneInfo);
router.post("/scheduleExportData", scheduleExportData);
router.post("/createUserConfigurations", createUserConfigurations);
router.get("/getUserConfigurations", getUserConfigurations);

module.exports = router;