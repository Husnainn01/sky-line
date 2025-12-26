import 'vanilla-cookieconsent/dist/cookieconsent.css';
import * as CookieConsent from 'vanilla-cookieconsent';

// Create a function to get the cookie consent configuration
// This ensures window is only accessed at runtime on the client
const getCookieConsentConfig = () => ({
  // GUI options
  root: 'body',
  autoShow: true,
  disablePageInteraction: false,
  
  // Consent management
  revision: 1,  // Increment when your policy changes to prompt users again
  
  // Cookie settings
  cookie: {
    name: 'skylinetrd',
    domain: typeof window !== 'undefined' ? window.location.hostname : '',
    expiresAfterDays: 365,
    sameSite: 'Lax' as 'Lax',
    path: '/'
  },
  
  // Categories and services
  categories: {
    necessary: {
      enabled: true,  // Always enabled, cannot be disabled by user
      readOnly: true,
      services: {
        essential: {}
      }
    },
    analytics: {
      enabled: false, // Off by default, user can enable
      services: {
        google_analytics: {}
      }
    },
    marketing: {
      enabled: false, // Off by default, user can enable
      services: {
        facebook_pixel: {},
        ads: {}
      }
    },
    preferences: {
      enabled: false, // Off by default, user can enable
      services: {
        preferences: {}
      }
    }
  },
  
  // Language and text
  language: {
    default: 'en',
    translations: {
      en: {
        consentModal: {
          title: 'We use cookies',
          description: 'We use cookies and other tracking technologies to improve your browsing experience on our website, to show you personalized content and targeted ads, to analyze our website traffic, and to understand where our visitors are coming from.',
          acceptAllBtn: 'Accept all',
          acceptNecessaryBtn: 'Reject all',
          showPreferencesBtn: 'Manage preferences'
        },
        preferencesModal: {
          title: 'Cookie Preferences',
          acceptAllBtn: 'Accept all',
          acceptNecessaryBtn: 'Reject all',
          savePreferencesBtn: 'Save preferences',
          closeIconLabel: 'Close',
          sections: [
            {
              title: 'Cookie Usage',
              description: 'We use cookies to ensure the basic functionality of the website and to enhance your online experience.'
            },
            {
              title: 'Strictly Necessary Cookies',
              description: 'These cookies are essential for the proper functioning of our website and cannot be disabled.',
              linkedCategory: 'necessary'
            },
            {
              title: 'Analytics Cookies',
              description: 'These cookies collect information about how you use our website, which pages you visited and which links you clicked on. All of the data is anonymized and cannot be used to identify you.',
              linkedCategory: 'analytics'
            },
            {
              title: 'Marketing Cookies',
              description: 'These cookies are used to track visitors across websites. The intention is to display ads that are relevant and engaging for the individual user.',
              linkedCategory: 'marketing'
            },
            {
              title: 'Preference Cookies',
              description: 'These cookies enable the website to remember information that changes the way the website behaves or looks, like your preferred language or the region you are in.',
              linkedCategory: 'preferences'
            },
            {
              title: 'More information',
              description: 'For any queries in relation to our policy on cookies and your choices, please <a href="/contact">contact us</a>.'
            }
          ]
        }
      }
    }
  },
  
  // Callbacks
  onFirstConsent: ({cookie}: {cookie: any}) => {
    console.log('First consent given:', cookie);
    storeUserPreferences(cookie);
  },
  onConsent: ({cookie}: {cookie: any}) => {
    console.log('Consent updated:', cookie);
    storeUserPreferences(cookie);
  },
  onChange: ({changedCategories, changedServices}: {changedCategories: any, changedServices: any}) => {
    console.log('Categories changed:', changedCategories);
    console.log('Services changed:', changedServices);
  }
});

// Function to store user preferences
function storeUserPreferences(cookie: any) {
  // Store preferences in localStorage for easy access
  if (typeof window !== 'undefined') {
    const preferences = {
      necessary: cookie.categories.necessary,
      analytics: cookie.categories.analytics,
      marketing: cookie.categories.marketing,
      preferences: cookie.categories.preferences,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    
    // You can also send these preferences to your backend if needed
    // sendPreferencesToServer(preferences);
  }
}

// Function to send preferences to server (optional)
async function sendPreferencesToServer(preferences: any) {
  try {
    const response = await fetch('/api/user/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });
    
    if (!response.ok) {
      console.error('Failed to save preferences to server');
    }
  } catch (error) {
    console.error('Error saving preferences to server:', error);
  }
}

// Function to get user preferences
export function getUserPreferences() {
  if (typeof window !== 'undefined') {
    const preferences = localStorage.getItem('userPreferences');
    return preferences ? JSON.parse(preferences) : null;
  }
  return null;
}

// Function to check if a specific category is accepted
export function isCategoryAccepted(category: 'analytics' | 'marketing' | 'preferences') {
  const preferences = getUserPreferences();
  return preferences ? preferences[category] : false;
}

// Initialize cookie consent
export function initCookieConsent() {
  if (typeof window !== 'undefined') {
    // Get the config at runtime when window is available
    const cookieConsentConfig = getCookieConsentConfig();
    CookieConsent.run(cookieConsentConfig);
  }
}

// Function to show cookie consent modal
export function showCookieConsentModal() {
  if (typeof window !== 'undefined') {
    CookieConsent.show();
  }
}

// Function to open preferences modal
export function showPreferencesModal() {
  if (typeof window !== 'undefined') {
    CookieConsent.showPreferences();
  }
}

export default {
  initCookieConsent,
  getUserPreferences,
  isCategoryAccepted,
  showCookieConsentModal,
  showPreferencesModal
};
