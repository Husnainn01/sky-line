// API utility functions for making requests to the backend

// Backend API URL - from environment variable only
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Throw an error if API_BASE_URL is not set
if (!API_BASE_URL) {
  console.error('NEXT_PUBLIC_API_URL environment variable is not set');
}

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
  
  // Get auth token if available - check both user and admin tokens
  const adminToken = typeof window !== 'undefined' ? localStorage.getItem('adminAuthToken') : null;
  const userToken = typeof window !== 'undefined' ? localStorage.getItem('userAuthToken') : null;
  
  // Use the appropriate token based on the endpoint
  if (endpoint.startsWith('/admin') && adminToken) {
    headers['Authorization'] = `Bearer ${adminToken}`;
  } else if (!endpoint.startsWith('/admin') && userToken) {
    headers['Authorization'] = `Bearer ${userToken}`;
  }
  
  // For debugging
  if (endpoint.startsWith('/admin')) {
    console.log('Admin API request:', endpoint, 'Token present:', !!adminToken);
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (response.status === 401) {
      console.warn('Authentication token expired or invalid');
      
      // Clear the relevant token based on the endpoint
      if (endpoint.startsWith('/admin')) {
        localStorage.removeItem('adminAuthToken');
        localStorage.removeItem('adminUser');
      } else {
        localStorage.removeItem('userAuthToken');
        localStorage.removeItem('userData');
      }
      
      // Redirect to login page if in browser environment
      if (typeof window !== 'undefined') {
        // For admin endpoints, redirect to admin login
        // For user endpoints, redirect to user login
        if (endpoint.startsWith('/admin')) {
          console.log('Redirecting to admin login page');
          // Use a small timeout to allow the current code to complete
          setTimeout(() => {
            window.location.href = '/admin/login';
          }, 100);
        } else {
          console.log('Redirecting to user login page');
          // Use a small timeout to allow the current code to complete
          // setTimeout(() => {
          //   window.location.href = '/auth/login';
          // }, 100);
        }
      }
    }
    
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

    // Store token and user data in localStorage - use userAuthToken for regular users
    if (response.token) {
      localStorage.setItem('userAuthToken', response.token);
      localStorage.setItem('userData', JSON.stringify(response.user));
      
      // If remember me is checked, store email in localStorage
      if (rememberMe) {
        localStorage.setItem('userEmail', email);
      } else {
        localStorage.removeItem('userEmail');
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

    // Store token and user data in localStorage - use userAuthToken for regular users
    if (response.token) {
      localStorage.setItem('userAuthToken', response.token);
      localStorage.setItem('userData', JSON.stringify(response.user));
      
      // If remember me is checked, store email in localStorage
      if (rememberMe) {
        localStorage.setItem('userEmail', email);
      } else {
        localStorage.removeItem('userEmail');
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
    // Clear user auth token and user data
    localStorage.removeItem('userAuthToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userEmail');
    
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
  // Get dashboard data for the user
  getDashboardData: async () => {
    try {
      // Try to fetch real data from the API
      return await apiRequest('/user/dashboard');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // If API fails, generate data based on saved vehicles and other available data
      const savedVehiclesResponse = await apiRequest('/saved-vehicles');
      const savedVehicles = savedVehiclesResponse.success ? savedVehiclesResponse.data : [];
      
      // Calculate stats based on real saved vehicles data
      return {
        success: true,
        stats: {
          savedVehicles: savedVehicles.length,
          vehiclesOwned: 0, // Will be implemented when purchase functionality is added
          activeShipments: 0, // Will be implemented when shipment functionality is added
          totalSpent: 0, // Will be implemented when payment functionality is added
        },
        featuredVehicles: savedVehicles.slice(0, 3).map((vehicle: any) => ({
          id: vehicle._id || vehicle.id,
          make: vehicle.make || 'Unknown',
          model: vehicle.model || 'Vehicle',
          year: vehicle.year || new Date().getFullYear(),
          price: vehicle.price || 0,
          image: vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : '/cars/placeholder.png',
          status: 'saved'
        })),
        recentSearches: [],
        accountStatus: {
          emailVerified: true,
          profileComplete: true,
          paymentMethodsAdded: false
        }
      };
    }
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

/**
 * Shipping API calls
 */
export const shippingApi = {
  // Get all shipping schedules
  getAllShippingSchedules: async (filters?: any) => {
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
    return apiRequest(`/shipping-schedules${queryString}`);
  },
  
  // Get active shipping schedules
  getActiveShippingSchedules: async () => {
    return apiRequest('/shipping-schedules/active');
  },
  
  // Get shipping schedule by ID
  getShippingScheduleById: async (id: string) => {
    return apiRequest(`/shipping-schedules/${id}`);
  },
  
  // Create a new shipping schedule (admin only)
  createShippingSchedule: async (scheduleData: any) => {
    return apiRequest('/shipping-schedules', {
      method: 'POST',
      body: JSON.stringify(scheduleData),
    });
  },
  
  // Update a shipping schedule (admin only)
  updateShippingSchedule: async (id: string, updates: any) => {
    return apiRequest(`/shipping-schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  
  // Delete a shipping schedule (admin only)
  deleteShippingSchedule: async (id: string) => {
    return apiRequest(`/shipping-schedules/${id}`, {
      method: 'DELETE',
    });
  },
  
  // Mock methods for endpoints that don't exist yet
  getShippingRates: async () => {
    // Return mock data since this endpoint doesn't exist yet
    return {
      success: true,
      data: [
        {
          destination: 'USA (West Coast)',
          container20ft: '2,800',
          container40ft: '4,200',
          roro: '1,800',
        },
        {
          destination: 'USA (East Coast)',
          container20ft: '3,200',
          container40ft: '4,800',
          roro: '2,200',
        },
        {
          destination: 'Europe (Main Ports)',
          container20ft: '3,000',
          container40ft: '4,500',
          roro: '2,000',
        },
        {
          destination: 'Australia',
          container20ft: '2,500',
          container40ft: '3,800',
          roro: '1,600',
        },
        {
          destination: 'New Zealand',
          container20ft: '2,600',
          container40ft: '3,900',
          roro: '1,700',
        },
      ]
    };
  },
  
  getShippingInfo: async () => {
    // Return mock data since this endpoint doesn't exist yet
    return {
      success: true,
      data: [
        {
          title: 'Required Documents',
          items: [
            'Bill of Lading',
            'Commercial Invoice',
            'Export Declaration',
            'Import License (if required)',
            'Certificate of Origin',
          ],
        },
        {
          title: 'Container Shipping',
          items: [
            'Full container load (FCL) available',
            'Shared container options (consolidation)',
            'Temperature-controlled containers for special vehicles',
            'Professional loading and securing',
          ],
        },
        {
          title: 'RoRo Shipping',
          items: [
            'Available for self-propelled vehicles',
            'Cost-effective option',
            'Faster transit times',
            'Regular schedules to major ports',
          ],
        },
        {
          title: 'Insurance Coverage',
          items: [
            'Comprehensive marine insurance',
            'Coverage against damage and loss',
            'Door-to-door coverage available',
            'Quick claim processing',
          ],
        },
      ]
    };
  },
  
  getDeparturePorts: async () => {
    // Return mock data since this endpoint doesn't exist yet
    return {
      success: true,
      data: [
        'Yokohama',
        'Tokyo',
        'Osaka',
        'Kawasaki',
        'Kobe',
        'Nagoya',
      ]
    };
  },
  
  getDestinations: async () => {
    // Return mock data since this endpoint doesn't exist yet
    return {
      success: true,
      data: [
        'USA (West Coast)',
        'USA (East Coast)',
        'Europe',
        'Australia',
        'New Zealand',
        'Southeast Asia',
      ]
    };
  },
};
