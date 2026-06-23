import * as redis from 'redis';
import { ChapterCommentary } from '../../lib';

/**
 * CacheService
 * 
 * Manages caching via Azure Cache for Redis
 * - For MVP: Uses in-memory cache (fast)
 * - For production: Connects to Azure Redis instance
 * 
 * Cache Strategy:
 * - Popular chapters (Galatians, Romans, John): 5 min TTL
 * - Less frequent: 1 hour TTL
 * - User-specific data: 30 min TTL
 */
export class CacheService {
  private redisClient: redis.RedisClientType | null = null;
  private inMemoryCache: Map<string, { data: any; expiresAt: number }> = new Map();
  private useRedis = process.env.USE_REDIS === 'true';
  private redisUrl = process.env.REDIS_URL || '';

  constructor() {
    if (this.useRedis && this.redisUrl) {
      this.initializeRedis();
    } else {
      console.log('Using in-memory cache for MVP');
    }
  }

  /**
   * Initialize Redis client
   */
  private async initializeRedis() {
    try {
      this.redisClient = redis.createClient({
        url: this.redisUrl,
      });

      this.redisClient.on('error', (error) => {
        console.error('Redis client error:', error);
      });

      await this.redisClient.connect();
      console.log('Connected to Azure Cache for Redis');
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      this.redisClient = null;
    }
  }

  /**
   * Get value from cache
   */
  async get(key: string): Promise<ChapterCommentary | null> {
    try {
      if (this.redisClient) {
        return await this.getFromRedis(key);
      } else {
        return this.getFromMemory(key);
      }
    } catch (error) {
      console.error(`Error retrieving cache key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache with optional TTL (seconds)
   */
  async set(key: string, value: ChapterCommentary, ttlSeconds: number = 300): Promise<void> {
    try {
      if (this.redisClient) {
        await this.setInRedis(key, value, ttlSeconds);
      } else {
        this.setInMemory(key, value, ttlSeconds);
      }
    } catch (error) {
      console.error(`Error setting cache key ${key}:`, error);
      // Fail silently - don't block API on cache failure
    }
  }

  /**
   * Clear cache entry
   */
  async delete(key: string): Promise<void> {
    try {
      if (this.redisClient) {
        await this.redisClient.del(key);
      } else {
        this.inMemoryCache.delete(key);
      }
    } catch (error) {
      console.error(`Error deleting cache key ${key}:`, error);
    }
  }

  /**
   * Get from Redis
   */
  private async getFromRedis(key: string): Promise<ChapterCommentary | null> {
    const value = await this.redisClient!.get(key);
    return value ? JSON.parse(value) : null;
  }

  /**
   * Set in Redis
   */
  private async setInRedis(
    key: string,
    value: ChapterCommentary,
    ttlSeconds: number
  ): Promise<void> {
    await this.redisClient!.setEx(key, ttlSeconds, JSON.stringify(value));
  }

  /**
   * Get from in-memory cache (MVP)
   */
  private getFromMemory(key: string): ChapterCommentary | null {
    const entry = this.inMemoryCache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (entry.expiresAt < Date.now()) {
      this.inMemoryCache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set in in-memory cache (MVP)
   */
  private setInMemory(
    key: string,
    value: ChapterCommentary,
    ttlSeconds: number
  ): void {
    this.inMemoryCache.set(key, {
      data: value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });

    // Cleanup: Remove oldest entries if cache grows too large
    if (this.inMemoryCache.size > 100) {
      const entries = Array.from(this.inMemoryCache.entries());
      entries.sort((a, b) => a[1].expiresAt - b[1].expiresAt);
      const toDelete = entries.slice(0, 10); // Remove 10 oldest
      toDelete.forEach(([key]) => this.inMemoryCache.delete(key));
    }
  }

  /**
   * Graceful shutdown
   */
  async close(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.disconnect();
      console.log('Disconnected from Redis');
    }
  }

  /**
   * Get cache statistics (for monitoring)
   */
  getStats() {
    return {
      backend: this.redisClient ? 'redis' : 'memory',
      cacheSize: this.inMemoryCache.size,
      memoryUsage: process.memoryUsage(),
    };
  }
}
