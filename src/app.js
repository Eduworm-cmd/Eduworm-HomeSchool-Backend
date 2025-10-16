const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const routes = require('./routes');
const { errorMiddleware } = require('./middlewares/error.middleware');
const ApiError = require('./utils/ApiError');
const logger = require('./utils/logger');
const morgan = require('morgan');
const config = require('./config/env');
const { redisClient } = require('./config/redis');
const cookieParser = require('cookie-parser');
const teacherRought = require('./routes/teacher.routes');

const app = express();

// Security middleware
app.use(helmet());
// CORS
app.use(cors({
  origin: config.clientUrl || '*',
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(cookieParser());
// Compress Data
app.use(compression());

// Logs Details
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));


app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Student Admin API Server',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      api: '/api/v1'
    }
  });
});

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
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      services: {
        server: 'running',
        redis: 'disconnected',
        database: 'unknown'
      }
    });
  }
});
app.use('/teacher', teacherRought);
// API routes
app.use('/api/v1', routes)

app.use((req, res, next) => {
  next(new ApiError(404, `Can't find ${req.originalUrl} on this server This End Point not Exists !`));
});


app.use(errorMiddleware);

module.exports = app;