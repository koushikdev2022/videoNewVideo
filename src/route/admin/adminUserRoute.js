const express = require("express");
const adminUserRoute = express.Router();

const userController = require("../../controller/api/admin/user/user.controller")
const userStatusValidation = require("../../validations/admin/userStatusValidation")
const walletFreezeValidation = require("../../validations/admin/walletFreezeValidation")

adminUserRoute.post("/list",userController.list);
adminUserRoute.post("/status",userStatusValidation,userController.status);
adminUserRoute.post("/transaction",userStatusValidation,userController.transaction);
adminUserRoute.post("/wallet",userStatusValidation,userController.wallet);
adminUserRoute.post("/wallet-freeze",walletFreezeValidation,userController.walletFreeze);


module.exports = adminUserRoute;