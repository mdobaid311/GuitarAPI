const client = require("../config/postgre_client");
const fs = require('fs');
const xlsx = require('xlsx');
const nodemailer = require("nodemailer");
const cron = require('node-cron');
const moment = require('moment-timezone');
const { log } = require("async");

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


const createScheduledQueriesInfo = async(req, res) =>{
  try {     
    const {userid, query, emails, name, day, week, month, subject, timezone } = req.body; 
    // min  hour DayOfMonth  Month  DayOfWeek
    // `0  7  *  *  *` daily
    // `0 7 * * 5`  Every week on friday
    //  `0 7 * * 0,14` bi weekly   every two weeks on Sundays
    //   `0 7 5 * * ` monthly  On friday of every month
    //`0  7  5  5  *`  YEARlY on friday of MAY at & AM
    let weekS = week || '*';
    let dayS = day || '*';
    let monthS = month || '*';
    console.log(week, month, day);
    if(!week && !day && !month) {
      schedule = `*/5  *  *  *  *`;
    }else {
      schedule = `1  ${dayS}  ${monthS}  *  ${weekS}`;
    }
     
    //  schedule = `*/5  *  *  *  *`;
     console.log(schedule); 
    const insertQquery = `INSERT INTO schedulequeries (userid, query, emails, schedule, name, subject, timezone) VALUES($1, $2,$3, $4, $5, $6, $7)`;
    const values = [userid, query,  emails, schedule, name, subject, timezone];
    const result = await client.query(insertQquery, values);
    res.status(201).json({ message : "Scheduler info created successfully"});       
} catch (error) {
  res.status(500).json({ error: error.message });
}
};

const getExportedData = async(query, toList, subject, res) => {
    try {
        const result = await client.query(query);
        const data = result.rows;
        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet 1');
        const excelFilePath = '../excel.xlsx';
        xlsx.writeFile(workbook, excelFilePath);
        excelExportData(excelFilePath, toList, subject, res);        
    } catch (error) {
        res.status(500).json({error : error.message});
    }
};

const excelExportData = async(excelFilePath, toList, subject, res ) => {

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
        subject : subject,
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
        // client.release();
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
 
    const id = Number(req.query.id);
    console.log(id);   
 
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


const scheduledJobs = new Set();

// Function to check if a job is locked
const isJobLocked = async (jobName) => {
  const selectQuery = 'SELECT locked FROM job_locks WHERE job_name = $1';
  const result = await client.query(selectQuery, [jobName]);
  if (result.rows.length === 0) {
    return false;
  }
  return result.rows[0].locked;
};

// Function to lock a job
const lockJob = async (jobName) => {
  const updateQuery = 'UPDATE job_locks SET locked = TRUE WHERE job_name = $1';
  await client.query(updateQuery, [jobName]);
};

// Function to unlock a job
const unlockJob = async (jobName) => {
  const updateQuery = 'UPDATE job_locks SET locked = FALSE WHERE job_name = $1';
  await client.query(updateQuery, [jobName]);
  return;
};

// Function to insert a job lock into the database
const insertJobLock = async (jobName) => {
  const insertQuery = 'INSERT INTO job_locks (job_name, locked) VALUES ($1, FALSE) ON CONFLICT (job_name) DO UPDATE SET locked = FALSE';
  await client.query(insertQuery, [jobName]);
};


cron.schedule('*/5 * * * *', async (req, res) => {
  const schedulerQuery = 'SELECT * FROM schedulequeries';
  const result = await client.query(schedulerQuery);
  console.log(result.rows);
  const schedulers = result.rows;

  schedulers.forEach(async (item) => {
    const { name, query, emails, subject, schedule, timezone } = item;
    if (!scheduledJobs.has(name) && !(await isJobLocked(name))) {
      // Lock the job to prevent concurrent execution
      await lockJob(name);

      const callback = async () => {
        console.log(`Cron job ${name} executed`);
        await getExportedData(query, emails, subject, res);
        // Unlock the job after execution
        await unlockJob(name);
      };
      // const job = 
      createCronJob(schedule, callback, timezone, name);
      // return job;
    }
  });
});

const createCronJob = (schedule, callback,timeZone, name) => {
  const job = cron.schedule(schedule, callback, {
    scheduled: true,
    timezone: timeZone,
  });
  job.start();
  scheduledJobs.add(name);
  insertJobLock(name);
  return job;
};


module.exports = {
    getReturnsData,
    mileStoneInfo,
    getMileStoneInfo,
    createWidgetsInfo,
    createStatusInfo,
    createQueriesInfo,
    getUserConfigurations,
    createScheduledQueriesInfo
  };