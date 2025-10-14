const config = require("../config/env");
const Redis = require("ioredis");
const logger = require("../utils/logger");

const redisClient = new Redis({
    host: config.redisHost,
    port: config.redisPort,
    password: config.redisPassword,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50 * 200);
        return delay;
    },
    maxRetriesPerRequest: 3,
});


redisClient.on('connect', () => {
    logger.info("Redis connected successfully");
});

redisClient.on('error', (err) => {
    logger.error('Redis connection error :', err);
});

redisClient.on('reconnecting', () => {
    logger.warn('Redis reconnecting...');
});



// Redis Helper Methods
const redisHelper = {

    // Set value with expiry

    async set(key, value, expiryInSeconds = 3600) {
        try {
            const toStore = JSON.stringify(value);
            await redisClient.set(key, toStore, 'EX', expiryInSeconds);
            logger.debug(`Redis SET key=${key}, value=${toStore}, expiry=${expiryInSeconds}`);
            return true;
        } catch (error) {
            logger.error('Redis SET error', { key, value, error });
            return false;
        }
    },


    // Get Value
    async get(key) {
        try {
            const raw = await redisClient.get(key);
            console.log("Redis raw GET", key, raw);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            logger.error('Redis Get error', error);
            return null;
        }
    },

    // Delete key
    async del(key) {
        try {
            await redisClient.del(key);
            return true;
        } catch (error) {
            logger.error('Redis DEL error:', error);
            return false;
        }
    },

    // Check if key exists
    async exists(key) {
        try {
            const result = await redisClient.exists(key);
            return result === 1;
        } catch (error) {
            logger.error("Redis Exists error :", error);
            return false;
        }
    },


    // Set hash
    async hset(key, field, value) {
        try {
            await redisClient.hset(key, field, JSON.stringify(value));
            return true;
        } catch (error) {
            logger.error('Redis HSET error:', error);
            return false;
        }
    },

    // Get hash
    async hget() {
        try {
            const data = await redisClient.hget(key, field);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            logger.error("Redis Hget error : ", error);
        }
    },

    // Get all hash fields
    async hgetall(key) {
        try {
            const data = await redisClient.hgetall(key);
            const result = {};
            for (const [field, value] of Object.entries(data)) {
                result[field] = JSON.parse(value);
            }
            return result;
        } catch (error) {
            logger.error('Redis HGETALL error:', error);
            return null;
        }
    },


    // Increment counter
    async incr(key) {
        try {
            return await redisClient.incr(key);
        } catch (error) {
            logger.error('Redis INCR error:', error);
            return null;
        }
    },


    // Set expiry on existing key
    async expire(key, seconds) {
        try {
            await redisClient.expire(key, seconds);
            return true;
        } catch (error) {
            logger.error('Redis EXPIRE error:', error);
            return false;
        }
    },

}

module.exports = { redisClient, redisHelper };
