'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Car } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useSavedVehicles } from '@/contexts/SavedVehiclesContext';
import styles from './CompactCarCard.module.css';
import TranslatableText from './TranslatableText';

interface CompactCarCardProps {
    car: Car;
    stockNumber?: string;
}

export default function CompactCarCard({ car, stockNumber }: CompactCarCardProps) {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const stock = stockNumber || `SKY-${car.id.padStart(4, '0')}`;
    const formattedMileage = `${car.mileage.toLocaleString()} km`;
    const { isSaved, saveVehicle, unsaveVehicle, isLoading } = useSavedVehicles();
    const [showAuthModal, setShowAuthModal] = useState(false);
    
    // Handle like/save button click
    const handleSaveClick = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation
        e.stopPropagation(); // Prevent event bubbling
        
        // Check if user is authenticated
        if (!isAuthenticated) {
            // Redirect to login page with return URL
            router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
        }
        
        if (!car || !car.id) return;
        
        try {
            if (isSaved(car.id)) {
                // Unsave the vehicle
                await unsaveVehicle(car.id);
            } else {
                // Save the vehicle
                await saveVehicle(car.id);
            }
        } catch (error) {
            console.error('Error saving/unsaving vehicle:', error);
        }
    };

    return (
        <Link href={`/inventory/${car.slug}`} className={styles.card}>
            {/* Favorite Icon */}
            <button 
                className={`${styles.favoriteButton} ${isSaved(car.id) ? styles.favoriteActive : ''}`} 
                onClick={handleSaveClick}
                disabled={isLoading}
                aria-label={isSaved(car.id) ? 'Remove from favorites' : 'Add to favorites'}
                title={isSaved(car.id) ? 'Remove from favorites' : 'Add to favorites'}
            >
                <svg viewBox="0 0 24 24" fill={isSaved(car.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
            </button>

            {/* Stock Number */}
            <div className={styles.stockBadge}>
                {stock}
            </div>

            {/* Status Badge */}
            {(!car.available || car.status === 'sold') && (
                <div className={styles.soldBadge}><TranslatableText text="SOLD" /></div>
            )}
            {car.status === 'shipping' && (
                <div className={styles.soldBadge} style={{ backgroundColor: '#3b82f6' }}><TranslatableText text="SHIPPING" /></div>
            )}
            {car.status === 'auction' && (
                <div className={styles.soldBadge} style={{ backgroundColor: '#8b5cf6' }}><TranslatableText text="AUCTION" /></div>
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
                <div className={styles.condition}><TranslatableText text={car.condition} /></div>

                {/* Specs */}
                <div className={styles.specList}>
                    {[
                        {label: 'Make', value: car.make, icon: '/images/icons/car-icon.svg', translatable: false as const },
                        {label: 'Model', value: car.model, icon: '/images/icons/car-rear.svg', translatable: false as const },
                        {label: 'Year', value: car.year.toString(), icon: '/images/icons/calendar-icon.svg', translatable: false as const},
                        {label: 'Mileage', value: formattedMileage, icon: '/images/icons/speedometer-color-icon.svg', translatable: true as const },
                    ].map((spec) => (
                        <div key={spec.label} className={styles.specEntry}>
                            <span className={styles.specIcon}>
                                <img src={spec.icon} alt={`${spec.label} icon`} loading="lazy" />
                            </span>
                            <span>{spec.translatable ? <TranslatableText text={spec.value} /> : spec.value}</span>
                        </div>
                    ))}
                </div>

                <div className={styles.ctaRow}>
                    <span className={styles.viewButton}>
                        <TranslatableText text="View Details" />
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
