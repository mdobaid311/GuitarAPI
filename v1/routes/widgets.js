const express = require("express");
const { createWidget, getWidgets } = require("../controllers/widgets");
const router = express.Router();

router.post("/",createWidget);
router.get("/", getWidgets);

module.exports = router;
