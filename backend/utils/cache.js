const redisClient = require('../config/redis');

const getCache = async (key) => {
    try {
        return await redisClient.get(key);
    } catch (error) {
        console.error('Redis get error:', error);
        return null;
    }
};

const setCache = async (key, value, expirationInSeconds = 3600) => {
    try {
        await redisClient.set(key, value, { ex: expirationInSeconds });
        return true;
    } catch (error) {
        console.error('Redis set error:', error);
        return false;
    }
};

const invalidateCache = async (pattern) => {
    try {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(...keys);
        }
        return true;
    } catch (error) {
        console.error('Redis invalidate error:', error);
        return false;
    }
};

module.exports = {
    getCache,
    setCache,
    invalidateCache
};