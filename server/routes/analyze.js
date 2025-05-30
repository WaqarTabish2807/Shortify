const express = require('express');
const router = express.Router();
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { createWriteStream } = require('fs');
const ytdl = require('ytdl-core');
const TranscriptAPI = require('youtube-transcript-api');
const ffmpegPath = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');

// Tell fluent-ffmpeg where it can find FFmpeg
ffmpeg.setFfmpegPath(ffmpegPath);

// Add detect-language endpoint
router.post('/detect-language', async (req, res) => {
  try {
    const { videoId } = req.body;
    if (!videoId) {
      return res.status(400).json({ error: 'Missing videoId' });
    }

    let text = '';
    
    try {
      // Try YouTube transcript first
      const transcript = await TranscriptAPI.getTranscript(videoId);
      if (transcript && transcript.length > 0) {
        text = transcript.slice(0, 10).map(item => item.text).join(' ');
      } else {
        throw new Error('No transcript found');
      }
    } catch (err) {
      console.warn('YouTube transcript not found, falling back to audio extraction:', err.message);
      
      // Fallback: Download audio and use speech-to-text
      const audioPath = path.join(__dirname, '..', 'temp', `audio-${Date.now()}.mp3`);
      
      // Download audio
      await new Promise((resolve, reject) => {
        ytdl(videoId, { filter: 'audioonly', quality: 'highestaudio' })
          .pipe(createWriteStream(audioPath))
          .on('finish', resolve)
          .on('error', reject);
      });

      // Extract first 30 seconds for language detection
      const shortAudioPath = path.join(__dirname, '..', 'temp', `short-audio-${Date.now()}.mp3`);
      await new Promise((resolve, reject) => {
        ffmpeg(audioPath)
          .setStartTime(0)
          .setDuration(30)
          .output(shortAudioPath)
          .on('end', resolve)
          .on('error', reject)
          .run();
      });

      // Use Google Speech-to-Text for language detection
      const speech = require('@google-cloud/speech');
      const client = new speech.SpeechClient();

      const audioBytes = fs.readFileSync(shortAudioPath).toString('base64');
      const audio = {
        content: audioBytes,
      };
      const config = {
        encoding: 'MP3',
        sampleRateHertz: 16000,
        languageCode: 'en-US', // We'll detect the actual language from the response
        enableAutomaticPunctuation: true,
      };
      const request = {
        audio: audio,
        config: config,
      };

      const [response] = await client.recognize(request);
      text = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');

      // Clean up temporary files
      fs.unlinkSync(audioPath);
      fs.unlinkSync(shortAudioPath);
    }

    // Dynamically import franc-min
    const { franc } = await import('franc-min');
    
    // Detect language using franc-min
    const langCode = franc(text);
    console.log('Detected language code:', langCode);

    // Map ISO 639-3 to language codes
    const isoMap = {
      'eng': 'en-US',
      'hin': 'hi-IN',
      'spa': 'es-ES',
      'fra': 'fr-FR',
      'deu': 'de-DE',
      'ita': 'it-IT',
      'rus': 'ru-RU',
      'jpn': 'ja-JP',
      'kor': 'ko-KR',
      'zho': 'zh',
      'ara': 'ar-XA',
      'por': 'pt-BR',
      'ben': 'bn-IN',
      'pan': 'pa-IN',
      'mar': 'mr-IN',
      'tam': 'ta-IN',
      'tel': 'te-IN',
      'guj': 'gu-IN',
      'urd': 'ur-IN'
    };

    const detectedLang = isoMap[langCode] || 'en-US';
    console.log('Mapped language code:', detectedLang);

    res.json({ languageCode: detectedLang });
  } catch (error) {
    console.error('Language detection error:', error);
    res.status(500).json({ 
      error: 'Failed to detect language',
      details: error.message 
    });
  }
});

module.exports = router; 