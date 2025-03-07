require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const { CronJob } = require('cron');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  console.log(`Created logs directory at ${logsDir}`);
}

// Configure logging
const logStream = fs.createWriteStream(
  path.join(logsDir, `server-${new Date().toISOString().split('T')[0]}.log`),
  { flags: 'a' }
);

// Redirect console output to log file and console
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

console.log = function() {
  const args = Array.from(arguments);
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] INFO: ${args.join(' ')}
`;
  logStream.write(logMessage);
  originalConsoleLog.apply(console, arguments);
};

console.error = function() {
  const args = Array.from(arguments);
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ERROR: ${args.join(' ')}
`;
  logStream.write(logMessage);
  originalConsoleError.apply(console, arguments);
};

// Import routes
const wordRoutes = require('./routes/words');
const datasetRoutes = require('./routes/datasets');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '..')));

// Connect to MongoDB with retry logic
const connectWithRetry = () => {
  console.log('Attempting to connect to MongoDB...');
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB connected successfully');
    // Initialize scheduled tasks after successful connection
    initializeScheduledTasks();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  });
};

// Handle MongoDB disconnection (auto-reconnect)
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected! Attempting to reconnect...');
  connectWithRetry();
});

// Initial connection
connectWithRetry();

// Initialize scheduled tasks
function initializeScheduledTasks() {
  // Import backup script
  const { performBackup } = require('./scripts/backup');
  
  // Schedule daily backup at 3:00 AM
  const backupJob = new CronJob('0 3 * * *', performBackup, null, true);
  console.log('Scheduled automatic database backup job');
  
  // Schedule weekly database maintenance at 2:00 AM on Sundays
  const maintenanceJob = new CronJob('0 2 * * 0', async () => {
    console.log('Running weekly database maintenance...');
    try {
      // Perform any maintenance tasks here
      // For example, compact collections, validate data integrity, etc.
      console.log('Database maintenance completed successfully');
    } catch (error) {
      console.error('Database maintenance error:', error);
    }
  }, null, true);
  console.log('Scheduled weekly database maintenance job');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    },
    database: {
      status: dbStatus
    }
  });
});

// API Routes
app.use('/api/words', wordRoutes);
app.use('/api/datasets', datasetRoutes);

// Serve the main HTML file for any other request
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  // Keep the process alive but log the error
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled promise rejection:', reason);
  // Keep the process alive but log the error
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`R00TS server running on port ${PORT}`);
  console.log(`Server time: ${new Date().toLocaleString()}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`MongoDB URI: ${process.env.MONGODB_URI.replace(/\/.*@/, '//***:***@')}`);
  console.log('Server is ready to accept connections');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = app; // Export for testing
