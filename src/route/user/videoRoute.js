const express = require("express");
const videoRoute = express.Router();

const videoValidation = require("../../validations/user/video/videoValidation")


const videoController = require("../../controller/api/user/video/video.controller")


videoRoute.get('/list/:entity/:limit/:page',videoController.list)
videoRoute.post('/create',videoValidation,videoController.create)
videoRoute.post('/update',videoController.update)


module.exports = videoRoute