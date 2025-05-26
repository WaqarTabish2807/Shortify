const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const { SpeechClient } = require('@google-cloud/speech');
const { Storage } = require('@google-cloud/storage');
const TranscriptAPI = require('youtube-transcript-api');

// Initialize Speech-to-Text client
const speechClient = new SpeechClient();

// Initialize Cloud Storage client and define bucket
const storage = new Storage();
const bucketName = 'shortify0-audio-uploads';

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

module.exports = router; 