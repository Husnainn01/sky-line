'use client';

import { useEffect, useState } from 'react';
import { vehicleApi } from '@/lib/api';
import { Car } from '@/types';
import HeroSection from '@/components/sections/HeroSection';
import RecentlyAddedSection from '@/components/sections/RecentlyAddedSection';
import HowToPurchaseSection from '@/components/sections/HowToPurchaseSection';
import FAQSection from '@/components/sections/FAQSection';
import Sidebar from '@/components/Sidebar';
import styles from './main_routes/page.module.css';

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
          
          // Extract unique makes with case-insensitive deduplication
          const uniqueMakes = (() => {
            // First, normalize all makes to lowercase for comparison
            const makesMap = new Map<string, string>();
            
            vehicles.forEach(car => {
              if (car.make) {
                const lowerMake = car.make.toLowerCase();
                // Keep the version with the best capitalization (prefer Title Case)
                if (!makesMap.has(lowerMake) || 
                    (car.make !== car.make.toLowerCase() && makesMap.get(lowerMake) === makesMap.get(lowerMake)?.toLowerCase())) {
                  makesMap.set(lowerMake, car.make);
                }
              }
            });
            
            // Extract the properly capitalized unique makes and sort them
            return Array.from(makesMap.values()).sort();
          })();
          
          // Create a mapping of makes to their models with case-insensitive comparison
          const makeToModels: Record<string, string[]> = {};
          uniqueMakes.forEach(make => {
            // Get all models for this make (case-insensitive)
            const modelsForMake = vehicles
              .filter(car => car.make && make && 
                car.make.toLowerCase() === make.toLowerCase() && car.model) // Filter by make (case-insensitive) and ensure model exists
              .map(car => car.model as string);
              
            // Remove duplicates with case-insensitive comparison
            const modelMap = new Map<string, string>();
            modelsForMake.forEach(model => {
              const lowerModel = model.toLowerCase();
              if (!modelMap.has(lowerModel) || 
                  (model !== model.toLowerCase() && modelMap.get(lowerModel) === modelMap.get(lowerModel)?.toLowerCase())) {
                modelMap.set(lowerModel, model);
              }
            });
            
            // Extract properly capitalized unique models and sort
            makeToModels[make] = Array.from(modelMap.values()).sort();
          });
          
          // Extract unique body types with case-insensitive deduplication
          const uniqueBodyTypes = (() => {
            // First, normalize all body types to lowercase for comparison
            const bodyTypeMap = new Map<string, string>();
            
            vehicles.forEach(car => {
              if (car.bodyType) {
                const lowerBodyType = car.bodyType.toLowerCase();
                // Keep the version with the best capitalization (prefer Title Case)
                if (!bodyTypeMap.has(lowerBodyType) || 
                    (car.bodyType !== car.bodyType.toLowerCase() && bodyTypeMap.get(lowerBodyType) === bodyTypeMap.get(lowerBodyType)?.toLowerCase())) {
                  bodyTypeMap.set(lowerBodyType, car.bodyType);
                }
              }
            });
            
            // Extract the properly capitalized unique body types and sort them
            return Array.from(bodyTypeMap.values()).sort();
          })();
          
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
