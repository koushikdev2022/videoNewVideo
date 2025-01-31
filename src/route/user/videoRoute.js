const express = require("express");
const videoRoute = express.Router();

const videoController = require("../../controller/api/user/video/video.controller")


videoRoute.get('/list/:entity/:limit/:page',videoController.list)


module.exports = videoRoute