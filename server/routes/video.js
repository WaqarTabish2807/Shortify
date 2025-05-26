const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const ytdl = require('ytdl-core');
const { v4: uuidv4 } = require('uuid');

// Store active download jobs
const activeJobs = new Map();

// New endpoint to start parallel processing
router.post('/process-video', async (req, res) => {
  const { videoId } = req.body;
  if (!videoId) {
    return res.status(400).json({ error: 'Missing YouTube video ID.' });
  }

  try {
    // Generate unique job ID
    const jobId = uuidv4();
    const timestamp = Date.now();
    const outputPath = path.join(__dirname, '..', 'temp', `video-${timestamp}.mp4`);

    // Initialize job status
    activeJobs.set(jobId, {
      status: 'processing',
      videoId,
      outputPath,
      downloadProgress: 0,
      transcript: null,
      segments: null,
      shorts: null,
      error: null
    });

    // Start video download in background
    const downloadPromise = new Promise((resolve, reject) => {
      const video = ytdl(videoId, {
        quality: 'highest',
        filter: 'videoandaudio'
      });

      const writeStream = fs.createWriteStream(outputPath);
      
      video.pipe(writeStream);

      video.on('progress', (_, downloaded, total) => {
        const progress = (downloaded / total) * 100;
        const job = activeJobs.get(jobId);
        if (job) {
          job.downloadProgress = progress;
        }
      });

      writeStream.on('finish', () => {
        const job = activeJobs.get(jobId);
        if (job) {
          job.status = 'downloaded';
        }
        resolve();
      });

      writeStream.on('error', (err) => {
        const job = activeJobs.get(jobId);
        if (job) {
          job.status = 'error';
          job.error = err.message;
        }
        reject(err);
      });
    });

    // Start transcript processing in parallel
    const transcriptPromise = fetch(`http://localhost:${process.env.PORT || 5000}/api/youtube-transcript`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId })
    }).then(res => res.json())
      .then(data => {
        const job = activeJobs.get(jobId);
        if (job) {
          job.transcript = data.transcript;
        }
        return data;
      });

    // Start analysis in parallel
    const analysisPromise = transcriptPromise.then(data => 
      fetch(`http://localhost:${process.env.PORT || 5000}/api/analyze-transcript`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: data.transcript })
      }).then(res => res.json())
    ).then(data => {
      const job = activeJobs.get(jobId);
      if (job) {
        job.segments = data.segments;
      }
      return data;
    });

    // Wait for download to complete, then cut shorts
    downloadPromise.then(() => {
      const job = activeJobs.get(jobId);
      if (job && job.segments) {
        return fetch(`http://localhost:${process.env.PORT || 5000}/api/cut-shorts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoPath: job.outputPath,
            segments: job.segments
          })
        }).then(res => res.json())
          .then(data => {
            job.shorts = data.shorts;
            job.status = 'completed';
          });
      }
    }).catch(err => {
      console.error('Error in processing pipeline:', err);
      const job = activeJobs.get(jobId);
      if (job) {
        job.status = 'error';
        job.error = err.message;
      }
    });

    // Return job ID immediately
    res.json({ 
      success: true, 
      jobId,
      message: 'Video processing started. Use /job-status endpoint to check progress.'
    });

  } catch (err) {
    console.error('Error starting video processing:', err);
    res.status(500).json({ 
      error: 'Failed to start video processing.', 
      details: err.message 
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
    error: job.error
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