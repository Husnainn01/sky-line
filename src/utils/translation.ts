// No need for the translate package anymore as we're using our own API route
import { scheduleTranslation } from './translationScheduler';

// Supported languages
export const supportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
];

// Language code mapping (from display name to code)
const languageCodeMap: Record<string, string> = {
  English: 'en',
  '日本語': 'ja',
};

// Get language code from display name
export const getLanguageCode = (displayName: string): string => {
  return languageCodeMap[displayName] || 'en'; // Default to English
};

// Get language display name from code
export const getLanguageDisplayName = (code: string): string => {
  const language = supportedLanguages.find(lang => lang.code === code);
  return language ? language.name : 'English'; // Default to English
};

// Translate text using the centralized scheduler
export const translateText = async (text: string, targetLang: string): Promise<string> => {
  if (!text) return '';
  
  // Convert language display name to code if needed
  const langCode = languageCodeMap[targetLang] || targetLang;
  
  // Skip translation for English
  if (langCode === 'en') {
    return text;
  }
  
  try {
    // Calculate priority based on text length (shorter texts get higher priority)
    const priority = Math.min(Math.floor(text.length / 10), 100);
    
    // Use the centralized scheduler
    return await scheduleTranslation(text, langCode, priority);
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Fallback to original text
  }
};

// Translate an object of strings
export const translateObject = async <T extends Record<string, string>>(
  obj: T, 
  targetLang: string
): Promise<T> => {
  if (targetLang === 'en' || !targetLang) {
    return obj; // Return original if target is English or not specified
  }
  
  const translatedObj: Record<string, string> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      translatedObj[key] = await translateText(obj[key], targetLang);
    }
  }
  
  return translatedObj as T;
};

// Get user's preferred language from localStorage or cookie
export const getUserLanguage = (): string => {
  if (typeof window !== 'undefined') {
    // Try to get from localStorage first
    const storedLang = localStorage.getItem('userLanguage');
    if (storedLang) return storedLang;
    
    // Try to get from cookie
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'userLanguage') return value;
    }
  }
  
  return 'en'; // Default to English
};

// Save user's language preference
export const saveUserLanguage = (lang: string): void => {
  if (typeof window !== 'undefined') {
    // Save to localStorage
    localStorage.setItem('userLanguage', lang);
    
    // Save to cookie (expires in 1 year)
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    document.cookie = `userLanguage=${lang};expires=${expiryDate.toUTCString()};path=/;`;
  }
};

export default {
  translateText,
  translateObject,
  getUserLanguage,
  saveUserLanguage,
  getLanguageCode,
  getLanguageDisplayName,
  supportedLanguages,
};
