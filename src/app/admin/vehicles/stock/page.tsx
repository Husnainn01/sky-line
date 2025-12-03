'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  stockNumber?: string;
  badge?: Badge;
  [key: string]: any; // For other properties
}
import AdminHeader from '../../../../components/admin/AdminHeader';
import AdminSidebar from '../../../../components/admin/AdminSidebar';
import styles from './stock.module.css';

export default function StockVehiclesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMake, setFilterMake] = useState('');
  
  // Filter to only show stock vehicles (not auction)
  const stockVehicles = carsData.filter(car => !car.hasOwnProperty('auctionGrade')) as unknown as Car[];
  
  // For demo purposes, add badges to some vehicles
  if (stockVehicles.length > 0) {
    // Add "Hot Stock" badge to the first vehicle
    stockVehicles[0].badge = {
      text: 'Hot Stock',
      color: '#ef4444'
    };
    
    // Add "50% Off" badge to the second vehicle if it exists
    if (stockVehicles.length > 1) {
      stockVehicles[1].badge = {
        text: '50% Off',
        color: '#f59e0b'
      };
    }
    
    // Add "Winter Special" badge to the third vehicle if it exists
    if (stockVehicles.length > 2) {
      stockVehicles[2].badge = {
        text: 'Winter Special',
        color: '#3b82f6'
      };
    }
  }
  
  // Apply search and make filter
  const filteredVehicles = stockVehicles.filter(car => {
    const matchesSearch = searchTerm 
      ? `${car.year} ${car.make} ${car.model} ${car.stockNumber}`.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    const matchesMake = filterMake 
      ? car.make === filterMake
      : true;
    
    return matchesSearch && matchesMake;
  });
  
  // Get unique makes for filter dropdown
  const uniqueMakes = Array.from(new Set(stockVehicles.map(car => car.make))).sort();
  
  return (
    <div className={styles.dashboardLayout}>
      <AdminSidebar />
      <div className={styles.mainContent}>
        <AdminHeader title="Stock Vehicles" />
        
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Stock Vehicles</h1>
            <Link href="/admin/vehicles/stock/new" className={styles.addButton}>
              Add New Vehicle
            </Link>
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
          <span className={styles.statValue}>{stockVehicles.length}</span>
          <span className={styles.statLabel}>Total Stock</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stockVehicles.filter(car => car.available).length}</span>
          <span className={styles.statLabel}>Available</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stockVehicles.filter(car => !car.available).length}</span>
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
              filteredVehicles.map(car => (
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
                    <Link href={`/admin/vehicles/stock/${car.id}`} className={styles.actionButton}>
                      View
                    </Link>
                    <Link href={`/admin/vehicles/stock/${car.id}/edit`} className={styles.actionButton}>
                      Edit
                    </Link>
                    <button className={`${styles.actionButton} ${styles.deleteButton}`}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
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
      </div>
    </div>
  );
}
