const express = require("express");

const {
    getReturnsData,
    mileStoneInfo,
    getMileStoneInfo,
    getExportedData
} = require("../controllers/returns");

const router = express.Router();

router.get("/getReturnsData", getReturnsData);
router.post("/mileStoneInfo", mileStoneInfo);
router.get("/getMileStoneInfo", getMileStoneInfo);
// router.get("/getExportedData", getExportedData);

module.exports = router;