const express = require("express");
const authRoute = express.Router();
const userRegistrationValidation = require("../../validations/user/auth/userRegisterValidation");
const userLoginValidation = require("../../validations/user/auth/userLoginValidation");
const authController = require("../../controller/api/user/auth/auth.controller")

authRoute.post("/register",userRegistrationValidation,authController.register);
authRoute.post('/login',userLoginValidation,authController.login)

module.exports = authRoute