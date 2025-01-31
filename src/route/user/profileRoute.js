const express = require("express")
const profileRoute = express.Router();

const profileController = require("../../controller/api/user/profile/profile.controller")

profileRoute.post("/update",profileController.update)


module.exports = profileRoute