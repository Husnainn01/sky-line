/**
 * Translation Scheduler
 * 
 * A centralized scheduler for managing translation requests across the application.
 * This helps prevent rate limiting by controlling the flow of requests to the API.
 */

import { translationCache } from './localStorageCache';

// Types
export interface TranslationRequest {
  id: string;
  text: string;
  targetLang: string;
  priority: number; // Lower number = higher priority
  resolve: (result: string) => void;
  reject: (error: Error) => void;
  retries: number;
  timestamp: number;
}

// Configuration
const MAX_CONCURRENT_REQUESTS = 2; // Maximum number of concurrent requests
const REQUEST_INTERVAL_MS = 500; // Minimum time between requests
const MAX_RETRIES = 3; // Maximum number of retries per request
const BACKOFF_INITIAL_MS = 1000; // Initial backoff time
const BACKOFF_MAX_MS = 30000; // Maximum backoff time
const RATE_LIMIT_COOLDOWN_MS = 10000; // Cooldown after rate limit is hit

// Track the last language change time to prioritize new language requests
let lastLanguageChangeTime = 0;
let currentLanguage = 'en';

// State
let requestQueue: TranslationRequest[] = [];
let activeRequests = 0;
let lastRequestTime = 0;
let isProcessing = false;
let rateLimitHit = false;
let rateLimitResetTime = 0;
let backoffTime = BACKOFF_INITIAL_MS;
let schedulerTimer: NodeJS.Timeout | null = null;

/**
 * Schedule a translation request
 * @param text Text to translate
 * @param targetLang Target language code
 * @param priority Priority of the request (lower = higher priority)
 * @returns Promise that resolves with the translated text
 */
export function scheduleTranslation(
  text: string,
  targetLang: string,
  priority: number = 50
): Promise<string> {
  // Skip empty text or English target language
  if (!text || targetLang === 'en') {
    return Promise.resolve(text);
  }
  
  // Check if language has changed and update tracking
  if (targetLang !== currentLanguage) {
    currentLanguage = targetLang;
    lastLanguageChangeTime = Date.now();
    
    // Clear the queue when language changes to prioritize new requests
    // But resolve all pending requests with their original text
    clearQueue();
  }
  
  // Boost priority for requests made shortly after a language change
  const timeSinceLanguageChange = Date.now() - lastLanguageChangeTime;
  if (timeSinceLanguageChange < 5000) { // 5 seconds
    // The more recent the language change, the higher the priority boost
    const boost = Math.max(0, 40 - Math.floor(timeSinceLanguageChange / 125));
    priority = Math.max(1, priority - boost); // Ensure priority doesn't go below 1
  }

  // Check memory cache first (handled by the caller)
  
  // Check persistent cache
  const cacheKey = `${text}:${targetLang}`;
  const cachedTranslation = translationCache.get(cacheKey);
  if (cachedTranslation) {
    return Promise.resolve(cachedTranslation);
  }

  // Create a new request
  return new Promise<string>((resolve, reject) => {
    const request: TranslationRequest = {
      id: Math.random().toString(36).substring(2, 15),
      text,
      targetLang,
      priority,
      resolve,
      reject,
      retries: 0,
      timestamp: Date.now(),
    };

    // Add to queue
    requestQueue.push(request);
    
    // Sort queue by priority
    requestQueue.sort((a, b) => a.priority - b.priority);
    
    // Start processing if not already
    if (!isProcessing) {
      processQueue();
    }
  });
}

/**
 * Process the request queue
 */
function processQueue(): void {
  if (isProcessing) return;
  
  // Clear any existing timer
  if (schedulerTimer) {
    clearTimeout(schedulerTimer);
    schedulerTimer = null;
  }
  
  // Check if we're in a rate limit cooldown
  const now = Date.now();
  if (rateLimitHit && now < rateLimitResetTime) {
    const waitTime = rateLimitResetTime - now;
    console.log(`Translation scheduler: Rate limit cooldown, waiting ${waitTime}ms`);
    schedulerTimer = setTimeout(processQueue, waitTime);
    return;
  }
  
  // Reset rate limit flag if cooldown is over
  if (rateLimitHit && now >= rateLimitResetTime) {
    rateLimitHit = false;
  }
  
  // Check if we have requests to process
  if (requestQueue.length === 0) {
    isProcessing = false;
    return;
  }
  
  // Check if we can send a request now
  if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
    // Too many active requests, wait and try again
    schedulerTimer = setTimeout(processQueue, 100);
    return;
  }
  
  // Check if we need to wait between requests
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < REQUEST_INTERVAL_MS) {
    // Need to wait longer between requests
    const waitTime = REQUEST_INTERVAL_MS - timeSinceLastRequest;
    schedulerTimer = setTimeout(processQueue, waitTime);
    return;
  }
  
  // We can process a request now
  isProcessing = true;
  
  // Get the next request
  const request = requestQueue.shift();
  if (!request) {
    isProcessing = false;
    return;
  }
  
  // Mark as active
  activeRequests++;
  lastRequestTime = now;
  
  // Process the request
  processRequest(request)
    .finally(() => {
      // Mark as complete
      activeRequests--;
      
      // Continue processing queue
      isProcessing = false;
      
      // Schedule next processing after a delay
      const nextDelay = rateLimitHit ? backoffTime : REQUEST_INTERVAL_MS;
      schedulerTimer = setTimeout(processQueue, nextDelay);
    });
}

/**
 * Process a single translation request
 * @param request The request to process
 */
async function processRequest(request: TranslationRequest): Promise<void> {
  try {
    // Make the API call
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: request.text,
        targetLang: request.targetLang,
      }),
    });
    
    const data = await response.json();
    
    // Check for rate limiting
    if (data.rateLimited) {
      console.log(`Translation scheduler: Rate limit hit for request ${request.id}`);
      
      // Update rate limit state
      rateLimitHit = true;
      rateLimitResetTime = Date.now() + (data.retryAfter || RATE_LIMIT_COOLDOWN_MS);
      backoffTime = Math.min(backoffTime * 2, BACKOFF_MAX_MS);
      
      // Check if we should retry
      if (request.retries < MAX_RETRIES) {
        // Re-queue with higher priority and retry count
        requestQueue.unshift({
          ...request,
          retries: request.retries + 1,
          priority: request.priority - 10, // Increase priority
          timestamp: Date.now(),
        });
        
        // Don't resolve/reject yet, it will be retried
        return;
      }
      
      // Max retries reached, return original text
      console.warn(`Translation scheduler: Max retries reached for request ${request.id}`);
      request.resolve(request.text);
      return;
    }
    
    // Successful translation
    const translatedText = data.translatedText || request.text;
    
    // Cache the result
    if (translatedText !== request.text) {
      const cacheKey = `${request.text}:${request.targetLang}`;
      translationCache.set(cacheKey, translatedText);
    }
    
    // Reset backoff on success
    if (!rateLimitHit && backoffTime > BACKOFF_INITIAL_MS) {
      backoffTime = Math.max(backoffTime / 2, BACKOFF_INITIAL_MS);
    }
    
    // Resolve the promise
    request.resolve(translatedText);
  } catch (error) {
    console.error(`Translation scheduler: Error processing request ${request.id}:`, error);
    
    // Check if we should retry
    if (request.retries < MAX_RETRIES) {
      // Re-queue with higher priority and retry count
      requestQueue.unshift({
        ...request,
        retries: request.retries + 1,
        priority: request.priority - 5, // Increase priority
        timestamp: Date.now(),
      });
    } else {
      // Max retries reached, reject
      request.reject(error instanceof Error ? error : new Error('Translation failed'));
    }
  }
}

/**
 * Get the current queue status
 * @returns Information about the current queue state
 */
export function getQueueStatus() {
  return {
    queueLength: requestQueue.length,
    activeRequests,
    rateLimitHit,
    rateLimitResetTime,
    backoffTime,
  };
}

/**
 * Clear the translation queue
 * This can be used when changing languages to avoid unnecessary translations
 */
export function clearQueue() {
  // Resolve all pending requests with their original text
  requestQueue.forEach(request => {
    request.resolve(request.text);
  });
  
  // Clear the queue
  requestQueue = [];
  
  // Reset rate limiting state
  rateLimitHit = false;
  backoffTime = BACKOFF_INITIAL_MS;
  
  // Record language change time
  lastLanguageChangeTime = Date.now();
}

export default {
  scheduleTranslation,
  getQueueStatus,
  clearQueue,
};
