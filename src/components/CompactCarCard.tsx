'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Car } from '@/types';
import styles from './CompactCarCard.module.css';

interface CompactCarCardProps {
    car: Car;
    stockNumber?: string;
}

export default function CompactCarCard({ car, stockNumber }: CompactCarCardProps) {
    const stock = stockNumber || `SKY-${car.id.padStart(4, '0')}`;
    const formattedMileage = `${car.mileage.toLocaleString()} km`;

    return (
        <Link href={`/inventory/${car.slug}`} className={styles.card}>
            {/* Favorite Icon */}
            <button className={styles.favoriteButton} onClick={(e) => e.preventDefault()}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
            </button>

            {/* Stock Number */}
            <div className={styles.stockBadge}>
                Stock: #{stock}
            </div>

            {/* Status Badge */}
            {car.status === 'sold' && (
                <div className={styles.soldBadge}>SOLD</div>
            )}
            {car.status === 'shipping' && (
                <div className={styles.soldBadge} style={{ backgroundColor: '#3b82f6' }}>SHIPPING</div>
            )}
            {car.status === 'auction' && (
                <div className={styles.soldBadge} style={{ backgroundColor: '#8b5cf6' }}>AUCTION</div>
            )}

            {/* Car Image */}
            <div className={styles.imageContainer}>
                <Image
                    src={car.image}
                    alt={`${car.year} ${car.make} ${car.model}`}
                    width={300}
                    height={200}
                    className={styles.image}
                />
            </div>

            {/* Card Content */}
            <div className={styles.content}>
                {/* Title and Price */}
                <div className={styles.header}>
                    <h3 className={styles.title}>{car.make} {car.model}</h3>
                    <p className={styles.price}>${car.price.toLocaleString()}</p>
                </div>

                {/* Condition */}
                <p className={styles.condition}>{car.condition}</p>

                {/* Specs */}
                <div className={styles.specList}>
                    <div className={styles.specEntry}>
                        <svg className={styles.specIcon} viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                        </svg>
                        <span>{car.make}</span>
                    </div>
                    <div className={styles.specEntry}>
                        <svg className={styles.specIcon} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span>{car.year}</span>
                    </div>
                    <div className={styles.specEntry}>
                        <svg className={styles.specIcon} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span>{formattedMileage}</span>
                    </div>
                </div>

                <div className={styles.ctaRow}>
                    <span className={styles.viewButton}>
                        View Details
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M4 10h12" strokeLinecap="round" />
                            <path d="M11 6l5 4-5 4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                </div>
            </div>
        </Link>
    );
}
