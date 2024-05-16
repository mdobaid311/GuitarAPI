const dashboardWidgetDataQuery = `SELECT public."GetDashboardData"(
	'Ref1', 'Ref2', 'Ref3', 'Ref4', 'Ref5', 'Ref6', 'Ref7'
);
FETCH ALL IN "Ref1";
FETCH ALL IN "Ref2";
FETCH ALL IN "Ref3";
FETCH ALL IN "Ref4";
FETCH ALL IN "Ref5";
FETCH ALL IN "Ref6";
FETCH ALL IN "Ref7";
`;
module.exports = {
  dashboardWidgetDataQuery,
};
