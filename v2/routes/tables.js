const express = require("express");
const { getTableData, getFullSalesData, getFullSalesDataTEST } = require("../controllers/tables");

const router = express.Router();

router.get("/",getTableData )
router.get("/getFullSalesData",getFullSalesData )
router.get("/getFullSalesDatatest",getFullSalesDataTEST )


module.exports = router;