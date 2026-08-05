import mongoose from 'mongoose';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pixela';
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
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

let redisClient;
try {
  const redisUrl = process.env.REDIS_URI || 'redis://127.0.0.1:6379';
  const client = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
    reconnectOnError: () => false,
    retryStrategy: () => null, // Stop retrying connection on error
  });
  redisClient = client;

  client.on('error', (err) => {
    console.warn('Redis is unavailable, falling back to local memory cache.');
    try {
      client.disconnect();
    } catch (e) {}
    redisClient = new InMemoryCache();
  });
  
  client.on('connect', () => {
    console.log('Redis Connected successfully.');
  });
} catch (error) {
  console.warn('Redis init error, using local memory cache.');
  redisClient = new InMemoryCache();
}

export const redis = redisClient;
