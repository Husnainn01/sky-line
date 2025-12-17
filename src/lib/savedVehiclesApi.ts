import { apiRequest } from './api';

export const savedVehiclesApi = {
  /**
   * Get all saved vehicles for the current user
   */
  async getSavedVehicles() {
    return apiRequest('/saved-vehicles');
  },

  /**
   * Check if a vehicle is saved by the current user
   */
  async checkSavedStatus(vehicleId: string) {
    return apiRequest(`/saved-vehicles/${vehicleId}`);
  },

  /**
   * Save a vehicle
   */
  async saveVehicle(vehicleId: string) {
    return apiRequest('/saved-vehicles/save', {
      method: 'POST',
      body: JSON.stringify({ vehicleId })
    });
  },

  /**
   * Unsave a vehicle
   */
  async unsaveVehicle(vehicleId: string) {
    return apiRequest('/saved-vehicles/unsave', {
      method: 'POST',
      body: JSON.stringify({ vehicleId })
    });
  }
};
