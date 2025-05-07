const {User,Video} = require("../../../../models")
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { google } = require('googleapis');
const { spawn } = require('child_process');

// Load environment variables or credentials from a secure source
const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID || 'YOUR_CLIENT_ID';
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET || 'YOUR_CLIENT_SECRET';
const REDIRECT_URI = process.env.YOUTUBE_REDIRECT_URI || 'http:////localhost:3015/user/youtube/oauth2callback';

console.log(REDIRECT_URI)
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Set credentials from environment variables or secure storage
oauth2Client.setCredentials({
  access_token: process.env.YOUTUBE_ACCESS_TOKEN || 'YOUR_ACCESS_TOKEN',
  refresh_token: process.env.YOUTUBE_REFRESH_TOKEN || 'YOUR_REFRESH_TOKEN'
});

const downloadVideo = async (videoUrl, outputPath) => {
  const response = await axios({
    method: 'GET',
    url: videoUrl,
    responseType: 'stream'
  });

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);
    writer.on('finish', () => {
      console.log('Download complete:', outputPath);
      resolve();
    });
    writer.on('error', reject);
  });
};

// Function to upload video to YouTube
const uploadToYoutube = async (filePath, title, description, tags, privacyStatus) => {
  return new Promise((resolve, reject) => {
    // Set YouTube API scopes
    const SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];
    
    const youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client
    });

    const fileSize = fs.statSync(filePath).size;
    
    const requestBody = {
      snippet: {
        title: title || 'Uploaded Video',
        description: description || 'Video uploaded via API',
        tags: tags || ['api', 'upload'],
        categoryId: '22' // People & Blogs category
      },
      status: {
        privacyStatus: privacyStatus || 'private' // 'private', 'public', or 'unlisted'
      }
    };

    // Use promise-based API instead of callback
    youtube.videos.insert({
      part: 'snippet,status',
      requestBody: requestBody,
      media: {
        body: fs.createReadStream(filePath)
      }
    })
    .then(response => {
      console.log('Video uploaded to YouTube:', response.data);
      resolve(response.data);
    })
    .catch(err => {
      console.error('Error uploading to YouTube:', err);
      reject(err);
    });
  });
};

// Function to spawn a child process for YouTube upload
const spawnYoutubeUploadProcess = (filePath, videoData) => {
  const scriptPath = path.join(__dirname, '../../../../../scripts/youtube-upload.js');
  const scriptsDir = path.dirname(scriptPath);
  
  // Create scripts directory if it doesn't exist
  if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true });
    console.log('Scripts directory created:', scriptsDir);
  }
  
  // Create upload script if it doesn't exist
  if (!fs.existsSync(scriptPath)) {
    const scriptContent = `
      const fs = require('fs');
      const { google } = require('googleapis');
      const path = require('path');
      require('dotenv').config(); // Load environment variables
      
      // Get command line arguments
      const filePath = process.argv[2];
      const videoId = process.argv[3];
      const title = process.argv[4] || 'Uploaded Video';
      const description = process.argv[5] || 'Video uploaded via API';
      
      // YouTube API credentials from environment variables
      const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
      const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
      const REDIRECT_URI = process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3000/oauth2callback';
      const ACCESS_TOKEN = process.env.YOUTUBE_ACCESS_TOKEN;
      const REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN;
      
      // Log path for debugging
      console.log('Processing video file:', filePath);
      
      // Set up OAuth client
      const oauth2Client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URI
      );
      
      oauth2Client.setCredentials({
        access_token: ACCESS_TOKEN,
        refresh_token: REFRESH_TOKEN
      });
      
      // Handle token refresh
      oauth2Client.on('tokens', (tokens) => {
        if (tokens.refresh_token) {
          // Store the new refresh token
          console.log('New refresh token received');
          // Save to environment or secure storage
        }
        // Update access token
        console.log('Access token refreshed');
        // Save to environment or secure storage
      });
      
      // Set up YouTube API
      const youtube = google.youtube({
        version: 'v3',
        auth: oauth2Client
      });
      
      const uploadVideo = async () => {
        try {
          // Verify file exists
          if (!fs.existsSync(filePath)) {
            console.error('File not found:', filePath);
            process.exit(1);
          }
          
          const fileSize = fs.statSync(filePath).size;
          console.log('File size:', fileSize, 'bytes');
          
          const requestBody = {
            snippet: {
              title: title,
              description: description,
              tags: ['api', 'upload'],
              categoryId: '22' // People & Blogs category
            },
            status: {
              privacyStatus: 'private' // 'private', 'public', or 'unlisted'
            }
          };
      
          console.log('Starting YouTube upload...');
          const response = await youtube.videos.insert({
            part: 'snippet,status',
            requestBody: requestBody,
            media: {
              body: fs.createReadStream(filePath)
            }
          });
          
          console.log('Video uploaded successfully. YouTube ID:', response.data.id);
          
          // Update the video record in database with YouTube ID
          try {
            const { createConnection } = require('mysql2/promise');
            const connection = await createConnection({
              host: process.env.DB_HOST,
              user: process.env.DB_USER,
              password: process.env.DB_PASSWORD,
              database: process.env.DB_NAME
            });
            
            await connection.execute(
              'UPDATE videos SET youtube_id = ?, youtube_upload_status = ? WHERE id = ?',
              [response.data.id, 'completed', videoId]
            );
            
            console.log('Database updated with YouTube ID');
            connection.end();
          } catch (dbError) {
            console.error('Database update failed:', dbError);
          }
          
          // Clean up the temporary file
          fs.unlinkSync(filePath);
          console.log('Temporary file removed:', filePath);
          
          process.exit(0);
        } catch (error) {
          console.error('Error uploading to YouTube:', error.message);
          
          // Update database with error status
          try {
            const { createConnection } = require('mysql2/promise');
            const connection = await createConnection({
              host: process.env.DB_HOST,
              user: process.env.DB_USER,
              password: process.env.DB_PASSWORD,
              database: process.env.DB_NAME
            });
            
            await connection.execute(
              'UPDATE videos SET youtube_upload_status = ?, youtube_error = ? WHERE id = ?',
              ['failed', error.message.substring(0, 255), videoId]
            );
            
            console.log('Database updated with error status');
            connection.end();
          } catch (dbError) {
            console.error('Database update failed:', dbError);
          }
          
          process.exit(1);
        }
      };
      
      uploadVideo();
    `;
    
    fs.writeFileSync(scriptPath, scriptContent);
    fs.chmodSync(scriptPath, '755');
    console.log('Upload script created:', scriptPath);
  }
  
  // Spawn child process to handle YouTube upload
  const child = spawn('node', [
    scriptPath,
    filePath,
    videoData.id,
    videoData.title || 'Uploaded Video',
    videoData.description || 'Video uploaded via API'
  ], {
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'] // Capture stdout and stderr
  });
  
  // Log output from child process
  if (child.stdout) {
    child.stdout.on('data', (data) => {
      console.log(`[YouTube Upload ${child.pid}]: ${data.toString().trim()}`);
    });
  }
  
  if (child.stderr) {
    child.stderr.on('data', (data) => {
      console.error(`[YouTube Upload ${child.pid} ERROR]: ${data.toString().trim()}`);
    });
  }
  
  // Unref child to allow parent to exit
  child.unref();
  
  console.log(`YouTube upload process started with PID: ${child.pid}`);
  return child.pid;
};

// Helper function to verify OAuth tokens
const verifyOAuthTokens = async () => {
  try {
    // Check if tokens exist
    // if (!process.env.YOUTUBE_ACCESS_TOKEN || !process.env.YOUTUBE_REFRESH_TOKEN) {
    //   console.warn('YouTube OAuth tokens not found in environment variables');
    //   return false;
    // }
    
    // Test the tokens with a simple API call
    const youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client
    });
    
    await youtube.channels.list({
      part: 'snippet',
      mine: true
    });
    
    return true;
  } catch (error) {
    console.error('OAuth token validation failed:', error.message);
    return false;
  }
};

// Main YouTube upload controller
exports.uploadYoutube = async (req, res) => {
  try {
    const userId = req?.user?.id;
    const videoId = req?.body?.video_id;

    // Validate required parameters
    if (!videoId) {
      return res.status(422).json({
        message: "video id required",
        status: false,
        status_code: 422
      });
    }
    
    // Verify OAuth tokens
    const tokensValid = await verifyOAuthTokens();
    if (!tokensValid) {
      return res.status(432).json({
        message: "YouTube authentication failed. Please authorize the application.",
        auth_url: oauth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: ['https://www.googleapis.com/auth/youtube.upload']
        }),
        status: false,
        status_code: 432
      });
    }

    // Find video in database
    const videoData = await Video.findByPk(videoId);
    if (!videoData) {
      return res.status(422).json({
        message: "no video found",
        status: false,
        status_code: 422
      });
    }

    // Validate video URL
    if (!videoData?.video) {
      return res.status(422).json({
        message: "Video file not found in database record",
        status: false,
        status_code: 422
      });
    }
    
    const videoUrl = `${process.env.VIDEO_URL}${videoData?.video}`;
    
    // Create upload directory
    const dirPath = path.join(__dirname, '../../../../../public/uploads/videoYoutube');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log('Directory created:', dirPath);
    }

    // Generate filename with timestamp to avoid collisions
    const extension = path.extname(videoData?.video) || '.mp4';
    const filename = `video_${Date.now()}_${videoData.id}${extension}`;
    const outputPath = path.join(dirPath, filename);

    // Log the download attempt
    console.log(`Downloading video from ${videoUrl} to ${outputPath}`);
    
    // Download the video
    try {
      await downloadVideo(videoUrl, outputPath);
      
      // Verify the downloaded file exists and has content
      const fileStats = fs.statSync(outputPath);
      if (fileStats.size === 0) {
        throw new Error('Downloaded file is empty');
      }
      
      console.log(`Download successful. File size: ${fileStats.size} bytes`);
    } catch (downloadError) {
      console.error("Error downloading video:", downloadError);
      return res.status(500).json({
        message: "Failed to download video: " + downloadError.message,
        status: false,
        status_code: 500
      });
    }

    // Start YouTube upload as a child process
    try {
      const uploadPid = spawnYoutubeUploadProcess(outputPath, videoData);
      
      // Update video record with upload status
      await Video.update({
        youtube_upload_status: 'processing',
        youtube_upload_pid: uploadPid,
        youtube_upload_started_at: new Date(),
        youtube_error: null // Clear any previous errors
      }, {
        where: { id: videoId }
      });

      // Return success response with file information
      res.status(200).json({
        message: "Video downloaded successfully and YouTube upload started",
        filePath: `/uploads/videoYoutube/${filename}`,
        youtube_upload_pid: uploadPid,
        status: true,
        status_code: 200
      });
      
      // Log success
      console.log(`YouTube upload process initiated for video ID ${videoId} with PID ${uploadPid}`);
    } catch (uploadError) {
      console.error("Error starting YouTube upload process:", uploadError);
      
      // Update video status to failed
      await Video.update({
        youtube_upload_status: 'failed',
        youtube_error: uploadError.message
      }, {
        where: { id: videoId }
      });
      
      return res.status(500).json({
        message: "Failed to start YouTube upload: " + uploadError.message,
        status: false,
        status_code: 500
      });
    }

  } catch (err) {
    console.error("Error in uploadYoutube controller:", err);
    
    // Update video status if we have a video ID
    if (req?.body?.video_id) {
      try {
        await Video.update({
          youtube_upload_status: 'failed',
          youtube_error: err.message.substring(0, 255) // Limit error message length
        }, {
          where: { id: req.body.video_id }
        });
      } catch (dbErr) {
        console.error("Failed to update video status:", dbErr);
      }
    }
    
    // Return appropriate error message
    return res.status(500).json({
      message: "Internal Server Error: " + err.message,
      status: false,
      status_code: 500
    });
  }
};

// Export OAuth callback handler
exports.youtubeOAuthCallback = async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({
        message: "Authorization code is required",
        status: false,
        status_code: 400
      });
    }
    
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    // Store tokens securely (this is just an example - use your preferred secure storage)
    // In production, use environment variables, secure database, or secret manager
    process.env.YOUTUBE_ACCESS_TOKEN = tokens.access_token;
    if (tokens.refresh_token) {
      process.env.YOUTUBE_REFRESH_TOKEN = tokens.refresh_token;
    }
    
    // Update OAuth client with new tokens
    oauth2Client.setCredentials(tokens);
    
    return res.status(200).json({
      message: "YouTube authorization successful",
      status: true,
      status_code: 200
    });
  } catch (err) {
    console.error("Error in YouTube OAuth callback:", err);
    return res.status(500).json({
      message: "YouTube authorization failed: " + err.message,
      status: false,
      status_code: 500
    });
  }
};

// Get YouTube upload status
exports.getYoutubeUploadStatus = async (req, res) => {
  try {
    const { videoId } = req.params;
    
    if (!videoId) {
      return res.status(422).json({
        message: "Video ID required",
        status: false,
        status_code: 422
      });
    }
    
    const videoData = await Video.findByPk(videoId);
    if (!videoData) {
      return res.status(404).json({
        message: "Video not found",
        status: false,
        status_code: 404
      });
    }
    
    return res.status(200).json({
      status: true,
      status_code: 200,
      data: {
        youtube_upload_status: videoData.youtube_upload_status,
        youtube_id: videoData.youtube_id,
        youtube_error: videoData.youtube_error,
        youtube_upload_started_at: videoData.youtube_upload_started_at
      }
    });
  } catch (err) {
    console.error("Error getting YouTube upload status:", err);
    return res.status(500).json({
      message: "Internal Server Error: " + err.message,
      status: false,
      status_code: 500
    });
  }
};

exports.youtubeOAuthCallback = async (req,res)=>{

}