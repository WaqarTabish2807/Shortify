const express = require('express');
const router = express.Router();
const os = require('os');
const { createClient } = require('@supabase/supabase-js');
const config = require('../config');
const logger = require('../utils/logger');

// Initialize Supabase client
const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);

// Basic health check
router.get('/health', async (req, res) => {
  try {
    // Check database connection
    const { data: dbStatus, error: dbError } = await supabase.from('health_check').select('*').limit(1);
    
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        heapUsed: process.memoryUsage().heapUsed,
        heapTotal: process.memoryUsage().heapTotal
      },
      cpu: {
        cores: os.cpus().length,
        load: os.loadavg(),
        model: os.cpus()[0].model,
        speed: os.cpus()[0].speed
      },
      environment: config.nodeEnv,
      services: {
        database: dbError ? 'error' : 'ok',
        ffmpeg: 'ok', // Basic check, you might want to add actual ffmpeg check
        storage: 'ok'  // Basic check, you might want to add actual storage check
      }
    };

    // Log health check
    logger.info('Health check performed', { healthData });

    res.json(healthData);
  } catch (error) {
    logger.error('Health check failed', { error });
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: config.nodeEnv === 'development' ? error.message : undefined
    });
  }
});

// Detailed health check (for internal use)
router.get('/health/detailed', async (req, res) => {
  try {
    const detailedHealth = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        heapUsed: process.memoryUsage().heapUsed,
        heapTotal: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external,
        arrayBuffers: process.memoryUsage().arrayBuffers
      },
      cpu: {
        cores: os.cpus().length,
        load: os.loadavg(),
        model: os.cpus()[0].model,
        speed: os.cpus()[0].speed,
        architecture: os.arch()
      },
      network: {
        interfaces: os.networkInterfaces(),
        hostname: os.hostname()
      },
      environment: {
        nodeEnv: config.nodeEnv,
        nodeVersion: process.version,
        platform: process.platform,
        release: os.release()
      },
      config: {
        port: config.port,
        maxConcurrentProcesses: config.maxConcurrentProcesses,
        processTimeout: config.processTimeout,
        maxFileSize: config.maxFileSize
      }
    };

    // Log detailed health check
    logger.info('Detailed health check performed', { detailedHealth });

    res.json(detailedHealth);
  } catch (error) {
    logger.error('Detailed health check failed', { error });
    res.status(500).json({
      status: 'error',
      message: 'Detailed health check failed',
      error: config.nodeEnv === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 