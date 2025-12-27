'use client';

import React, { useState, useEffect, useRef, memo } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';

// Static counter to stagger initial render of components
let componentCounter = 0;

// Delay settings for initial translation attempt
const MIN_INITIAL_DELAY_MS = 20; // Minimum delay
const MAX_INITIAL_DELAY_MS = 200; // Maximum delay

interface TranslatableTextProps {
  text: string;
  as?: keyof JSX.IntrinsicElements | React.ComponentType<any>;
  className?: string;
  skipTranslation?: boolean; // Option to skip translation for this component
  [key: string]: any; // For any additional props
}

const TranslatableText: React.FC<TranslatableTextProps> = ({
  text,
  as: Component = 'span',
  className = '',
  skipTranslation = false,
  ...props
}) => {
  const { translate, currentLanguageCode, isLoading } = useTranslation();
  const [translatedText, setTranslatedText] = useState<string>(text);
  const [translationAttempted, setTranslationAttempted] = useState<boolean>(false);
  const [translationFailed, setTranslationFailed] = useState<boolean>(false);

  // Use a ref to track the current text for comparison
  const textRef = useRef<string>(text);
  
  // Use a ref to track the current language for comparison
  const langRef = useRef<string>(currentLanguageCode);
  
  // Use a ref to track translation attempts to prevent infinite loops
  const attemptCountRef = useRef<number>(0);
  
  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Component ID for staggered initial loading
  const componentIdRef = useRef<number>(componentCounter++);

  useEffect(() => {
    // Reset state when language changes
    if (currentLanguageCode !== langRef.current) {
      // Language changed - reset everything
      attemptCountRef.current = 0;
      setTranslationAttempted(false);
      setTranslationFailed(false);
      
      // For English, set text directly
      if (currentLanguageCode === 'en') {
        setTranslatedText(text);
      } else {
        // For non-English, reset to original text first (will be translated below)
        setTranslatedText(text);
      }
      
      // Update language ref
      langRef.current = currentLanguageCode;
    }
    
    // Handle text changes
    if (text !== textRef.current) {
      // Text changed - reset attempts
      attemptCountRef.current = 0;
      setTranslationAttempted(false);
      setTranslationFailed(false);
      
      // Update text ref
      textRef.current = text;
    }
    
    // Skip if English or skipTranslation flag is true
    if (currentLanguageCode === 'en' || skipTranslation) {
      // Always make sure we show the original text for English
      if (currentLanguageCode === 'en' && translatedText !== text) {
        setTranslatedText(text);
      }
      return;
    }
    
    // Clear any existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Calculate a staggered initial delay based on component ID
    // This helps avoid all components trying to translate at the exact same time
    const calculateInitialDelay = () => {
      // Base delay with some randomness to avoid synchronized requests
      const baseDelay = MIN_INITIAL_DELAY_MS + (componentIdRef.current % 10) * 20;
      
      // Add proportional delay based on text length (longer texts wait longer)
      const lengthFactor = Math.min(text.length / 100, 5); // Cap at 5
      
      // Add some randomness to further stagger requests
      const randomFactor = Math.random() * 50;
      
      return Math.min(baseDelay + (lengthFactor * 20) + randomFactor, MAX_INITIAL_DELAY_MS);
    };
    
    // Set a debounce timer with staggered delay
    debounceTimerRef.current = setTimeout(() => {
      // Use a single translation attempt
      let isMounted = true;
      
      const translateText = async () => {
        // Limit translation attempts to prevent infinite loops
        if (attemptCountRef.current >= 3) {
          console.warn(`Max translation attempts reached for: ${text.substring(0, 30)}...`);
          setTranslationFailed(true);
          return;
        }
        
        attemptCountRef.current += 1;
        setTranslationAttempted(true);
        
        try {
          const result = await translate(text);
          if (isMounted) {
            setTranslatedText(result);
            // If result is the same as input, mark as failed to prevent further attempts
            if (result === text && currentLanguageCode !== 'en') {
              setTranslationFailed(true);
            }
          }
        } catch (error) {
          // Fallback to original text on error
          if (isMounted) {
            console.error('Translation error in component:', error);
            setTranslatedText(text);
            setTranslationFailed(true);
          }
        }
      };
      
      // Start translation
      translateText();
    }, calculateInitialDelay());
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [text, currentLanguageCode, translate, skipTranslation]);
  
  // Check if this component is waiting for translation
  const needsTranslation = currentLanguageCode !== 'en' && 
                          !skipTranslation && 
                          (translatedText === text || isLoading) && 
                          !translationFailed;

  return (
    <Component className={`${className} ${isLoading && needsTranslation ? 'opacity-80' : ''}`} {...props}>
      {translatedText}
    </Component>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(TranslatableText);
