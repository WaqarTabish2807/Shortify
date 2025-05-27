require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const healthRoutes = require('./routes/health');
const audioRoutes = require('./routes/audio');
const transcribeRoutes = require('./routes/transcribe');
const analyzeRoutes = require('./routes/analyze');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Use routes
app.use('/api', healthRoutes);
app.use('/api', audioRoutes);
app.use('/api', transcribeRoutes);
app.use('/api', analyzeRoutes);

// Serve the temp directory statically at /shorts
app.use('/shorts', express.static(path.join(__dirname, 'temp')));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 