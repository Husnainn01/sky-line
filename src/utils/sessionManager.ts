/**
 * Session Manager utility for handling WorkOS sessions and local authentication
 */

// Store token in localStorage as a fallback
export const storeAuthToken = (token: string, user: any) => {
  localStorage.setItem('adminAuthToken', token);
  localStorage.setItem('adminUser', JSON.stringify(user));
};

// Get auth token from localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('adminAuthToken');
};

// Get user from localStorage
export const getUser = (): any | null => {
  const userJson = localStorage.getItem('adminUser');
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson);
  } catch (e) {
    console.error('Error parsing user JSON:', e);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

// Clear authentication data
export const clearAuth = () => {
  localStorage.removeItem('adminAuthToken');
  localStorage.removeItem('adminUser');
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

// Logout function that handles both local and WorkOS session
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
