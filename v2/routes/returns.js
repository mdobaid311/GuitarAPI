const express = require("express");

const {
    getReturnsData
} = require("../controllers/returns");

const router = express.Router();

router.get("/getReturnsData", getReturnsData);

module.exports = router;