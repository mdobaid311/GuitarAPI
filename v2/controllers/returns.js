const client = require("../config/postgre_client");
const fs = require('fs');
const xlsx = require('xlsx');
const nodemailer = require("nodemailer");
const cron = require('node-cron');

const getReturnsData = async(req, res) =>{
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    
    const query = `SELECT getReturnsData('${startDate}','${endDate}', 'Ref1', 'Ref2','Ref3', 'Ref4','Ref5','Ref6','Ref7', 'Ref8','Ref9', 'Ref10','Ref11');
    FETCH ALL IN "Ref1";FETCH ALL IN "Ref2";FETCH ALL IN "Ref3";FETCH ALL IN "Ref4";FETCH ALL IN "Ref5";FETCH ALL IN "Ref6";FETCH ALL IN "Ref7";FETCH ALL IN "Ref8";FETCH ALL IN "Ref9";FETCH ALL IN "Ref10";FETCH ALL IN "Ref11";`;

   try {
    client.query(query, (err,result) => {
        if(err){
            return res.status(500).send(err);
        }else {
        const returnStats = result[1].rows;
        const returnsFulfilled = result[2].rows;
        const returnByFulfillmentType = result[3].rows;
        const exchangeOrder = result[4].rows;
        const returnReason = result[5].rows;
        const returnsByItemInfo = result[6].rows;
        const returnsByItems = result[7].rows;
        const returnsQtyByCategory = result[8].rows;
        const returnsQtyByBrandName = result[9].rows;
        const returnsValByCategory = result[10].rows;
        const returnsValByBrandName = result[11].rows;
        let total_units_sum = 0;
        let total_value_sum = 0;
            returnsFulfilled.forEach(element => {
                total_units_sum = total_units_sum + Number(element.total_units);
                total_value_sum = total_value_sum + Number(element.total_value);
            });
            let returnsFulfilledResult ={total_units_sum, total_value_sum, returnsFulfilled};

            let order_count_sum = 0;
            let exchange_book_amount_sum = 0;
            let pending_refund_to_use_for_exchange_sum = 0;
            exchangeOrder.forEach(element => {
                order_count_sum = order_count_sum + Number(element.order_count);
                exchange_book_amount_sum = exchange_book_amount_sum + Number(element.exchange_book_amount);
                pending_refund_to_use_for_exchange_sum = pending_refund_to_use_for_exchange_sum + Number(element.pending_refund_to_use_for_exchange);
            });
            let exchangeOrderResult ={order_count_sum, exchange_book_amount_sum,pending_refund_to_use_for_exchange_sum, exchangeOrder};
        
        let total_units = 0;
        let total_value = 0;
         
        returnByFulfillmentType.forEach(element => {
                total_units = total_units + Number(element.total_units);
                total_value = total_value + Number(element.total_value);
            });
            let returnByFulfillmentTypeResult ={total_units, total_value, returnByFulfillmentType};

        let reason_total_units = 0;
        let return_total_value = 0;
        returnReason.forEach(element => {
            reason_total_units = reason_total_units + Number(element.total_units);
            return_total_value = return_total_value + Number(element.total_value);
            });
            let returnReasonResult ={total_units : reason_total_units, total_value : return_total_value, returnReason};

        let line_units = 0;
        let line_charge = 0;
        returnsByItemInfo.forEach(element => {
            line_units = line_units + Number(element.line_units);
            line_charge = line_charge + Number(element.line_charge);
            });
            let returnsByItemInfoResult ={line_units, line_charge, returnsByItemInfo};

            let line_units_sum = 0;
        let line_charge_sum = 0;
        returnsByItems.forEach(element => {
            line_units_sum = line_units_sum + Number(element.line_units);
            line_charge_sum = line_charge_sum + Number(element.line_charge);
            });
            let returnsByItemsResult ={line_units : line_units_sum , line_charge : line_charge_sum, returnsByItems};

            let sum = 0;
            returnsQtyByCategory.forEach(element => {
            sum = sum + Number(element.sum);
            });
            let returnsQtyByCategoryResult ={sum, returnsQtyByCategory};

            let total_sum = 0;
            returnsQtyByBrandName.forEach(element => {
                total_sum = total_sum + Number(element.sum);
            });
            let returnsQtyByBrandNameResult ={sum : total_sum, returnsQtyByBrandName};

            let total = 0;
            returnsValByCategory.forEach(element => {
                total = total + Number(element.sum);
            });
            let returnsValByCategoryResult ={sum : total, returnsValByCategory};

            let BrandNameSum = 0;
            returnsValByBrandName.forEach(element => {
                BrandNameSum = BrandNameSum + Number(element.sum);
            });
            let returnsValByBrandNameResult ={sum : BrandNameSum, returnsValByBrandName};

        res.status(200).json({
            returnStats,
            returnsFulfilledResult,
            returnByFulfillmentTypeResult,
            exchangeOrderResult,
            returnReasonResult,
            returnsByItemInfoResult,
            returnsByItemsResult,
            returnsQtyByCategoryResult,
            returnsQtyByBrandNameResult,
            returnsValByCategoryResult,
            returnsValByBrandNameResult
          });
        }
    });
   } catch (error) {
    res.status(500).json({error : error.message })
   }
};

const mileStoneInfo = async(req, res) =>{
    const {userid, msone, mstwo, msthree, msfour, msfive, mssix } = req.body;

    if(!userid || !msone || !mstwo || !msthree || !msfour || !msfive || !mssix){
        return res.status(400).json({message : "Please enter all fields"});
    }

    try {
        const checkUserQuery = `SELECT * FROM configuremilestone WHERE userid =$1`;
        const checkUserResult = await client.query(checkUserQuery, [Number(userid)]);
        const updateQuery = `UPDATE configuremilestone SET msone = $2, mstwo = $3, msthree = $4, msfour = $5, msfive = $6, mssix = $7 WHERE userid =$1`;        
        const insertQuery = `INSERT INTO configuremilestone (userid, msone, mstwo,msthree, msfour, msfive, mssix) VALUES($1, $2, $3,$4,$5,$6,$7)`;
        const query = (checkUserResult.rows.length > 0) ?(updateQuery) :(insertQuery);
        const values = [userid, msone, mstwo, msthree, msfour, msfive, mssix ];
        const result = await client.query(query, values);
        res.status(201).json({ message : (query === insertQuery) ?("Milestone info created successfully") : ("Milestone info updated successfully")});
    } catch (error) {
        res.status(500).json({error : error.message});
    }
};

const getMileStoneInfo = async(req, res) => {

    try {
        const query = `SELECT * FROM configuremilestone WHERE userid =$1`;
        const userid = [req.query.userid];
        const result = await client.query(query, userid);
        if(result.rows.length <1) {
            return res.status(404).json({message : `no data found for username : ${userid}`});
        }
        res.status(201).json({result : result.rows});
    } catch (error) {
        res.status(500).json({error : error.message});
    }
};

// const scheduleExportData = async(req, res) => {
//   const {query, toList } = req.body;
// //  const query1 = "SELECT * FROM order_book_line limit 100";
// //  const query2 = "SELECT * FROM order_book_header limit 100";
// //  const query3 = "SELECT * FROM order_book_taxes limit 100";
// //'*/1 * * * *'
// //'0 17 * * *'
//   cron.schedule('*/1 * * * *', () => {
//     const query =  `SELECT * FROM configurequeries order by time`;
//     const result = await client.query(query);
//     const queries = result.rows;
//     queries.forEach(list ={
//       cron.schedule(`0 ${list.time} * * *`, () => {
//         getExportedData(list.query, list.emails, res);
//       })
//     });    
//   });
// };

const createScheduledQueriesInfo = async(req, res) =>{
  try {     
    const {userid, query,  emails, time} = req.body;  
    const insertQquery = `INSERT INTO schedulequeries (userid, query, emails, time ) VALUES($1, $2,$3, $4)`;
    const values = [userid, query,  emails, time];
    const result = await client.query(insertQquery, values);
    res.status(201).json({ message : "Schedule query info created successfully"});       
} catch (error) {
  res.status(500).json({ error: error.message });
}
};

// const scheduleExportData = async (req, res) => {
//   const { query, toList , time} = req.body;
//   // `*/${list.time} * * * *`
//   cron.schedule(`0 ${list.time} * * *`, async () => {
//     const query =  `SELECT * FROM schedulequeries order by time`;
//     const result = await client.query(query);
//     const queries = result.rows;
//     console.log(queries);
//     queries.forEach(list => {
//       cron.schedule(`*/${list.time} * * * *`, async () => {
//         await getExportedData(list.query, list.emails, res);
//       });
//     });
//   });
// };

const scheduleExportData = async (req, res) => {
  const { query, toList , time} = req.body;
  cron.schedule(`0 ${list.time} * * *`, async () => {
    getExportedData(query, toList, res);
  });
};


const getExportedData = async(query, toList, res) => {
    try {
        const result = await client.query(query);
        const data = result.rows;
        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet 1');
        const excelFilePath = '../excel.xlsx';
        xlsx.writeFile(workbook, excelFilePath);
        excelExportData(excelFilePath, toList, res);        
    } catch (error) {
        res.status(500).json({error : error.message});
    }
};

const excelExportData = async(excelFilePath, toList, res ) => {

     try {
      const transporter  = nodemailer.createTransport({
        host : "smtp.gmail.com",
        port:587,
        secure : false,
        requireTLS:true,
        auth : {
          user : 'guitarcenter.xit@gmail.com',
          pass :'blnsziorfgrueolw'
        }
      });
      const mailOptions = {
        from : 'guitarcenter.xit@gmail.com',
        to: toList,
        subject : 'Guitar Center Report',
        html:"<p>Hi!<br>Please find attached sales analysis report.<br><br><br><br>Please note.<br>This is a Guitar Center application generated report.<br><br></p>",
        attachments: [
            {
              filename: 'excel.xlsx',
              path: excelFilePath,
            },
          ],
      }
  
      transporter.sendMail(mailOptions, function(err, info){
        if(err){
          console.log(err);
        }
        else{
            res.status(201).json({ message: "Data Exported successfully" });
        }
        fs.unlinkSync(excelFilePath);
        client.release();
      });
  
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const createWidgetsInfo = async(req, res) => {
    try {     
        const {userid, isSalesEnabled } = req.body;
        const checkUserQuery = `SELECT * FROM configurewidgets WHERE userid =$1`;
        const checkUserResult = await client.query(checkUserQuery, [Number(userid)]);
        const updateQuery = `UPDATE configurewidgets SET issalesenabled = $2 WHERE userid =$1`;        
        const insertQuery = `INSERT INTO configurewidgets (userid, issalesenabled ) VALUES($1, $2)`;
        const query = (checkUserResult.rows.length > 0) ?(updateQuery) :(insertQuery);
        const values = [userid, isSalesEnabled ];
        const result = await client.query(query, values);
        res.status(201).json({ message : (query === insertQuery) ?("Widgets info created successfully") : ("Widgets info updated successfully")});
         
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const createStatusInfo = async(req, res) =>{
    try {     
      const {userid, statusCode } = req.body;  
      const query = `INSERT INTO configurestatus (userid, statuscode ) VALUES($1, $2)`;
      const values = [userid, statusCode ];
      const result = await client.query(query, values);
      res.status(201).json({ message : "Widgets info created successfully"});       
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
  };

  const createQueriesInfo = async(req, res) => {
    try {     
      const {userid, queryVal, xaxis, yaxis, name} = req.body;      
      const query = `INSERT INTO configurequeries (userid,  query, xaxis, yaxis, name) VALUES($1, $2, $3, $4,$5)`;
      const values = [userid, queryVal, xaxis, yaxis, name];
      const result = await client.query(query, values);
      res.status(201).json({ message : "queries info created successfully"});       
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
  };

  const getUserConfigurations = async (req, res) => {
 
    const id = Number(req.query.userid);
    console.log(id);
    const check = `SELECT * FROM users WHERE id = 45`;
    
 
    try {
      const query = `
        SELECT getuserconfigurations(${id},'ref1', 'ref2','ref3', 'ref4','ref5');
        FETCH ALL IN "ref1";
        FETCH ALL IN "ref2";
        FETCH ALL IN "ref3";
        FETCH ALL IN "ref4";
        FETCH ALL IN "ref5";
      `;
  
      client.query(query, (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send(err);
        }
    
        const milestoneData = result[1].rows;
        const thresholdData = result[2].rows;
        const widgetsData = result[3].rows;
        const StatusFilterData = result[4].rows;
        const queriesData = result[5].rows;
  
        res.status(200).json({
            milestoneData,
            thresholdData,
            widgetsData,
            StatusFilterData,
            queriesData
        });
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

module.exports = {
    getReturnsData,
    mileStoneInfo,
    getMileStoneInfo,
    scheduleExportData,
    createWidgetsInfo,
    createStatusInfo,
    createQueriesInfo,
    getUserConfigurations,
    createScheduledQueriesInfo
  };