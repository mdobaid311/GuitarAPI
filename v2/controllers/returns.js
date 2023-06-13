const client = require("../config/postgre_client");

const getReturnsData = async(req, res) =>{
    const returnOrderDate = req.query.date;
    
    const query = `SELECT getReturnsData('${returnOrderDate}','Ref1', 'Ref2','Ref3', 'Ref4','Ref5','Ref6','Ref7', 'Ref8','Ref9', 'Ref10','Ref11');
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

        res.status(200).json({
            returnStats,
            returnsFulfilled,
            returnByFulfillmentType,
            exchangeOrder,
            returnReason,
            returnsByItemInfo,
            returnsByItems,
            returnsQtyByCategory,
            returnsQtyByBrandName,
            returnsValByCategory,
            returnsValByBrandName
          });
        }
    });
   } catch (error) {
    res.status(500).json({error : error.message })
   }
};

const mileStoneInfo = async(req, res) =>{
    const {username, msone, mstwo, msthree, msfour, msfive, mssix } = req.body;
    try {
        const query = `INSERT INTO milestoneinfo(username, msone, mstwo,msthree, msfour, msfive, mssix) VALUES($1, $2, $3,$4,$5,$6,$7)`;
        const values = [username, msone, mstwo, msthree, msfour, msfive, mssix ];
        const result = await client.query(query, values);
        res.status(201).json({ message : "Milestone info created successfully"});
    } catch (error) {
        res.status(500).json({error : error.message});
    }
};

const getMileStoneInfo = async(req, res) => {

    try {
        const query = `SELECT * FROM milestoneinfo WHERE username =$1`;
        const username = [req.query.username];
        const result = await client.query(query, username);
        if(result.rows.length <1) {
            return res.status(404).json({message : `no data found for username : ${username}`});
        }
        res.status(201).json({result : result.rows});
    } catch (error) {
        res.status(500).json({error : error.message});
    }
};

module.exports = {
    getReturnsData,
    mileStoneInfo,
    getMileStoneInfo
  };