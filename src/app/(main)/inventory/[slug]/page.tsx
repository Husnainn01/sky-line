import Image from 'next/image';
import Link from 'next/link';
import { carsData } from '@/data/mockData';
import styles from './page.module.css';

const fallbackCar = carsData[0];

export default function InventoryDetailPage({ params }: { params: { slug: string } }) {
    const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
    const normalizedSlug = decodeURIComponent(slug);
    const car = carsData.find((item) => item.slug === normalizedSlug) || fallbackCar;

    const stockNumber = car.stockNumber || `SKY-${car.id.padStart(4, '0')}`;
    const galleryImages = car.images && car.images.length > 0 ? car.images : [car.image];

    const specGroups = [
        { label: 'Stock Number', value: stockNumber, icon: '📦' },
        { label: 'Make', value: car.make, icon: '🚘' },
        { label: 'Model', value: car.model, icon: '🏷️' },
        { label: 'Mileage', value: `${car.mileage.toLocaleString()} km`, icon: '🛣️' },
        { label: 'Year', value: car.year, icon: '📅' },
        { label: 'Condition', value: car.condition, icon: '🧾' },
        { label: 'Availability', value: car.available ? 'In Stock' : 'Sold', icon: '✅' },
        { label: 'VIN', value: car.vin || 'N/A', icon: '🧾' },
        { label: 'Body Type', value: car.bodyType || 'N/A', icon: '🚗' },
        { label: 'Color', value: car.color || 'N/A', icon: '🎨' },
        { label: 'Drive Wheel', value: car.drivetrain, icon: '🛞' },
        { label: 'Doors', value: car.doors ?? 'N/A', icon: '🚪' },
        { label: 'Fuel Type', value: car.fuelType, icon: '⛽' },
        { label: 'Engine', value: car.engine || 'N/A', icon: '⚙️' },
        { label: 'Transmission', value: car.transmission, icon: '🔧' },
        { label: 'Cylinders', value: car.cylinders ?? 'N/A', icon: '🧱' },
        { label: 'Steering', value: car.steering || 'N/A', icon: '🕹️' },
        { label: 'Location', value: car.location, icon: '📍' },
    ];

    const featureList = car.features || [];
    const quickSteps = [
        'Complete and submit the form',
        'Receive a detailed quotation via email',
        'Review and confirm the quotation',
        'Get your Proforma Invoice',
    ];

    const relatedCars = carsData
        .filter((item) => item.slug !== car.slug && (item.make === car.make || item.bodyType === car.bodyType))
        .slice(0, 3);

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <nav className={styles.breadcrumbs}>
                    <Link href="/inventory">Inventory</Link>
                    <span>/</span>
                    <span>{car.make} {car.model}</span>
                </nav>

                <header className={styles.overview}>
                    <div>
                        <h1 className={styles.title}>{car.year} {car.make} {car.model}</h1>
                        <p className={styles.subtitle}>
                            <span>{car.condition}</span>
                            <span>• Stock {stockNumber}</span>
                            <span>• {car.location}</span>
                        </p>
                    </div>
                    <div className={styles.pricePanel}>
                        <span className={styles.priceLabel}>FOB</span>
                        <span className={styles.priceValue}>${car.price.toLocaleString()}</span>
                        <span className={styles.priceMeta}>Export ready • Ask about CIF</span>
                    </div>
                </header>

                <div className={styles.mainLayout}>
                    <div className={styles.mainContent}>
                        <section className={styles.galleryPanel}>
                            <div className={styles.primaryImage}>
                                <Image
                                    src={galleryImages[0]}
                                    alt={`${car.year} ${car.make} ${car.model}`}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 640px"
                                />
                            </div>
                            {galleryImages.length > 1 && (
                                <div className={styles.thumbnailStrip}>
                                    {galleryImages.map((imageSrc, index) => (
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
                            <div className={styles.galleryTopBar}>
                                <span>Photo Gallery</span>
                                <div className={styles.galleryActions}>
                                    <button type="button" className={styles.galleryButton}>Hide thumbnails</button>
                                    <button type="button" className={styles.galleryButton}>Download All</button>
                                </div>
                            </div>
                        </section>

                        <section className={styles.overviewSection}>
                            <div className={styles.sectionHeader}>
                                <h2>Car Overview</h2>
                                <span className={styles.sectionHint}>Inspection verified specifications</span>
                            </div>
                            <div className={styles.overviewGrid}>
                                {specGroups.map((spec) => (
                                    <div key={spec.label} className={styles.overviewItem}>
                                        <span className={styles.overviewIcon}>{spec.icon}</span>
                                        <div>
                                            <span className={styles.overviewLabel}>{spec.label}</span>
                                            <span className={styles.overviewValue}>{spec.value}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {featureList.length > 0 && (
                            <section className={styles.featuresSection}>
                                <h2>Features</h2>
                                <div className={styles.featureList}>
                                    {featureList.map((feature) => (
                                        <span key={feature} className={styles.featurePill}>✔ {feature}</span>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    <aside className={styles.sidebar}>
                        <div className={styles.quotePanel}>
                            <div className={styles.quoteHeader}>
                                <h2>Quick Quote Request</h2>
                                <p>Let us prepare a tailored export offer for you.</p>
                            </div>

                            <form className={styles.quoteForm}>
                                <div className={styles.formGrid}>
                                    <input type="text" placeholder="Full Name" />
                                    <input type="email" placeholder="Email Address" />
                                    <input type="text" placeholder="Destination Country" />
                                    <input type="text" placeholder="Destination Port" />
                                    <input type="text" placeholder="City" />
                                    <input type="tel" placeholder="Telephone" />
                                </div>
                                <button type="button" className={styles.quoteButton}>Request Quote</button>
                                <a 
                                    href={`https://wa.me/YOUR_PHONE_NUMBER?text=Hi,%20I'm%20interested%20in%20this%20car:%20${car.year}%20${car.make}%20${car.model}%20(Stock:%20${stockNumber})`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.whatsappButton}
                                >
                                    Chat on WhatsApp
                                </a>
                            </form>

                            <div className={styles.quickGuide}>
                                <h3>Quick Process Guide</h3>
                                <ol>
                                    {quickSteps.map((step) => (
                                        <li key={step}>{step}</li>
                                    ))}
                                </ol>
                            </div>
                        </div>

                        {relatedCars.length > 0 && (
                            <section className={styles.relatedSection}>
                                <div className={styles.relatedHeader}>
                                    <h2>Related Cars</h2>
                                    <span className={styles.sectionHint}>Similar inventory you might like</span>
                                </div>
                                <div className={styles.relatedList}>
                                    {relatedCars.map((related) => (
                                        <article key={related.slug} className={styles.relatedCard}>
                                            <div className={styles.relatedMedia}>
                                                <Image
                                                    src={related.image}
                                                    alt={`${related.year} ${related.make} ${related.model}`}
                                                    fill
                                                    sizes="120px"
                                                />
                                                <span className={styles.relatedRef}>Ref No. {related.stockNumber || `SKY-${related.id.padStart(4, '0')}`}</span>
                                            </div>
                                            <div className={styles.relatedContent}>
                                                <Link href={`/inventory/${related.slug}`} className={styles.relatedTitle}>
                                                    {related.year} {related.make} {related.model}
                                                </Link>
                                                <div className={styles.relatedMeta}>
                                                    <div>
                                                        <span>Mileage</span>
                                                        <strong>{related.mileage.toLocaleString()} km</strong>
                                                    </div>
                                                    <div>
                                                        <span>Engine</span>
                                                        <strong>{related.engine || 'N/A'}</strong>
                                                    </div>
                                                    <div>
                                                        <span>Trans.</span>
                                                        <strong>{related.transmission}</strong>
                                                    </div>
                                                </div>
                                                <div className={styles.relatedFooter}>
                                                    <div className={styles.relatedPriceBlock}>
                                                        <span className={styles.relatedPrice}>${related.price.toLocaleString()}</span>
                                                        <span className={styles.relatedPriceMeta}>Total Price estimate</span>
                                                    </div>
                                                    <div className={styles.relatedActions}>
                                                        <Link
                                                            href={`/contact?stock=${related.stockNumber ?? related.id}`}
                                                            className={styles.relatedInquiry}
                                                        >
                                                            Inquiry
                                                        </Link>
                                                        <Link href={`/inventory/${related.slug}`} className={styles.relatedView}>
                                                            More
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </section>
                        )}
                    </aside>
                </div>
            </div>
        </div>
    );
}
