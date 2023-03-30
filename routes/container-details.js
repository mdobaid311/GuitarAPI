const express = require("express");
const {
  executeQuery,
  excludeColumnQuery,
  includeColumnQuery,
} = require("../controllers/container-details");
const router = express.Router();

router.get("/", executeQuery);
router.get("/exclude", excludeColumnQuery);
router.get("/include", includeColumnQuery);

module.exports = router;
