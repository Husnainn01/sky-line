'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { translateText, getUserLanguage, saveUserLanguage, getLanguageDisplayName } from '@/utils/translation';
import { translationCache } from '@/utils/localStorageCache';
import preloadTranslations from '@/utils/preloadTranslations';
import { getQueueStatus, clearQueue } from '@/utils/translationScheduler';

// In-memory cache for current session (outside of component to persist between renders)
let memoryCache: Record<string, string> = {};

interface TranslationContextType {
  translate: (text: string) => Promise<string>;
  currentLanguage: string;
  currentLanguageCode: string;
  setLanguage: (langCode: string) => void;
  isLoading: boolean;
  queueSize: number;
  clearTranslationCache: () => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

interface TranslationProviderProps {
  children: ReactNode;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children }) => {
  const [currentLanguageCode, setCurrentLanguageCode] = useState<string>('en');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [queueSize, setQueueSize] = useState<number>(0);
  
  // Update queue size periodically
  useEffect(() => {
    const updateQueueSize = () => {
      const status = getQueueStatus();
      setQueueSize(status.queueLength + status.activeRequests);
      setIsLoading(status.queueLength > 0 || status.activeRequests > 0);
    };
    
    // Update immediately
    updateQueueSize();
    
    // Then update periodically
    const interval = setInterval(updateQueueSize, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Handle language changes
  useEffect(() => {
    // Clear memory cache
    memoryCache = {};
    
    // Clear the translation queue when language changes
    clearQueue();
    
    // Don't preload for English (source language)
    if (currentLanguageCode !== 'en') {
      // Preload common translations in the background
      // Start with UI elements which are most important
      preloadTranslations(currentLanguageCode, ['ui']).catch(err => {
        console.error('Failed to preload UI translations:', err);
      });
      
      // After a delay, preload the rest to avoid overwhelming the API
      setTimeout(() => {
        preloadTranslations(currentLanguageCode, ['cars', 'messages']).catch(err => {
          console.error('Failed to preload additional translations:', err);
        });
      }, 5000); // 5 second delay
    }
  }, [currentLanguageCode]);
  
  // Initialize the persistent cache
  useEffect(() => {
    // Only run in browser
    if (typeof window !== 'undefined') {
      translationCache.init();
    }
  }, []);


  // Initialize language from stored preference
  useEffect(() => {
    const storedLang = getUserLanguage();
    if (storedLang) {
      setCurrentLanguageCode(storedLang);
    }
  }, []);

  // Translation function that uses the centralized scheduler
  const translate = async (text: string): Promise<string> => {
    if (!text || currentLanguageCode === 'en') {
      return text; // Return original text for English or empty strings
    }
    
    // Check memory cache first
    const cacheKey = `${text}:${currentLanguageCode}`;
    if (memoryCache[cacheKey]) {
      return memoryCache[cacheKey];
    }
    
    try {
      // Use translateText which now uses the centralized scheduler
      const result = await translateText(text, currentLanguageCode);
      
      // Update memory cache
      if (result !== text) {
        memoryCache[cacheKey] = result;
      }
      
      return result;
    } catch (error) {
      console.error('Translation error in context:', error);
      return text; // Return original text on error
    }
  };
  
  // Function to clear translation cache
  const clearTranslationCache = () => {
    memoryCache = {};
    translationCache.clear();
  };

  // Set language and save preference
  const setLanguage = (langCode: string) => {
    // Skip if it's the same language
    if (langCode === currentLanguageCode) return;
    
    // Clear caches immediately
    memoryCache = {};
    clearQueue();
    
    // Update language state immediately
    setCurrentLanguageCode(langCode);
    saveUserLanguage(langCode);
    
    // Force re-render of all translated components
    // by triggering a small loading state
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 50);
  };

  // Get display name for current language
  const currentLanguage = getLanguageDisplayName(currentLanguageCode);

  const value = {
    translate,
    currentLanguage,
    currentLanguageCode,
    setLanguage,
    isLoading,
    queueSize,
    clearTranslationCache,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export default TranslationContext;
