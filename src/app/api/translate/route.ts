import { NextRequest, NextResponse } from 'next/server';

// DeepL API configuration
const DEEPL_API_KEY = '1cfa2f95-29ef-4d3c-8bc6-1bba6da6c963:fx';
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';

// Simple in-memory cache for translations
type CacheEntry = {
  translatedText: string;
  timestamp: number;
};

type TranslationCache = {
  [key: string]: CacheEntry;
};

// Cache will expire after 24 hours
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// In-memory cache
const translationCache: TranslationCache = {};

// Rate limiting with token bucket algorithm
type TokenBucket = {
  tokens: number;
  lastRefill: number;
  ipBuckets: Record<string, {
    tokens: number;
    lastRefill: number;
  }>;
};

// Global token bucket for all requests
const globalBucket: TokenBucket = {
  tokens: 10, // Start with more tokens
  lastRefill: Date.now(),
  ipBuckets: {}
};

// Configuration
const MAX_TOKENS = 10; // Increased maximum tokens
const REFILL_RATE = 1; // Tokens per 10 seconds (more gradual refill)
const REFILL_INTERVAL = 10000; // 10 seconds in milliseconds
const PER_IP_LIMIT = true; // Enable per-IP rate limiting
const MAX_TOKENS_PER_IP = 3; // Limit per IP address
const REFILL_RATE_PER_IP = 1; // Tokens per 15 seconds per IP
const REFILL_INTERVAL_PER_IP = 15000; // 15 seconds in milliseconds

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { text, targetLang } = body;
    
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }
    
    if (!targetLang) {
      return NextResponse.json({ error: 'Target language is required' }, { status: 400 });
    }
    
    // Check if English (no need to translate)
    if (targetLang.toLowerCase() === 'en') {
      return NextResponse.json({ translatedText: text });
    }
    
    // Create a cache key
    const cacheKey = `${text}:${targetLang}`;
    
    // Check if we have a cached translation and get current time
    const now = Date.now();
    if (translationCache[cacheKey] && now - translationCache[cacheKey].timestamp < CACHE_EXPIRY) {
      console.log('Using cached translation for:', text);
      return NextResponse.json({ 
        translatedText: translationCache[cacheKey].translatedText,
        cached: true
      });
    }
    
    // Get client IP for per-IP rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    // Check and update rate limit using token bucket algorithm
    const timeSinceLastRefill = now - globalBucket.lastRefill;
    
    // Refill tokens based on time elapsed
    if (timeSinceLastRefill > 0) {
      const tokensToAdd = Math.floor(timeSinceLastRefill / REFILL_INTERVAL) * REFILL_RATE;
      if (tokensToAdd > 0) {
        globalBucket.tokens = Math.min(MAX_TOKENS, globalBucket.tokens + tokensToAdd);
        globalBucket.lastRefill = now;
      }
    }
    
    // Check/initialize per-IP bucket if enabled
    if (PER_IP_LIMIT) {
      if (!globalBucket.ipBuckets[ip]) {
        globalBucket.ipBuckets[ip] = {
          tokens: MAX_TOKENS_PER_IP, // Start with full IP bucket
          lastRefill: now
        };
      } else {
        // Refill IP-specific tokens
        const ipBucket = globalBucket.ipBuckets[ip];
        const ipTimeSinceLastRefill = now - ipBucket.lastRefill;
        const ipTokensToAdd = Math.floor(ipTimeSinceLastRefill / REFILL_INTERVAL_PER_IP) * REFILL_RATE_PER_IP;
        
        if (ipTokensToAdd > 0) {
          ipBucket.tokens = Math.min(MAX_TOKENS_PER_IP, ipBucket.tokens + ipTokensToAdd);
          ipBucket.lastRefill = now;
        }
        
        // Check IP-specific rate limit
        if (ipBucket.tokens < 1) {
          console.log(`Rate limit exceeded for IP ${ip}, returning original text`);
          const retryAfterMs = Math.ceil((REFILL_INTERVAL_PER_IP - (now - ipBucket.lastRefill)) / 1000) * 1000;
          
          return NextResponse.json({ 
            translatedText: text,
            rateLimited: true,
            retryAfter: retryAfterMs
          }, {
            headers: {
              'Retry-After': Math.ceil(retryAfterMs / 1000).toString()
            }
          });
        }
        
        // Consume IP token
        ipBucket.tokens -= 1;
      }
    }
    
    // Check global rate limit
    if (globalBucket.tokens < 1) {
      console.log('Global rate limit exceeded, returning original text');
      const retryAfterMs = Math.ceil((REFILL_INTERVAL - (now - globalBucket.lastRefill)) / 1000) * 1000;
      
      return NextResponse.json({ 
        translatedText: text,
        rateLimited: true,
        retryAfter: retryAfterMs
      }, {
        headers: {
          'Retry-After': Math.ceil(retryAfterMs / 1000).toString()
        }
      });
    }
    
    // Consume global token
    globalBucket.tokens -= 1;
    
    // Prepare the request to DeepL API
    const formData = new URLSearchParams();
    formData.append('auth_key', DEEPL_API_KEY);
    formData.append('text', text);
    formData.append('target_lang', targetLang.toUpperCase());
    
    // Add source language if text is not in English
    if (targetLang.toLowerCase() !== 'en') {
      formData.append('source_lang', 'EN');
    }
    
    // Make the request to DeepL API
    const response = await fetch(DEEPL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepL API error:', errorText);
      return NextResponse.json(
        { error: `DeepL API error: ${response.status}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Extract the translated text from the response
    const translatedText = data.translations?.[0]?.text || text;
    
    // Cache the translation
    translationCache[cacheKey] = {
      translatedText,
      timestamp: Date.now()
    };
    
    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Failed to translate text' },
      { status: 500 }
    );
  }
}
