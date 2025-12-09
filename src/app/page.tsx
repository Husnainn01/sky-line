'use client';

import { useEffect, useState } from 'react';
import { vehicleApi } from '@/lib/api';
import { Car } from '@/types';
import HeroSection from '@/components/sections/HeroSection';
import RecentlyAddedSection from '@/components/sections/RecentlyAddedSection';
import HowToPurchaseSection from '@/components/sections/HowToPurchaseSection';
import FAQSection from '@/components/sections/FAQSection';
import Sidebar from '@/components/Sidebar';
import styles from './(main)/page.module.css';

export default function Home() {
  const [recentlyAdded, setRecentlyAdded] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for makes and models
  const [makes, setMakes] = useState<string[]>([]);
  const [modelsByMake, setModelsByMake] = useState<Record<string, string[]>>({});
  const [bodyTypes, setBodyTypes] = useState<string[]>([]);

  useEffect(() => {
    // Fetch recently added vehicles
    const fetchRecentVehicles = async () => {
      try {
        setLoading(true);
        // Get vehicles with a limit of 10, sorted by most recent
        const response = await vehicleApi.getAllVehicles({ limit: 10, sort: 'createdAt', order: 'desc' });
        
        if (response.success && response.data) {
          // Map API response to Car type
          const vehicles: Car[] = response.data.map((vehicle: any) => ({
            id: vehicle._id,
            slug: vehicle.slug || `${vehicle.make}-${vehicle.model}-${vehicle.year}`.toLowerCase().replace(/\s+/g, '-'),
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            price: vehicle.price,
            mileage: vehicle.mileage,
            transmission: vehicle.transmission,
            fuelType: vehicle.fuelType,
            drivetrain: vehicle.drivetrain,
            image: vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : '/cars/placeholder.png',
            images: vehicle.images || [],
            description: vehicle.description,
            features: vehicle.features || [],
            condition: vehicle.condition,
            location: vehicle.location,
            available: vehicle.status !== 'sold',
            bodyType: vehicle.bodyType,
            vin: vehicle.vin,
            engine: vehicle.engineSize,
            cylinders: vehicle.cylinders,
            color: vehicle.exteriorColor,
            doors: vehicle.doors,
            stockNumber: vehicle.stockNumber || `SKY-${Math.floor(1000 + Math.random() * 9000)}`,
            steering: vehicle.steering
          }));
          
          // Extract unique makes
          const uniqueMakes = Array.from(new Set(vehicles
            .filter(car => car.make) // Filter out undefined makes
            .map(car => car.make as string)))
            .sort();
          
          // Create a mapping of makes to their models
          const makeToModels: Record<string, string[]> = {};
          uniqueMakes.forEach(make => {
            // Get all models for this make
            const modelsForMake = vehicles
              .filter(car => car.make === make && car.model) // Filter by make and ensure model exists
              .map(car => car.model as string);
              
            // Remove duplicates and sort
            makeToModels[make] = Array.from(new Set(modelsForMake)).sort();
          });
          
          // Extract unique body types
          const uniqueBodyTypes = Array.from(new Set(vehicles
            .filter(car => car.bodyType) // Filter out undefined body types
            .map(car => car.bodyType as string)))
            .sort();
          
          setMakes(uniqueMakes);
          setModelsByMake(makeToModels);
          setBodyTypes(uniqueBodyTypes);
          setRecentlyAdded(vehicles);
        } else {
          throw new Error('Failed to fetch vehicles');
        }
      } catch (err: any) {
        console.error('Error fetching vehicles:', err);
        setError(err.message || 'Failed to load vehicles');
        // Fallback to empty array if there's an error
        setRecentlyAdded([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentVehicles();
  }, []);

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <HeroSection />

      {/* Recently Added with Sidebar */}
      <RecentlyAddedSection
        cars={recentlyAdded}
        loading={loading}
        error={error}
        makes={makes}
        modelsByMake={modelsByMake}
        bodyTypes={bodyTypes}
        sidebar={<Sidebar variant="inline" />}
      />

      {/* How to Purchase Section */}
      <HowToPurchaseSection />
      
      {/* FAQ Section */}
      <FAQSection />
    </div>
  );
}
