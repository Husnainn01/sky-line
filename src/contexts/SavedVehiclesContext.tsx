'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { savedVehiclesApi } from '@/lib/savedVehiclesApi';
import { useAuth } from './AuthContext';

interface SavedVehiclesContextType {
  savedVehicles: string[];
  isLoading: boolean;
  saveVehicle: (vehicleId: string) => Promise<boolean>;
  unsaveVehicle: (vehicleId: string) => Promise<boolean>;
  isSaved: (vehicleId: string) => boolean;
  refreshSavedVehicles: () => Promise<void>;
}

const SavedVehiclesContext = createContext<SavedVehiclesContextType | undefined>(undefined);

export const SavedVehiclesProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [savedVehicles, setSavedVehicles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch saved vehicles on mount and when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      refreshSavedVehicles();
    } else {
      setSavedVehicles([]);
    }
  }, [isAuthenticated]);

  // Function to refresh the list of saved vehicles
  const refreshSavedVehicles = async () => {
    if (!isAuthenticated) {
      setSavedVehicles([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await savedVehiclesApi.getSavedVehicles();
      if (response.success && response.data) {
        // Extract vehicle IDs from the response
        // MongoDB uses _id as the primary key, but our frontend might use id
        // So we need to handle both cases
        const vehicleIds = response.data.map((vehicle: any) => {
          // First check if the vehicle object itself has an ID
          if (vehicle._id) return vehicle._id;
          if (vehicle.id) return vehicle.id;
          
          // If the vehicle is just a reference with vehicleId
          if (vehicle.vehicleId) return vehicle.vehicleId;
          
          // If we have a nested vehicle object
          if (vehicle.vehicle && (vehicle.vehicle._id || vehicle.vehicle.id)) {
            return vehicle.vehicle._id || vehicle.vehicle.id;
          }
          
          return null;
        }).filter(Boolean); // Remove any null values
        
        setSavedVehicles(vehicleIds);
      }
    } catch (error) {
      console.error('Error fetching saved vehicles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if a vehicle is saved
  const isSaved = (vehicleId: string) => {
    return savedVehicles.includes(vehicleId);
  };

  // Save a vehicle
  const saveVehicle = async (vehicleId: string) => {
    if (!isAuthenticated) return false;

    setIsLoading(true);
    try {
      const response = await savedVehiclesApi.saveVehicle(vehicleId);
      if (response.success) {
        // If the response includes the saved vehicle with its MongoDB _id, use that
        if (response.data && (response.data._id || response.data.id)) {
          const savedId = response.data._id || response.data.id;
          setSavedVehicles(prev => [...prev, savedId]);
        } else {
          // Otherwise just use the vehicleId we sent
          setSavedVehicles(prev => [...prev, vehicleId]);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving vehicle:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Unsave a vehicle
  const unsaveVehicle = async (vehicleId: string) => {
    if (!isAuthenticated) return false;

    setIsLoading(true);
    try {
      const response = await savedVehiclesApi.unsaveVehicle(vehicleId);
      if (response.success) {
        // Remove this vehicle ID from our saved list
        // We need to check all possible ID formats that might be in our list
        setSavedVehicles(prev => prev.filter(id => {
          // Direct match
          if (id === vehicleId) return false;
          
          // MongoDB ObjectId in string form might be different from the vehicleId
          // If the vehicleId is the actual vehicle document ID and not the saved vehicle record ID
          // This is a simplistic check - in a real app you might need more sophisticated matching
          if (id.length === 24 && vehicleId.length === 24) {
            // Both are likely MongoDB ObjectIds, so do a direct comparison
            return id !== vehicleId;
          }
          
          // Keep this ID in the list
          return true;
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error unsaving vehicle:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    savedVehicles,
    isLoading,
    saveVehicle,
    unsaveVehicle,
    isSaved,
    refreshSavedVehicles
  };

  return (
    <SavedVehiclesContext.Provider value={value}>
      {children}
    </SavedVehiclesContext.Provider>
  );
};

export const useSavedVehicles = () => {
  const context = useContext(SavedVehiclesContext);
  if (context === undefined) {
    throw new Error('useSavedVehicles must be used within a SavedVehiclesProvider');
  }
  return context;
};
