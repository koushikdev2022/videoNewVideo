const express = require("express");
const authRoute = express.Router();
const userRegistrationValidation = require("../../validations/user/auth/userRegisterValidation");
const userLoginValidation = require("../../validations/user/auth/userLoginValidation");
const isUserAuthenticateMiddleware = require("../../middleware/user/isUserAuthenticateMiddleware");
const authController = require("../../controller/api/user/auth/auth.controller")

authRoute.post("/register",userRegistrationValidation,authController.register);
authRoute.post('/login',userLoginValidation,authController.login)
authRoute.post('/get-new-token',isUserAuthenticateMiddleware,authController.getNewToken);
module.exports = authRoute