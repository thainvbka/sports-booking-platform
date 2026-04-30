import { createClient } from 'redis';
import config from '../configs/dotenv';

export type RedisClient = ReturnType<typeof createClient>;

const globalForRedis = globalThis as unknown as {
  redisClient?: RedisClient;
};

export const initRedis = async () => {
  if (globalForRedis.redisClient) {
    console.warn("Redis client is already initialized");
    return;
  }

  const client = createClient({
    url: config.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 50, 500),
      connectTimeout: 10000,
    },
  });

  client.on('connect', () => {
    console.log(':::::Redis connected successfully!');
  });

  client.on('error', (err) => {
    console.error(':::::Redis connection error:', err);
  });

  client.on('reconnecting', () => {
    console.warn(':::::Redis reconnecting...');
  });

  try {
    await client.connect();
    globalForRedis.redisClient = client;
    console.log(':::::Redis client initialized');
  } catch (error) {
    console.error(":::::Failed to connect to Redis:", error);
    throw error;
  }
};

export const getRedis = (): RedisClient => {
  if (!globalForRedis.redisClient) {
    throw new Error(':::::Redis client instance is not initialized. Make sure to call initRedis() first.');
  }
  return globalForRedis.redisClient;
};

export const closeRedis = async () => {
  if (globalForRedis.redisClient) {
    await globalForRedis.redisClient.quit();
    globalForRedis.redisClient = undefined;
    console.log(':::::Redis connection closed.');
  }
};
