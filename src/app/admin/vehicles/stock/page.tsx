'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import AdminHeader from '../../../../components/admin/AdminHeader';
import AdminSidebar from '../../../../components/admin/AdminSidebar';
import ProtectedRoute from '../../../../components/admin/ProtectedRoute';
import PermissionGuard from '../../../../components/admin/PermissionGuard';
import ConfirmDialog from '../../../../components/admin/ConfirmDialog';
import { getAuthToken, verifySession } from '../../../../utils/sessionManager';
import styles from './stock.module.css';

// Define badge type
interface Badge {
  text: string;
  color: string;
}

// Define car type with badge
interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  transmission: string;
  fuelType: string;
  drivetrain: string;
  image: string;
  description: string;
  features: string[];
  condition: string;
  location: string;
  available: boolean;
  bodyType: string;
  stockNumber?: string;
  badge?: Badge;
  [key: string]: any; // For other properties
}

export default function StockVehiclesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMake, setFilterMake] = useState('');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<{id: string, make: string, model: string, year: number} | null>(null);
  
  // Fetch vehicles from API
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        
        // Get the authentication token
        const token = getAuthToken();
        if (!token) {
          console.error('Authentication required');
          router.push('/admin/login');
          return;
        }
        
        const response = await fetch('http://localhost:5001/api/vehicles/type/stock', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/admin/login');
            return;
          }
          throw new Error('Failed to fetch vehicles');
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        console.log('Vehicles data:', data.data);
        
        // Ensure each vehicle has a valid ID
        const vehiclesWithValidIds = (data.data || []).map((vehicle: any) => {
          console.log('Vehicle:', vehicle);
          // If _id exists but id doesn't, use _id as id
          if (vehicle._id && !vehicle.id) {
            return { ...vehicle, id: vehicle._id };
          }
          return vehicle;
        });
        
        setVehicles(vehiclesWithValidIds);
      } catch (err) {
        console.error('Error fetching vehicles:', err);
        setError('Failed to load vehicles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVehicles();
  }, [router]);
  
  // Apply search and make filter
  const filteredVehicles = vehicles.filter(car => {
    const matchesSearch = searchTerm 
      ? `${car.year} ${car.make} ${car.model} ${car.stockNumber || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    const matchesMake = filterMake 
      ? car.make === filterMake
      : true;
    
    return matchesSearch && matchesMake;
  });
  
  // Open delete confirmation dialog
  const openDeleteConfirm = (car: any) => {
    setVehicleToDelete({
      id: car.id || car._id,
      make: car.make,
      model: car.model,
      year: car.year
    });
    setShowDeleteConfirm(true);
  };
  
  // Close delete confirmation dialog
  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setVehicleToDelete(null);
  };
  
  // Handle delete vehicle
  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    
    const id = vehicleToDelete.id;
    setShowDeleteConfirm(false);
    setDeleteId(id);
    
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
      
      // Make API call to delete vehicle
      const response = await fetch(`http://localhost:5001/api/vehicles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete vehicle');
      }
      
      // Remove the vehicle from the list
      setVehicles(vehicles.filter(car => (car.id || car._id) !== id));
      
    } catch (err) {
      console.error('Error deleting vehicle:', err);
      alert(`Failed to delete vehicle: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setDeleteId(null);
    }
  };
  
  // Get unique makes for filter dropdown
  const uniqueMakes = Array.from(new Set(vehicles.map(car => car.make))).sort();
  
  // Show loading state
  if (loading) {
    return (
      <div className={styles.dashboardLayout}>
        <AdminSidebar />
        <div className={styles.mainContent}>
          <AdminHeader title="Loading..." />
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading vehicles data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={styles.dashboardLayout}>
        <AdminSidebar />
        <div className={styles.mainContent}>
          <AdminHeader title="Error" />
          <div className={styles.errorContainer}>
            <h1 className={styles.errorTitle}>Error Loading Vehicles</h1>
            <p className={styles.errorMessage}>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className={styles.backButton}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardLayout}>
      <AdminSidebar />
      <div className={styles.mainContent}>
        <AdminHeader title="Stock Vehicles" />
        
        <ProtectedRoute
          requiredPermission={{ resource: 'vehicles', action: 'read' }}
        >
          <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Stock Vehicles</h1>
            <PermissionGuard
              requiredPermission={{ resource: 'vehicles', action: 'create' }}
            >
              <Link href="/admin/vehicles/stock/new" className={styles.addButton}>
                Add New Vehicle
              </Link>
            </PermissionGuard>
          </div>
      
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search by make, model, year, or stock #"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <span className={styles.searchIcon}>🔍</span>
        </div>
        
        <div className={styles.filterGroup}>
          <select 
            value={filterMake} 
            onChange={(e) => setFilterMake(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Makes</option>
            {uniqueMakes.map(make => (
              <option key={make} value={make}>{make}</option>
            ))}
          </select>
          
          <button 
            className={styles.filterReset}
            onClick={() => {
              setSearchTerm('');
              setFilterMake('');
            }}
            disabled={!searchTerm && !filterMake}
          >
            Reset Filters
          </button>
        </div>
      </div>
      
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{vehicles.length}</span>
          <span className={styles.statLabel}>Total Stock</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{vehicles.filter((car: any) => car.available || car.status === 'available').length}</span>
          <span className={styles.statLabel}>Available</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{vehicles.filter((car: any) => !car.available && car.status !== 'available').length}</span>
          <span className={styles.statLabel}>Sold</span>
        </div>
      </div>
      
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Image</th>
              <th>Stock #</th>
              <th>Year</th>
              <th>Make</th>
              <th>Model</th>
              <th>Price</th>
              <th>Mileage</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map(car => {
                console.log('Vehicle ID:', car.id, 'Type:', typeof car.id);
                return (
                  <tr key={car.id} className={styles.tableRow}>
                  <td className={styles.imageCell}>
                    <div className={styles.thumbnailContainer}>
                      <Image
                        src={car.image}
                        alt={`${car.year} ${car.make} ${car.model}`}
                        width={80}
                        height={60}
                        className={styles.thumbnail}
                      />
                      {car.badge && (
                        <div 
                          className={styles.tableBadge}
                          style={{ backgroundColor: car.badge.color }}
                        >
                          {car.badge.text}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{car.stockNumber || 'N/A'}</td>
                  <td>{car.year}</td>
                  <td>{car.make}</td>
                  <td>{car.model}</td>
                  <td className={styles.priceCell}>${car.price.toLocaleString()}</td>
                  <td>{car.mileage.toLocaleString()} km</td>
                  <td>
                    <span className={`${styles.statusBadge} ${car.available ? styles.available : styles.sold}`}>
                      {car.available ? 'Available' : 'Sold'}
                    </span>
                  </td>
                  <td className={styles.actionsCell}>
                    <Link href={`/admin/vehicles/stock/${car.id || car._id}`} className={styles.actionButton}>
                      View
                    </Link>
                    <PermissionGuard
                      requiredPermission={{ resource: 'vehicles', action: 'update' }}
                    >
                      <Link href={`/admin/vehicles/stock/${car.id || car._id}/edit`} className={styles.actionButton}>
                        Edit
                      </Link>
                    </PermissionGuard>
                    <PermissionGuard
                      requiredPermission={{ resource: 'vehicles', action: 'delete' }}
                    >
                      <button 
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        onClick={() => openDeleteConfirm(car)}
                        disabled={deleteId === (car.id || car._id)}
                      >
                        {deleteId === (car.id || car._id) ? 'Deleting...' : 'Delete'}
                      </button>
                    </PermissionGuard>
                  </td>
                </tr>
              );
            })
            ) : (
              <tr>
                <td colSpan={9} className={styles.noResults}>
                  No vehicles found matching your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
          </div>
        </div>
        </ProtectedRoute>
      </div>
      
      {/* Delete Confirmation Dialog */}
      {vehicleToDelete && (
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Confirm Delete"
          message={`Are you sure you want to delete this ${vehicleToDelete.year} ${vehicleToDelete.make} ${vehicleToDelete.model}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteVehicle}
          onCancel={closeDeleteConfirm}
        />
      )}
    </div>
  );
}
