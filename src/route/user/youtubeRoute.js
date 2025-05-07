const express = require("express");
const youtubeRoute = express.Router();

const youtubeController = require("../../controller/api/user/youtube/youtube.controller");
const youtubeNewController = require("../../controller/api/user/youtube/youtubeNew.controller");

youtubeRoute.post('/upload-youtube',youtubeController.uploadYoutube);
youtubeRoute.get('/oauth2callback', youtubeController.youtubeOAuthCallback);


youtubeRoute.get('/auth-url', youtubeNewController.getYoutubeAuthUrl);
youtubeRoute.post('/oauth2callback', youtubeNewController.youtubeOAuthCallback);
youtubeRoute.post('/download-video', youtubeNewController.downloadVideo);
youtubeRoute.post('/upload', youtubeNewController.uploadYoutube);


module.exports = youtubeRoute;