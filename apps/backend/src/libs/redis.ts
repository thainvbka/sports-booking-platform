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
    try {
      if (globalForRedis.redisClient.isOpen) {
        await globalForRedis.redisClient.quit();
      }
    } catch (error) {
      console.warn(":::::Redis quit warning:", error);
    } finally {
      globalForRedis.redisClient = undefined;
      console.log(':::::Redis connection closed.');
    }
  }
};

export const acquireLock = async (key: string, value: string, ttlSeconds: number): Promise<boolean> => {
  try {
    const client = getRedis();
    const result = await client.set(key, value, {
      EX: ttlSeconds,
      NX: true,
    });
    return result === 'OK';
  } catch (err) {
    console.error(`:::::Failed to acquire lock for key ${key}:`, err);
    // On Redis error, fail open to database layer pessimistic lock
    return true; 
  }
};

export const acquireLockWithRetry = async (
  key: string,
  value: string,
  ttlSeconds: number,
  retries = 3,
  delayMs = 100
): Promise<boolean> => {
  let attempt = 0;
  while (attempt <= retries) {
    const acquired = await acquireLock(key, value, ttlSeconds);
    if (acquired) {
      return true;
    }
    attempt++;
    if (attempt <= retries) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return false;
};


export const releaseLock = async (key: string, value: string): Promise<void> => {
  try {
    const client = getRedis();
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    await client.eval(script, {
      keys: [key],
      arguments: [value],
    });
  } catch (err) {
    console.error(`:::::Failed to release lock for key ${key}:`, err);
  }
};
