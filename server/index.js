require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');

// Import routes
const healthRoutes = require('./routes/health');
const audioRoutes = require('./routes/audio');
const transcribeRoutes = require('./routes/transcribe');
const analyzeRoutes = require('./routes/analyze');
const paymentRoutes = require('./routes/payment');

const app = express();
const PORT = config.port;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" }
}));

// CORS configuration
const allowedOrigins = [
  'https://shortify-ix35.vercel.app',
  'https://shortify-eight-zeta.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173'
];

// CORS middleware
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: config.maxFileSize }));
app.use(express.urlencoded({ extended: true, limit: config.maxFileSize }));

// Root route handler
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Welcome to Shortify API',
    version: '1.0.0',
    environment: config.nodeEnv,
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
  console.error('Error:', err);
  
  // Log error details in development
  if (config.nodeEnv === 'development') {
    console.error('Stack:', err.stack);
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Validation Error',
      details: err.message
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    status: 'error',
    message: config.nodeEnv === 'development' ? err.message : 'Something went wrong!'
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  // Close database connections, etc.
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  // Close database connections, etc.
  process.exit(0);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
}); 