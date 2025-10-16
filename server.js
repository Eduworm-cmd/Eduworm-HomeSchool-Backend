const config = require('./src/config/env');
const app = require('./src/app');
const connectDB = require('./src/config/database');
const logger = require('./src/utils/logger');



connectDB();





const PORT = config.port || 5000;
const HOST = config.host;


const server = app.listen(PORT, HOST, () => {
    logger.info(`Server running on https://${HOST}:${PORT} in ${config.nodeEnv} mode`);
});


process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
    logger.error(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
})

process.on('SIGTERM', () => {
    logger.info("SIGTERM RECEIVED. Shutting down gracefully");
    server.close(() => {
        logger.info("Process terminated ");
    });
});