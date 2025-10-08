const { Redis } = require('@upstash/redis');

const redisClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Test connection
(async () => {
    try {
        await redisClient.ping();
        console.log('✅ Upstash Redis Connected');
    } catch (err) {
        console.error('❌ Upstash Redis connection failed:', err);
    }
})();

module.exports = redisClient;