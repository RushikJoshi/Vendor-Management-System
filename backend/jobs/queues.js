const Queue = require("bull");
const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = require("../config/env");
const logger = require("../utils/logger");

const defaultJobOptions = {
    attempts: 3,
    backoff: {
        type: "exponential",
        delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
};

const redisOpts = {
    redis: {
        host: REDIS_HOST,
        port: REDIS_PORT,
        password: REDIS_PASSWORD,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
    },
};

const schedulerQueue = new Queue("scheduler-tasks", redisOpts);
const emailQueue = new Queue("email-notifications", redisOpts);

// Suppress unhandled error logs to prevent console spam
const handleQueueError = (queue, name) => {
    queue.on("error", (error) => {
        if (!queue._errorLogged) {
            logger.warn(`Background Job system (${name}) is offline (No local Redis detected).`);
            queue._errorLogged = true;
        }
    });
};

handleQueueError(schedulerQueue, "Scheduler");
handleQueueError(emailQueue, "Email");

module.exports = {
    schedulerQueue,
    emailQueue,
    defaultJobOptions,
};
