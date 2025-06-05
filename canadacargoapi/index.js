const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const app = express();
const port = process.env.PORT || 3007;
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json());
app.use(cors());

const authenticationRoute = require("./routes/generalRoutes/authenticationRoute");
const productRoute = require("./routes/adminRoutes/productRoute");
const salesRoute = require("./routes/salesRoutes/salesRoute");
const taxroute = require("./routes/taxAndDiscountRoute/taxRoute");
const reportDashboardROute = require("./routes/Reportroute/dashboardRoute");
const configurationRoute = require("./routes/configurationRoutes/configurationRoute");
const shipmentRoute = require("./routes/shipmentRoute/shipmentRoute");

app.use("/canadacargoapi/api/", authenticationRoute);
app.use("/canadacargoapi/api/", productRoute);
app.use("/canadacargoapi/api/", salesRoute);
app.use("/canadacargoapi/api/", taxroute);
app.use("/canadacargoapi/api/", reportDashboardROute);
app.use("/canadacargoapi/api/", configurationRoute);
app.use("/canadacargoapi/api/", shipmentRoute);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
