const express = require("express");
const authRoute = express.Router();
const userRegistrationValidation = require("../../validations/user/auth/userRegisterValidation");
const authController = require("../../controller/api/user/auth/auth.controller")

authRoute.post("/register",userRegistrationValidation,authController.register)

module.exports = authRoute