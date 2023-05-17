const express = require("express");
const { getTableData, getFullSalesData } = require("../controllers/tables");

const router = express.Router();

router.get("/",getTableData )
router.get("/getFullSalesData",getFullSalesData )


module.exports = router;