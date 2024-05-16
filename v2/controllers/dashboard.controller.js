const client = require("../config/postgre_client");
// const dashboardWidgetDataQuery = require("../queries/salesQueries");

const GetDashboardData = async (req, res) => {
  try {
    const dashboardWidgetDataQuery = `SELECT public."GetDashboardData"(
        'Ref1', 'Ref2', 'Ref3', 'Ref4', 'Ref5', 'Ref6', 'Ref7'
    );
    FETCH ALL IN "Ref1";
    FETCH ALL IN "Ref2";
    FETCH ALL IN "Ref3";
    FETCH ALL IN "Ref4";
    FETCH ALL IN "Ref5";
    FETCH ALL IN "Ref6";
    `;
    const result = await client.query(dashboardWidgetDataQuery);
    console.log(result);

    const resultObj = {
      revenueTrend: result[1]?.rows,
      deliveries: result[2]?.rows,
      trendYOY: result[3]?.rows,
      topSellers: result[4]?.rows,
      thisWeekSales: result[5]?.rows,
      allWeekSales: result[6]?.rows,
    };

    res.status(200).send(resultObj);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  GetDashboardData,
};
