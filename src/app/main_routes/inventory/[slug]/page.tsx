'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { vehicleApi } from '@/lib/api';
import { Car } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useSavedVehicles } from '@/contexts/SavedVehiclesContext';
import styles from './page.module.css';

export default function InventoryDetailPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [car, setCar] = useState<Car | null>(null);
    const [relatedCars, setRelatedCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const { isSaved, saveVehicle, unsaveVehicle, isLoading } = useSavedVehicles();

    // Get slug from URL params using useParams hook
    const params = useParams();
    const slugParam = params?.slug || '';
    const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam as string;
    const normalizedSlug = decodeURIComponent(slug);

    // Helper function to process vehicle data
    const processVehicleData = (vehicleData: any) => {
        const mappedCar: Car = {
            id: vehicleData._id,
            slug: vehicleData.slug || `${vehicleData.make}-${vehicleData.model}-${vehicleData.year}`.toLowerCase().replace(/\s+/g, '-'),
            make: vehicleData.make,
            model: vehicleData.model,
            year: vehicleData.year,
            price: vehicleData.price,
            mileage: vehicleData.mileage,
            transmission: vehicleData.transmission,
            fuelType: vehicleData.fuelType,
            drivetrain: vehicleData.drivetrain,
            image: vehicleData.images && vehicleData.images.length > 0 ? vehicleData.images[0] : '/cars/placeholder.png',
            images: vehicleData.images || [],
            description: vehicleData.description,
            features: vehicleData.features || [],
            condition: vehicleData.condition,
            location: vehicleData.location,
            available: vehicleData.status !== 'sold',
            bodyType: vehicleData.bodyType,
            vin: vehicleData.vin,
            engine: vehicleData.engineSize,
            cylinders: vehicleData.cylinders,
            color: vehicleData.exteriorColor,
            doors: vehicleData.doors,
            stockNumber: vehicleData.stockNumber || `SKY-${Math.floor(1000 + Math.random() * 9000)}`,
            steering: vehicleData.steering
        };
        
        setCar(mappedCar);
        
        // Fetch related cars
        fetchRelatedCars(mappedCar);
    };
    
    // No need for the checkSavedStatus effect as we're using the global context
    
    // Handle like/save button click
    const handleLikeClick = async () => {
        // Check if user is authenticated
        if (!isAuthenticated) {
            // Show authentication modal
            setShowAuthModal(true);
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
    
    // Handle login/signup button click
    const handleAuthClick = (type: 'login' | 'signup') => {
        // Close the modal
        setShowAuthModal(false);
        
        // Redirect to login or signup page
        if (type === 'login') {
            router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
        } else {
            router.push('/auth/signup?redirect=' + encodeURIComponent(window.location.pathname));
        }
    };
    
    // Fetch car data when component mounts
    useEffect(() => {
        const fetchCarData = async () => {
            try {
                setLoading(true);
                
                console.log('Fetching car with slug:', normalizedSlug);
                
                // First try to find the car by slug
                console.log('Normalized slug for API request:', normalizedSlug);
                const response = await vehicleApi.getAllVehicles({ slug: normalizedSlug });
                
                console.log('Response from API:', response);
                
                // If no results found, try with a more flexible search
                if (!response.success || !response.data || response.data.length === 0) {
                    console.log('No exact match found, trying partial match');
                    
                    // Extract make, model, year from slug (assuming format: make-model-year)
                    const slugParts = normalizedSlug.split('-');
                    if (slugParts.length >= 3) {
                        const make = slugParts[0];
                        const model = slugParts[1];
                        const year = slugParts[slugParts.length - 1]; // Last part might be the year
                        
                        console.log(`Trying with make=${make}, model=${model}, year=${year}`);
                        
                        // Try to find by make, model and year
                        const fallbackResponse = await vehicleApi.getAllVehicles({
                            make,
                            model,
                            year
                        });
                        
                        console.log('Fallback response:', fallbackResponse);
                        
                        if (fallbackResponse.success && fallbackResponse.data && fallbackResponse.data.length > 0) {
                            return processVehicleData(fallbackResponse.data[0]);
                        }
                    }
                }
                
                if (response.success && response.data && response.data.length > 0) {
                    // Process the first vehicle in the response
                    processVehicleData(response.data[0]);
                } else {
                    throw new Error('Vehicle not found');
                }
            } catch (err: any) {
                console.error('Error fetching vehicle:', err);
                setError(err.message || 'Failed to load vehicle details');
            } finally {
                setLoading(false);
            }
        };
        
        fetchCarData();
    }, [normalizedSlug]);
    
    // Fetch related cars based on make or body type
    const fetchRelatedCars = async (currentCar: Car) => {
        try {
            // Get cars with same make or body type, excluding current car
            const response = await vehicleApi.getAllVehicles({ 
                make: currentCar.make,
                limit: 4 
            });
            
            if (response.success && response.data) {
                // Map API response to Car type and filter out current car
                const relatedVehicles: Car[] = response.data
                    .filter((vehicle: any) => vehicle._id !== currentCar.id)
                    .slice(0, 3)
                    .map((vehicle: any) => ({
                        id: vehicle._id,
                        slug: vehicle.slug || `${vehicle.make}-${vehicle.model}-${vehicle.year}`.toLowerCase().replace(/\s+/g, '-'),
                        make: vehicle.make,
                        model: vehicle.model,
                        year: vehicle.year,
                        price: vehicle.price,
                        mileage: vehicle.mileage,
                        transmission: vehicle.transmission,
                        fuelType: vehicle.fuelType,
                        drivetrain: vehicle.drivetrain,
                        image: vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : '/cars/placeholder.png',
                        images: vehicle.images || [],
                        description: vehicle.description,
                        features: vehicle.features || [],
                        condition: vehicle.condition,
                        location: vehicle.location,
                        available: vehicle.status !== 'sold',
                        bodyType: vehicle.bodyType,
                        vin: vehicle.vin,
                        engine: vehicle.engineSize,
                        cylinders: vehicle.cylinders,
                        color: vehicle.exteriorColor,
                        doors: vehicle.doors,
                        stockNumber: vehicle.stockNumber || `SKY-${Math.floor(1000 + Math.random() * 9000)}`,
                        steering: vehicle.steering
                    }));
                    
                setRelatedCars(relatedVehicles);
            }
        } catch (err) {
            console.error('Error fetching related vehicles:', err);
            // Don't set error state here, as this is not critical
            setRelatedCars([]);
        }
    };
    
    // Show loading state
    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.container}>
                    <div className={styles.loadingContainer}>
                        <div className={styles.loadingSpinner}></div>
                        <p className={styles.loadingText}>Loading vehicle details...</p>
                    </div>
                </div>
            </div>
        );
    }
    
    // Show error state
    if (error || !car) {
        return (
            <div className={styles.page}>
                <div className={styles.container}>
                    <nav className={styles.breadcrumbs}>
                        <Link href="/inventory">Inventory</Link>
                        <span>/</span>
                        <span>Error</span>
                    </nav>
                    
                    <div className={styles.errorContainer}>
                        <div className={styles.errorIcon}>⚠️</div>
                        <h3 className={styles.errorTitle}>Vehicle Not Found</h3>
                        <p className={styles.errorText}>{error || 'The requested vehicle could not be found.'}</p>
                        <Link href="/inventory" className={styles.backButton}>
                            Back to Inventory
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
    
    const stockNumber = car.stockNumber || `SKY-${car.id}`;
    const galleryImages = car.images && car.images.length > 0 ? car.images : [car.image];
    const isCarSaved = !!(car && car.id && isSaved(car.id));

    const overviewIconMap: Record<string, string> = {
        'Stock Number': '/images/icons/box-package-icon.svg',
        'Make': '/images/icons/car-icon.svg',
        'Model': '/images/icons/car-rear.svg',
        'Mileage': '/images/icons/speedometer-color-icon.svg',
        'Year': '/images/icons/calendar-icon.svg',
        'Condition': '/images/icons/text-document-check-icon.svg',
        'Availability': '/images/icons/database-checkmark-icon.svg',
        'VIN': '/images/icons/',
        'Body Type': '/images/icons/car-icon.svg',
        'Color': '/images/icons/paint-palette-icon.svg',
        'Drive Wheel': '/images/icons/wheel-icon.svg',
        'Doors': '/images/icons/car-door-icon.svg',
        'Fuel Type': '/images/icons/gas-pump-icon.svg',
        'Engine': '/images/icons/piston-icon.svg',
        'Transmission': '/images/icons/manual-transmission-icon.svg',
        'Cylinders': '/images/icons/pistons-icon.svg',
        'Steering': '/images/icons/steering-wheel-icon.svg',
        'Location': '/images/icons/marker.svg',
    };

    const getOverviewIcon = (label: string) => overviewIconMap[label] || '/images/icons/car-icon.svg';

    const specGroups = [
        { label: 'Stock Number', value: stockNumber },
        { label: 'Make', value: car.make },
        { label: 'Model', value: car.model },
        { label: 'Mileage', value: `${car.mileage.toLocaleString()} km` },
        { label: 'Year', value: car.year },
        { label: 'Condition', value: car.condition },
        { label: 'Availability', value: car.available ? 'In Stock' : 'Sold' },
        { label: 'VIN', value: car.vin || 'N/A' },
        { label: 'Body Type', value: car.bodyType || 'N/A' },
        { label: 'Color', value: car.color || 'N/A' },
        { label: 'Drive Wheel', value: car.drivetrain },
        { label: 'Doors', value: car.doors ?? 'N/A' },
        { label: 'Fuel Type', value: car.fuelType },
        { label: 'Engine', value: car.engine || 'N/A' },
        { label: 'Transmission', value: car.transmission },
        { label: 'Cylinders', value: car.cylinders ?? 'N/A' },
        { label: 'Steering', value: car.steering || 'N/A' },
        { label: 'Location', value: car.location },
    ];

    const featureList = car.features || [];
    const quickSteps = [
        'Complete and submit the form',
        'Receive a detailed quotation via email',
        'Review and confirm the quotation',
        'Get your Proforma Invoice',
    ];

    return (
        <div className={styles.page}>
            {showAuthModal && (
                <div className={styles.authModalOverlay} onClick={() => setShowAuthModal(false)}>
                    <div className={styles.authModal} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.closeButton} onClick={() => setShowAuthModal(false)}>&times;</button>
                        <h3 className={styles.authModalTitle}>Authentication Required</h3>
                        <p className={styles.authModalText}>Please log in or sign up to save this vehicle to your favorites.</p>
                        <div className={styles.authModalButtons}>
                            <button 
                                className={`${styles.authButton} ${styles.loginButton}`}
                                onClick={() => handleAuthClick('login')}
                            >
                                Log In
                            </button>
                            <button 
                                className={`${styles.authButton} ${styles.signupButton}`}
                                onClick={() => handleAuthClick('signup')}
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
                            <div className={styles.galleryTopBar}>
                                <span>Photo Gallery</span>
                                <div className={styles.galleryActions}>
                                    <button 
                                        onClick={handleLikeClick}
                                        className={`${styles.galleryButton} ${styles.saveButton} ${isCarSaved ? styles.saved : ''}`}
                                        disabled={isLoading}
                                        aria-label={isCarSaved ? 'Unsave vehicle' : 'Save vehicle'}
                                    >
                                        <Image
                                            src={isCarSaved ? '/images/icons/red-heart-icon.svg' : '/images/icons/heart-thin-icon.svg'}
                                            alt=""
                                            width={18}
                                            height={18}
                                            className={styles.saveIcon}
                                            aria-hidden="true"
                                        />
                                        <span>{isCarSaved ? 'Saved' : 'Save to Favorites'}</span>
                                    </button>
                                    <button 
                                        type="button" 
                                        className={styles.galleryButton}
                                        onClick={() => {
                                            const thumbnailStrip = document.querySelector(`.${styles.thumbnailStrip}`);
                                            if (thumbnailStrip) {
                                                if (thumbnailStrip.classList.contains(styles.hiddenThumbnails)) {
                                                    thumbnailStrip.classList.remove(styles.hiddenThumbnails);
                                                } else {
                                                    thumbnailStrip.classList.add(styles.hiddenThumbnails);
                                                }
                                            }
                                        }}
                                    >
                                        Hide thumbnails
                                    </button>
                                    <button type="button" className={styles.galleryButton}>Download All</button>
                                </div>
                            </div>
                            
                            <div className={styles.primaryImage}>
                                <Image
                                    src={galleryImages[currentImageIndex]}
                                    alt={`${car.year} ${car.make} ${car.model}`}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 640px"
                                />
                                <div className={styles.watermarkContainer}>
                                    <div className={styles.watermarkDiagonal}>
                                        {Array(5).fill(0).map((_, i) => (
                                            <div key={i} className={styles.watermarkRow}>
                                                {Array(8).fill(0).map((_, j) => (
                                                    <span key={j} className={styles.watermarkText}>SkylineTRD</span>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {galleryImages.length > 1 && (
                                    <div className={styles.imageNavigation}>
                                        <button 
                                            onClick={() => setCurrentImageIndex(prev => (prev === 0 ? galleryImages.length - 1 : prev - 1))}
                                            className={`${styles.navButton} ${styles.prevButton}`}
                                            aria-label="Previous image"
                                        >
                                            ‹
                                        </button>
                                        <button 
                                            onClick={() => setCurrentImageIndex(prev => (prev === galleryImages.length - 1 ? 0 : prev + 1))}
                                            className={`${styles.navButton} ${styles.nextButton}`}
                                            aria-label="Next image"
                                        >
                                            ›
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            {galleryImages.length > 1 && (
                                <div className={styles.thumbnailStrip}>
                                    {galleryImages.map((imageSrc, index) => (
                                        <div
                                            key={`${imageSrc}-${index}`}
                                            className={index === currentImageIndex ? `${styles.thumbnail} ${styles.thumbnailSelected}` : styles.thumbnail}
                                            onClick={() => setCurrentImageIndex(index)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => e.key === 'Enter' && setCurrentImageIndex(index)}
                                            aria-label={`View image ${index + 1}`}
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

                        <section className={styles.overviewSection}>
                            <div className={styles.sectionHeader}>
                                <h2>Car Overview</h2>
                                <span className={styles.sectionHint}>Inspection verified specifications</span>
                            </div>
                            <div className={styles.overviewGrid}>
                                {specGroups.map((spec) => {
                                    const icon = getOverviewIcon(spec.label);
                                    return (
                                        <div key={spec.label} className={styles.overviewItem}>
                                            <span className={styles.overviewIcon}>
                                                <img src={icon} alt={`${spec.label} icon`} loading="lazy" />
                                            </span>
                                            <div>
                                                <span className={styles.overviewLabel}>{spec.label}</span>
                                                <span className={styles.overviewValue}>{spec.value}</span>
                                            </div>
                                        </div>
                                    );
                                })}
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

                        {/* Desktop Related Cars */}
                        <div className={styles.desktopRelated}>
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
                                                    <span className={styles.relatedRef}>Ref No. {related.stockNumber}</span>
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
                                                                href={`/contact?stock=${related.stockNumber}`}
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
                        </div>
                    </aside>
                </div>

                {/* Mobile Quote Panel and Related Cars */}
                <div className={styles.mobileContent}>
                    <div className={styles.mobileQuotePanel}>
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

                    {/* Mobile Related Cars */}
                    {relatedCars.length > 0 && (
                        <section className={styles.mobileRelatedSection}>
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
                                            <span className={styles.relatedRef}>Ref No. {related.stockNumber}</span>
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
                                                        href={`/contact?stock=${related.stockNumber}`}
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
                </div>
            </div>
        </div>
    );
}
