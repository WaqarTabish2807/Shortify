const express = require('express');
const router = express.Router();
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { GoogleGenerativeAI } = require("@google/generative-ai");
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
const { Readable } = require('stream');

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
    const videoStream = Readable.from(videoBuffer);
    const audioChunks = [];

    ffmpeg(videoStream)
      .toFormat('mp3')
      .on('start', (commandLine) => {
        console.log('FFmpeg started with command:', commandLine);
      })
      .on('progress', (progress) => {
        console.log('FFmpeg progress:', progress);
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        reject(err);
      })
      .pipe()
      .on('data', (chunk) => {
        audioChunks.push(chunk);
      })
      .on('end', () => {
        console.log('Audio extraction completed');
        const audioBuffer = Buffer.concat(audioChunks);
        resolve(audioBuffer);
      })
      .on('error', (err) => {
        console.error('Stream error:', err);
        reject(err);
      });
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
    console.log('Video buffer size:', req.file.buffer.length);
    
    const audioBuffer = await extractAudioFromVideo(req.file.buffer);
    console.log('Audio extraction successful, buffer size:', audioBuffer.length);

    // Upload audio to Supabase
    console.log('📤 Uploading audio to Supabase...');
    const audioPath = `audio/${uuidv4()}.mp3`;
    await uploadToSupabase('shorts', audioPath, audioBuffer, 'audio/mpeg');
    console.log('Audio upload successful');

    // Get public URL for the audio
    const audioUrl = await getPublicUrl('shorts', audioPath);
    console.log('Audio URL generated:', audioUrl);

    res.json({
      success: true,
      audioUrl: audioUrl
    });
  } catch (error) {
    console.error('Error processing video:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to process video',
      details: error.message 
    });
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