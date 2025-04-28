require("dotenv").config();
const express = require("express");
require("./utils/task");
require("./config/database");
const app = express();
const PORT = process.env.PORT || 3001;
const routes = require("./route/index");
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", routes);
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
