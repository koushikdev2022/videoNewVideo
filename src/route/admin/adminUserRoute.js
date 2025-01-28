const express = require("express");
const adminUserRoute = express.Router();

const userController = require("../../controller/api/admin/user/user.controller")


adminUserRoute.post("/list",userController.list);

module.exports = adminUserRoute;