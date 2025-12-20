/**
 * Session Manager utility for handling WorkOS sessions and local authentication
 */

// Store admin token in localStorage
export const storeAuthToken = (token: string, user: any) => {
  if (typeof window !== 'undefined') {
    try {
      // Store token and user data
      localStorage.setItem('adminAuthToken', token);
      localStorage.setItem('adminUser', JSON.stringify(user));
      
      // For debugging
      console.log('Admin auth token stored successfully');
    } catch (error) {
      console.error('Error storing admin auth token:', error);
    }
  } else {
    console.warn('Cannot store admin auth token: window is undefined');
  }
};

// Store user token in localStorage
export const storeUserAuthToken = (token: string, user: any) => {
  if (typeof window !== 'undefined') {
    try {
      // Store token and user data
      localStorage.setItem('userAuthToken', token);
      localStorage.setItem('userData', JSON.stringify(user));
      
      // For debugging
      console.log('User auth token stored successfully');
    } catch (error) {
      console.error('Error storing user auth token:', error);
    }
  } else {
    console.warn('Cannot store user auth token: window is undefined');
  }
};

// Get admin auth token from localStorage
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    try {
      return localStorage.getItem('adminAuthToken');
    } catch (error) {
      console.error('Error getting admin auth token:', error);
      return null;
    }
  }
  return null;
};

// Get user auth token from localStorage
export const getUserAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    try {
      return localStorage.getItem('userAuthToken');
    } catch (error) {
      console.error('Error getting user auth token:', error);
      return null;
    }
  }
  return null;
};

// Get admin user from localStorage
export const getUser = (): any | null => {
  if (typeof window !== 'undefined') {
    try {
      const userJson = localStorage.getItem('adminUser');
      if (!userJson) return null;
      
      return JSON.parse(userJson);
    } catch (e) {
      console.error('Error getting/parsing admin user JSON:', e);
      return null;
    }
  }
  return null;
};

// Get regular user from localStorage
export const getUserData = (): any | null => {
  if (typeof window !== 'undefined') {
    try {
      const userJson = localStorage.getItem('userData');
      if (!userJson) return null;
      
      return JSON.parse(userJson);
    } catch (e) {
      console.error('Error getting/parsing user JSON:', e);
      return null;
    }
  }
  return null;
};

// Check if admin is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

// Check if regular user is authenticated
export const isUserAuthenticated = (): boolean => {
  return !!getUserAuthToken();
};

// Clear admin authentication data
export const clearAuth = () => {
  localStorage.removeItem('adminAuthToken');
  localStorage.removeItem('adminUser');
};

// Clear user authentication data
export const clearUserAuth = () => {
  localStorage.removeItem('userAuthToken');
  localStorage.removeItem('userData');
  localStorage.removeItem('userEmail');
};

// Verify session with WorkOS (to be called on important operations or app initialization)
export const verifySession = async (): Promise<boolean> => {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    // Call your backend API to verify the session with WorkOS
    const response = await fetch('http://localhost:5001/api/admin/auth/verify-session', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      // If session is invalid, clear local auth data
      clearAuth();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error verifying session:', error);
    return false;
  }
};

// Admin logout function that handles both local and WorkOS session
export const logout = async (): Promise<boolean> => {
  const token = getAuthToken();
  
  try {
    if (token) {
      // Call your backend API to invalidate the WorkOS session
      await fetch('http://localhost:5001/api/admin/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    }
    
    // Clear local storage regardless of API call success
    clearAuth();
    return true;
  } catch (error) {
    console.error('Error during logout:', error);
    // Still clear local storage even if API call fails
    clearAuth();
    return false;
  }
};

// User logout function
export const userLogout = async (): Promise<boolean> => {
  const token = getUserAuthToken();
  
  try {
    if (token) {
      // Call your backend API to invalidate the session
      await fetch('http://localhost:5001/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    }
    
    // Clear local storage regardless of API call success
    clearUserAuth();
    return true;
  } catch (error) {
    console.error('Error during user logout:', error);
    // Still clear local storage even if API call fails
    clearUserAuth();
    return false;
  }
};
