'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { carsData } from '@/data/mockData';

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
  vin?: string;
  engine?: string;
  cylinders?: number;
  color?: string;
  doors?: number;
  stockNumber?: string;
  steering?: string;
  badge?: Badge;
}
import AdminHeader from '../../../../../components/admin/AdminHeader';
import AdminSidebar from '../../../../../components/admin/AdminSidebar';
import styles from './vehicleDetail.module.css';

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  // Find the vehicle by ID
  const vehicle = carsData.find(car => car.id === id) as unknown as Car;
  
  // For demo purposes, add a badge to the first vehicle
  if (vehicle && vehicle.id === '1') {
    vehicle.badge = {
      text: 'Hot Stock',
      color: '#ef4444'
    };
  }
  
  // If vehicle not found, show error
  if (!vehicle) {
    return (
      <div className={styles.dashboardLayout}>
        <AdminSidebar />
        <div className={styles.mainContent}>
          <AdminHeader title="Vehicle Not Found" />
          <div className={styles.errorContainer}>
            <h1 className={styles.errorTitle}>Vehicle Not Found</h1>
            <p className={styles.errorMessage}>The vehicle you are looking for does not exist or has been removed.</p>
            <button 
              onClick={() => router.push('/admin/vehicles/stock')}
              className={styles.backButton}
            >
              Back to Stock Vehicles
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
          <button className={styles.deleteButton}>
            Delete Vehicle
          </button>
        </div>
      </div>
      
      <div className={styles.content}>
        <div className={styles.mainInfo}>
          <div className={styles.imageContainer}>
            <Image
              src={vehicle.image}
              alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              width={600}
              height={400}
              className={styles.mainImage}
            />
            <div className={`${styles.statusBadge} ${vehicle.available ? styles.available : styles.sold}`}>
              {vehicle.available ? 'Available' : 'Sold'}
            </div>
            
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
                <span className={`${styles.detailValue} ${vehicle.available ? styles.statusAvailable : styles.statusSold}`}>
                  {vehicle.available ? 'Available' : 'Sold'}
                </span>
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
