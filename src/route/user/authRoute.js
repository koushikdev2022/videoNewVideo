const express = require("express");
const authRoute = express.Router();

const authController = require("../../controller/api/user/auth/auth.controller")

authRoute.post("/register",authController.register)

module.exports = authRoute