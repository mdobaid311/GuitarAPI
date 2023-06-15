const express = require("express");

const {
    getReturnsData,
    mileStoneInfo,
    getMileStoneInfo,
    scheduleExportData
} = require("../controllers/returns");

const router = express.Router();

router.get("/getReturnsData", getReturnsData);
router.post("/mileStoneInfo", mileStoneInfo);
router.get("/getMileStoneInfo", getMileStoneInfo);
router.post("/scheduleExportData", scheduleExportData);

module.exports = router;