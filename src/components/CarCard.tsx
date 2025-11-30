import Image from 'next/image';
import { Car } from '@/types';
import styles from './CarCard.module.css';

interface CarCardProps {
    car: Car;
}

export default function CarCard({ car }: CarCardProps) {
    return (
        <div className={styles.card}>
            <div className={styles.imageContainer}>
                <Image
                    src={car.image}
                    alt={`${car.year} ${car.make} ${car.model}`}
                    width={400}
                    height={300}
                    className={styles.image}
                />
                {!car.available && (
                    <div className={styles.soldBadge}>SOLD</div>
                )}
            </div>

            <div className={styles.content}>
                <div className={styles.header}>
                    <h3 className={styles.title}>
                        {car.year} {car.make} {car.model}
                    </h3>
                    <p className={styles.price}>${car.price.toLocaleString()}</p>
                </div>

                <div className={styles.specs}>
                    <div className={styles.spec}>
                        <span className={styles.specLabel}>Mileage</span>
                        <span className={styles.specValue}>{car.mileage.toLocaleString()} km</span>
                    </div>
                    <div className={styles.spec}>
                        <span className={styles.specLabel}>Transmission</span>
                        <span className={styles.specValue}>{car.transmission}</span>
                    </div>
                    <div className={styles.spec}>
                        <span className={styles.specLabel}>Location</span>
                        <span className={styles.specValue}>{car.location}</span>
                    </div>
                </div>

                <p className={styles.description}>{car.description}</p>

                <div className={styles.features}>
                    {car.features.slice(0, 3).map((feature, index) => (
                        <span key={index} className={styles.featureBadge}>
                            {feature}
                        </span>
                    ))}
                </div>

                <button className={styles.button}>
                    Inquire Now
                </button>
            </div>
        </div>
    );
}
