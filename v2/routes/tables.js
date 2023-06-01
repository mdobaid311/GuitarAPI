const express = require("express");
const { getTableData, getFullSalesData, getFullSalesDataTEST, getCustomQueryDate } = require("../controllers/tables");

const router = express.Router();

router.get("/",getTableData )
router.get("/getFullSalesData",getFullSalesData )
router.get("/getFullSalesDatatest",getFullSalesDataTEST )
router.post("/query",getCustomQueryDate)


module.exports = router;