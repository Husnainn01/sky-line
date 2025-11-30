'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Car } from '@/types';
import styles from './FeaturedCarCard.module.css';

interface FeaturedCarCardProps {
    car: Car;
}

export default function FeaturedCarCard({ car }: FeaturedCarCardProps) {
    return (
        <div className={styles.card}>
            {/* Car Image */}
            <div className={styles.imageContainer}>
                <Image
                    src={car.image}
                    alt={`${car.year} ${car.make} ${car.model}`}
                    width={400}
                    height={280}
                    className={styles.image}
                />
            </div>

            {/* Car Info */}
            <div className={styles.content}>
                <h3 className={styles.title}>
                    {car.year} {car.make} {car.model}
                </h3>

                {/* Specs Row */}
                <div className={styles.specs}>
                    <div className={styles.specItem}>
                        <span className={styles.specLabel}>MILEAGE</span>
                        <span className={styles.specValue}>{car.mileage.toLocaleString()} km</span>
                    </div>
                    <div className={styles.specItem}>
                        <span className={styles.specLabel}>TRANSMISSION</span>
                        <span className={styles.specValue}>{car.transmission}</span>
                    </div>
                    <div className={styles.specItem}>
                        <span className={styles.specLabel}>LOCATION</span>
                        <span className={styles.specValue}>{car.location}</span>
                    </div>
                </div>

                {/* Description */}
                <p className={styles.description}>{car.description}</p>

                {/* Features Tags */}
                <div className={styles.features}>
                    {car.features.slice(0, 3).map((feature, index) => (
                        <Link key={index} href="#" className={styles.featureTag}>
                            {feature}
                        </Link>
                    ))}
                </div>

                {/* Inquire Button */}
                <button className={styles.inquireButton}>
                    Inquire Now
                </button>
            </div>
        </div>
    );
}
