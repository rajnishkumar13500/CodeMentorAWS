const express = require('express');
const { PORT } = require('./config/env');
const corsMiddleware = require('./middleware/cors');
const { requestLogger, errorLogger } = require('./middleware/logger');
const logger = require('./config/logger');
require('dotenv').config();

const app = express();

// Create logs directory if it doesn't exist
const fs = require('fs');
const path = require('path');
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Middleware
app.use(express.json({ limit: '1mb' }));
app.use(corsMiddleware);
app.use(requestLogger);

// Test DynamoDB connection
const { docClient, TABLE_NAME } = require('./config/dynamodb');
console.log(`DynamoDB configured for table: ${TABLE_NAME}`);

// Routes
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const projectRouter = require('./routes/project');

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/project', projectRouter);

// Error handling middleware (must be after routes)
app.use(errorLogger);
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name
    },
    url: req.url,
    method: req.method
  });

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  logger.warn('Route not found', {
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress
  });

  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.url}`
  });
});

// Start the server
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  logger.info(`Server started successfully`, {
    port: PORT,
    host: HOST,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
  console.log(`Server is running on http://${HOST}:${PORT}`);
});

// Export for testing
module.exports = app;