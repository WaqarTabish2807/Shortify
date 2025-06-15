require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const healthRoutes = require('./routes/health');
const audioRoutes = require('./routes/audio');
const transcribeRoutes = require('./routes/transcribe');
const analyzeRoutes = require('./routes/analyze');
const paymentRoutes = require('./routes/payment');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: '*', // Allow all origins during development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Root route handler
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Welcome to Shortify API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      audio: '/api/audio',
      transcribe: '/api/transcribe',
      analyze: '/api/analyze',
      payment: '/api/payment',
      shorts: '/shorts'
    }
  });
});

// Use routes
app.use('/api', healthRoutes);
app.use('/api', audioRoutes);
app.use('/api', transcribeRoutes);
app.use('/api', analyzeRoutes);
app.use('/api/payment', paymentRoutes);

// Serve the temp directory statically at /shorts
app.use('/shorts', express.static(path.join(__dirname, 'temp')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 