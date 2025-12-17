'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { savedVehiclesApi } from '@/lib/savedVehiclesApi';
import { isAuthenticated } from '@/utils/sessionManager';

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
  const [savedVehicles, setSavedVehicles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch saved vehicles on mount and when authentication state changes
  useEffect(() => {
    if (isAuthenticated()) {
      refreshSavedVehicles();
    } else {
      setSavedVehicles([]);
    }
  }, []);

  // Function to refresh the list of saved vehicles
  const refreshSavedVehicles = async () => {
    if (!isAuthenticated()) {
      setSavedVehicles([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await savedVehiclesApi.getSavedVehicles();
      if (response.success && response.data) {
        // Extract vehicle IDs from the response
        const vehicleIds = response.data.map((vehicle: any) => vehicle.id || vehicle._id);
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
    if (!isAuthenticated()) return false;

    setIsLoading(true);
    try {
      const response = await savedVehiclesApi.saveVehicle(vehicleId);
      if (response.success) {
        setSavedVehicles(prev => [...prev, vehicleId]);
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
    if (!isAuthenticated()) return false;

    setIsLoading(true);
    try {
      const response = await savedVehiclesApi.unsaveVehicle(vehicleId);
      if (response.success) {
        setSavedVehicles(prev => prev.filter(id => id !== vehicleId));
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
