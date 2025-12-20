'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { auctionVehicleApi } from '@/lib/api';
import { AuctionCar } from '@/types/auction';
import { AuctionVehicle } from '@/types/auctionVehicle';
import { mapAuctionVehicleToAuctionCar } from '@/utils/auctionUtils';
import styles from './page.module.css';

// Component that uses useParams hook
function AuctionDetailContent() {
  const [car, setCar] = useState<AuctionCar | null>(null);
  const [relatedCars, setRelatedCars] = useState<AuctionCar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get params using the hook instead
  const params = useParams();
  const slug = params.slug as string;
  const normalizedSlug = decodeURIComponent(slug);
  
  useEffect(() => {
    const fetchAuctionVehicle = async () => {
      try {
        setLoading(true);
        
        // Directly fetch the auction vehicle by slug
        const response = await auctionVehicleApi.getAuctionVehicleBySlug(normalizedSlug);
        
        if (response.success && response.data) {
          // Map the vehicle to AuctionCar format
          const foundCar = mapAuctionVehicleToAuctionCar(response.data as AuctionVehicle);
          setCar(foundCar);
          
          // Fetch related cars (same make or model)
          const relatedResponse = await auctionVehicleApi.getAllAuctionVehicles({
            make: foundCar.make,
            model: foundCar.model,
            exclude: foundCar.id,
            limit: 3
          });
          
          if (relatedResponse.success && relatedResponse.data) {
            const related = relatedResponse.data.map((vehicle: AuctionVehicle) => 
              mapAuctionVehicleToAuctionCar(vehicle)
            );
            setRelatedCars(related);
          }
        } else {
          setError('Vehicle not found');
        }
      } catch (err) {
        console.error('Error fetching auction vehicle:', err);
        setError('An error occurred while fetching the auction vehicle');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAuctionVehicle();
  }, [normalizedSlug]);
  
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading auction details...</p>
      </div>
    );
  }
  
  if (error || !car) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>{error || 'Vehicle not found'}</p>
        <Link href="/auction" className={styles.backButton}>
          Back to Auctions
        </Link>
      </div>
    );
  }
  
  const isLive = car.auctionStatus === 'live';
  const isPast = car.auctionStatus === 'past';
  const isUpcoming = car.auctionStatus === 'upcoming';

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <nav className={styles.breadcrumbs}>
          <Link href="/auction">Auction</Link>
          <span>/</span>
          <span>{car.year} {car.make} {car.model}</span>
        </nav>

        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>{car.year} {car.make} {car.model}</h1>
            <p className={styles.subtitle}>
              <span>Auction ID: {car.id}</span>
              <span>• {car.auctionHouse}</span>
              <span>• {car.location}</span>
            </p>
          </div>
          <div className={styles.statusPanel}>
            {isLive && (
              <>
                <span className={styles.statusLabel}>LIVE AUCTION</span>
                <span className={styles.statusValue}>Ends in: {car.timeRemaining}</span>
              </>
            )}
            {isPast && (
              <>
                <span className={styles.statusLabel}>{car.soldStatus === 'sold' ? 'SOLD' : 'UNSOLD'}</span>
                <span className={styles.statusValue}>Auction ended {car.auctionDate}</span>
              </>
            )}
            {isUpcoming && (
              <>
                <span className={styles.statusLabel}>UPCOMING</span>
                <span className={styles.statusValue}>Auction date: {car.auctionDate}</span>
              </>
            )}
          </div>
        </header>

        <div className={styles.mainLayout}>
          <div className={styles.mainContent}>
            <section className={styles.galleryPanel}>
              <div className={styles.primaryImage}>
                <Image
                  src={car.image}
                  alt={`${car.year} ${car.make} ${car.model}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 640px"
                />
              </div>
              {car.images && car.images.length > 1 && (
                <div className={styles.thumbnailStrip}>
                  {car.images.map((imageSrc, index) => (
                    <div
                      key={`${imageSrc}-${index}`}
                      className={index === 0 ? `${styles.thumbnail} ${styles.thumbnailSelected}` : styles.thumbnail}
                    >
                      <Image
                        src={imageSrc}
                        alt={`${car.make} ${car.model} thumbnail ${index + 1}`}
                        fill
                        sizes="96px"
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className={styles.specsSection}>
              <div className={styles.sectionHeader}>
                <h2>Vehicle Specifications</h2>
              </div>
              <div className={styles.specsGrid}>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Make</span>
                  <span className={styles.specValue}>{car.make}</span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Model</span>
                  <span className={styles.specValue}>{car.model}</span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Year</span>
                  <span className={styles.specValue}>{car.year}</span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Mileage</span>
                  <span className={styles.specValue}>{car.mileage.toLocaleString()} km</span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Engine</span>
                  <span className={styles.specValue}>{car.engine}</span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Transmission</span>
                  <span className={styles.specValue}>{car.transmission}</span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Color</span>
                  <span className={styles.specValue}>{car.color}</span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Grade</span>
                  <span className={styles.specValue}>{car.grade}</span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Condition</span>
                  <span className={styles.specValue}>{car.condition}</span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Location</span>
                  <span className={styles.specValue}>{car.location}</span>
                </div>
                {car.inspectionGrade && (
                  <div className={styles.specItem}>
                    <span className={styles.specLabel}>Inspection Grade</span>
                    <span className={styles.specValue}>{car.inspectionGrade}</span>
                  </div>
                )}
                {car.exteriorGrade && (
                  <div className={styles.specItem}>
                    <span className={styles.specLabel}>Exterior Grade</span>
                    <span className={styles.specValue}>{car.exteriorGrade}</span>
                  </div>
                )}
                {car.interiorGrade && (
                  <div className={styles.specItem}>
                    <span className={styles.specLabel}>Interior Grade</span>
                    <span className={styles.specValue}>{car.interiorGrade}</span>
                  </div>
                )}
              </div>
            </section>

            {car.features && car.features.length > 0 && (
              <section className={styles.featuresSection}>
                <div className={styles.sectionHeader}>
                  <h2>Features & Equipment</h2>
                </div>
                <div className={styles.featuresList}>
                  {car.features.map((feature) => (
                    <div key={feature} className={styles.featureItem}>
                      <span>✓</span> {feature}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {car.description && (
              <section className={styles.descriptionSection}>
                <div className={styles.sectionHeader}>
                  <h2>Description</h2>
                </div>
                <div className={styles.descriptionContent}>
                  <p>{car.description}</p>
                </div>
              </section>
            )}
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.bidPanel}>
              <div className={styles.bidHeader}>
                <h2>Auction Information</h2>
              </div>
              
              <div className={styles.bidInfo}>
                <div className={styles.bidRow}>
                  <span>Auction House</span>
                  <strong>{car.auctionHouse}</strong>
                </div>
                <div className={styles.bidRow}>
                  <span>Auction Date</span>
                  <strong>{car.auctionDate}</strong>
                </div>
                
                {isLive && (
                  <>
                    <div className={styles.bidRow}>
                      <span>Current Bid</span>
                      <strong className={styles.currentBid}>¥{car.currentBid.toLocaleString()}</strong>
                    </div>
                    <div className={styles.bidRow}>
                      <span>Time Remaining</span>
                      <strong className={styles.timeRemaining}>{car.timeRemaining}</strong>
                    </div>
                  </>
                )}
                
                {isUpcoming && (
                  <div className={styles.bidRow}>
                    <span>Starting Bid</span>
                    <strong>¥{car.startingBid.toLocaleString()}</strong>
                  </div>
                )}
                
                {isPast && (
                  <div className={styles.bidRow}>
                    <span>Final Price</span>
                    <strong>¥{car.finalPrice?.toLocaleString() || 'N/A'}</strong>
                  </div>
                )}
                
                <div className={styles.bidRow}>
                  <span>Estimated Price</span>
                  <strong>¥{car.estimatedPrice.toLocaleString()}</strong>
                </div>
              </div>
              
              {!isPast && (
                <div className={styles.bidActions}>
                  {isLive ? (
                    <Link href={`/auction/${car.slug}/bid`} className={styles.primaryButton}>
                      Place Bid Now
                    </Link>
                  ) : (
                    <Link href={`/auction/${car.slug}/notify`} className={styles.primaryButton}>
                      Get Notified When Live
                    </Link>
                  )}
                  <Link href="/auction/how-it-works" className={styles.secondaryButton}>
                    How Bidding Works
                  </Link>
                </div>
              )}
              
              {isPast && car.soldStatus === 'unsold' && (
                <div className={styles.bidActions}>
                  <Link href="/contact?inquiry=similar" className={styles.primaryButton}>
                    Find Similar Vehicles
                  </Link>
                </div>
              )}
              
              {isPast && car.soldStatus === 'sold' && (
                <div className={styles.soldNotice}>
                  <p>This vehicle has been sold at auction. Browse our other available vehicles or contact us to find something similar.</p>
                </div>
              )}
            </div>
            
            <div className={styles.contactPanel}>
              <h3>Need Assistance?</h3>
              <p>Our auction specialists can help you with bidding strategy, vehicle inspection reports, and shipping logistics.</p>
              <Link href="/contact?type=auction" className={styles.contactButton}>
                Contact Auction Team
              </Link>
            </div>
            
            {car.inspectionReport && (
              <div className={styles.reportPanel}>
                <h3>Inspection Report</h3>
                <p>Download the detailed inspection report for this vehicle.</p>
                <Link href={car.inspectionReport} className={styles.reportButton}>
                  Download Report
                </Link>
              </div>
            )}
          </aside>
        </div>
        
        {relatedCars.length > 0 && (
          <section className={styles.relatedSection}>
            <div className={styles.sectionHeader}>
              <h2>Similar Vehicles</h2>
              <p>Other vehicles you might be interested in</p>
            </div>
            <div className={styles.relatedGrid}>
              {relatedCars.map((related: AuctionCar) => (
                <article key={related.id} className={styles.relatedCard}>
                  <div className={styles.relatedMedia}>
                    <Image
                      src={related.image}
                      alt={`${related.year} ${related.make} ${related.model}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 240px"
                    />
                    {related.auctionStatus === 'live' && (
                      <div className={styles.relatedBadge}>LIVE</div>
                    )}
                  </div>
                  <div className={styles.relatedContent}>
                    <Link href={`/auction/${related.slug}`} className={styles.relatedTitle}>
                      {related.year} {related.make} {related.model}
                    </Link>
                    <div className={styles.relatedMeta}>
                      <div>
                        <span>
                          {related.auctionStatus === 'past' ? 'Final Price' : 
                           related.auctionStatus === 'live' ? 'Current Bid' : 'Starting Bid'}
                        </span>
                        <strong>
                          ¥{(related.auctionStatus === 'past' && related.finalPrice ? related.finalPrice : 
                             related.auctionStatus === 'live' ? related.currentBid : 
                             related.startingBid).toLocaleString()}
                        </strong>
                      </div>
                      <div>
                        <span>Mileage</span>
                        <strong>{related.mileage.toLocaleString()} km</strong>
                      </div>
                    </div>
                    <Link href={`/auction/${related.slug}`} className={styles.relatedLink}>
                      View Details
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
        
        <section className={styles.processSection}>
          <h2>How Our Auction Service Works</h2>
          <div className={styles.processSteps}>
            <div className={styles.processStep}>
              <div className={styles.stepNumber}>1</div>
              <h3>Browse & Select</h3>
              <p>Find the vehicle you're interested in and review all details</p>
            </div>
            <div className={styles.processStep}>
              <div className={styles.stepNumber}>2</div>
              <h3>Place Your Bid</h3>
              <p>Set your maximum bid and we'll handle the bidding strategy</p>
            </div>
            <div className={styles.processStep}>
              <div className={styles.stepNumber}>3</div>
              <h3>Win & Purchase</h3>
              <p>If your bid wins, we'll handle all paperwork and payment</p>
            </div>
            <div className={styles.processStep}>
              <div className={styles.stepNumber}>4</div>
              <h3>Ship & Deliver</h3>
              <p>We'll arrange shipping to your destination with full tracking</p>
            </div>
          </div>
          <div className={styles.processActions}>
            <Link href="/auction/how-it-works" className={styles.processLink}>
              Learn More About Our Process
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

// Export the main component with Suspense boundary
export default function AuctionDetailPage() {
  return (
    <Suspense fallback={
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading auction details...</p>
      </div>
    }>
      <AuctionDetailContent />
    </Suspense>
  );
}
