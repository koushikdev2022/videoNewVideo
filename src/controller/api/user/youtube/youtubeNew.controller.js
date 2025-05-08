const { User, Video } = require("../../../../models");
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { google } = require('googleapis');
const { spawn } = require('child_process');

// const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID || 'YOUR_CLIENT_ID';
// const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET || 'YOUR_CLIENT_SECRET';
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
  
  const getOAuth2Client = (userData) => {
    const client_id_key = userData?.access_key;
    const client_secret_key = userData?.secret_key;
    return new google.auth.OAuth2(client_id_key, client_secret_key, REDIRECT_URI);
  }

exports.getYoutubeAuthUrl = async (req, res) => {
    const redirect = process?.env?.REDIRECT_URL
    const userId = req?.user?.id
    const userData = await User.findByPk(userId)
    const oauth2Client = getOAuth2Client(userData);
    const scopes = ['https://www.googleapis.com/auth/youtube.upload'];
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      redirect_uri: redirect
    });
    res.status(200).json({ url:url,status:true,status_code:200 });
};
exports.youtubeOAuthCallback = async (req, res) => {
    // Get code and user_id from URL query parameters
    const code  = req?.body?.code;
    const userId = req?.user?.id;
    const userData = await User.findByPk(userId)
    console.log(code)
    // Validate required parameters
    if (!code) {
      return res.status(422).json({ 
        message: "Authorization code and user_id are required in the URL parameters", 
        status: false ,
        status_code:422
      });
    }
  
    const oauth2Client = getOAuth2Client(userData);
  
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
      res.status(400).json({ 
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
      res.status(400).json({ message: "Download failed: " + err.message, status: false ,status_code:400 });
    }
  };
  


// exports.uploadYoutube = async (req, res) => {
//     try{
//         const userId = req.user.id;
//         const videoId = req.body.video_id;
//         const videourl = req.body.video_url;
//         const code  = req?.body?.code;
//         const scope = req?.body?.scope
//         const videoData = await Video.findByPk(videoId)
//         const userData = await User.findByPk(userId)
//         if(!videoData){
//             return res.status(422).json({ 
//                 message: "no video found", 
//                 status: false ,
//                 status_code:422
//               });
//         }
//         console.log(code)
//         // Validate required parameters
//         if (!code) {
//           return res.status(422).json({ 
//             message: "Authorization code and user_id are required in the URL parameters", 
//             status: false ,
//             status_code:422
//           });
//         }
      
//         const oauth2Client = getOAuth2Client(userData);
      
        
       
//         const { tokens } = await oauth2Client.getToken(code);
      
        
//         console.log(tokens)
//         if (!videoId) return res.status(422).json({ message: "video id required", status: false,status_code:422 });
//         if (!videourl) return res.status(422).json({ message: "video_url required", status: false,status_code:422 });
      
//         const redirect = process?.env?.REDIRECT_URL
//           const url = oauth2Client.generateAuthUrl({
//             access_type: 'offline',
//             scope: [scope],
//             prompt: 'consent',
//             redirect_uri: redirect
//           });
       
        
//         try {
//           const oauth2Client = getOAuth2Client(userData);
//           oauth2Client.setCredentials({
//             access_token:  tokens.access_token,
//             refresh_token: tokens.refresh_token
//           });
      
//           oauth2Client.on('tokens', async (tokens) => {
//             if (tokens.access_token) {
//               await User.update({ youtube_access_token: tokens.access_token }, { where: { id: userId } });
//             }
//             if (tokens.refresh_token) {
//               await User.update({ youtube_refresh_token: tokens.refresh_token }, { where: { id: userId } });
//             }
//           });
      
//           const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
//           const response = await youtube.videos.insert({
//             part: 'snippet,status',
//             requestBody: {
//               snippet: {
//                 title: videoData.title || 'Uploaded Video',
//                 description: videoData.description || 'Video uploaded via API',
//                 tags: ['api', 'upload'],
//                 categoryId: '22'
//               },
//               status: { privacyStatus: 'public' }
//             },
//             media: { body: fs.createReadStream(videourl) }
//           });
      
//           await Video.update({
//             youtube_id: response.data.id,
//             youtube_upload_status: 'completed'
//           }, { where: { id: videoId } });
//           await User.update({
//             youtube_access_token: tokens.access_token,
//             youtube_refresh_token: tokens.refresh_token
//             }, { where: { id: userId } });
      
//           fs.unlinkSync(videourl);
      
//           res.status(200).json({ message: "Video uploaded to YouTube", youtube_id: response.data.id, status: true,status_code: 200 });
//         } catch (err) {
//           await Video.update({
//             youtube_upload_status: 'failed',
//             youtube_error: err.message.substring(0, 255)
//           }, { where: { id: videoId } });
//           res.status(400).json({ message: "YouTube upload failed: " + err.message, status: false,status_code: 400 });
//         }
//     }catch (err) {
//         console.log("Error in get new token authController: ", err);
//         const status = err?.status || 400;
//         const msg = err?.message || "Internal Server Error";
//         return res.status(status).json({
//             message:msg,
//             status: false,
//             status_code: status,
//             status_code:400

//         })
//     }
  
//   };
  

exports.uploadYoutube = async (req, res) => {
  try {
    const userId = req.user.id;
    const { video_id: videoId, video_url: videourl, code, scope } = req.body;

    // Validate inputs
    if (!code || !videoId || !videourl) {
      return res.status(422).json({
        message: "code, video_id, and video_url are required",
        status: false,
        status_code: 422
      });
    }

    // Fetch video and user data
    const videoData = await Video.findByPk(videoId);
    const userData = await User.findByPk(userId);
    if (!videoData) {
      return res.status(422).json({
        message: "No video found",
        status: false,
        status_code: 422
      });
    }

    // Initialize OAuth2 client
    const oauth2Client = getOAuth2Client(userData);
    const redirectUri = process.env.REDIRECT_URL;
    oauth2Client.setRedirectUri(redirectUri);

    // Get tokens from the auth code
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Save tokens to DB
    await User.update({
      youtube_access_token: tokens.access_token,
      youtube_refresh_token: tokens.refresh_token
    }, { where: { id: userId } });

    // Upload video to YouTube
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

    // Save video info in DB and delete local file
    await Video.update({
      youtube_id: response.data.id,
      youtube_upload_status: 'completed'
    }, { where: { id: videoId } });

    fs.unlinkSync(videourl); // delete local file after upload

    res.status(200).json({
      message: "Video uploaded to YouTube",
      youtube_id: response.data.id,
      status: true,
      status_code: 200
    });

  } catch (err) {
    console.error("Error uploading video:", err);

    if (req.body.video_id) {
      await Video.update({
        youtube_upload_status: 'failed',
        youtube_error: err.message?.substring(0, 255)
      }, { where: { id: req.body.video_id } });
    }

    res.status(400).json({
      message: "YouTube upload failed: " + (err.message || 'Unknown error'),
      status: false,
      status_code: 400
    });
  }
};
