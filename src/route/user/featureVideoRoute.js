const express = require("express")
const featureVideoRoute = express.Router();

const featureVideoController = require("../../controller/api/user/featureVideo/featureVideo.controller")

featureVideoRoute.post('/',featureVideoController.featureVideo)



module.exports = featureVideoRoute