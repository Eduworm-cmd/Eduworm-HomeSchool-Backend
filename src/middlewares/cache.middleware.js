const { redisHelper, redisClient } = require("../config/redis");
const logger = require("../utils/logger");

const cacheMiddleware = (keyPrefix, ttl = 3600) => {
    return async (req, res, next) => {
        try {
            const userId = req.user?._id;
            const cacheKey = `${keyPrefix}:${userId}:${JSON.stringify(req.params)}:${JSON.stringify(req.query)}`;

            const cachData = await redisHelper.get(cacheKey);

            if (cachData) {
                logger.info(`Cache HIT: ${cacheKey}`);
                return res.status(200).json(cachData);
            }

            logger.info(`Cache MISS: ${cacheKey}`);


            const originalJson = res.json.bind(res);

            res.json = function (data) {
                if (res.statusCode === 200 || res.statusCode === 201) {
                    redisHelper.set(cacheKey, data, ttl).catch(err => {
                        logger.error('Cache set error:', err);
                    });
                }
                return originalJson(data);
            };
            next();
        } catch (error) {
            logger.error('Cache middleware error :', error);
            next();
        }
    }
}

const invalidateCache = async (pattern) => {
    try {
        const keys = await redisClient.keys(pattern);

        if (keys.length > 0) {
            await redisClient.del(...keys);
            logger.info(`Cache invalidated: ${keys.length} keys matching ${pattern}`);
        }
    } catch (error) {
        logger.error("Cache invalidation error : ", error);
    }
}

const clearUserCache = async (userId) => {
    try {
        await invalidateCache(`*:${userId}:*`);
        await redisHelper.del(`user:${userId}`);
        await redisHelper.del(`dashboard:${userId}`);
        await redisHelper.del(`user:${userId}:children`);
        logger.info(`User cache cleared for: ${userId}`);
    } catch (error) {
        logger.error('Clear user cache error : ', error);
    }
}

module.export = {
    cacheMiddleware,
    invalidateCache,
    clearUserCache
}