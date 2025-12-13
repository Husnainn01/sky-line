'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { auctionService } from '@/lib/auctionService';
import { AuctionCar } from '@/types/auction';
import AdminHeader from '../../../../components/admin/AdminHeader';
import AdminSidebar from '../../../../components/admin/AdminSidebar';
import ProtectedRoute from '../../../../components/admin/ProtectedRoute';
import PermissionGuard from '../../../../components/admin/PermissionGuard';
import styles from './auction.module.css';

type AuctionStatus = 'all' | 'live' | 'upcoming' | 'past';

export default function AuctionVehiclesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AuctionStatus>('all');
  const [auctionCars, setAuctionCars] = useState<AuctionCar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  // Fetch auction cars from API
  useEffect(() => {
    const fetchAuctionCars = async () => {
      try {
        setLoading(true);
        const cars = await auctionService.getAllAuctionVehicles();
        setAuctionCars(cars);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching auction cars:', err);
        setError('Failed to load auction vehicles. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchAuctionCars();
  }, []);
  
  // Apply search and status filter
  const filteredVehicles = auctionCars.filter(car => {
    const matchesSearch = searchTerm 
      ? `${car.year} ${car.make} ${car.model} ${car.auctionHouse}`.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    const matchesStatus = statusFilter === 'all' 
      ? true 
      : car.auctionStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Count vehicles by status
  const liveCount = auctionCars.filter(car => car.auctionStatus === 'live').length;
  const upcomingCount = auctionCars.filter(car => car.auctionStatus === 'upcoming').length;
  const pastCount = auctionCars.filter(car => car.auctionStatus === 'past').length;
  
  // Format currency in JPY
  const formatJPY = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', { 
      style: 'currency', 
      currency: 'JPY',
      maximumFractionDigits: 0 
    }).format(amount);
  };
  
  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'live':
        return styles.liveBadge;
      case 'upcoming':
        return styles.upcomingBadge;
      case 'past':
        return styles.pastBadge;
      default:
        return '';
    }
  };
  
  // Get sold status badge class
  const getSoldBadgeClass = (status?: string) => {
    switch (status) {
      case 'sold':
        return styles.soldBadge;
      case 'unsold':
        return styles.unsoldBadge;
      default:
        return '';
    }
  };
  
  // Handle vehicle deletion
  const handleDeleteVehicle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this auction vehicle? This action cannot be undone.')) {
      return;
    }
    
    try {
      setDeleteLoading(id);
      setDeleteError(null);
      
      // Call API to delete auction vehicle
      await auctionService.deleteAuctionVehicle(id);
      
      // Remove vehicle from state
      setAuctionCars(prevCars => prevCars.filter(car => car.id !== id));
      
      setDeleteLoading(null);
    } catch (err) {
      console.error(`Error deleting auction vehicle with ID ${id}:`, err);
      setDeleteError(`Failed to delete auction vehicle. Please try again.`);
      setDeleteLoading(null);
    }
  };
  
  return (
    <div className={styles.dashboardLayout}>
      <AdminSidebar />
      <div className={styles.mainContent}>
        <AdminHeader title="Auction Vehicles" />
        
        <ProtectedRoute
          requiredPermission={{ resource: 'vehicles', action: 'read' }}
        >
          <div className={styles.container}>
          <div className={styles.header}>
            <PermissionGuard
              requiredPermission={{ resource: 'vehicles', action: 'create' }}
            >
              <Link href="/admin/vehicles/auction/new" className={styles.addButton}>
                Add New Auction
              </Link>
            </PermissionGuard>
            {loading && <span className={styles.loadingText}>Loading auction data...</span>}
            {error && <span className={styles.errorText}>{error}</span>}
            {deleteError && <span className={styles.errorText}>{deleteError}</span>}
          </div>
          
          <div className={styles.filters}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Search by make, model, year, or auction house"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              <span className={styles.searchIcon}>🔍</span>
            </div>
            
            <div className={styles.tabsContainer}>
              <button 
                className={`${styles.tabButton} ${statusFilter === 'all' ? styles.activeTab : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All
              </button>
              <button 
                className={`${styles.tabButton} ${statusFilter === 'live' ? styles.activeTab : ''}`}
                onClick={() => setStatusFilter('live')}
              >
                Live
              </button>
              <button 
                className={`${styles.tabButton} ${statusFilter === 'upcoming' ? styles.activeTab : ''}`}
                onClick={() => setStatusFilter('upcoming')}
              >
                Upcoming
              </button>
              <button 
                className={`${styles.tabButton} ${statusFilter === 'past' ? styles.activeTab : ''}`}
                onClick={() => setStatusFilter('past')}
              >
                Past
              </button>
            </div>
          </div>
          
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{auctionCars.length}</span>
              <span className={styles.statLabel}>Total Auctions</span>
            </div>
            <div className={styles.statCard}>
              <span className={`${styles.statValue} ${styles.liveValue}`}>{liveCount}</span>
              <span className={styles.statLabel}>Live Now</span>
            </div>
            <div className={styles.statCard}>
              <span className={`${styles.statValue} ${styles.upcomingValue}`}>{upcomingCount}</span>
              <span className={styles.statLabel}>Upcoming</span>
            </div>
            <div className={styles.statCard}>
              <span className={`${styles.statValue} ${styles.pastValue}`}>{pastCount}</span>
              <span className={styles.statLabel}>Past Auctions</span>
            </div>
          </div>
          
          <div className={styles.tableContainer}>
            <table className={styles.table} style={{ minWidth: '900px' }}>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Vehicle</th>
                  <th>Auction House</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Starting Bid</th>
                  <th>Current Bid</th>
                  <th>Est. Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className={styles.loadingCell}>
                      <div className={styles.loadingSpinner}></div>
                      <p>Loading auction vehicles...</p>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={9} className={styles.errorCell}>
                      <p>{error}</p>
                      <button 
                        onClick={() => window.location.reload()}
                        className={styles.retryButton}
                      >
                        Retry
                      </button>
                    </td>
                  </tr>
                ) : filteredVehicles.length > 0 ? (
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
                        </div>
                      </td>
                      <td className={styles.vehicleCell}>
                        <div className={styles.vehicleName}>
                          {car.year} {car.make} {car.model}
                        </div>
                        <div className={styles.vehicleDetails}>
                          {car.grade} Grade • {car.mileage.toLocaleString()} km
                        </div>
                      </td>
                      <td>{car.auctionHouse}</td>
                      <td>{car.auctionDate}</td>
                      <td>
                        {car.auctionStatus === 'live' && (
                          <div className={styles.statusContainer}>
                            <span className={styles.liveBadge}>Live</span>
                            {car.timeRemaining && (
                              <span className={styles.timeRemaining}>{car.timeRemaining} left</span>
                            )}
                          </div>
                        )}
                        {car.auctionStatus === 'upcoming' && (
                          <span className={styles.upcomingBadge}>Upcoming</span>
                        )}
                        {car.auctionStatus === 'past' && (
                          <div className={styles.statusContainer}>
                            <span className={styles.pastBadge}>Past</span>
                            {car.soldStatus && (
                              <span className={`${styles.soldStatusBadge} ${getSoldBadgeClass(car.soldStatus)}`}>
                                {car.soldStatus === 'sold' ? 'Sold' : 'Unsold'}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className={styles.bidCell}>{formatJPY(car.startingBid)}</td>
                      <td className={styles.bidCell}>
                        {formatJPY(car.currentBid)}
                        {car.auctionStatus === 'past' && car.finalPrice && (
                          <div className={styles.finalPrice}>
                            Final: {formatJPY(car.finalPrice)}
                          </div>
                        )}
                      </td>
                      <td className={styles.bidCell}>{formatJPY(car.estimatedPrice)}</td>
                      <td className={styles.actionsCell}>
                        <Link href={`/admin/vehicles/auction/${car.id}`} className={styles.actionButton}>
                          View
                        </Link>
                        <PermissionGuard
                          requiredPermission={{ resource: 'vehicles', action: 'update' }}
                        >
                          <Link href={`/admin/vehicles/auction/${car.id}/edit`} className={styles.actionButton}>
                            Edit
                          </Link>
                        </PermissionGuard>
                        <PermissionGuard
                          requiredPermission={{ resource: 'vehicles', action: 'delete' }}
                        >
                          <button 
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            onClick={() => handleDeleteVehicle(car.id)}
                            disabled={deleteLoading === car.id}
                          >
                            {deleteLoading === car.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </PermissionGuard>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className={styles.noResults}>
                      No auction vehicles found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        </ProtectedRoute>
      </div>
    </div>
  );
}
