const express = require("express");
const userroutes = express();

const controller = require("../controller/index");

userroutes.post("/create", controller.postCreateAccount);
userroutes.put("/update/:email", controller.putUserProfile);
userroutes.get("/user/:email", controller.getUser);
userroutes.put("/user/logout/:email", controller.putRefreshToken);
module.exports = userroutes;
