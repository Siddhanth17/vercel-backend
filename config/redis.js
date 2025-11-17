const redis = require('redis');

let redisClient = null;

const connectRedis = async () => {
  try {
    if (process.env.REDIS_URL) {
      redisClient = redis.createClient({
        url: process.env.REDIS_URL
      });

      redisClient.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });

      redisClient.on('connect', () => {
        console.log('🔴 Redis Connected');
      });

      redisClient.on('disconnect', () => {
        console.log('Redis Disconnected');
      });

      await redisClient.connect();
    } else {
      console.log('⚠️  Redis URL not provided, running without Redis cache');
    }
  } catch (error) {
    console.error('Redis connection failed:', error.message);
    console.log('⚠️  Continuing without Redis cache');
  }
};

const getRedisClient = () => {
  return redisClient;
};

const setCache = async (key, value, expireInSeconds = 3600) => {
  if (!redisClient) return false;
  
  try {
    await redisClient.setEx(key, expireInSeconds, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Redis set error:', error);
    return false;
  }
};

const getCache = async (key) => {
  if (!redisClient) return null;
  
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
};

const deleteCache = async (key) => {
  if (!redisClient) return false;
  
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Redis delete error:', error);
    return false;
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  setCache,
  getCache,
  deleteCache
};