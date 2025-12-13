import Image from 'next/image';
import Link from 'next/link';
import { Car } from '@/types';
import styles from './InventoryCarCard.module.css';
import { SendInquiry } from './SendInquiry';

interface InventoryCarCardProps {
    car: Car;
}

export default function InventoryCarCard({ car }: InventoryCarCardProps) {
    const stockNumber = car.stockNumber || `SKY-${car.id.padStart(4, '0')}`;
    const mileage = car.mileage ? `${car.mileage.toLocaleString()} km` : 'N/A';
    const totalPrice = `$${car.price.toLocaleString()}`;

    const specRows = [
        { label: 'Mileage', value: mileage },
        { label: 'Year', value: car.year },
        { label: 'Engine', value: car.engine || 'N/A' },
        { label: 'Trans.', value: car.transmission },
        { label: 'VIN', value: car.vin || 'N/A' },
        { label: 'Drive', value: car.drivetrain },
        { label: 'Fuel', value: car.fuelType },
        { label: 'Body Type', value: car.bodyType || 'N/A' },
        { label: 'Doors', value: car.doors ?? 'N/A' },
        { label: 'Color', value: car.color || 'N/A' },
        { label: 'Location', value: car.location },
        { label: 'Condition', value: car.condition },
    ];

    return (
        <article className={styles.card}>
            <div className={styles.media}>
                <div className={styles.imageWrapper}>
                    <Image
                        src={car.image}
                        alt={`${car.year} ${car.make} ${car.model}`}
                        fill
                        className={styles.image}
                        sizes="(max-width: 768px) 100vw, 280px"
                    />
                    <span className={styles.stockBadge}>Stock No. {stockNumber}</span>
                    
                    {/* Status Badge */}
                    {car.status === 'sold' && (
                        <span className={styles.statusBadge} style={{ backgroundColor: '#ef4444' }}>SOLD</span>
                    )}
                    {car.status === 'shipping' && (
                        <span className={styles.statusBadge} style={{ backgroundColor: '#3b82f6' }}>SHIPPING</span>
                    )}
                    {car.status === 'auction' && (
                        <span className={styles.statusBadge} style={{ backgroundColor: '#8b5cf6' }}>AUCTION</span>
                    )}
                </div>
            </div>

            <div className={styles.content}>
                <header className={styles.header}>
                    <div>
                        <h2 className={styles.title}>{car.make} {car.model} {car.year}</h2>
                    </div>
                    <div className={styles.priceBlock}>
                        <span className={styles.price}>{totalPrice}</span>
                    </div>
                </header>

                <div className={styles.specList}>
                    {specRows.map((spec) => (
                        <div key={spec.label} className={styles.specRow}>
                            <span className={styles.specLabel}>{spec.label}</span>
                            <span className={styles.specValue}>{spec.value}</span>
                        </div>
                    ))}
                </div>

                <div className={styles.footerRow}>
                    <div className={styles.actions}>
                        <SendInquiry 
                            carName={`${car.year} ${car.make} ${car.model}`} 
                            className={styles.inquiryButton}
                        />
                        <Link href={`/inventory/${car.slug}`} className={styles.viewButton}>
                            View More
                        </Link>
                    </div>
                </div>
            </div>
        </article>
    );
}
