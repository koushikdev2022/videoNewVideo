const { User, Video } = require("../../../../models");
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { google } = require('googleapis');
const { spawn } = require('child_process');

const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID || 'YOUR_CLIENT_ID';
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET || 'YOUR_CLIENT_SECRET';
const REDIRECT_URI = process.env.YOUTUBE_REDIRECT_URI ||'http://localhost:3015/user/youtube/oauth2callback';


async function downloadVideo(videoUrl, outputPath) {
    const response = await axios({ method: 'GET', url: videoUrl, responseType: 'stream' });
    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(outputPath);
      response.data.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }
  
function getOAuth2Client() {

  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
}

exports.getYoutubeAuthUrl = (req, res) => {
    const oauth2Client = getOAuth2Client();
    const scopes = ['https://www.googleapis.com/auth/youtube.upload'];
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
    res.status(200).json({ url:url,status:true,status_code:200 });
};
exports.youtubeOAuthCallback = async (req, res) => {
    // Get code and user_id from URL query parameters
    const code  = req?.body?.code;
    const userId = req?.user?.id;
    console.log(code)
    // Validate required parameters
    if (!code) {
      return res.status(422).json({ 
        message: "Authorization code and user_id are required in the URL parameters", 
        status: false ,
        status_code:422
      });
    }
  
    const oauth2Client = getOAuth2Client();
  
    try {
      // Exchange code for tokens
      const { tokens } = await oauth2Client.getToken(code);
  
      // Save tokens in DB for this user
      await User.update({
        youtube_access_token: tokens.access_token,
        youtube_refresh_token: tokens.refresh_token
      }, { where: { id: userId } });
  
      res.status(200).json({ 
        message: "YouTube authorization successful", 
        status: true,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token
      });
    } catch (err) {
      res.status(500).json({ 
        message: "YouTube authorization failed: " + err.message, 
        status: false 
      });
    }
  };
  
// POST /api/video/download
exports.downloadVideo = async (req, res) => {
    const  video_id  = req?.body?.video_id;
    if (!video_id) {
        return res.status(422).json({ message: "Video_id found", status: false,status_code:422 });
      }
    const videoData = await Video.findByPk(video_id);
    if (!videoData || !videoData.video) {
      return res.status(422).json({ message: "Video not found", status: false,status_code:422 });
    }
  
    // Download video file
    const videoUrl = `${process.env.VIDEO_URL}${videoData.video}`;
    const dirPath = path.join(__dirname, '../../../../../public/uploads/videoYoutube');
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
    const extension = path.extname(videoData.video) || '.mp4';
    const filename = `video_${Date.now()}_${videoData.id}${extension}`;
    const outputPath = path.join(dirPath, filename);
  
   
  
    try {
      await downloadVideo(videoUrl, outputPath); // your downloadVideo helper
    //   await Video.update({ local_file_path: outputPath }, { where: { id: video_id } });
      res.status(200).json({ message: "Video downloaded", local_file_path: outputPath, status: true,status_code:200 });
    } catch (err) {
      res.status(500).json({ message: "Download failed: " + err.message, status: false });
    }
  };
  

//   exports.uploadYoutube = async (req, res) => {
//     const userId = req.user.id;
//     const videoId = req.body.video_id;
//     if (!videoId) return res.status(422).json({ message: "video id required", status: false });
  
//     const user = await User.findByPk(userId);
//     if (!user || !user.youtube_access_token || !user.youtube_refresh_token) {
//       // Not authorized yet
//       const oauth2Client = getOAuth2Client();
//       const url = oauth2Client.generateAuthUrl({
//         access_type: 'offline',
//         scope: ['https://www.googleapis.com/auth/youtube.upload'],
//         prompt: 'consent'
//       });
//       return res.status(432).json({
//         message: "YouTube authentication required.",
//         auth_url: url,
//         status: false
//       });
//     }
  
//     // Find video in DB
//     const videoData = await Video.findByPk(videoId);
//     if (!videoData || !videoData.video) {
//       return res.status(422).json({ message: "Video not found", status: false });
//     }
  
//     // Download video file
//     const videoUrl = `${process.env.VIDEO_URL}${videoData.video}`;
//     const dirPath = path.join(__dirname, '../../../../../public/uploads/videoYoutube');
//     if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
//     const extension = path.extname(videoData.video) || '.mp4';
//     const filename = `video_${Date.now()}_${videoData.id}${extension}`;
//     const outputPath = path.join(dirPath, filename);
  
//     try {
//       await downloadVideo(videoUrl, outputPath);
//     } catch (err) {
//       return res.status(500).json({ message: "Failed to download video: " + err.message, status: false });
//     }
  
//     // Upload to YouTube
//     try {
//       const oauth2Client = getOAuth2Client();
//       oauth2Client.setCredentials({
//         access_token: user.youtube_access_token,
//         refresh_token: user.youtube_refresh_token
//       });
  
//       // Refresh access token if needed
//       oauth2Client.on('tokens', async (tokens) => {
//         if (tokens.access_token) {
//           await User.update({ youtube_access_token: tokens.access_token }, { where: { id: userId } });
//         }
//         if (tokens.refresh_token) {
//           await User.update({ youtube_refresh_token: tokens.refresh_token }, { where: { id: userId } });
//         }
//       });
  
//       const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
//       const requestBody = {
//         snippet: {
//           title: videoData.title || 'Uploaded Video',
//           description: videoData.description || 'Video uploaded via API',
//           tags: ['api', 'upload'],
//           categoryId: '22'
//         },
//         status: { privacyStatus: 'private' }
//       };
  
//       const response = await youtube.videos.insert({
//         part: 'snippet,status',
//         requestBody,
//         media: { body: fs.createReadStream(outputPath) }
//       });
  
//       // Save YouTube ID to DB
//       await Video.update({
//         youtube_id: response.data.id,
//         youtube_upload_status: 'completed'
//       }, { where: { id: videoId } });
  
//       // Optionally delete the local file
//       fs.unlinkSync(outputPath);
  
//       res.status(200).json({ message: "Video uploaded to YouTube", youtube_id: response.data.id, status: true });
  
//     } catch (err) {
//       await Video.update({
//         youtube_upload_status: 'failed',
//         youtube_error: err.message.substring(0, 255)
//       }, { where: { id: videoId } });
//       res.status(500).json({ message: "YouTube upload failed: " + err.message, status: false });
//     }
//   };
  // POST /api/video/upload-youtube
exports.uploadYoutube = async (req, res) => {
    try{
        const userId = req.user.id;
        const videoId = req.body.video_id;
        const videourl = req.body.video_url;
        const code  = req?.body?.code;
        const scope = req?.body?.scope
        const videoData = await Video.findByPk(videoId)
        if(!videoData){
            return res.status(422).json({ 
                message: "no video found", 
                status: false ,
                status_code:422
              });
        }
        console.log(code)
        // Validate required parameters
        if (!code) {
          return res.status(422).json({ 
            message: "Authorization code and user_id are required in the URL parameters", 
            status: false ,
            status_code:422
          });
        }
      
        const oauth2Client = getOAuth2Client();
      
        
       
        const { tokens } = await oauth2Client.getToken(code);
      
        
        console.log(tokens)
        if (!videoId) return res.status(422).json({ message: "video id required", status: false,status_code:422 });
        if (!videourl) return res.status(422).json({ message: "video_url required", status: false,status_code:422 });
      
      
          const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [scope],
            prompt: 'consent'
          });
       
        
        try {
          const oauth2Client = getOAuth2Client();
          oauth2Client.setCredentials({
            access_token:  tokens.access_token,
            refresh_token: tokens.refresh_token
          });
      
          oauth2Client.on('tokens', async (tokens) => {
            if (tokens.access_token) {
              await User.update({ youtube_access_token: tokens.access_token }, { where: { id: userId } });
            }
            if (tokens.refresh_token) {
              await User.update({ youtube_refresh_token: tokens.refresh_token }, { where: { id: userId } });
            }
          });
      
          const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
          const response = await youtube.videos.insert({
            part: 'snippet,status',
            requestBody: {
              snippet: {
                title: videoData.title || 'Uploaded Video',
                description: videoData.description || 'Video uploaded via API',
                tags: ['api', 'upload'],
                categoryId: '22'
              },
              status: { privacyStatus: 'public' }
            },
            media: { body: fs.createReadStream(videourl) }
          });
      
          await Video.update({
            youtube_id: response.data.id,
            youtube_upload_status: 'completed'
          }, { where: { id: videoId } });
          await User.update({
            youtube_access_token: tokens.access_token,
            youtube_refresh_token: tokens.refresh_token
            }, { where: { id: userId } });
      
          fs.unlinkSync(videourl);
      
          res.status(200).json({ message: "Video uploaded to YouTube", youtube_id: response.data.id, status: true });
        } catch (err) {
          await Video.update({
            youtube_upload_status: 'failed',
            youtube_error: err.message.substring(0, 255)
          }, { where: { id: videoId } });
          res.status(400).json({ message: "YouTube upload failed: " + err.message, status: false,status_code: 400 });
        }
    }catch (err) {
        console.log("Error in get new token authController: ", err);
        const status = err?.status || 400;
        const msg = err?.message || "Internal Server Error";
        return res.status(status).json({
            message:msg,
            status: false,
            status_code: status
        })
    }
  
  };
  