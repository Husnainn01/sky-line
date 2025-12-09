'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { auctionService } from '@/lib/auctionService';
import { AuctionCar } from '@/types/auction';
import AdminHeader from '../../../../../components/admin/AdminHeader';
import AdminSidebar from '../../../../../components/admin/AdminSidebar';
import styles from './auctionDetail.module.css';

export default function AuctionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [auction, setAuction] = useState<AuctionCar | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch auction vehicle by ID
  useEffect(() => {
    const fetchAuctionVehicle = async () => {
      try {
        setLoading(true);
        const auctionVehicle = await auctionService.getAuctionVehicleById(id);
        setAuction(auctionVehicle);
        setLoading(false);
      } catch (err) {
        console.error(`Error fetching auction vehicle with ID ${id}:`, err);
        setError('Failed to load auction vehicle. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchAuctionVehicle();
  }, [id]);
  
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
  
  // Show loading state
  if (loading) {
    return (
      <div className={styles.dashboardLayout}>
        <AdminSidebar />
        <div className={styles.mainContent}>
          <AdminHeader title="Loading Auction..." />
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p className={styles.loadingMessage}>Loading auction details...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error || !auction) {
    return (
      <div className={styles.dashboardLayout}>
        <AdminSidebar />
        <div className={styles.mainContent}>
          <AdminHeader title="Auction Not Found" />
          <div className={styles.errorContainer}>
            <h1 className={styles.errorTitle}>Auction Not Found</h1>
            <p className={styles.errorMessage}>The auction you are looking for does not exist or has been removed.</p>
            <button 
              onClick={() => router.push('/admin/vehicles/auction')}
              className={styles.backButton}
            >
              Back to Auction Vehicles
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
        <AdminHeader title={`${auction.year} ${auction.make} ${auction.model}`} />
        
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.breadcrumbs}>
              <Link href="/admin/vehicles/auction" className={styles.breadcrumbLink}>
                Auction Vehicles
              </Link>
              <span className={styles.breadcrumbSeparator}>/</span>
              <span className={styles.breadcrumbCurrent}>{auction.year} {auction.make} {auction.model}</span>
            </div>
            
            <div className={styles.actions}>
              <Link href={`/admin/vehicles/auction/${id}/edit`} className={styles.editButton}>
                Edit Auction
              </Link>
              <button className={styles.deleteButton}>
                Delete Auction
              </button>
            </div>
          </div>
          
          <div className={styles.content}>
            <div className={styles.mainInfo}>
              <div className={styles.imageContainer}>
                <Image
                  src={auction.image}
                  alt={`${auction.year} ${auction.make} ${auction.model}`}
                  width={600}
                  height={400}
                  className={styles.mainImage}
                />
                <div className={`${styles.statusBadge} ${getStatusBadgeClass(auction.auctionStatus)}`}>
                  {auction.auctionStatus === 'live' ? 'Live Auction' : 
                   auction.auctionStatus === 'upcoming' ? 'Upcoming Auction' : 'Past Auction'}
                </div>
                {auction.auctionStatus === 'live' && auction.timeRemaining && (
                  <div className={styles.timeRemainingBadge}>
                    {auction.timeRemaining} left
                  </div>
                )}
              </div>
              
              <div className={styles.infoCard}>
                <h1 className={styles.vehicleTitle}>
                  {auction.year} {auction.make} {auction.model}
                </h1>
                
                <div className={styles.auctionInfo}>
                  <div className={styles.auctionDetail}>
                    <span className={styles.detailLabel}>Auction House</span>
                    <span className={styles.detailValue}>{auction.auctionHouse}</span>
                  </div>
                  <div className={styles.auctionDetail}>
                    <span className={styles.detailLabel}>Auction Date</span>
                    <span className={styles.detailValue}>{auction.auctionDate}</span>
                  </div>
                  <div className={styles.auctionDetail}>
                    <span className={styles.detailLabel}>Location</span>
                    <span className={styles.detailValue}>{auction.location}</span>
                  </div>
                </div>
                
                <div className={styles.bidInfo}>
                  <div className={styles.bidCard}>
                    <div className={styles.bidLabel}>Starting Bid</div>
                    <div className={styles.bidAmount}>{formatJPY(auction.startingBid)}</div>
                  </div>
                  <div className={styles.bidCard}>
                    <div className={styles.bidLabel}>Current Bid</div>
                    <div className={styles.bidAmount}>{formatJPY(auction.currentBid)}</div>
                  </div>
                  <div className={styles.bidCard}>
                    <div className={styles.bidLabel}>Estimated Price</div>
                    <div className={styles.bidAmount}>{formatJPY(auction.estimatedPrice)}</div>
                  </div>
                </div>
                
                {auction.auctionStatus === 'past' && (
                  <div className={styles.resultCard}>
                    <h3 className={styles.resultTitle}>Auction Result</h3>
                    <div className={styles.resultContent}>
                      <div className={styles.resultStatus}>
                        <span className={styles.resultLabel}>Status:</span>
                        <span className={`${styles.resultValue} ${auction.soldStatus === 'sold' ? styles.soldText : styles.unsoldText}`}>
                          {auction.soldStatus === 'sold' ? 'Sold' : 'Unsold'}
                        </span>
                      </div>
                      {auction.finalPrice && (
                        <div className={styles.resultFinal}>
                          <span className={styles.resultLabel}>Final Price:</span>
                          <span className={styles.resultValue}>{formatJPY(auction.finalPrice)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {auction.description && (
                  <div className={styles.description}>{auction.description}</div>
                )}
                
                {auction.features && auction.features.length > 0 && (
                  <div className={styles.featuresSection}>
                    <h3 className={styles.sectionTitle}>Features</h3>
                    <div className={styles.featuresList}>
                      {auction.features.map((feature, index) => (
                        <div key={index} className={styles.featureBadge}>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className={styles.detailsGrid}>
              <div className={styles.detailCard}>
                <h3 className={styles.detailTitle}>Vehicle Details</h3>
                <div className={styles.detailsTable}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Make</span>
                    <span className={styles.detailValue}>{auction.make}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Model</span>
                    <span className={styles.detailValue}>{auction.model}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Year</span>
                    <span className={styles.detailValue}>{auction.year}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Mileage</span>
                    <span className={styles.detailValue}>{auction.mileage.toLocaleString()} km</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Color</span>
                    <span className={styles.detailValue}>{auction.color}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Condition</span>
                    <span className={styles.detailValue}>{auction.condition}</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.detailCard}>
                <h3 className={styles.detailTitle}>Engine & Transmission</h3>
                <div className={styles.detailsTable}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Engine</span>
                    <span className={styles.detailValue}>{auction.engine}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Transmission</span>
                    <span className={styles.detailValue}>{auction.transmission}</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.detailCard}>
                <h3 className={styles.detailTitle}>Inspection Details</h3>
                <div className={styles.detailsTable}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Overall Grade</span>
                    <span className={styles.detailValue}>{auction.grade}</span>
                  </div>
                  {auction.inspectionGrade && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Inspection Grade</span>
                      <span className={styles.detailValue}>{auction.inspectionGrade}</span>
                    </div>
                  )}
                  {auction.exteriorGrade && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Exterior Grade</span>
                      <span className={styles.detailValue}>{auction.exteriorGrade}</span>
                    </div>
                  )}
                  {auction.interiorGrade && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Interior Grade</span>
                      <span className={styles.detailValue}>{auction.interiorGrade}</span>
                    </div>
                  )}
                  {auction.inspectionReport && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Inspection Report</span>
                      <a href={auction.inspectionReport} target="_blank" rel="noopener noreferrer" className={styles.reportLink}>
                        View Report
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {auction.auctionStatus === 'live' && (
              <div className={styles.actionSection}>
                <h3 className={styles.actionTitle}>Auction Actions</h3>
                <div className={styles.actionButtons}>
                  <button className={styles.actionButton}>
                    Update Current Bid
                  </button>
                  <button className={styles.actionButton}>
                    Mark as Sold
                  </button>
                  <button className={styles.actionButton}>
                    End Auction
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
