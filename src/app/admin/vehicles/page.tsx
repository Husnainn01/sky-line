'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
// Import directly with relative paths to fix TypeScript errors
import AdminHeader from '../../../components/admin/AdminHeader';
import AdminSidebar from '../../../components/admin/AdminSidebar';
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
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredVehicles = sampleVehicles.filter(vehicle => {
    const matchesType = activeTab === 'all' ? true : vehicle.type === activeTab;
    const matchesSearch = searchTerm 
      ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    return matchesType && matchesSearch;
  });
  
  // Count vehicles by type
  const vehicleCounts = {
    all: sampleVehicles.length,
    stock: sampleVehicles.filter(v => v.type === 'stock').length,
    auction: sampleVehicles.filter(v => v.type === 'auction').length
  };
  
  return (
    <div className={styles.dashboardLayout}>
      <AdminSidebar />
      <div className={styles.mainContent}>
        <AdminHeader title="Vehicles" />
        
        <div className={styles.pageHeader}>
          <div className={styles.searchContainer}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Search vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
          
          <div className={styles.tabsContainer}>
            <button 
              className={`${styles.tabButton} ${activeTab === 'all' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Vehicles
              <span className={styles.tabCount}>{vehicleCounts.all}</span>
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'stock' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('stock')}
            >
              Stock
              <span className={styles.tabCount}>{vehicleCounts.stock}</span>
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'auction' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('auction')}
            >
              Auction
              <span className={styles.tabCount}>{vehicleCounts.auction}</span>
            </button>
          </div>
          
          <Link href="/admin/vehicles/stock/new" className={styles.addButton}>
            <span>Add New Vehicle</span>
          </Link>
        </div>
        
        {filteredVehicles.length > 0 ? (
          <div className={styles.vehicleGrid}>
            {filteredVehicles.map(vehicle => (
              <div key={vehicle.id} className={styles.vehicleCard}>
                <div className={styles.cardImageContainer}>
                  <Image
                    src={vehicle.image}
                    alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    width={300}
                    height={200}
                    className={styles.cardImage}
                  />
                  <div className={styles.cardType}>
                    {vehicle.type === 'stock' ? 'Stock' : 'Auction'}
                  </div>
                  <div className={`${styles.cardTag} ${styles[vehicle.status]}`}>
                    {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                  </div>
                </div>
                
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  
                  <div className={styles.cardPrice}>
                    ${vehicle.price.toLocaleString()}
                  </div>
                  
                  <div className={styles.cardDetails}>
                    <div className={styles.cardDetail}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.6-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
                        <circle cx="7" cy="17" r="2"></circle>
                        <path d="M9 17h6"></path>
                        <circle cx="17" cy="17" r="2"></circle>
                      </svg>
                      <span>{vehicle.mileage.toLocaleString()} km</span>
                    </div>
                  </div>
                </div>
                
                <div className={styles.cardActions}>
                  <Link 
                    href={`/admin/vehicles/${vehicle.type}/${vehicle.id}`} 
                    className={`${styles.cardButton} ${styles.viewButton}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </Link>
                  <Link 
                    href={`/admin/vehicles/${vehicle.type}/${vehicle.id}/edit`} 
                    className={`${styles.cardButton} ${styles.editButton}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </Link>
                  <button className={`${styles.cardButton} ${styles.deleteButton}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noResults}>
            <div className={styles.noResultsIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </div>
            <h3 className={styles.noResultsTitle}>No Vehicles Found</h3>
            <p className={styles.noResultsText}>No vehicles match your search criteria. Try adjusting your filters.</p>
            <button 
              className={styles.resetButton}
              onClick={() => {
                setSearchTerm('');
                setActiveTab('all');
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
