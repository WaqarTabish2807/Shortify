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
  const { videoId, languageCode: userProvidedLanguageCode } = req.body;
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
    const outputPath = path.join(__dirname, '..', 'temp', `video-${timestamp}.mp4`);
    const shortsDir = path.join(__dirname, '..', 'temp', jobId);
    await fsPromises.mkdir(shortsDir, { recursive: true });

    // Initialize job status
    activeJobs.set(jobId, {
      status: 'processing',
      videoId,
      outputPath,
      downloadProgress: 0,
      transcript: null,
      segments: null,
      shorts: null,
      error: null,
      userId,
      userTier,
      maxShorts
    });

    // Start video download in background
    const downloadPromise = new Promise((resolve, reject) => {
      const video = ytdl(videoId, {
        quality: 'highest',
        filter: 'videoandaudio'
      });

      const writeStream = createWriteStream(outputPath);

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
            // Fallback: Use Google Speech-to-Text with chunking
            try {
                // Download audio only
                const audioPath = path.join(__dirname, '..', 'temp', `audio-${Date.now()}.mp3`);
                await new Promise((resolve, reject) => {
                    ytdl(videoId, { filter: 'audioonly', quality: 'highestaudio' })
                        .pipe(fs.createWriteStream(audioPath))
                        .on('finish', resolve)
                        .on('error', reject);
                });
                // Split audio into 1-minute chunks using ffmpeg
                const ffmpeg = require('fluent-ffmpeg');
                const audioChunksDir = path.join(__dirname, '..', 'temp', `audio-chunks-${Date.now()}`);
                await fsPromises.mkdir(audioChunksDir, { recursive: true });
                await new Promise((resolve, reject) => {
                    ffmpeg(audioPath)
                        .outputOptions('-f segment', '-segment_time 60', '-c copy')
                        .output(path.join(audioChunksDir, 'chunk-%03d.mp3'))
                        .on('end', resolve)
                        .on('error', reject)
                        .run();
                });
                // Google Speech-to-Text
                const speech = require('@google-cloud/speech');
                const client = new speech.SpeechClient();
                const chunkFiles = await fsPromises.readdir(audioChunksDir);
                let allTranscripts = [];
                for (const chunkFile of chunkFiles) {
                    const chunkPath = path.join(audioChunksDir, chunkFile);
                    const file = await fsPromises.readFile(chunkPath);
                    const audioBytes = file.toString('base64');
                    const audio = { content: audioBytes };
                    const config = {
                        encoding: 'MP3',
                        sampleRateHertz: 44100,
                        languageCode: userProvidedLanguageCode || 'en-US',
                        enableWordTimeOffsets: true
                    };
                    const request = { audio, config };
                    const [response] = await client.recognize(request);
                    if (response.results && response.results.length > 0) {
                        allTranscripts.push(...response.results.map(result => ({
                            text: result.alternatives[0].transcript,
                            start: result.alternatives[0].words && result.alternatives[0].words[0] ? parseFloat(result.alternatives[0].words[0].startTime.seconds || 0) : 0,
                            duration: result.alternatives[0].words && result.alternatives[0].words.length > 1 ?
                                parseFloat(result.alternatives[0].words[result.alternatives[0].words.length - 1].endTime.seconds || 0) - parseFloat(result.alternatives[0].words[0].startTime.seconds || 0)
                                : 0
                        })));
                    }
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

        try {
            const prompt = `Analyze this TED talk transcript and identify 2-4 high-quality segments that would make engaging short-form content. \n\nImportant requirements:\n1. Each segment MUST be 25-30 seconds when spoken\n2. Select the most impactful, emotional, or thought-provoking moments\n3. Each segment should be a complete thought that makes sense on its own\n4. Focus on segments with clear messages, personal stories, or powerful quotes\n5. Avoid segments with audience reactions (laughter, applause) unless they\'re part of a key moment\n6. Use exact timestamps from the transcript\n\nFormat the output as a JSON array of objects, where each object has:\n- text: the segment text\n- startTime: the exact start time in seconds from the transcript\n- duration: the exact duration in seconds from the transcript\n\nExample format:\n[\n  {\n    \"text\": \"First segment text here\",\n    \"startTime\": 30,\n    \"duration\": 25\n  },\n  {\n    \"text\": \"Second segment text here\",\n    \"startTime\": 120,\n    \"duration\": 28\n  }\n]\n\nTranscript (with timestamps):\n\`\`\`\n${JSON.stringify(transcript, null, 2)}\n\`\`\`\n\nJSON array of segments with exact timestamps:`;

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
    Promise.all([downloadPromise, analysisPromise]).then(async ([_, analysisData]) => {
        const job = activeJobs.get(jobId);
        if (!job || !job.segments || job.status === 'error') return; // Don't proceed if there's an error or no segments

        job.status = 'cutting';
        const segments = job.segments;
        const videoPath = job.outputPath;
        const shortFiles = [];

        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            const outputFileName = `short-${i + 1}.mp4`;
            const outputFilePath = path.join(shortsDir, outputFileName);

            try {
                await new Promise((resolve, reject) => {
                    ffmpeg(videoPath)
                        .seekInput(segment.startTime)
                        .duration(segment.duration)
                        .outputOptions([
                          '-vf',
                          // Robust vertical portrait filter
                          "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,format=yuv420p"
                        ])
                        .output(outputFilePath)
                        .on('end', () => resolve())
                        .on('error', (err) => reject(err))
                        .run();
                });
                shortFiles.push(outputFilePath);
            } catch (err) {
                console.error(`Error cutting segment ${i + 1}:`, err);
                job.error = job.error ? `${job.error}, Cutting Error Segment ${i + 1}: ${err.message}` : `Cutting Error Segment ${i + 1}: ${err.message}`;;
                // Continue to try cutting other segments
            }
        }

        job.shorts = shortFiles.map(filePath =>
          `/shorts/${jobId}/${path.basename(filePath)}`
        );
        // Only set status to completed if there were no cutting errors
        if (!job.error || !job.error.includes('Cutting Error')) {
             job.status = 'completed';
        } else if (shortFiles.length > 0) {
            // If some shorts were created despite errors
            job.status = 'completed_with_errors';
        } else {
            job.status = 'error';
        }

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