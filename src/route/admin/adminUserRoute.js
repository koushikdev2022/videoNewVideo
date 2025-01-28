const express = require("express");
const adminUserRoute = express.Router();

const userController = require("../../controller/api/admin/user/user.controller")
const userStatusValidation = require("../../validations/admin/userStatusValidation")


adminUserRoute.post("/list",userController.list);
adminUserRoute.post("/status",userStatusValidation,userController.status);

module.exports = adminUserRoute;