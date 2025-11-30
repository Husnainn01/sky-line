import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auctionCarsData } from '@/data';
import { AuctionCar } from '@/types/auction';
import styles from './page.module.css';

const fallbackCar = auctionCarsData[0];

export default function BidPage({ params }: { params: { slug: string } }) {
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const normalizedSlug = decodeURIComponent(slug);
  const car = auctionCarsData.find((car: AuctionCar) => car.slug === normalizedSlug) || fallbackCar;
  
  if (!car) {
    notFound();
  }

  // Only allow bidding on live auctions
  if (car.auctionStatus !== 'live') {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.notAvailable}>
            <h1>Bidding Not Available</h1>
            <p>
              This vehicle is not currently available for bidding.
              {car.auctionStatus === 'upcoming' ? 
                ' The auction has not started yet.' : 
                ' The auction has already ended.'}
            </p>
            <div className={styles.actions}>
              <Link href={`/auction/${car.slug}`} className={styles.primaryButton}>
                Return to Vehicle Details
              </Link>
              <Link href="/auction" className={styles.secondaryButton}>
                Browse All Auctions
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <nav className={styles.breadcrumbs}>
          <Link href="/auction">Auction</Link>
          <span>/</span>
          <Link href={`/auction/${car.slug}`}>{car.year} {car.make} {car.model}</Link>
          <span>/</span>
          <span>Place Bid</span>
        </nav>

        <div className={styles.bidLayout}>
          <div className={styles.bidContent}>
            <header className={styles.header}>
              <h1 className={styles.title}>Place Bid</h1>
              <p className={styles.subtitle}>
                {car.year} {car.make} {car.model}
              </p>
            </header>

            <div className={styles.vehiclePreview}>
              <div className={styles.vehicleImage}>
                <Image
                  src={car.image}
                  alt={`${car.year} ${car.make} ${car.model}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
              <div className={styles.vehicleInfo}>
                <div className={styles.infoRow}>
                  <span>Auction House</span>
                  <strong>{car.auctionHouse}</strong>
                </div>
                <div className={styles.infoRow}>
                  <span>Current Bid</span>
                  <strong className={styles.currentBid}>¥{car.currentBid.toLocaleString()}</strong>
                </div>
                <div className={styles.infoRow}>
                  <span>Estimated Price</span>
                  <strong>¥{car.estimatedPrice.toLocaleString()}</strong>
                </div>
                <div className={styles.infoRow}>
                  <span>Time Remaining</span>
                  <strong className={styles.timeRemaining}>{car.timeRemaining}</strong>
                </div>
              </div>
            </div>

            <div className={styles.bidForm}>
              <div className={styles.formSection}>
                <h2>Your Bid Information</h2>
                <p className={styles.formHelper}>
                  Set your maximum bid amount. We'll bid strategically on your behalf up to this amount.
                </p>
                
                <div className={styles.formGroup}>
                  <label htmlFor="bidAmount">Maximum Bid Amount (JPY)</label>
                  <div className={styles.inputWithPrefix}>
                    <span className={styles.inputPrefix}>¥</span>
                    <input 
                      type="text" 
                      id="bidAmount" 
                      placeholder="e.g. 8,500,000" 
                      className={styles.formInput} 
                    />
                  </div>
                  <div className={styles.inputHelp}>
                    Minimum bid increment: ¥10,000
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="bidNotes">Notes (Optional)</label>
                  <textarea 
                    id="bidNotes" 
                    placeholder="Any special instructions or questions about your bid" 
                    className={styles.formTextarea}
                    rows={3}
                  ></textarea>
                </div>
              </div>
              
              <div className={styles.formSection}>
                <h2>Your Contact Information</h2>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="fullName">Full Name</label>
                    <input type="text" id="fullName" className={styles.formInput} />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="email">Email Address</label>
                    <input type="email" id="email" className={styles.formInput} />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="phone">Phone Number</label>
                    <input type="tel" id="phone" className={styles.formInput} />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="country">Country</label>
                    <input type="text" id="country" className={styles.formInput} />
                  </div>
                </div>
              </div>
              
              <div className={styles.formSection}>
                <h2>Shipping & Delivery</h2>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="destination">Destination Port</label>
                    <input type="text" id="destination" className={styles.formInput} />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="shippingMethod">Preferred Shipping Method</label>
                    <select id="shippingMethod" className={styles.formSelect}>
                      <option value="">Select an option</option>
                      <option value="container">Container (Shared)</option>
                      <option value="roro">RoRo (Roll-on/Roll-off)</option>
                      <option value="air">Air Freight (Premium)</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className={styles.termsSection}>
                <div className={styles.termsCheck}>
                  <input type="checkbox" id="termsAgree" className={styles.checkbox} />
                  <label htmlFor="termsAgree">
                    I agree to the <Link href="/terms">Terms and Conditions</Link> and understand the bidding process
                  </label>
                </div>
              </div>
              
              <div className={styles.formActions}>
                <button type="button" className={styles.submitButton}>
                  Submit Bid Request
                </button>
                <Link href={`/auction/${car.slug}`} className={styles.cancelButton}>
                  Cancel
                </Link>
              </div>
            </div>
          </div>
          
          <aside className={styles.bidSidebar}>
            <div className={styles.infoPanel}>
              <h2>How Bidding Works</h2>
              <ol className={styles.infoList}>
                <li>
                  <strong>Submit Your Maximum Bid</strong>
                  <p>Tell us the maximum amount you're willing to pay for this vehicle.</p>
                </li>
                <li>
                  <strong>We Contact You</strong>
                  <p>Our auction specialists will contact you to confirm your bid and discuss strategy.</p>
                </li>
                <li>
                  <strong>We Bid On Your Behalf</strong>
                  <p>Our team will represent you at the auction, bidding strategically up to your maximum.</p>
                </li>
                <li>
                  <strong>Win Notification</strong>
                  <p>If your bid wins, we'll notify you immediately and handle all paperwork and payment.</p>
                </li>
              </ol>
            </div>
            
            <div className={styles.feePanel}>
              <h2>Fees & Charges</h2>
              <div className={styles.feeList}>
                <div className={styles.feeItem}>
                  <span>Our Service Fee</span>
                  <strong>5% of winning bid</strong>
                </div>
                <div className={styles.feeItem}>
                  <span>Auction House Fee</span>
                  <strong>¥50,000 - ¥100,000</strong>
                </div>
                <div className={styles.feeItem}>
                  <span>Export Paperwork</span>
                  <strong>¥25,000 - ¥45,000</strong>
                </div>
                <div className={styles.feeItem}>
                  <span>Shipping (Varies)</span>
                  <strong>Quote on request</strong>
                </div>
              </div>
              <div className={styles.feeNote}>
                <p>All fees will be detailed in your final invoice if your bid is successful.</p>
              </div>
            </div>
            
            <div className={styles.contactPanel}>
              <h2>Need Assistance?</h2>
              <p>Our auction specialists are available to help with any questions about this vehicle or the bidding process.</p>
              <div className={styles.contactInfo}>
                <div className={styles.contactItem}>
                  <span>Phone</span>
                  <strong>+81 3-1234-5678</strong>
                </div>
                <div className={styles.contactItem}>
                  <span>Email</span>
                  <strong>auctions@skylinejdm.com</strong>
                </div>
              </div>
              <Link href="/contact?type=auction" className={styles.contactButton}>
                Contact Auction Team
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
