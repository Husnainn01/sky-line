'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { carsData } from '@/data/mockData';
import { savedVehiclesApi } from '@/lib/savedVehiclesApi';
import { useSavedVehicles } from '@/contexts/SavedVehiclesContext';
import { vehicleApi } from '@/lib/api';
import { Car } from '@/types';
import styles from './page.module.css';

type VehicleCategory = 'all' | 'saved' | 'bids' | 'purchased';

// Define types for our vehicle data
interface SavedVehicle {
  id: string;
  vehicleId?: string;
  savedAt: string;
  [key: string]: any;
}

interface BidVehicle {
  id: string;
  bidAmount: number;
  bidStatus: string;
  bidDate: string;
  [key: string]: any;
}

interface PurchasedVehicle {
  id: string;
  purchaseDate: string;
  deliveryStatus: string;
  trackingNumber: string;
  [key: string]: any;
}

interface UserVehicles {
  saved: SavedVehicle[];
  bids: BidVehicle[];
  purchased: PurchasedVehicle[];
}

// Initial empty state for user's vehicles
const initialUserVehicles: UserVehicles = {
  saved: [],
  bids: [],
  purchased: []
};

export default function MyVehiclesPage() {
  const { savedVehicles, refreshSavedVehicles, unsaveVehicle, isLoading: savedVehiclesLoading } = useSavedVehicles();
  const [activeCategory, setActiveCategory] = useState<VehicleCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userVehicles, setUserVehicles] = useState(initialUserVehicles);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedVehicleDetails, setSavedVehicleDetails] = useState<any[]>([]);
  
  // Fetch saved vehicles details when savedVehicles IDs change
  useEffect(() => {
    const fetchSavedVehicleDetails = async () => {
      if (!savedVehicles || savedVehicles.length === 0) {
        setUserVehicles(prev => ({
          ...prev,
          saved: []
        }));
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Get all saved vehicles with full details
        const response = await savedVehiclesApi.getSavedVehicles();
        
        if (response.success && response.data) {
          // Map the database vehicle objects to our frontend Car type
          const savedVehicleDetails = response.data.map((dbVehicle: any) => {
            // Extract the MongoDB _id as our vehicle ID
            const vehicleId = dbVehicle._id || dbVehicle.id;
            
            // Map database fields to our Car interface
            const formattedVehicle: Car = {
              id: vehicleId,
              slug: dbVehicle.slug || `${(dbVehicle.make || 'unknown').toLowerCase().replace(/\s+/g, '-')}-${(dbVehicle.model || 'model').toLowerCase().replace(/\s+/g, '-')}-${dbVehicle.year || new Date().getFullYear()}`,
              make: dbVehicle.make || 'Unknown Make',
              model: dbVehicle.model || 'Unknown Model',
              year: dbVehicle.year || new Date().getFullYear(),
              price: dbVehicle.price || 0,
              mileage: dbVehicle.mileage || 0,
              transmission: dbVehicle.transmission || 'Manual',
              fuelType: dbVehicle.fuelType || 'Gasoline',
              drivetrain: dbVehicle.driveType || 'RWD', // Note: database uses driveType, frontend uses drivetrain
              image: dbVehicle.images && dbVehicle.images.length > 0 ? dbVehicle.images[0] : '/cars/placeholder.png',
              images: dbVehicle.images || [],
              description: dbVehicle.description || '',
              features: dbVehicle.features || [],
              condition: dbVehicle.condition || 'Used',
              location: dbVehicle.location || 'Unknown',
              available: dbVehicle.status === 'available',
              status: dbVehicle.status || 'available',
              bodyType: dbVehicle.bodyType || 'Unknown',
              vin: dbVehicle.vin,
              engine: dbVehicle.engineSize, // Note: database uses engineSize, frontend uses engine
              cylinders: dbVehicle.specifications?.cylinders,
              color: dbVehicle.exteriorColor, // Note: database uses exteriorColor, frontend uses color
              doors: dbVehicle.doors,
              stockNumber: dbVehicle.stockNumber || `SKY-${vehicleId.slice(-4).padStart(4, '0')}`,
              steering: dbVehicle.steering
            };
            
            return {
              ...formattedVehicle,
              savedAt: dbVehicle.createdAt || new Date().toISOString(),
            } as SavedVehicle;
          });
          
          setSavedVehicleDetails(savedVehicleDetails);
          setUserVehicles(prev => ({
            ...prev,
            saved: savedVehicleDetails
          }));
        } else {
          // Fallback to individual vehicle fetching if the saved vehicles endpoint doesn't return full details
          const vehicleDetailsPromises = savedVehicles.map(async (vehicleId) => {
            try {
              // Try to fetch from API
              const vehicleDetails = await vehicleApi.getVehicleById(vehicleId);
              
              // Map to our Car interface
              const formattedVehicle: Car = {
                id: vehicleId,
                slug: vehicleDetails.slug || `${(vehicleDetails.make || 'unknown').toLowerCase().replace(/\s+/g, '-')}-${(vehicleDetails.model || 'model').toLowerCase().replace(/\s+/g, '-')}-${vehicleDetails.year || new Date().getFullYear()}`,
                make: vehicleDetails.make || 'Unknown Make',
                model: vehicleDetails.model || 'Unknown Model',
                year: vehicleDetails.year || new Date().getFullYear(),
                price: vehicleDetails.price || 0,
                mileage: vehicleDetails.mileage || 0,
                transmission: vehicleDetails.transmission || 'Manual',
                fuelType: vehicleDetails.fuelType || 'Gasoline',
                drivetrain: vehicleDetails.driveType || vehicleDetails.drivetrain || 'RWD',
                image: vehicleDetails.images && vehicleDetails.images.length > 0 ? vehicleDetails.images[0] : '/cars/placeholder.png',
                images: vehicleDetails.images || [],
                description: vehicleDetails.description || '',
                features: vehicleDetails.features || [],
                condition: vehicleDetails.condition || 'Used',
                location: vehicleDetails.location || 'Unknown',
                available: vehicleDetails.status === 'available',
                status: vehicleDetails.status || 'available',
                bodyType: vehicleDetails.bodyType || 'Unknown',
                vin: vehicleDetails.vin,
                engine: vehicleDetails.engineSize || vehicleDetails.engine,
                cylinders: vehicleDetails.specifications?.cylinders || vehicleDetails.cylinders,
                color: vehicleDetails.exteriorColor || vehicleDetails.color,
                doors: vehicleDetails.doors,
                stockNumber: vehicleDetails.stockNumber || `SKY-${vehicleId.slice(-4).padStart(4, '0')}`,
                steering: vehicleDetails.steering
              };
              
              return {
                ...formattedVehicle,
                savedAt: new Date().toISOString(),
              } as SavedVehicle;
            } catch (error) {
              console.error(`Error fetching details for vehicle ${vehicleId}:`, error);
              
              // Fallback to mock data if API fails
              const { carsData } = await import('@/data/mockData');
              const mockVehicle = carsData.find(car => car.id === vehicleId);
              
              if (mockVehicle) {
                return {
                  ...mockVehicle,
                  savedAt: new Date().toISOString(),
                } as SavedVehicle;
              }
              
              // Last resort fallback
              return {
                id: vehicleId,
                slug: `unknown-vehicle-${vehicleId}`,
                make: 'Unknown Make',
                model: 'Unknown Model',
                year: new Date().getFullYear(),
                price: 0,
                mileage: 0,
                transmission: 'Manual',
                fuelType: 'Gasoline',
                drivetrain: 'RWD',
                image: '/cars/placeholder.png',
                description: 'No description available',
                features: [],
                condition: 'Unknown',
                location: 'Unknown',
                available: true,
                savedAt: new Date().toISOString(),
              } as SavedVehicle;
            }
          });
          
          const vehicleDetails = (await Promise.all(vehicleDetailsPromises)).filter(Boolean) as SavedVehicle[];
          
          setSavedVehicleDetails(vehicleDetails);
          setUserVehicles(prev => ({
            ...prev,
            saved: vehicleDetails
          }));
        }
      } catch (err) {
        console.error('Error fetching saved vehicle details:', err);
        setError('Failed to load saved vehicles');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSavedVehicleDetails();
  }, [savedVehicles, refreshSavedVehicles]);
  
  // Initial fetch of saved vehicles
  useEffect(() => {
    refreshSavedVehicles();
  }, []);
  
  // Handle removing a saved vehicle
  const handleRemoveSavedVehicle = async (vehicleId: string) => {
    try {
      await unsaveVehicle(vehicleId);
      
      // The savedVehicles context will update automatically
      // and trigger a re-fetch of the vehicle details
    } catch (err) {
      console.error('Error removing saved vehicle:', err);
      setError('Failed to remove saved vehicle');
    }
  };

  // Filter vehicles based on active category and search query
  const getFilteredVehicles = () => {
    let vehicles: Array<any> = [];
    
    if (activeCategory === 'all') {
      vehicles = [
        ...userVehicles.saved.map((v: any) => ({ ...v, type: 'saved' })),
        ...userVehicles.bids.map((v: any) => ({ ...v, type: 'bids' })),
        ...userVehicles.purchased.map((v: any) => ({ ...v, type: 'purchased' }))
      ];
    } else {
      vehicles = userVehicles[activeCategory].map((v: any) => ({ ...v, type: activeCategory }));
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return vehicles.filter(vehicle => 
        vehicle.make.toLowerCase().includes(query) || 
        vehicle.model.toLowerCase().includes(query) ||
        vehicle.year.toString().includes(query)
      );
    }
    
    return vehicles;
  };

  const filteredVehicles = getFilteredVehicles();

  const getBidStatusClass = (status: string) => {
    switch(status) {
      case 'winning': return styles.statusWinning;
      case 'outbid': return styles.statusOutbid;
      case 'pending': return styles.statusPending;
      default: return '';
    }
  };

  const getDeliveryStatusClass = (status: string) => {
    switch(status) {
      case 'delivered': return styles.statusDelivered;
      case 'shipped': return styles.statusShipped;
      case 'processing': return styles.statusProcessing;
      default: return '';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Vehicles</h1>
        <p className={styles.subtitle}>Manage your saved vehicles, bids, and purchases</p>
      </div>

      <div className={styles.controls}>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeCategory === 'all' ? styles.activeTab : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All Vehicles
          </button>
          <button 
            className={`${styles.tab} ${activeCategory === 'saved' ? styles.activeTab : ''}`}
            onClick={() => setActiveCategory('saved')}
          >
            Saved <span className={styles.count}>{userVehicles.saved.length}</span>
          </button>
          <button 
            className={`${styles.tab} ${activeCategory === 'bids' ? styles.activeTab : ''}`}
            onClick={() => setActiveCategory('bids')}
          >
            My Bids <span className={styles.count}>{userVehicles.bids.length}</span>
          </button>
          <button 
            className={`${styles.tab} ${activeCategory === 'purchased' ? styles.activeTab : ''}`}
            onClick={() => setActiveCategory('purchased')}
          >
            Purchased <span className={styles.count}>{userVehicles.purchased.length}</span>
          </button>
        </div>
        
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <button className={styles.searchButton}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
      </div>

      {filteredVehicles.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
          </div>
          <h3>No vehicles found</h3>
          <p>
            {activeCategory === 'all' 
              ? "You haven't saved any vehicles or placed any bids yet." 
              : activeCategory === 'saved' 
                ? "You haven't saved any vehicles yet." 
                : activeCategory === 'bids' 
                  ? "You haven't placed any bids yet." 
                  : "You haven't purchased any vehicles yet."}
          </p>
          <Link href="/inventory" className={styles.browseButton}>
            Browse Inventory
          </Link>
        </div>
      ) : (
        <div className={styles.vehicleGrid}>
          {filteredVehicles.map((vehicle: any) => (
            <div key={`${vehicle.id}-${vehicle.type}`} className={styles.vehicleCard}>
              <div className={styles.imageContainer}>
                <Image 
                  src={vehicle.image} 
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  width={300}
                  height={200}
                  className={styles.vehicleImage}
                />
                <div className={styles.vehicleType}>
                  {vehicle.type === 'saved' && (
                    <span className={styles.savedBadge}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                      </svg>
                      Saved
                    </span>
                  )}
                  {vehicle.type === 'bids' && (
                    <span className={`${styles.bidBadge} ${getBidStatusClass(vehicle.bidStatus)}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                      {vehicle.bidStatus === 'winning' ? 'Winning Bid' : 
                       vehicle.bidStatus === 'outbid' ? 'Outbid' : 'Pending'}
                    </span>
                  )}
                  {vehicle.type === 'purchased' && (
                    <span className={`${styles.purchasedBadge} ${getDeliveryStatusClass(vehicle.deliveryStatus)}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <polyline points="9 11 12 14 22 4"></polyline>
                      </svg>
                      {vehicle.deliveryStatus === 'delivered' ? 'Delivered' : 
                       vehicle.deliveryStatus === 'shipped' ? 'Shipped' : 'Processing'}
                    </span>
                  )}
                </div>
              </div>
              
              <div className={styles.vehicleInfo}>
                <h3 className={styles.vehicleName}>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h3>
                <div className={styles.vehicleSpecs}>
                  <span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20s-8-4.5-8-8.5A8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 8 8.5c0 4-8 8.5-8 8.5z"></path>
                      <circle cx="12" cy="11" r="3"></circle>
                    </svg>
                    {vehicle.location}
                  </span>
                  <span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    {vehicle.year}
                  </span>
                  <span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                    {formatCurrency(vehicle.price)}
                  </span>
                </div>
                
                {vehicle.type === 'saved' && (
                  <div className={styles.savedInfo}>
                    <p className={styles.savedDate}>Saved on {formatDate(vehicle.savedAt)}</p>
                    <div className={styles.cardActions}>
                      <Link href={`/inventory/${vehicle.slug || vehicle.id}`} className={styles.viewButton}>
                        View Details
                      </Link>
                      <button 
                        className={styles.removeButton}
                        onClick={() => handleRemoveSavedVehicle(vehicle.id || vehicle.vehicleId)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                )}
                
                {vehicle.type === 'bids' && (
                  <div className={styles.bidInfo}>
                    <div className={styles.bidDetails}>
                      <div>
                        <p className={styles.bidLabel}>Your Bid</p>
                        <p className={styles.bidAmount}>{formatCurrency(vehicle.bidAmount)}</p>
                      </div>
                      <div>
                        <p className={styles.bidLabel}>Bid Date</p>
                        <p className={styles.bidDate}>{formatDate(vehicle.bidDate)}</p>
                      </div>
                    </div>
                    <div className={styles.cardActions}>
                      <Link href={`/auction/${vehicle.id}`} className={styles.viewButton}>
                        View Auction
                      </Link>
                      {vehicle.bidStatus === 'outbid' && (
                        <button className={styles.bidAgainButton}>
                          Bid Again
                        </button>
                      )}
                    </div>
                  </div>
                )}
                
                {vehicle.type === 'purchased' && (
                  <div className={styles.purchaseInfo}>
                    <div className={styles.purchaseDetails}>
                      <div>
                        <p className={styles.purchaseLabel}>Purchase Date</p>
                        <p className={styles.purchaseDate}>{formatDate(vehicle.purchaseDate)}</p>
                      </div>
                      <div>
                        <p className={styles.purchaseLabel}>Tracking</p>
                        <p className={styles.trackingNumber}>{vehicle.trackingNumber}</p>
                      </div>
                    </div>
                    <div className={styles.cardActions}>
                      <Link href={`/dashboard/purchases/${vehicle.id}`} className={styles.viewButton}>
                        View Details
                      </Link>
                      <Link href={`/dashboard/track/${vehicle.trackingNumber}`} className={styles.trackButton}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        Track Shipment
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
