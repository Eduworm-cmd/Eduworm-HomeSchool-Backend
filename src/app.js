const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const logger = require('./utils/logger');
const ApiError = require('./utils/ApiError');
const { errorMiddleware } = require('./middlewares/error.middleware');
const config = require('./config/env');
const { redisClient } = require('./config/redis');
const teacherRoutes = require('./routes/teacher.routes');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: config.clientUrl || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

// Logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Student Admin API Server',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      teacher: '/teacher/all'
    }
  });
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await redisClient.ping();
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      services: {
        server: 'running',
        redis: 'connected',
        database: 'connected'
      }
    });
  } catch (err) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      services: { server: 'running', redis: 'disconnected', database: 'unknown' }
    });
  }
});

// Teacher route test logging + mount
app.use('/teacher', (req, res, next) => {
  console.log(` /teacher route hit: ${req.method} ${req.originalUrl}`);
  next();
}, teacherRoutes);

// API v1
app.use('/api/v1', require('./routes'));

// 404 handler
app.use((req, res, next) => {
  next(new ApiError(404, `Can't find ${req.originalUrl} on this server This End Point not Exists !`));
});

// Error middleware
app.use(errorMiddleware);

module.exports = app;
