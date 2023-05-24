const express = require("express");
const app = express();
const helmet = require("helmet");
require("dotenv").config();
const morgan = require("morgan");
const cors = require("cors");

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());
app.use(helmet());

const queryRouter = require("./v1/routes/container-details");
const authRouter = require("./v1/routes/auth");
const widgetsRouter = require("./v1/routes/widgets");
const activeLineStatusDetailsRouter = require("./v1/routes/active-line-status-details");
const orgChartRouter = require("./v1/routes/org-chart");

const v2ActiveLineStatusDetailsRouter = require("./v2/routes/active_line_status_details");
const v2TablesRouter = require("./v2/routes/tables");
const v2SalesRouter = require("./v2/routes/sales");

app.get("/", (req, res) => {
  res.send("Guitar API");
});

app.use("/query", queryRouter);
app.use("/auth", authRouter);
app.use("/widgets", widgetsRouter);
app.use("/alsd", activeLineStatusDetailsRouter);
app.use("/org", orgChartRouter);

app.use("/v2/alsd", v2ActiveLineStatusDetailsRouter);
app.use("/v2/tables", v2TablesRouter);
app.use("/v2/sales", v2SalesRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
