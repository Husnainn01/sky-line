'use client';

import React, { useState } from 'react';
// Import directly with relative paths to fix TypeScript errors
import AdminHeader from '../../../components/admin/AdminHeader';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import VehicleTypeSelector from '../../../components/admin/VehicleTypeSelector';
import styles from './vehicles.module.css';

// Sample data
const sampleVehicles = [
  {
    id: '1',
    type: 'stock',
    year: 2020,
    make: 'Toyota',
    model: 'Supra',
    price: 58000,
    mileage: 15000,
    status: 'available',
    image: '/cars/supra.png'
  },
  {
    id: '2',
    type: 'auction',
    year: 1998,
    make: 'Nissan',
    model: 'Skyline GT-R',
    price: 45000,
    mileage: 80000,
    status: 'auction',
    image: '/cars/gtr.png'
  },
  {
    id: '3',
    type: 'stock',
    year: 1993,
    make: 'Mazda',
    model: 'RX-7',
    price: 38000,
    mileage: 90000,
    status: 'available',
    image: '/cars/rx7.png'
  },
  {
    id: '4',
    type: 'stock',
    year: 2021,
    make: 'Honda',
    model: 'Civic Type R',
    price: 42000,
    mileage: 5000,
    status: 'sold',
    image: '/cars/civic.png'
  },
  {
    id: '5',
    type: 'auction',
    year: 1994,
    make: 'Toyota',
    model: 'Supra',
    price: 85000,
    mileage: 60000,
    status: 'auction',
    image: '/cars/supra.png'
  }
];

export default function VehiclesPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredVehicles = sampleVehicles.filter(vehicle => {
    const matchesType = selectedType ? vehicle.type === selectedType : true;
    const matchesSearch = searchTerm 
      ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    return matchesType && matchesSearch;
  });
  
  return (
    <div className={styles.dashboardLayout}>
      <AdminSidebar />
      <div className={styles.mainContent}>
        <AdminHeader title="Vehicles" />
        
        <div className={styles.pageHeader}>
          <div className={styles.filters}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Search vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            
            <VehicleTypeSelector 
              selectedType={selectedType}
              onChange={setSelectedType}
            />
          </div>
          
          <button className={styles.addButton}>
            Add New Vehicle
          </button>
        </div>
        
        <div className={styles.vehiclesGrid}>
          {filteredVehicles.map(vehicle => (
            <div key={vehicle.id} className={styles.vehicleCard}>
              <div className={styles.vehicleImageContainer}>
                <div className={styles.vehicleType}>
                  {vehicle.type === 'stock' ? 'Stock' : 'Auction'}
                </div>
                <div className={styles.vehicleImage} style={{ backgroundColor: '#eee' }}>
                  {/* Image would go here */}
                  🚗
                </div>
                <div className={`${styles.vehicleStatus} ${styles[vehicle.status]}`}>
                  {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                </div>
              </div>
              
              <div className={styles.vehicleInfo}>
                <h3 className={styles.vehicleTitle}>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h3>
                
                <div className={styles.vehicleDetails}>
                  <div className={styles.vehiclePrice}>${vehicle.price.toLocaleString()}</div>
                  <div className={styles.vehicleMileage}>{vehicle.mileage.toLocaleString()} km</div>
                </div>
                
                <div className={styles.vehicleActions}>
                  <button className={styles.editButton}>Edit</button>
                  <button className={styles.deleteButton}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
