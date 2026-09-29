import mongoose from 'mongoose';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

let cachedConn = null;
let cachedPromise = null;

export const connectDB = async () => {
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    return true;
  }
  if (cachedConn) {
    return true;
  }

  const isVercel = !!process.env.VERCEL;
  const mongoUri = process.env.MONGODB_URI;

  // On Vercel, if MONGODB_URI is absent or accidentally points to local loopback, bail immediately without waiting
  if (isVercel && (!mongoUri || mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost'))) {
    return false;
  }

  const urisToTry = [
    mongoUri,
    !isVercel ? 'mongodb://127.0.0.1:27017/pixela' : null,
    !isVercel ? 'mongodb://localhost:27017/pixela' : null
  ].filter(Boolean);

  const uniqueUris = Array.from(new Set(urisToTry)).filter(uri => {
    if (isVercel && (uri.includes('127.0.0.1') || uri.includes('localhost'))) {
      return false;
    }
    return true;
  });

  if (uniqueUris.length === 0) {
    return false;
  }

  if (cachedPromise) {
    try {
      await cachedPromise;
      return mongoose.connection.readyState === 1;
    } catch {
      cachedPromise = null;
    }
  }

  for (const uri of uniqueUris) {
    try {
      cachedPromise = mongoose.connect(uri, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000,
        socketTimeoutMS: 5000,
        bufferCommands: false, // Prevents hanging queries when connection drops or times out
      });
      const conn = await cachedPromise;
      cachedConn = conn;
      console.log(`MongoDB Connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
      return true;
    } catch (error) {
      cachedPromise = null;
      cachedConn = null;
      // Continue to next fallback
    }
  }

  console.warn('MongoDB Connection Notice: Operating in In-Memory Cache/Store mode. All API endpoints remain fully functional.');
  return false;
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

