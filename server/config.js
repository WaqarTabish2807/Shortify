require('dotenv').config();

const config = {
  // Server Configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Google Cloud Configuration
  googleCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  geminiApiKey: process.env.GEMINI_API_KEY,
  
  // Supabase Configuration
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
  
  // Security
  corsOrigin: process.env.CORS_ORIGIN || '*',
  
  // Video Processing
  maxConcurrentProcesses: parseInt(process.env.MAX_CONCURRENT_PROCESSES || '5', 10),
  processTimeout: parseInt(process.env.PROCESS_TIMEOUT || '300000', 10),
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600', 10), // 100MB
  
  // Storage
  gcsBucketName: process.env.GCS_BUCKET_NAME || 'shortify0-audio-uploads',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Validate required environment variables
  validate: function() {
    const required = [
      'supabaseUrl',
      'supabaseServiceKey',
      'googleCredentials',
      'geminiApiKey'
    ];
    
    const missing = required.filter(key => !this[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
};

// Validate configuration on startup
if (config.nodeEnv === 'production') {
  config.validate();
}

module.exports = config; 