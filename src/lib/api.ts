// API utility functions for making requests to the backend

// Backend API URL - change this to your production URL when deploying
const API_BASE_URL = 'http://localhost:5001/api';

/**
 * Make a request to the backend API
 */
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Set default headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  
  // Get admin auth token if available
  const adminToken = typeof window !== 'undefined' ? localStorage.getItem('adminAuthToken') : null;
  if (adminToken) {
    headers['Authorization'] = `Bearer ${adminToken}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    // Create a custom error with status code information
    const errorMessage = data.message || 'Something went wrong';
    const error = new Error(`${response.status}: ${errorMessage}`);
    // Add extra properties to the error object
    (error as any).status = response.status;
    (error as any).data = data;
    throw error;
  }
  
  return data;
}

/**
 * Authentication API calls
 */
export const authApi = {
  // Register a new user
  register: async (userData: any) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  // Login user
  login: async (email: string, password: string, rememberMe: boolean = false) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, rememberMe }),
    });

    // If MFA is required, return the response without storing token
    if (response.requiresMfa) {
      // Store email and rememberMe preference temporarily
      sessionStorage.setItem('pendingMfaEmail', email);
      sessionStorage.setItem('pendingMfaRememberMe', String(rememberMe));
      return response;
    }

    // Store token and user data in localStorage
    if (response.token) {
      localStorage.setItem('adminAuthToken', response.token);
      localStorage.setItem('adminUser', JSON.stringify(response.user));
      
      // If remember me is checked, store email in localStorage
      if (rememberMe) {
        localStorage.setItem('adminEmail', email);
      } else {
        localStorage.removeItem('adminEmail');
      }
    }

    return response;
  },
  
  // Verify MFA during login
  verifyMfaLogin: async (factorId: string, code: string) => {
    // Get stored email and rememberMe preference
    const email = sessionStorage.getItem('pendingMfaEmail');
    const rememberMe = sessionStorage.getItem('pendingMfaRememberMe') === 'true';
    
    if (!email) {
      throw new Error('MFA verification session expired');
    }
    
    const response = await apiRequest('/auth/verify-mfa-login', {
      method: 'POST',
      body: JSON.stringify({ email, factorId, code, rememberMe }),
    });

    // Store token and user data in localStorage
    if (response.token) {
      localStorage.setItem('adminAuthToken', response.token);
      localStorage.setItem('adminUser', JSON.stringify(response.user));
      
      // If remember me is checked, store email in localStorage
      if (rememberMe) {
        localStorage.setItem('adminEmail', email);
      } else {
        localStorage.removeItem('adminEmail');
      }
      
      // Clear temporary MFA session data
      sessionStorage.removeItem('pendingMfaEmail');
      sessionStorage.removeItem('pendingMfaRememberMe');
    }

    return response;
  },
  
  // Request password reset
  forgotPassword: async (email: string) => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  
  // Reset password with token
  resetPassword: async (token: string, password: string) => {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },
  
  // Logout user
  logout: async () => {
    // Clear admin auth token and user data
    localStorage.removeItem('adminAuthToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminEmail');
    
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },
  
  // Get current user profile
  getProfile: async () => {
    return apiRequest('/auth/profile');
  },
  
  // Verify email
  verifyEmail: async (code: string) => {
    return apiRequest(`/auth/verify-email?code=${code}`);
  },
  
  // Request verification code
  requestVerification: async (data: { email: string }) => {
    return apiRequest('/auth/request-verification', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

/**
 * Dashboard API calls
 */
export const dashboardApi = {
  // Get dashboard data with mock data for now
  // This will be replaced with a real API call once the backend endpoint is implemented
  getDashboardData: async () => {
    // For now, return mock data instead of making an API call
    // This avoids the 401 error since there's no proper admin dashboard endpoint yet
    return {
      success: true,
      monthlyRevenue: [
        { month: 'Jan', amount: 65000 },
        { month: 'Feb', amount: 72000 },
        { month: 'Mar', amount: 58000 },
        { month: 'Apr', amount: 75000 },
        { month: 'May', amount: 82000 },
        { month: 'Jun', amount: 95000 },
        { month: 'Jul', amount: 105000 },
        { month: 'Aug', amount: 92000 },
        { month: 'Sep', amount: 86000 },
        { month: 'Oct', amount: 94000 },
        { month: 'Nov', amount: 98000 },
        { month: 'Dec', amount: 120000 },
      ],
      vehiclesByType: {
        stock: 86,
        auction: 38,
        sold: 45,
        pending: 12,
      },
      topSellingModels: [
        { model: 'Toyota Supra', count: 12, percentage: 15 },
        { model: 'Nissan Skyline', count: 10, percentage: 12.5 },
        { model: 'Honda NSX', count: 8, percentage: 10 },
        { model: 'Mazda RX-7', count: 7, percentage: 8.75 },
        { model: 'Mitsubishi Evo', count: 6, percentage: 7.5 },
      ],
      recentOrders: [
        { id: 'ORD-7829', customer: 'John Smith', vehicle: '2002 Nissan Skyline GT-R', amount: 42500, status: 'completed', date: '2023-11-28' },
        { id: 'ORD-7830', customer: 'Emma Johnson', vehicle: '1995 Toyota Supra RZ', amount: 68000, status: 'processing', date: '2023-11-29' },
        { id: 'ORD-7831', customer: 'Michael Brown', vehicle: '1992 Mazda RX-7 FD', amount: 35000, status: 'processing', date: '2023-11-30' },
        { id: 'ORD-7832', customer: 'Sarah Davis', vehicle: '1991 Honda NSX', amount: 75000, status: 'pending', date: '2023-12-01' },
      ]
    };
    
    // Commented out until backend endpoint is implemented
    // return apiRequest('/dashboard');
  },
};

/**
 * Bookmark API calls
 */
export const bookmarkApi = {
  // Get all bookmarks for the current user
  getBookmarks: async () => {
    return apiRequest('/bookmarks');
  },
  
  // Add a bookmark
  addBookmark: async (vehicleId: string, notes?: string) => {
    return apiRequest('/bookmarks', {
      method: 'POST',
      body: JSON.stringify({ vehicleId, notes }),
    });
  },
  
  // Remove a bookmark
  removeBookmark: async (bookmarkId: string) => {
    return apiRequest(`/bookmarks/${bookmarkId}`, {
      method: 'DELETE',
    });
  },
  
  // Update bookmark notes
  updateBookmarkNotes: async (bookmarkId: string, notes: string) => {
    return apiRequest(`/bookmarks/${bookmarkId}/notes`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    });
  },
};

/**
 * Security API calls
 */
export const securityApi = {
  // Get security settings
  getSecuritySettings: async () => {
    return apiRequest('/security/settings');
  },
  
  // Change password
  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiRequest('/security/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
  
  // Enable MFA
  enableMFA: async () => {
    return apiRequest('/security/mfa/enable', {
      method: 'POST',
    });
  },
  
  // Verify MFA setup
  verifyMFA: async (factorId: string, code: string) => {
    return apiRequest('/security/mfa/verify', {
      method: 'POST',
      body: JSON.stringify({ factorId, code }),
    });
  },
  
  // Disable MFA
  disableMFA: async (factorId?: string) => {
    return apiRequest('/security/mfa/disable', {
      method: 'POST',
      body: JSON.stringify({ factorId }),
    });
  },
};

/**
 * Profile API calls
 */
export const profileApi = {
  // Get user profile
  getProfile: async () => {
    return apiRequest('/profile');
  },
  
  // Update user profile
  updateProfile: async (profileData: any) => {
    return apiRequest('/profile/update', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
  
  // Request email change
  requestEmailChange: async (newEmail: string) => {
    return apiRequest('/profile/email/change', {
      method: 'POST',
      body: JSON.stringify({ newEmail }),
    });
  },
  
  // Verify email change
  verifyEmailChange: async (token: string) => {
    return apiRequest('/profile/email/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },
  
  // Cancel email change
  cancelEmailChange: async () => {
    return apiRequest('/profile/email/cancel', {
      method: 'POST',
    });
  },
};

/**
 * Make API calls
 */
export const makeApi = {
  // Get all makes
  getAllMakes: async (filters?: any) => {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params if provided
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value as string);
        }
      });
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiRequest(`/makes${queryString}`);
  },
  
  // Get a single make by ID
  getMakeById: async (id: string) => {
    return apiRequest(`/makes/${id}`);
  },
  
  // Get models for a specific make
  getModelsByMake: async (id: string) => {
    return apiRequest(`/makes/${id}/models`);
  },
  
  // Create a new make (admin only)
  createMake: async (makeData: any) => {
    return apiRequest('/makes', {
      method: 'POST',
      body: JSON.stringify(makeData),
    });
  },
  
  // Update a make (admin only)
  updateMake: async (id: string, updates: any) => {
    return apiRequest(`/makes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  
  // Delete a make (admin only)
  deleteMake: async (id: string) => {
    return apiRequest(`/makes/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Model API calls
 */
export const modelApi = {
  // Get all models
  getAllModels: async (filters?: any) => {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params if provided
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value as string);
        }
      });
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiRequest(`/models${queryString}`);
  },
  
  // Get a single model by ID
  getModelById: async (id: string) => {
    return apiRequest(`/models/${id}`);
  },
  
  // Create a new model (admin only)
  createModel: async (modelData: any) => {
    return apiRequest('/models', {
      method: 'POST',
      body: JSON.stringify(modelData),
    });
  },
  
  // Update a model (admin only)
  updateModel: async (id: string, updates: any) => {
    return apiRequest(`/models/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  
  // Delete a model (admin only)
  deleteModel: async (id: string) => {
    return apiRequest(`/models/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Vehicle API calls
 */
export const vehicleApi = {
  // Get all vehicles with optional filters
  getAllVehicles: async (filters?: any) => {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params if provided
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value as string);
        }
      });
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiRequest(`/vehicles${queryString}`);
  },
  
  // Get a single vehicle by ID
  getVehicleById: async (id: string) => {
    return apiRequest(`/vehicles/${id}`);
  },
  
  // Get vehicles by type (stock or auction)
  getVehiclesByType: async (type: 'stock' | 'auction') => {
    return apiRequest(`/vehicles/type/${type}`);
  },
  
  // Create a new vehicle
  createVehicle: async (vehicleData: any) => {
    return apiRequest('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicleData),
    });
  },
  
  // Update a vehicle
  updateVehicle: async (id: string, updates: any) => {
    return apiRequest(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  
  // Delete a vehicle
  deleteVehicle: async (id: string) => {
    return apiRequest(`/vehicles/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Auction Vehicle API calls - separate collection for auction vehicles
 */
export const auctionVehicleApi = {
  // Get all auction vehicles with optional filters
  getAllAuctionVehicles: async (filters?: any) => {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params if provided
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value as string);
        }
      });
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiRequest(`/auction-vehicles${queryString}`);
  },
  
  // Get a single auction vehicle by ID
  getAuctionVehicleById: async (id: string) => {
    return apiRequest(`/auction-vehicles/${id}`);
  },
  
  // Get auction vehicle by slug
  getAuctionVehicleBySlug: async (slug: string) => {
    return apiRequest(`/auction-vehicles/slug/${slug}`);
  },
  
  // Get auction vehicles by status
  getAuctionVehiclesByStatus: async (status: 'upcoming' | 'live' | 'past') => {
    return apiRequest(`/auction-vehicles/status/${status}`);
  },
  
  // Create a new auction vehicle
  createAuctionVehicle: async (vehicleData: any) => {
    return apiRequest('/auction-vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicleData),
    });
  },
  
  // Update an auction vehicle
  updateAuctionVehicle: async (id: string, updates: any) => {
    return apiRequest(`/auction-vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  
  // Delete an auction vehicle
  deleteAuctionVehicle: async (id: string) => {
    return apiRequest(`/auction-vehicles/${id}`, {
      method: 'DELETE',
    });
  },
  
  // Place a bid on an auction vehicle
  placeBid: async (vehicleId: string, bidAmount: number) => {
    return apiRequest(`/auction-vehicles/${vehicleId}/bid`, {
      method: 'POST',
      body: JSON.stringify({ amount: bidAmount }),
    });
  },
  
  // Get bid history for an auction vehicle
  getBidHistory: async (vehicleId: string) => {
    return apiRequest(`/auction-vehicles/${vehicleId}/bids`);
  },
};
