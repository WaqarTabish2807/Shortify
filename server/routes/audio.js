const express = require('express');
const router = express.Router();
const path = require('path');
const fsPromises = require('fs').promises;
const { createWriteStream } = require('fs');
const { v4: uuidv4 } = require('uuid');
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
const multer = require('multer');
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  }
});
const { Storage } = require('@google-cloud/storage');

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Initialize Google Cloud Storage client
const storage = new Storage();

// Tell fluent-ffmpeg where it can find FFmpeg
ffmpeg.setFfmpegPath(ffmpegPath);

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, {
  apiVersion: 'v1'
});

// Store active download jobs
const activeJobs = new Map();

// New endpoint to start parallel processing
router.post('/process-video', upload.single('video'), async (req, res) => {
  console.log('🚀 Starting video processing request');
  
  if (!req.file) {
    console.error('❌ No video file uploaded');
    return res.status(400).json({ error: 'No video file uploaded.' });
  }

  // Verify JWT and extract user ID
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('❌ Missing or invalid authorization token');
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token.' });
  }
  
  const token = authHeader.split(' ')[1];
  let userId;
  try {
    console.log('🔑 Verifying user token...');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      console.error('❌ Invalid token:', error);
      return res.status(401).json({ error: 'Unauthorized: Invalid token.' });
    }
    userId = user.id;
    console.log('✅ User authenticated:', userId);
  } catch (err) {
    console.error('❌ Token verification failed:', err);
    return res.status(401).json({ error: 'Unauthorized: Token verification failed.' });
  }

  // Fetch user credits and tier
  let userCredits, userTier;
  try {
    console.log('💰 Fetching user credits and tier...');
    const { data, error } = await supabase
      .from('user_credits')
      .select('credits, tier, user_id')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) {
      console.error('❌ Failed to fetch user credits:', error);
      return res.status(500).json({ error: 'Failed to fetch user credits.' });
    }
    if (!data) {
      console.error('❌ No credits record found for user:', userId);
      return res.status(403).json({ error: 'No credits record found for this user. Please contact support.' });
    }
    userCredits = data.credits;
    userTier = data.tier === 'paid' ? 'paid' : 'free';
    console.log('✅ User credits:', userCredits, 'Tier:', userTier);
  } catch (err) {
    console.error('❌ Error fetching user data:', err);
    return res.status(500).json({ error: 'Error fetching user data.' });
  }

  // Enforce credit limits
  const maxShorts = userTier === 'paid' ? 4 : 2;
  if (userCredits < 1) {
    console.error('❌ Insufficient credits for user:', userId);
    return res.status(403).json({ error: 'Insufficient credits.' });
  }

  try {
    // Generate unique job ID
    const jobId = uuidv4();
    const timestamp = Date.now();
    const tempBucket = 'temp';
    const shortsBucket = 'shorts';
    const tempVideoPath = `originals/original-${jobId}.mp4`;

    // Initialize job status
    console.log('📝 Initializing job status...');
    activeJobs.set(jobId, {
      status: 'initializing',
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

    // Return job ID immediately
    console.log('✅ Video processing job initialized');
    res.json({ 
      success: true, 
      jobId,
      message: 'Video processing initialized. Use /job-status endpoint to check progress.'
    });

    // Start the upload process
    console.log('📤 Uploading video to Supabase temp storage...');
    try {
      await uploadToSupabase(tempBucket, tempVideoPath, req.file.buffer, 'video/mp4');
      console.log('✅ Video uploaded to Supabase successfully');
      
      // Update job status to processing
      const job = activeJobs.get(jobId);
      if (job) {
        job.status = 'processing';
      }
    } catch (uploadError) {
      console.error('❌ Failed to upload video to Supabase:', uploadError);
      const job = activeJobs.get(jobId);
      if (job) {
        job.status = 'error';
        job.error = `Failed to upload video: ${uploadError.message}`;
      }
      return;
    }

    // --- Integrated Transcript Fetching Logic ---
    const transcriptPromise = (async () => {
        try {
            console.log('🎙️ Starting speech-to-text processing...');
            const speech = require('@google-cloud/speech').v1;
            const client = new speech.SpeechClient();
            const { Readable } = require('stream');
            
            // 1. Extract audio from video and convert to FLAC format
            console.log('🔄 Extracting audio from video...');
            const audioBuffer = await new Promise((resolve, reject) => {
                const outputChunks = [];
                const inputStream = Readable.from(req.file.buffer);
                ffmpeg(inputStream)
                    .inputFormat('mp4')
                    .toFormat('flac')
                    .audioChannels(1)
                    .audioFrequency(16000)
                    .on('error', (err) => {
                        console.error('❌ Error extracting audio:', err);
                        reject(new Error(`Audio extraction failed: ${err.message}`));
                    })
                    .on('end', () => {
                        console.log('✅ Audio extracted successfully');
                        resolve(Buffer.concat(outputChunks));
                    })
                    .pipe()
                    .on('data', chunk => outputChunks.push(chunk));
            });

            // 2. Upload audio to Google Cloud Storage
            const bucketName = 'shortify0-audio-uploads';
            const gcsFileName = `audio-${jobId}.flac`;
            console.log('📤 Uploading audio to Google Cloud Storage...');
            const gcsFile = storage.bucket(bucketName).file(gcsFileName);

            await new Promise((resolve, reject) => {
                const uploadStream = gcsFile.createWriteStream({
                    metadata: {
                        contentType: 'audio/flac',
                    },
                });
                uploadStream.on('error', (uploadErr) => {
                    console.error('❌ Error uploading audio to GCS:', uploadErr);
                    reject(new Error(`GCS upload failed: ${uploadErr.message}`));
                });
                uploadStream.on('finish', () => {
                    console.log('✅ Audio uploaded to GCS successfully');
                    resolve();
                });
                uploadStream.end(audioBuffer);
            });

            // 3. Configure and start speech recognition
            console.log('🎯 Starting speech recognition...');
            const gcsUri = `gs://${bucketName}/${gcsFileName}`;
            console.log(`Starting LongRunningRecognize for GCS URI: ${gcsUri}`);

            const request = {
                config: {
                    encoding: 'FLAC',
                    sampleRateHertz: 16000,
                    languageCode: 'en-US',
                    enableAutomaticPunctuation: true,
                    model: 'video',
                    useEnhanced: true,
                },
                audio: {
                    uri: gcsUri,
                },
            };

            const [operation] = await client.longRunningRecognize(request);
            console.log('⏳ Waiting for speech recognition to complete...');
            const [response] = await operation.promise();
            
            const transcript = response.results
                .map(result => result.alternatives[0].transcript)
                .join('\n');

            console.log('✅ Speech recognition completed successfully');
            
            // Update job status with transcript
            const job = activeJobs.get(jobId);
            if (job) {
                job.transcript = transcript;
                console.log('📝 Transcript saved to job status');
            }

            return transcript;
        } catch (err) {
            console.error('❌ Google Speech-to-Text error:', err);
            throw err;
        }
    })();

    // --- Integrated Analysis Logic ---
    const analysisPromise = transcriptPromise.then(async (transcript) => {
        console.log('📊 Starting transcript analysis...');

        if (!transcript || typeof transcript !== 'string') {
            console.error('❌ Invalid transcript data:', transcript);
            throw new Error('Missing or invalid transcript data for analysis.');
        }

        console.log('📝 Received transcript:', transcript);

        // Determine min/max duration from clipLength
        let minDuration = 25, maxDuration = 30;
        if (req.body.clipLength === '<30s') {
          minDuration = 10; maxDuration = 29;
        } else if (req.body.clipLength === '30s-60s') {
          minDuration = 30; maxDuration = 60;
        } else if (req.body.clipLength === '60s-90s') {
          minDuration = 60; maxDuration = 90;
        }

        try {
            const prompt = `You are a video content analyzer. Your task is to analyze the transcript and extract the most engaging segments for short-form content.

Input:
- Transcript with timestamps
- Target duration: ${minDuration}-${maxDuration} seconds per segment
- Maximum segments: ${maxShorts}

Requirements for each segment:
1. Duration must be between ${minDuration}-${maxDuration} seconds
2. Must be a complete, self-contained thought
3. Should be engaging and impactful
4. Must have clear start and end points
5. Should avoid audience reactions unless part of key moments

Output Format:
{
  "segments": [
    {
      "text": "exact transcript text",
      "startTime": number (seconds),
      "duration": number (seconds),
      "reason": "brief explanation of why this segment is engaging"
    }
  ],
  "analysis": {
    "totalSegments": number,
    "averageDuration": number,
    "contentType": "type of content (e.g., story, tutorial, opinion)",
    "keyThemes": ["theme1", "theme2", ...]
  }
}

Transcript:
\`\`\`
${JSON.stringify(transcript, null, 2)}
\`\`\`

Provide the output in valid JSON format only.`;

            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

            console.log('Sending transcript to Gemini for analysis...');
            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            console.log('Gemini analysis complete.');

            let analysisResult;
            try {
                const jsonContent = text
                    .replace(/```json\n?/g, '')
                    .replace(/```\n?/g, '')
                    .trim();

                console.log('Cleaned JSON content:', jsonContent);
                analysisResult = JSON.parse(jsonContent);

                if (!analysisResult.segments || !Array.isArray(analysisResult.segments)) {
                    throw new Error('Invalid response format: missing segments array');
                }

                // Validate each segment
                analysisResult.segments.forEach((segment, index) => {
                    if (!segment.text || typeof segment.startTime !== 'number' || typeof segment.duration !== 'number') {
                        throw new Error(`Invalid segment format at index ${index}`);
                    }
                });

                // Limit segments based on user tier
                const limitedSegments = analysisResult.segments.slice(0, maxShorts);
                
                // Update job status with segments and analysis
                const job = activeJobs.get(jobId);
                if (job) {
                    job.segments = limitedSegments;
                    job.analysis = analysisResult.analysis;
                    console.log('✅ Analysis saved to job status');
                }

                return { 
                    segments: limitedSegments,
                    analysis: analysisResult.analysis
                };

            } catch (parseError) {
                console.error('Failed to parse Gemini response:', parseError);
                console.error('Raw response text:', text);
                throw new Error(`Failed to parse Gemini response: ${parseError.message}`);
            }

        } catch (err) {
            console.error('Gemini analysis error during processing:', err);
            const job = activeJobs.get(jobId);
            if (job) {
              job.error = job.error ? `${job.error}, Analysis Error: ${err.message}` : `Analysis Error: ${err.message}`;
            }
            throw err;
        }
    });

    // --- Integrated Cutting Logic ---
    Promise.all([analysisPromise]).then(async ([analysisData]) => {
        console.log('✂️ Starting video cutting process...');
        const job = activeJobs.get(jobId);
        if (!job || !job.segments || job.status === 'error') {
            console.error('❌ Invalid job state for cutting:', job);
            return;
        }
        
        job.status = 'cutting';
        const segments = job.segments;
        const shortUrls = [];
        const ffmpeg = require('fluent-ffmpeg');
        const { Readable } = require('stream');

        // For each segment, create a short
        for (let i = 0; i < segments.length; i++) {
            console.log(`🎥 Processing segment ${i + 1}/${segments.length}...`);
            const segment = segments[i];
            const outputFileName = `short-${i + 1}.mp4`;
            const outputPath = `${jobId}/${outputFileName}`;

            // 1. Generate .ts buffer
            console.log(`🔄 Converting segment ${i + 1} to TS format...`);
            const tsBuffer = await Promise.race([
                new Promise((resolve, reject) => {
                    const outputChunks = [];
                    const inputStream = Readable.from(req.file.buffer);
                    const ffmpegStream = ffmpeg(inputStream)
                        .inputFormat('mp4')
                        .addInputOption('-analyzeduration', '2147483647')
                        .addInputOption('-probesize', '2147483647')
                        .setStartTime(segment.startTime)
                        .duration(segment.duration)
                        .videoCodec('libx264')
                        .audioCodec('aac')
                        .format('mpegts')
                        .on('error', (err) => {
                            console.error(`❌ FFmpeg TS error for segment ${i + 1}:`, err);
                            reject(new Error(`FFmpeg TS error: ${err.message}`));
                        })
                        .on('end', () => {
                            console.log(`✅ Segment ${i + 1} converted to TS successfully`);
                            resolve(Buffer.concat(outputChunks));
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

            // 2. Convert .ts buffer to .mp4 buffer
            console.log(`🔄 Converting segment ${i + 1} to MP4 format...`);
            const mp4Buffer = await new Promise((resolve, reject) => {
                const outputChunks = [];
                const inputStream = Readable.from(tsBuffer);
                
                ffmpeg(inputStream)
                    .inputFormat('mpegts')
                    .inputOptions([
                        '-analyzeduration 2147483647',
                        '-probesize 2147483647',
                        '-fflags +genpts+igndts',
                        '-flags +global_header',
                        '-thread_queue_size 1024',
                        '-max_delay 5000000',
                        '-max_interleave_delta 0'
                    ])
                    .outputOptions([
                        '-c:v libx264',
                        '-c:a aac',
                        '-f mp4',
                        '-movflags +faststart+frag_keyframe+empty_moov',
                        '-preset ultrafast',
                        '-crf 23',
                        '-maxrate 2M',
                        '-bufsize 2M',
                        '-fps_mode cfr',
                        '-async 1',
                        '-strict experimental',
                        '-thread_queue_size 1024',
                        '-vf scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black',
                        '-pix_fmt yuv420p',
                        '-max_muxing_queue_size 1024'
                    ])
                    .on('start', (commandLine) => {
                        console.log('🔄 Converting segment to MP4 format...');
                        console.log('FFmpeg command:', commandLine);
                    })
                    .on('error', (err) => {
                        console.error('❌ FFmpeg MP4 error:', err.message);
                        reject(new Error(`FFmpeg MP4 error: ${err.message}`));
                    })
                    .on('end', () => {
                        console.log('✅ MP4 conversion completed');
                        resolve(Buffer.concat(outputChunks));
                    })
                    .on('stderr', (stderrLine) => {
                        console.log('FFmpeg stderr:', stderrLine);
                    })
                    .on('progress', (progress) => {
                        console.log('Processing: ' + Math.floor(progress.percent) + '% done');
                    })
                    .on('codecData', (data) => {
                        console.log('Input is ' + data.format + ' with ' + data.duration + 's duration');
                    })
                    .pipe()
                    .on('data', chunk => {
                        console.log('Received chunk of size:', chunk.length);
                        outputChunks.push(chunk);
                    })
                    .on('end', () => {
                        console.log('Pipe end event triggered');
                    })
                    .on('error', (err) => {
                        console.error('Pipe error:', err);
                        reject(err);
                    });
            });

            // Add error handling for empty buffer
            if (!mp4Buffer || mp4Buffer.length === 0) {
                throw new Error('Failed to generate MP4 buffer - empty output');
            }

            // 3. Upload .mp4 to Supabase
            console.log(`📤 Uploading segment ${i + 1} to Supabase...`);
            try {
                await uploadToSupabase(shortsBucket, outputPath, mp4Buffer, 'video/mp4');
                const url = getPublicUrl(shortsBucket, outputPath);
                shortUrls.push(url);
                console.log(`✅ Segment ${i + 1} uploaded successfully`);

                // Store short in database with only the required fields
                const { error: insertError } = await supabase
                    .from('shorts')
                    .insert({
                        user_id: userId,
                        video_url: url,
                        original_video_path: tempVideoPath,
                        segment_number: i + 1,
                        created_at: new Date().toISOString()
                    });

                if (insertError) {
                    console.error(`❌ Error storing short ${i + 1} in database:`, insertError);
                } else {
                    console.log(`✅ Short ${i + 1} stored in database successfully`);
                }
            } catch (uploadError) {
                console.error(`❌ Error uploading segment ${i + 1} to Supabase:`, uploadError);
                throw new Error(`Failed to upload short to Supabase: ${uploadError.message}`);
            }
        }
        
        console.log('✅ All segments processed successfully');
        job.shorts = shortUrls;
        job.status = 'completed';

        // Decrement credits for free users
        if (userTier === 'free') {
            console.log('💰 Decrementing credits for free user...');
            const { error: updateError } = await supabase
                .from('user_credits')
                .update({ credits: userCredits - 1 })
                .eq('user_id', userId);
            if (updateError) {
                console.error('❌ Failed to decrement credits:', updateError);
            } else {
                console.log('✅ Credits decremented successfully');
            }
        }
    }).catch(err => {
        console.error('❌ Error in processing pipeline:', err);
        const job = activeJobs.get(jobId);
        if (job) {
            job.status = 'error';
            job.error = job.error ? `${job.error}, Pipeline Error: ${err.message}` : `Pipeline Error: ${err.message}`;
        }
    });

  } catch (err) {
    console.error('❌ Error starting video processing:', err);
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