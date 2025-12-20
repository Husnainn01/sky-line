'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { auctionVehicleApi } from '@/lib/api';
import { AuctionCar } from '@/types/auction';
import { AuctionVehicle } from '@/types/auctionVehicle';
import { mapAuctionVehicleToAuctionCar } from '@/utils/auctionUtils';
import styles from './page.module.css';

export default function AuctionPage() {
  const [auctionVehicles, setAuctionVehicles] = useState<AuctionCar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchAuctionVehicles = async () => {
      try {
        setLoading(true);
        // Fetch auction vehicles from the dedicated auction vehicle API
        const response = await auctionVehicleApi.getAllAuctionVehicles();
        
        if (response.success && response.data) {
          // Map the vehicle data to AuctionCar format
          const mappedAuctionCars = response.data.map((vehicle: AuctionVehicle) => 
            mapAuctionVehicleToAuctionCar(vehicle)
          );
          setAuctionVehicles(mappedAuctionCars);
        } else {
          setError('Failed to fetch auction vehicles');
        }
      } catch (err) {
        console.error('Error fetching auction vehicles:', err);
        setError('An error occurred while fetching auction vehicles');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAuctionVehicles();
  }, []);
  
  // Filter auction vehicles by status
  const upcomingAuctions = auctionVehicles.filter(car => car.auctionStatus === 'upcoming');
  const liveAuctions = auctionVehicles.filter(car => car.auctionStatus === 'live');
  const pastAuctions = auctionVehicles.filter(car => car.auctionStatus === 'past');

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>JDM Auction Service</h1>
          <p className={styles.subtitle}>
            Browse upcoming auctions, place bids, and let us handle the entire purchasing process
          </p>
        </header>
        
        {loading && (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading auction vehicles...</p>
          </div>
        )}
        
        {error && (
          <div className={styles.errorContainer}>
            <p className={styles.errorMessage}>{error}</p>
            <button 
              className={styles.retryButton}
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        )}

        <section className={styles.processSection}>
          <h2 className={styles.sectionTitle}>How Our Auction Service Works</h2>
          <div className={styles.processSteps}>
            <div className={styles.processStep}>
              <div className={styles.stepNumber}>1</div>
              <h3>Browse Auctions</h3>
              <p>View upcoming auction vehicles with detailed information and inspection reports</p>
            </div>
            <div className={styles.processStep}>
              <div className={styles.stepNumber}>2</div>
              <h3>Place Your Bid</h3>
              <p>Tell us your maximum bid and we'll handle the bidding strategy</p>
            </div>
            <div className={styles.processStep}>
              <div className={styles.stepNumber}>3</div>
              <h3>We Purchase</h3>
              <p>If your bid wins, we'll handle all purchasing paperwork and logistics</p>
            </div>
            <div className={styles.processStep}>
              <div className={styles.stepNumber}>4</div>
              <h3>Shipping & Delivery</h3>
              <p>We'll arrange shipping to your desired destination with full tracking</p>
            </div>
          </div>
        </section>

        {!loading && !error && liveAuctions.length > 0 && (
          <section className={styles.auctionSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                Live Auctions <span className={styles.liveIndicator}>LIVE NOW</span>
              </h2>
              <p className={styles.sectionDescription}>
                These auctions are happening right now. Contact us immediately to place a bid.
              </p>
            </div>
            <div className={styles.auctionGrid}>
              {liveAuctions.map((car: AuctionCar) => (
                <article key={car.id} className={styles.auctionCard}>
                  <div className={styles.auctionMedia}>
                    <Image
                      src={car.image}
                      alt={`${car.year} ${car.make} ${car.model}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className={styles.auctionBadge}>LIVE</div>
                    <div className={styles.auctionTimer}>
                      Ends in: <span>{car.timeRemaining}</span>
                    </div>
                  </div>
                  <div className={styles.auctionContent}>
                    <Link href={`/auction/${car.slug}`} className={styles.auctionTitle}>
                      {car.year} {car.make} {car.model}
                    </Link>
                    <div className={styles.auctionMeta}>
                      <div>
                        <span>Current Bid</span>
                        <strong>¥{car.currentBid.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span>Est. Price</span>
                        <strong>¥{car.estimatedPrice.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span>Mileage</span>
                        <strong>{car.mileage.toLocaleString()} km</strong>
                      </div>
                    </div>
                    <div className={styles.auctionSpecs}>
                      <div>
                        <span>Engine</span>
                        <strong>{car.engine}</strong>
                      </div>
                      <div>
                        <span>Transmission</span>
                        <strong>{car.transmission}</strong>
                      </div>
                      <div>
                        <span>Grade</span>
                        <strong>{car.grade}</strong>
                      </div>
                    </div>
                    <div className={styles.auctionActions}>
                      <Link href={`/auction/${car.slug}`} className={styles.auctionDetailsButton}>
                        View Details
                      </Link>
                      <Link href={`/auction/${car.slug}/bid`} className={styles.auctionBidButton}>
                        Place Bid
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {!loading && !error && upcomingAuctions.length > 0 && (
          <section className={styles.auctionSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Upcoming Auctions</h2>
              <p className={styles.sectionDescription}>
                Browse vehicles that will be available at upcoming auctions and prepare your bids.
              </p>
            </div>
            <div className={styles.auctionGrid}>
            {upcomingAuctions.map((car: AuctionCar) => (
              <article key={car.id} className={styles.auctionCard}>
                <div className={styles.auctionMedia}>
                  <Image
                    src={car.image}
                    alt={`${car.year} ${car.make} ${car.model}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className={styles.auctionDate}>
                    {car.auctionDate}
                  </div>
                </div>
                <div className={styles.auctionContent}>
                  <Link href={`/auction/${car.slug}`} className={styles.auctionTitle}>
                    {car.year} {car.make} {car.model}
                  </Link>
                  <div className={styles.auctionMeta}>
                    <div>
                      <span>Starting Bid</span>
                      <strong>¥{car.startingBid.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span>Est. Price</span>
                      <strong>¥{car.estimatedPrice.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span>Mileage</span>
                      <strong>{car.mileage.toLocaleString()} km</strong>
                    </div>
                  </div>
                  <div className={styles.auctionSpecs}>
                    <div>
                      <span>Engine</span>
                      <strong>{car.engine}</strong>
                    </div>
                    <div>
                      <span>Transmission</span>
                      <strong>{car.transmission}</strong>
                    </div>
                    <div>
                      <span>Grade</span>
                      <strong>{car.grade}</strong>
                    </div>
                  </div>
                  <div className={styles.auctionActions}>
                    <Link href={`/auction/${car.slug}`} className={styles.auctionDetailsButton}>
                      View Details
                    </Link>
                    <Link href={`/auction/${car.slug}/notify`} className={styles.auctionNotifyButton}>
                      Get Notified
                    </Link>
                  </div>
                </div>
              </article>
            ))}
            </div>
          </section>
        )}

        {!loading && !error && pastAuctions.length > 0 && (
          <section className={styles.auctionSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Past Auction Results</h2>
              <p className={styles.sectionDescription}>
                View recent auction results to understand market trends and pricing.
              </p>
            </div>
            <div className={styles.auctionGrid}>
            {pastAuctions.map((car: AuctionCar) => (
              <article key={car.id} className={styles.auctionCard}>
                <div className={styles.auctionMedia}>
                  <Image
                    src={car.image}
                    alt={`${car.year} ${car.make} ${car.model}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className={`${styles.auctionBadge} ${styles.auctionBadgePast}`}>
                    {car.soldStatus === 'sold' ? 'SOLD' : 'UNSOLD'}
                  </div>
                </div>
                <div className={styles.auctionContent}>
                  <Link href={`/auction/${car.slug}`} className={styles.auctionTitle}>
                    {car.year} {car.make} {car.model}
                  </Link>
                  <div className={styles.auctionMeta}>
                    <div>
                      <span>Final Price</span>
                      <strong>¥{car.finalPrice?.toLocaleString() || 'N/A'}</strong>
                    </div>
                    <div>
                      <span>Est. Price</span>
                      <strong>¥{car.estimatedPrice.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span>Mileage</span>
                      <strong>{car.mileage.toLocaleString()} km</strong>
                    </div>
                  </div>
                  <div className={styles.auctionSpecs}>
                    <div>
                      <span>Engine</span>
                      <strong>{car.engine}</strong>
                    </div>
                    <div>
                      <span>Transmission</span>
                      <strong>{car.transmission}</strong>
                    </div>
                    <div>
                      <span>Grade</span>
                      <strong>{car.grade}</strong>
                    </div>
                  </div>
                  <div className={styles.auctionActions}>
                    <Link href={`/auction/${car.slug}`} className={styles.auctionDetailsButton}>
                      View Details
                    </Link>
                    <Link href={`/contact?inquiry=similar&carId=${car.slug}`} className={styles.auctionSimilarButton}>
                      Find Similar
                    </Link>
                  </div>
                </div>
              </article>
            ))}
            </div>
          </section>
        )}

        <section className={styles.faqSection}>
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3>How do I place a bid?</h3>
              <p>
                You can place a bid by viewing an auction vehicle's details and clicking the "Place Bid" button. 
                Our team will contact you to confirm your maximum bid amount and handle the bidding process on your behalf.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>What fees are involved?</h3>
              <p>
                Our service fee is 5% of the winning bid amount. Additional costs include auction house fees, 
                transportation within Japan, export paperwork, and shipping to your destination.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>How long does shipping take?</h3>
              <p>
                Shipping duration depends on your location. Typically, it takes 4-8 weeks from auction win to 
                arrival at your destination port, including all processing and transit time.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>What if I win multiple auctions?</h3>
              <p>
                We can consolidate multiple vehicles into a single shipping container when possible, 
                which can reduce your overall shipping costs significantly.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2>Ready to find your dream JDM car at auction?</h2>
            <p>
              Our team of experts will guide you through the entire process, from bidding to delivery.
            </p>
            <div className={styles.ctaButtons}>
              <Link href="/contact?type=auction" className={styles.ctaPrimaryButton}>
                Contact Our Auction Team
              </Link>
              <Link href="/auction/how-it-works" className={styles.ctaSecondaryButton}>
                Read Auction Guide
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
