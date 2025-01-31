const express = require("express")
const profileRoute = express.Router();

const profileController = require("../../controller/api/user/profile/profile.controller")

profileRoute.post("/update",profileController.update)
profileRoute.get("/my-profile",profileController.profile)
profileRoute.post("/avatar",profileController.avatar)

module.exports = profileRoute