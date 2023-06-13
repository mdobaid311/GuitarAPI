const express = require("express");

const {
    getReturnsData,
    mileStoneInfo,
    getMileStoneInfo
} = require("../controllers/returns");

const router = express.Router();

router.get("/getReturnsData", getReturnsData);
router.post("/mileStoneInfo", mileStoneInfo);
router.get("/getMileStoneInfo", getMileStoneInfo);

module.exports = router;