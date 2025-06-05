const express = require('express');
const router = express.Router();
const path = require('path');
const fsPromises = require('fs').promises;
const { createWriteStream } = require('fs');
const ytdl = require('ytdl-core');
const { v4: uuidv4 } = require('uuid');
const TranscriptAPI = require('youtube-transcript-api');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const ffmpegPath = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const {
  uploadToSupabase,
  downloadFromSupabase,
  getPublicUrl,
  deleteFromSupabase,
} = require('../supabaseUtils');

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Tell fluent-ffmpeg where it can find FFmpeg
ffmpeg.setFfmpegPath(ffmpegPath);

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, {
  apiVersion: 'v1'
});

// Function to extract video ID from URL or return as is
function extractVideoId(input) {
  // If it's already just a video ID (no special characters)
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return input;
  }

  // Try to extract from URL
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

// Store active download jobs
const activeJobs = new Map();

// New endpoint to start parallel processing
router.post('/process-video', async (req, res) => {
  const { videoId, languageCode: userProvidedLanguageCode, clipLength, layout, template } = req.body;
  if (!videoId) {
    return res.status(400).json({ error: 'Missing YouTube video ID.' });
  }

  // Verify JWT and extract user ID
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token.' });
  }
  const token = authHeader.split(' ')[1];
  let userId;
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token.' });
    }
    userId = user.id;
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Token verification failed.' });
  }

  // Fetch user credits and tier
  let userCredits, userTier;
  try {
    const { data, error } = await supabase
      .from('user_credits')
      .select('credits, tier, user_id')
      .eq('user_id', userId)
      .maybeSingle(); // Use maybeSingle to avoid throwing if no row
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch user credits.' });
    }
    if (!data) {
      // No row found for this user
      return res.status(403).json({ error: 'No credits record found for this user. Please contact support.' });
    }
    userCredits = data.credits;
    userTier = data.tier === 'paid' ? 'paid' : 'free'; // Default to free if not set or invalid
  } catch (err) {
    return res.status(500).json({ error: 'Error fetching user data.' });
  }

  // Enforce credit limits
  const maxShorts = userTier === 'paid' ? 4 : 2;
  if (userCredits < 1) {
    return res.status(403).json({ error: 'Insufficient credits.' });
  }

  try {
    // Generate unique job ID
    const jobId = uuidv4();
    const timestamp = Date.now();
    const tempBucket = 'temp';
    const shortsBucket = 'shorts';
    const tempVideoPath = `originals/original-${jobId}.mp4`;

    // Remove local temp file/dir creation
    // await fsPromises.mkdir(shortsDir, { recursive: true });

    // Stream YouTube video and upload to Supabase in-memory
    await new Promise((resolve, reject) => {
      const passThrough = new (require('stream').PassThrough)();
      const ytdlStream = ytdl(videoId, { quality: 'highest', filter: 'videoandaudio' });
      ytdlStream.pipe(passThrough);
      const chunks = [];
      passThrough.on('data', chunk => chunks.push(chunk));
      passThrough.on('end', async () => {
        const buffer = Buffer.concat(chunks);
        console.log('YouTube video buffer size before upload:', buffer.length);
        if (buffer.length < 1000000) { // <1MB, likely invalid
          require('fs').writeFileSync('debug-upload-video.mp4', buffer);
          console.error('Buffer is too small, wrote debug-upload-video.mp4');
        }
        try {
          await uploadToSupabase(tempBucket, tempVideoPath, buffer, 'video/mp4');
          resolve();
        } catch (err) {
          console.error('Error uploading to Supabase:', err);
          reject(err);
        }
      });
      passThrough.on('error', err => {
        console.error('Error in YouTube download stream:', err);
        reject(err);
      });
      ytdlStream.on('error', err => {
        console.error('Error in ytdl stream:', err);
        reject(err);
      });
    });

    // Initialize job status
    activeJobs.set(jobId, {
      status: 'processing',
      videoId,
      outputPath: tempVideoPath,
      downloadProgress: 0,
      transcript: null,
      segments: null,
      shorts: null,
      error: null,
      userId,
      userTier,
      maxShorts
    });

    // --- Integrated Transcript Fetching Logic ---
    const transcriptPromise = (async () => {
        const extractedId = extractVideoId(videoId);
        if (!extractedId) {
             throw new Error('Invalid YouTube video ID or URL. Please provide a valid YouTube video ID or URL.');
        }
        try {
            // Try YouTube transcript first
            const transcript = await TranscriptAPI.getTranscript(extractedId);

            if (transcript && transcript.length > 0) {
                const formattedTranscript = transcript.map(item => ({
                    text: item.text,
                    start: parseFloat(item.start),
                    duration: parseFloat(item.duration)
                }));
                const job = activeJobs.get(jobId);
                if (job) {
                  job.transcript = formattedTranscript;
                }
                return { transcript: formattedTranscript };
            } else {
                throw new Error('No transcript found for this video.');
            }
        } catch (err) {
            console.warn('YouTube transcript not found, falling back to Google Speech-to-Text:', err.message);
            // Fallback: Use Google Speech-to-Text with chunking (in-memory, no disk)
            try {
                const speech = require('@google-cloud/speech');
                const client = new speech.SpeechClient();
                const { PassThrough } = require('stream');
                
                // 1. Download audio as stream from YouTube
                const audioStream = ytdl(videoId, { filter: 'audioonly', quality: 'highestaudio' });
                
                // 2. Use ffmpeg to chunk audio into 60s segments, output as mp3 to memory
                const chunkBuffers = [];
                let currentBuffer = [];
                let chunkIndex = 0;
                let chunkPromises = [];
                
                // Helper to process a single chunk buffer with Google STT
                async function processChunkBuffer(buffer) {
                  const audioBytes = buffer.toString('base64');
                    const audio = { content: audioBytes };
                    const config = {
                        encoding: 'MP3',
                        sampleRateHertz: 44100,
                        languageCode: userProvidedLanguageCode || 'en-US',
                        enableWordTimeOffsets: true
                    };
                    const request = { audio, config };
                    const [response] = await client.recognize(request);
                  return response.results && response.results.length > 0
                    ? response.results.map(result => ({
                            text: result.alternatives[0].transcript,
                            start: result.alternatives[0].words && result.alternatives[0].words[0] ? parseFloat(result.alternatives[0].words[0].startTime.seconds || 0) : 0,
                        duration: result.alternatives[0].words && result.alternatives[0].words.length > 1
                          ? parseFloat(result.alternatives[0].words[result.alternatives[0].words.length - 1].endTime.seconds || 0) - parseFloat(result.alternatives[0].words[0].startTime.seconds || 0)
                          : 0
                      }))
                    : [];
                }

                // 3. Set up ffmpeg to segment audio
                await new Promise((resolve, reject) => {
                  const ffmpegCommand = ffmpeg(audioStream)
                    .audioCodec('libmp3lame')
                    .format('mp3')
                    .outputOptions('-f segment', '-segment_time 60', '-c copy')
                    .on('start', () => {
                      chunkIndex = 0;
                    })
                    .on('error', err => reject(err));

                  // ffmpeg emits 'data' for each chunk
                  ffmpegCommand.pipe()
                    .on('data', chunk => {
                      currentBuffer.push(chunk);
                    })
                    .on('end', async () => {
                      // Last chunk
                      if (currentBuffer.length > 0) {
                        chunkBuffers.push(Buffer.concat(currentBuffer));
                        currentBuffer = [];
                      }
                      resolve();
                    })
                    .on('close', () => {
                      if (currentBuffer.length > 0) {
                        chunkBuffers.push(Buffer.concat(currentBuffer));
                        currentBuffer = [];
                      }
                      resolve();
                    });
                });

                // 4. Process each chunk buffer with Google STT
                let allTranscripts = [];
                for (const buffer of chunkBuffers) {
                  const chunkTranscript = await processChunkBuffer(buffer);
                  allTranscripts.push(...chunkTranscript);
                }
                const job = activeJobs.get(jobId);
                if (job) {
                  job.transcript = allTranscripts;
                }
                return { transcript: allTranscripts };
            } catch (sttErr) {
                console.error('Google Speech-to-Text error:', sttErr);
                const job = activeJobs.get(jobId);
                if (job) {
                  job.error = job.error ? `${job.error}, Transcript Error: ${sttErr.message}` : `Transcript Error: ${sttErr.message}`;
                }
                throw sttErr;
            }
        }
    })();

    // --- Integrated Analysis Logic ---
    const analysisPromise = transcriptPromise.then(async (data) => {
        const transcript = data.transcript;

        if (!transcript || !Array.isArray(transcript)) {
            throw new Error('Missing or invalid transcript data for analysis.');
        }

        // Determine min/max duration from clipLength
        let minDuration = 25, maxDuration = 30;
        if (clipLength === '<30s') {
          minDuration = 10; maxDuration = 29;
        } else if (clipLength === '30s-60s') {
          minDuration = 30; maxDuration = 60;
        } else if (clipLength === '60s-90s') {
          minDuration = 60; maxDuration = 90;
        }

        try {
            const prompt = `Analyze this TED talk transcript and identify 2-4 high-quality segments that would make engaging short-form content. \n\nImportant requirements:\n1. Each segment MUST be ${minDuration}-${maxDuration} seconds when spoken\n2. Select the most impactful, emotional, or thought-provoking moments\n3. Each segment should be a complete thought that makes sense on its own\n4. Focus on segments with clear messages, personal stories, or powerful quotes\n5. Avoid segments with audience reactions (laughter, applause) unless they're part of a key moment\n6. Use exact timestamps from the transcript\n\nFormat the output as a JSON array of objects, where each object has:\n- text: the segment text\n- startTime: the exact start time in seconds from the transcript\n- duration: the exact duration in seconds from the transcript\n\nExample format:\n[\n  {\n    "text": "First segment text here",\n    "startTime": 30,\n    "duration": 25\n  },\n  {\n    "text": "Second segment text here",\n    "startTime": 120,\n    "duration": 28\n  }\n]\n\nTranscript (with timestamps):\n\`\`\`\n${JSON.stringify(transcript, null, 2)}\n\`\`\`\n\nJSON array of segments with exact timestamps:`;

            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

            console.log('Sending transcript to Gemini for analysis...');
            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            console.log('Gemini analysis complete.', text);

            let suggestedSegments = [];
            try {
                // Clean up the response text by removing markdown code block formatting
                const jsonContent = text
                    .replace(/```json\n?/g, '') // Remove opening ```json
                    .replace(/```\n?/g, '')    // Remove closing ```
                    .trim();                    // Remove extra whitespace

                console.log('Cleaned JSON content:', jsonContent); // Debug log
                suggestedSegments = JSON.parse(jsonContent);

                if (!Array.isArray(suggestedSegments)) {
                    throw new Error('Gemini did not return a JSON array.');
                }

                // Validate each segment has the required properties
                suggestedSegments.forEach((segment, index) => {
                    if (!segment.text || typeof segment.startTime !== 'number' || typeof segment.duration !== 'number') {
                        throw new Error(`Invalid segment format at index ${index}`);
                    }
                });

                // Enforce shorts limit for free/paid users
                const limitedSegments = suggestedSegments.slice(0, maxShorts);
                const job = activeJobs.get(jobId);
                if (job) {
                  job.segments = limitedSegments;
                }
                return { segments: limitedSegments };

            } catch (parseError) {
                console.error('Failed to parse Gemini response as JSON array during processing:', parseError);
                console.error('Raw response text:', text); // Debug log
                throw new Error(`Failed to parse Gemini response: ${parseError.message}`);
            }

        } catch (err) {
            console.error('Gemini analysis error during processing:', err);
            const job = activeJobs.get(jobId);
            if (job) {
              job.error = job.error ? `${job.error}, Analysis Error: ${err.message}` : `Analysis Error: ${err.message}`;
            }
            throw err; // Re-throw to propagate the error
        }
    });

    // --- Integrated Cutting Logic (Waits for download and analysis) ---
    Promise.all([analysisPromise]).then(async ([analysisData]) => {
        const job = activeJobs.get(jobId);
      if (!job || !job.segments || job.status === 'error') return;
        job.status = 'cutting';
        const segments = job.segments;
      const shortUrls = [];
      const ffmpeg = require('fluent-ffmpeg');
      const { Readable } = require('stream');
      // 1. Get info and select a valid webm or mp4 format from ytdl
      const info = await ytdl.getInfo(videoId);
      let selectedFormat = info.formats.find(
        f => f.container === 'webm' && f.hasVideo && f.hasAudio
      );
      let inputFormat = 'webm';
      if (!selectedFormat) {
        // Fallback to mp4
        selectedFormat = info.formats.find(
          f => f.container === 'mp4' && f.hasVideo && f.hasAudio
        );
        inputFormat = 'mp4';
      }
      if (!selectedFormat) {
        throw new Error('No suitable webm or mp4 format found for this video.');
      }
      const ytdlStream = ytdl.downloadFromInfo(info, { format: selectedFormat });
      const chunks = [];
      for await (const chunk of ytdlStream) {
        chunks.push(chunk);
      }
      const videoBuffer = Buffer.concat(chunks);
      // 2. For each segment, use a Readable stream from the buffer
        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            const outputFileName = `short-${i + 1}.mp4`;
        const outputPath = `${jobId}/${outputFileName}`;
        // 1. Generate .ts buffer
        const tsBuffer = await Promise.race([
          new Promise((resolve, reject) => {
            const outputChunks = [];
            const inputStream = Readable.from(videoBuffer);
            const ffmpegStream = ffmpeg(inputStream)
              .inputFormat(inputFormat)
              .addInputOption('-analyzeduration', '2147483647')
              .addInputOption('-probesize', '2147483647')
              .setStartTime(segment.startTime)
              .duration(segment.duration)
              .videoCodec('libx264')
              .audioCodec('aac')
              .format('mpegts')
              .on('stderr', data => console.log('ffmpeg stderr (ts):', data.toString()))
              .on('error', (err) => {
                console.error('FFmpeg TS error:', err);
                reject(new Error(`FFmpeg TS error: ${err.message}`));
              })
              .on('end', () => {
                console.log('FFmpeg TS processing completed');
                resolve(Buffer.concat(outputChunks));
              })
              .on('progress', (progress) => {
                console.log('FFmpeg TS progress:', progress);
              })
              .setFfmpegPath(ffmpegPath)
              .setFfprobePath(ffmpegPath.replace('ffmpeg', 'ffprobe'))
              .pipe();
            ffmpegStream.on('data', chunk => outputChunks.push(chunk));
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('FFmpeg TS conversion timed out after 5 minutes')), 300000)
          )
        ]);

        console.log('TS buffer size:', tsBuffer.length);

        // 2. Convert .ts buffer to .mp4 buffer
        const mp4Buffer = await Promise.race([
          new Promise((resolve, reject) => {
            const outputChunks = [];
            const inputStream = Readable.from(tsBuffer);
            const ffmpegStream = ffmpeg(inputStream)
              .inputFormat('mpegts')
              .videoCodec('libx264')
              .audioCodec('aac')
              .format('mp4')
              .addOutputOption('-movflags', 'frag_keyframe+empty_moov')
              .on('stderr', data => console.log('ffmpeg stderr (mp4):', data.toString()))
              .on('error', (err) => {
                console.error('FFmpeg MP4 error:', err);
                reject(new Error(`FFmpeg MP4 error: ${err.message}`));
              })
              .on('end', () => {
                console.log('FFmpeg MP4 processing completed');
                resolve(Buffer.concat(outputChunks));
              })
              .on('progress', (progress) => {
                console.log('FFmpeg MP4 progress:', progress);
              })
              .setFfmpegPath(ffmpegPath)
              .setFfprobePath(ffmpegPath.replace('ffmpeg', 'ffprobe'))
              .pipe();
            ffmpegStream.on('data', chunk => outputChunks.push(chunk));
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('FFmpeg MP4 conversion timed out after 5 minutes')), 300000)
          )
        ]);

        console.log('MP4 buffer size:', mp4Buffer.length);

        // 3. Upload .mp4 to Supabase
        try {
          await uploadToSupabase(shortsBucket, outputPath, mp4Buffer, 'video/mp4');
          const url = getPublicUrl(shortsBucket, outputPath);
          shortUrls.push(url);
          console.log('Successfully uploaded short to Supabase:', url);
        } catch (uploadError) {
          console.error('Error uploading to Supabase:', uploadError);
          throw new Error(`Failed to upload short to Supabase: ${uploadError.message}`);
        }
      }
      job.shorts = shortUrls;
             job.status = 'completed';
      // 4. Delete temp video from Supabase
      await deleteFromSupabase(tempBucket, tempVideoPath);
        // Decrement credits for free users
        if (userTier === 'free') {
            const { error: updateError } = await supabase
                .from('user_credits')
                .update({ credits: userCredits - 1 })
                .eq('user_id', userId);
            if (updateError) {
                console.error('Failed to decrement credits:', updateError);
            }
        }
    }).catch(err => {
      console.error('Error in processing pipeline after download/analysis:', err);
      const job = activeJobs.get(jobId);
      if (job) {
        job.status = 'error';
        job.error = job.error ? `${job.error}, Pipeline Error: ${err.message}` : `Pipeline Error: ${err.message}`;;
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