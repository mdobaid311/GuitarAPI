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

const queryRouter = require('./routes/container-details');
const authRouter = require('./routes/auth');

app.use("/query", queryRouter);
app.use("/auth",authRouter)

const port = process.env.PORT||3000

app.listen(port, () => {
    console.log(`server running on port ${port}`)
})
