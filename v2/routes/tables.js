const express = require("express");
const { getTableData, getFullSalesData, getFullSalesDataTEST, UserLogin, getMinMaxValues } = require("../controllers/tables");

const router = express.Router();

router.get("/",getTableData )
router.get("/getFullSalesData",getFullSalesData )
router.get("/getFullSalesDatatest",getFullSalesDataTEST )
router.post("/login", UserLogin)
router.get("/getMinMaxValues", getMinMaxValues)


module.exports = router;