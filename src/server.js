const app = require('./app');
const connectDB = require('./config/database');
const config = require('./config/env');

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(config.port, () => {
      console.log(`🚀 Server running in ${config.nodeEnv} mode on port ${config.port}`);
      console.log(`📍 URL: http://localhost:${config.port}`);
    });

    // Handle graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n${signal} received, shutting down gracefully...`);
      
      server.close(async () => {
        console.log('🛑 HTTP server closed');
        
        try {
          const { closeDB } = require('./config/database');
          await closeDB();
        } catch (error) {
          console.error('Error closing database:', error.message);
        }
        
        console.log('✅ Process terminated');
        process.exit(0);
      });

      // Force exit after 10 seconds
      setTimeout(() => {
        console.error('❌ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
