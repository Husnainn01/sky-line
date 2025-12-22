'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getAuthToken, verifySession } from '../../../../../utils/sessionManager';
import ConfirmDialog from '../../../../../components/admin/ConfirmDialog';

// Define badge type
interface Badge {
  text: string;
  color: string;
}

// Define car type with badge
interface Car {
  id?: string;
  _id?: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  transmission: string;
  fuelType: string;
  drivetrain: string;
  image: string;
  images?: string[];
  description: string;
  features: string[];
  condition: string;
  location: string;
  available: boolean;
  bodyType: string;
  vin?: string;
  stockNumber?: string;
  engineSize?: string;
  exteriorColor?: string;
  color?: string; // For backward compatibility
  engine?: string; // For backward compatibility
  cylinders?: string; // For backward compatibility
  steering?: string; // For backward compatibility
  doors?: number;
  specifications?: {
    cylinders?: string;
    steering?: string;
  };
  badge?: Badge;
  status?: string; // available or sold
}
import AdminHeader from '../../../../../components/admin/AdminHeader';
import AdminSidebar from '../../../../../components/admin/AdminSidebar';
import styles from './vehicleDetail.module.css';

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  // Extract ID from URL and ensure it's not undefined
  let id = params?.id as string;
  
  // Debug params
  console.log('Detail Page Params:', params);
  console.log('Detail Page Raw ID:', id);
  
  // Fix for the 'undefined' string issue
  if (id === 'undefined' || !id) {
    console.error('Invalid ID: ID is undefined');
    // In Next.js App Router, we can't access router.query directly
    // Instead, we'll need to extract from the current URL
    // Check if window is available (client-side only)
    if (typeof window !== 'undefined') {
      const urlParts = window.location.pathname.split('/');
      const potentialId = urlParts[urlParts.length - 1]; // The ID should be the last part
      if (potentialId) {
        id = potentialId;
        console.log('Extracted ID from URL path:', id);
      } else {
        console.error('Could not extract ID from URL path');
      }
    } else {
      console.log('Running on server side, cannot extract ID from URL');
    }
  }
  
  const [vehicle, setVehicle] = useState<Car | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Fetch vehicle data
  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        // Check if ID is valid
        if (!id) {
          console.error('Vehicle ID is undefined');
          setError('Vehicle ID is missing');
          setIsLoading(false);
          return;
        }
        
        // Get the authentication token
        const token = getAuthToken();
        if (!token) {
          console.error('Authentication required');
          router.push('/admin/login');
          return;
        }

        console.log(`Fetching vehicle details with ID: ${id}`);
        
        // Get API base URL from environment variable
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
        
        const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Vehicle not found');
          } else if (response.status === 401) {
            router.push('/admin/login');
          } else {
            throw new Error('Failed to fetch vehicle data');
          }
          return;
        }
        
        const data = await response.json();
        const vehicle = data.data;
        
        if (!vehicle) {
          setError('Vehicle not found');
          return;
        }
        
        // Ensure vehicle has an id property
        if (!vehicle.id && vehicle._id) {
          vehicle.id = vehicle._id;
        }
        
        console.log('Fetched vehicle data:', vehicle);
        
        // Ensure vehicle has an image property
        if (vehicle.images && vehicle.images.length > 0) {
          vehicle.image = vehicle.images[0];
        } else {
          vehicle.image = '/cars/placeholder.png';
        }
        
        setVehicle(vehicle);
      } catch (err) {
        console.error('Error fetching vehicle:', err);
        setError('Failed to load vehicle data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVehicle();
  }, [id, router]);
  
  // Open delete confirmation dialog
  const openDeleteConfirm = () => {
    setShowDeleteConfirm(true);
  };
  
  // Close delete confirmation dialog
  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
  };
  
  // Handle delete vehicle
  const handleDeleteVehicle = async () => {
    setShowDeleteConfirm(false);
    setIsDeleting(true);
    
    try {
      // First verify the session
      const isSessionValid = await verifySession();
      if (!isSessionValid) {
        throw new Error('Your session has expired. Please log in again.');
      }
      
      // Then get the token
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      // Use vehicle._id as fallback if id is not available
      const vehicleId = id || (vehicle && (vehicle.id || vehicle._id));
      console.log('Using vehicle ID for delete:', vehicleId);
      
      if (!vehicleId) {
        throw new Error('Vehicle ID is missing');
      }
      
      // Get API base URL from environment variable
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
      
      // Make API call to delete vehicle
      const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete vehicle');
      }
      
      // Redirect to stock vehicles page after successful deletion
      router.push('/admin/vehicles/stock');
      
    } catch (err) {
      console.error('Error deleting vehicle:', err);
      alert(`Failed to delete vehicle: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsDeleting(false);
    }
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className={styles.dashboardLayout}>
        <AdminSidebar />
        <div className={styles.mainContent}>
          <AdminHeader title="Loading..." />
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading vehicle data...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // If error or vehicle not found, show error
  if (error || !vehicle) {
    return (
      <div className={styles.dashboardLayout}>
        <AdminSidebar />
        <div className={styles.mainContent}>
          <AdminHeader title="Vehicle Not Found" />
          <div className={styles.errorContainer}>
            <h1 className={styles.errorTitle}>Vehicle Not Found</h1>
            <p className={styles.errorMessage}>{error || 'The vehicle you are looking for does not exist or has been removed.'}</p>
            <Link href="/admin/vehicles/stock" className={styles.backButton}>
              Back to Stock Vehicles
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.dashboardLayout}>
      <AdminSidebar />
      <div className={styles.mainContent}>
        <AdminHeader title={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} />
        
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.breadcrumbs}>
              <Link href="/admin/vehicles/stock" className={styles.breadcrumbLink}>
                Stock Vehicles
              </Link>
              <span className={styles.breadcrumbSeparator}>/</span>
              <span className={styles.breadcrumbCurrent}>{vehicle.year} {vehicle.make} {vehicle.model}</span>
            </div>
        
        <div className={styles.actions}>
          <Link href={`/admin/vehicles/stock/${id}/edit`} className={styles.editButton}>
            Edit Vehicle
          </Link>
          <button 
            className={styles.deleteButton}
            onClick={openDeleteConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Vehicle'}
          </button>
          
          <ConfirmDialog
            isOpen={showDeleteConfirm}
            title="Confirm Delete"
            message={`Are you sure you want to delete this ${vehicle.year} ${vehicle.make} ${vehicle.model}? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={handleDeleteVehicle}
            onCancel={closeDeleteConfirm}
          />
        </div>
      </div>
      
      <div className={styles.content}>
        <div className={styles.mainInfo}>
          <div className={styles.imageContainer}>
            <Image
              src={vehicle.image || '/cars/placeholder.png'}
              alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              width={600}
              height={400}
              className={styles.mainImage}
            />
            {vehicle.status === 'available' && (
              <div className={`${styles.statusBadge} ${styles.available}`}>Available</div>
            )}
            {vehicle.status === 'sold' && (
              <div className={`${styles.statusBadge} ${styles.sold}`}>Sold</div>
            )}
            {vehicle.status === 'shipping' && (
              <div className={`${styles.statusBadge} ${styles.shipping}`}>Shipping</div>
            )}
            {vehicle.status === 'auction' && (
              <div className={`${styles.statusBadge} ${styles.auction}`}>Auction</div>
            )}
            {!vehicle.status && (
              <div className={`${styles.statusBadge} ${vehicle.available ? styles.available : styles.sold}`}>
                {vehicle.available ? 'Available' : 'Sold'}
              </div>
            )}
            
            {vehicle.badge && (
              <div 
                className={styles.promotionalBadge}
                style={{ backgroundColor: vehicle.badge.color }}
              >
                {vehicle.badge.text}
              </div>
            )}
          </div>
          
          <div className={styles.infoCard}>
            <h1 className={styles.vehicleTitle}>
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h1>
            
            <div className={styles.priceRow}>
              <span className={styles.price}>${vehicle.price.toLocaleString()}</span>
              <span className={styles.stockNumber}>Stock #{vehicle.stockNumber || 'N/A'}</span>
            </div>
            
            <p className={styles.description}>{vehicle.description}</p>
            
            <div className={styles.featuresSection}>
              <h3 className={styles.sectionTitle}>Features</h3>
              <div className={styles.featuresList}>
                {vehicle.features.map((feature, index) => (
                  <div key={index} className={styles.featureBadge}>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.detailsGrid}>
          <div className={styles.detailCard}>
            <h3 className={styles.detailTitle}>Vehicle Details</h3>
            <div className={styles.detailsTable}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Make</span>
                <span className={styles.detailValue}>{vehicle.make}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Model</span>
                <span className={styles.detailValue}>{vehicle.model}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Year</span>
                <span className={styles.detailValue}>{vehicle.year}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Mileage</span>
                <span className={styles.detailValue}>{vehicle.mileage.toLocaleString()} km</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Body Type</span>
                <span className={styles.detailValue}>{vehicle.bodyType || 'N/A'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Color</span>
                <span className={styles.detailValue}>{vehicle.color || 'N/A'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Doors</span>
                <span className={styles.detailValue}>{vehicle.doors || 'N/A'}</span>
              </div>
            </div>
          </div>
          
          <div className={styles.detailCard}>
            <h3 className={styles.detailTitle}>Engine & Performance</h3>
            <div className={styles.detailsTable}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Engine</span>
                <span className={styles.detailValue}>{vehicle.engine || 'N/A'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Cylinders</span>
                <span className={styles.detailValue}>{vehicle.cylinders || 'N/A'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Transmission</span>
                <span className={styles.detailValue}>{vehicle.transmission}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Drivetrain</span>
                <span className={styles.detailValue}>{vehicle.drivetrain}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Fuel Type</span>
                <span className={styles.detailValue}>{vehicle.fuelType}</span>
              </div>
            </div>
          </div>
          
          <div className={styles.detailCard}>
            <h3 className={styles.detailTitle}>Additional Information</h3>
            <div className={styles.detailsTable}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>VIN</span>
                <span className={styles.detailValue}>{vehicle.vin || 'N/A'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Stock Number</span>
                <span className={styles.detailValue}>{vehicle.stockNumber || 'N/A'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Condition</span>
                <span className={styles.detailValue}>{vehicle.condition}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Location</span>
                <span className={styles.detailValue}>{vehicle.location}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Steering</span>
                <span className={styles.detailValue}>{vehicle.steering || 'N/A'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Status</span>
                {vehicle.status === 'available' && (
                  <span className={`${styles.detailValue} ${styles.statusAvailable}`}>Available</span>
                )}
                {vehicle.status === 'sold' && (
                  <span className={`${styles.detailValue} ${styles.statusSold}`}>Sold</span>
                )}
                {vehicle.status === 'shipping' && (
                  <span className={`${styles.detailValue} ${styles.statusShipping}`}>Shipping</span>
                )}
                {vehicle.status === 'auction' && (
                  <span className={`${styles.detailValue} ${styles.statusAuction}`}>Auction</span>
                )}
                {!vehicle.status && (
                  <span className={`${styles.detailValue} ${vehicle.available ? styles.statusAvailable : styles.statusSold}`}>
                    {vehicle.available ? 'Available' : 'Sold'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
