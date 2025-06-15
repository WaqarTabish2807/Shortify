const express = require('express');
const router = express.Router();
const path = require('path');
const fsPromises = require('fs').promises;
const { createWriteStream } = require('fs');
const { v4: uuidv4 } = require('uuid');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const {
  uploadToSupabase,
  downloadFromSupabase,
  getPublicUrl,
  deleteFromSupabase,
} = require('../supabaseUtils');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const { Storage } = require('@google-cloud/storage');

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Initialize Google Cloud Storage client
const storage = new Storage();

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, {
  apiVersion: 'v1'
});

// Store active download jobs
const activeJobs = new Map();

// Configure FFmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Function to extract audio from video buffer
async function extractAudioFromVideo(videoBuffer) {
  return new Promise((resolve, reject) => {
    const tempVideoPath = path.join(__dirname, '..', 'temp', `${uuidv4()}.mp4`);
    const tempAudioPath = path.join(__dirname, '..', 'temp', `${uuidv4()}.mp3`);

    // Write video buffer to temporary file
    fsPromises.writeFile(tempVideoPath, videoBuffer)
      .then(() => {
        ffmpeg(tempVideoPath)
          .toFormat('mp3')
          .on('end', async () => {
            try {
              // Read the audio file
              const audioBuffer = await fsPromises.readFile(tempAudioPath);
              
              // Clean up temporary files
              await Promise.all([
                fsPromises.unlink(tempVideoPath),
                fsPromises.unlink(tempAudioPath)
              ]);
              
              resolve(audioBuffer);
            } catch (error) {
              reject(error);
            }
          })
          .on('error', (err) => {
            // Clean up temporary files on error
            Promise.all([
              fsPromises.unlink(tempVideoPath).catch(() => {}),
              fsPromises.unlink(tempAudioPath).catch(() => {})
            ]).finally(() => {
              reject(err);
            });
          })
          .save(tempAudioPath);
      })
      .catch(reject);
  });
}

// Process video endpoint
router.post('/process-video', upload.single('video'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No video file provided' });
  }

  try {
    // Extract audio from video
    console.log('🎵 Extracting audio from video...');
    const audioBuffer = await extractAudioFromVideo(req.file.buffer);

    // Upload audio to Supabase
    console.log('📤 Uploading audio to Supabase...');
    const audioPath = `audio/${uuidv4()}.mp3`;
    await uploadToSupabase('shorts', audioPath, audioBuffer, 'audio/mpeg');

    // Get public URL for the audio
    const audioUrl = await getPublicUrl('shorts', audioPath);

    res.json({
      success: true,
      audioUrl: audioUrl
    });
  } catch (error) {
    console.error('Error processing video:', error);
    res.status(500).json({ error: 'Failed to process video' });
  }
});

// New endpoint to check job status
router.get('/job-status/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = activeJobs.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found.' });
  }

  res.json({
    success: true,
    status: job.status,
    downloadProgress: job.downloadProgress,
    transcript: job.transcript,
    segments: job.segments,
    shorts: job.shorts,
    error: job.error,
    duration: job.duration || null
  });
});

// Clean up completed jobs after 1 hour
setInterval(() => {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  for (const [jobId, job] of activeJobs.entries()) {
    if (job.status === 'completed' || job.status === 'error') {
      activeJobs.delete(jobId);
    }
  }
}, 60 * 60 * 1000);

module.exports = router;