/**
 * Local storage based translation cache utility
 * Provides persistent caching for translations to reduce API calls
 */

// Cache structure
interface CacheEntry {
  value: string;
  timestamp: number;
}

interface CacheStore {
  [key: string]: CacheEntry;
}

// Default expiry time (24 hours)
const DEFAULT_EXPIRY_MS = 24 * 60 * 60 * 1000;

/**
 * Translation cache manager
 */
export class LocalStorageCache {
  private cacheKey: string;
  private expiryMs: number;
  private memoryCache: CacheStore = {};
  private initialized = false;

  /**
   * Create a new cache instance
   * @param cacheKey The localStorage key to use for this cache
   * @param expiryMs Time in milliseconds before entries expire
   */
  constructor(cacheKey: string, expiryMs: number = DEFAULT_EXPIRY_MS) {
    this.cacheKey = cacheKey;
    this.expiryMs = expiryMs;
  }

  /**
   * Initialize the cache from localStorage
   */
  init(): void {
    if (typeof window === 'undefined' || this.initialized) return;
    
    try {
      const storedCache = localStorage.getItem(this.cacheKey);
      if (storedCache) {
        this.memoryCache = JSON.parse(storedCache);
        
        // Clean expired entries on load
        this.cleanExpired();
      }
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize cache from localStorage:', error);
      // Reset cache if corrupted
      this.memoryCache = {};
    }
  }

  /**
   * Save the cache to localStorage
   */
  private save(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.cacheKey, JSON.stringify(this.memoryCache));
    } catch (error) {
      console.error('Failed to save cache to localStorage:', error);
      
      // If storage is full, clear old entries
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.prune(50); // Remove 50% of entries
        try {
          localStorage.setItem(this.cacheKey, JSON.stringify(this.memoryCache));
        } catch (e) {
          console.error('Still failed to save cache after pruning:', e);
        }
      }
    }
  }

  /**
   * Get a value from the cache
   * @param key Cache key
   * @returns The cached value or null if not found or expired
   */
  get(key: string): string | null {
    this.init();
    
    const entry = this.memoryCache[key];
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() - entry.timestamp > this.expiryMs) {
      delete this.memoryCache[key];
      this.save();
      return null;
    }
    
    return entry.value;
  }

  /**
   * Set a value in the cache
   * @param key Cache key
   * @param value Value to cache
   */
  set(key: string, value: string): void {
    this.init();
    
    this.memoryCache[key] = {
      value,
      timestamp: Date.now()
    };
    
    this.save();
  }

  /**
   * Remove expired entries from the cache
   */
  cleanExpired(): void {
    const now = Date.now();
    let changed = false;
    
    Object.keys(this.memoryCache).forEach(key => {
      if (now - this.memoryCache[key].timestamp > this.expiryMs) {
        delete this.memoryCache[key];
        changed = true;
      }
    });
    
    if (changed) {
      this.save();
    }
  }

  /**
   * Prune the cache to reduce size
   * @param percentToRemove Percentage of entries to remove (0-100)
   */
  prune(percentToRemove: number = 25): void {
    const keys = Object.keys(this.memoryCache);
    if (keys.length === 0) return;
    
    // Sort by age (oldest first)
    const sortedKeys = keys.sort((a, b) => 
      this.memoryCache[a].timestamp - this.memoryCache[b].timestamp
    );
    
    // Calculate how many to remove
    const removeCount = Math.ceil(sortedKeys.length * (percentToRemove / 100));
    
    // Remove oldest entries
    sortedKeys.slice(0, removeCount).forEach(key => {
      delete this.memoryCache[key];
    });
    
    this.save();
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.memoryCache = {};
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.cacheKey);
    }
  }
}

// Create and export a default translation cache instance
export const translationCache = new LocalStorageCache('jdm-translation-cache');

export default translationCache;
