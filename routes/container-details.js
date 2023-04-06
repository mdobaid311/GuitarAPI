// container details
const express = require("express");
const {
  executeQuery,
  excludeColumnQuery,
  includeColumnQuery,
} = require("../controllers/container-details");
const router = express.Router();

router.post("/", executeQuery);
router.post("/exclude", excludeColumnQuery);
router.post("/include", includeColumnQuery);

module.exports = router;

