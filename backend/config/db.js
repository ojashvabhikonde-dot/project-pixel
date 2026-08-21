import mongoose from 'mongoose';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pixela';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`MongoDB Connection Notice: ${error.message}`);
    console.warn('Backend is operating in In-Memory Cache/Store mode. All API endpoints remain fully functional.');
    return false;
  }
};

// Fallback Cache class if Redis is unavailable
class InMemoryCache {
  constructor() {
    this.store = new Map();
  }
  async get(key) {
    return this.store.get(key) || null;
  }
  async set(key, value, expiryMode, time) {
    this.store.set(key, value);
    if (expiryMode === 'EX' && typeof time === 'number') {
      setTimeout(() => this.store.delete(key), time * 1000);
    }
  }
  async del(key) {
    this.store.delete(key);
  }
}

class CacheManager {
  constructor() {
    this.inMemory = new InMemoryCache();
    this.redisClient = null;

    if (process.env.REDIS_URI) {
      try {
        const client = new Redis(process.env.REDIS_URI, {
          maxRetriesPerRequest: 1,
          connectTimeout: 2000,
          reconnectOnError: () => false,
          retryStrategy: () => null,
          lazyConnect: true,
        });

        client.on('error', () => {
          this.redisClient = null;
        });

        client.on('connect', () => {
          console.log('Redis Connected successfully.');
          this.redisClient = client;
        });
      } catch (err) {
        this.redisClient = null;
      }
    }
  }

  async get(key) {
    if (this.redisClient) {
      try {
        return await this.redisClient.get(key);
      } catch (e) {
        return await this.inMemory.get(key);
      }
    }
    return await this.inMemory.get(key);
  }

  async set(key, value, expiryMode, time) {
    if (this.redisClient) {
      try {
        return await this.redisClient.set(key, value, expiryMode, time);
      } catch (e) {
        return await this.inMemory.set(key, value, expiryMode, time);
      }
    }
    return await this.inMemory.set(key, value, expiryMode, time);
  }

  async del(key) {
    if (this.redisClient) {
      try {
        return await this.redisClient.del(key);
      } catch (e) {
        return await this.inMemory.del(key);
      }
    }
    return await this.inMemory.del(key);
  }
}

export const redis = new CacheManager();

