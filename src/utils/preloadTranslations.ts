/**
 * Utility for preloading common translations
 * This helps reduce API calls by preloading frequently used text
 */

import { translateText } from './translation';
import { translationCache } from './localStorageCache';

// Common UI elements that should be preloaded for better user experience
const commonTranslations: Record<string, string[]> = {
  // Navigation and common UI elements
  ui: [
    'Home',
    'About',
    'Contact',
    'Search',
    'Login',
    'Register',
    'Profile',
    'Settings',
    'Logout',
    'Menu',
    'Close',
    'Back',
    'Next',
    'Submit',
    'Cancel',
    'Save',
    'Delete',
    'Edit',
    'View',
    'More',
    'Less',
    'Loading...',
    'Please wait...',
    'Error',
    'Success',
    'Warning',
    'Info',
  ],
  
  // Car-related terms (since this is a JDM site)
  cars: [
    'Car',
    'Vehicle',
    'Engine',
    'Transmission',
    'Manual',
    'Automatic',
    'Turbo',
    'Horsepower',
    'Mileage',
    'Year',
    'Model',
    'Make',
    'Color',
    'Price',
    'Condition',
    'New',
    'Used',
    'Import',
    'Export',
    'JDM',
    'Japanese',
    'Auction',
    'Bid',
    'Buy',
    'Sell',
  ],
  
  // Common messages
  messages: [
    'Thank you for your interest',
    'Please fill out the form',
    'We will contact you shortly',
    'Your request has been submitted',
    'An error occurred',
    'Please try again later',
    'No results found',
    'Loading more results',
  ]
};

/**
 * Preload translations for a specific language
 * @param languageCode The language code to preload translations for
 * @param categories Optional array of categories to preload (defaults to all)
 * @returns Promise that resolves when preloading is complete
 */
export const preloadTranslations = async (
  languageCode: string,
  categories: string[] = Object.keys(commonTranslations)
): Promise<void> => {
  // Skip for English
  if (languageCode === 'en') return;
  
  console.log(`Preloading translations for ${languageCode}...`);
  
  // Initialize the cache
  translationCache.init();
  
  // Track progress
  let completed = 0;
  let total = 0;
  
  // Count total translations to preload
  categories.forEach(category => {
    if (commonTranslations[category]) {
      total += commonTranslations[category].length;
    }
  });
  
  // Create a queue of translations to process
  const queue: string[] = [];
  
  // Add requested categories to the queue
  categories.forEach(category => {
    if (commonTranslations[category]) {
      queue.push(...commonTranslations[category]);
    }
  });
  
  // Process in batches to avoid rate limits
  const batchSize = 3;
  
  while (queue.length > 0) {
    // Take a batch of items
    const batch = queue.splice(0, batchSize);
    
    // Process batch in parallel
    await Promise.all(batch.map(async (text) => {
      const cacheKey = `${text}:${languageCode}`;
      
      // Skip if already in cache
      if (translationCache.get(cacheKey)) {
        completed++;
        return;
      }
      
      try {
        // Translate and cache
        const translated = await translateText(text, languageCode);
        translationCache.set(cacheKey, translated);
      } catch (error) {
        console.error(`Failed to preload translation for "${text}":`, error);
      }
      
      completed++;
    }));
    
    // Log progress
    console.log(`Preloaded ${completed}/${total} translations (${Math.round(completed/total*100)}%)`);
    
    // Wait between batches to avoid rate limits
    if (queue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`Finished preloading translations for ${languageCode}`);
};

/**
 * Add custom phrases to preload
 * @param category Category name
 * @param phrases Array of phrases to add
 */
export const addPreloadPhrases = (category: string, phrases: string[]): void => {
  if (!commonTranslations[category]) {
    commonTranslations[category] = [];
  }
  
  // Add only unique phrases
  phrases.forEach(phrase => {
    if (!commonTranslations[category].includes(phrase)) {
      commonTranslations[category].push(phrase);
    }
  });
};

export default preloadTranslations;
