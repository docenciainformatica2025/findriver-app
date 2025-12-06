const cron = require('node-cron');
const logger = require('./logger');

const initCronJobs = () => {
    // Run every day at midnight
    cron.schedule('0 0 * * *', () => {
        logger.info('Running daily maintenance task...');
        // Add maintenance logic here (e.g., cleaning up old temp files)
    });

    // Run every Monday at 9 AM
    cron.schedule('0 9 * * 1', () => {
        logger.info('Generating weekly reports...');
        // Add report generation logic here
    });

    logger.info('Cron jobs initialized');
};

module.exports = initCronJobs;
