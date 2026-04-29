import Redis from 'ioredis';

let redis: Redis | null = null;

const redisUrl = process.env.REDIS_URL;

if (redisUrl) {
  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        // Stop retrying after 3 attempts to allow quick fallback to SQLite
        if (times > 3) {
          console.warn('Redis retry limit reached. Disabling Redis.');
          return null; 
        }
        return Math.min(times * 50, 2000);
      }
    });

    redis.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redis.on('connect', () => {
      console.log('Connected to Redis successfully.');
    });

  } catch (error) {
    console.error('Failed to initialize Redis client:', error);
    redis = null;
  }
} else {
  console.warn('REDIS_URL not set in environment. Caching is disabled.');
}

export default redis;
