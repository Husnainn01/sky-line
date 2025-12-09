'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchFilter from '@/components/SearchFilter';
import InventoryCarCard from '@/components/InventoryCarCard';
import { vehicleApi } from '@/lib/api';
import { Car, FilterOptions } from '@/types';
import styles from './inventory.module.css';

// Body type icons mapping
const bodyTypeIcons: Record<string, string> = {
    'Coupe': '🚗',
    'Sedan': '🚘',
    'SUV': '🚙',
    'Hatchback': '🚗',
    'Truck': '🚚',
    'Wagon': '🚙',
    'Convertible': '🚙',
    'Van': '🚐',
    'Crossover': '🚙'
};

const sortOptions = ['Recently Added', 'Price: Low to High', 'Price: High to Low', 'Year: Newest'];

export default function InventoryPage() {
    const searchParams = useSearchParams();
    
    const [allCars, setAllCars] = useState<Car[]>([]);
    const [filteredCars, setFilteredCars] = useState<Car[]>([]);
    const [activeSort, setActiveSort] = useState(sortOptions[0]);
    const pageSizeOptions = [10, 50];
    const [itemsPerPage, setItemsPerPage] = useState<number>(pageSizeOptions[0]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Initial filters from URL query parameters
    const [initialFilters] = useState<FilterOptions>(() => {
        return {
            searchQuery: searchParams.get('searchQuery') || '',
            make: searchParams.get('make') || '',
            model: searchParams.get('model') || '',
            bodyType: searchParams.get('bodyType') || '',
            transmission: '',
            fuel: '',
            drivetrain: '',
            minPrice: 0,
            maxPrice: 200000,
            minYear: searchParams.get('yearFrom') ? parseInt(searchParams.get('yearFrom') || '1985') : 1985,
            maxYear: searchParams.get('yearTo') ? parseInt(searchParams.get('yearTo') || '2024') : new Date().getFullYear(),
            minMileage: 0,
            maxMileage: 200000,
            steering: searchParams.get('steering') || '',
            priceRange: searchParams.get('priceRange') || '',
        };
    });
    
    // State for dynamic body types and engine types
    const [bodyTypes, setBodyTypes] = useState<{label: string, icon: string}[]>([]);
    const [engineTypes, setEngineTypes] = useState<string[]>([]);
    const [activeBodyType, setActiveBodyType] = useState<string>('');
    const [activeEngineType, setActiveEngineType] = useState<string>('');
    const [averageRating, setAverageRating] = useState<number>(4.8); // Default rating
    
    // State for makes and models
    const [makes, setMakes] = useState<string[]>([]);
    const [modelsByMake, setModelsByMake] = useState<Record<string, string[]>>({});

    // Fetch vehicles when component mounts
    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                setLoading(true);
                const response = await vehicleApi.getAllVehicles();
                
                if (response.success && response.data) {
                    // Map API response to Car type
                    const vehicles: Car[] = response.data.map((vehicle: any) => ({
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
                    
                    // Extract unique body types
                    const uniqueBodyTypes = Array.from(new Set(vehicles
                        .filter(car => car.bodyType) // Filter out undefined body types
                        .map(car => car.bodyType as string)))
                        .sort();
                    
                    // Map body types to objects with icons
                    const bodyTypesWithIcons = uniqueBodyTypes.map(type => ({
                        label: type,
                        icon: bodyTypeIcons[type] || '🚗' // Default icon if not found
                    }));
                    
                    // Extract unique engine types
                    const uniqueEngineTypes = Array.from(new Set(vehicles
                        .filter(car => car.engine) // Filter out undefined engines
                        .map(car => car.engine as string)))
                        .sort();
                        
                    // Extract unique makes
                    const uniqueMakes = Array.from(new Set(vehicles
                        .filter(car => car.make) // Filter out undefined makes
                        .map(car => car.make)))
                        .sort();
                    
                    // Create a mapping of makes to their models
                    const makeToModels: Record<string, string[]> = {};
                    uniqueMakes.forEach(make => {
                        // Get all models for this make
                        const modelsForMake = vehicles
                            .filter(car => car.make === make && car.model) // Filter by make and ensure model exists
                            .map(car => car.model);
                            
                        // Remove duplicates and sort
                        makeToModels[make] = Array.from(new Set(modelsForMake)).sort();
                    });
                    
                    // Calculate average rating (if ratings are available in the data)
                    // For now, we'll use a mock calculation - in a real app, this would use actual ratings
                    const calculateAverageRating = () => {
                        // This is a placeholder - in a real app, you would calculate this from actual ratings
                        // For example: if vehicles had a ratings array or a rating field
                        
                        // Mock calculation based on number of vehicles (just for demonstration)
                        const baseRating = 4.5;
                        const variability = 0.3;
                        const calculatedRating = Math.min(5, baseRating + (Math.random() * variability));
                        return parseFloat(calculatedRating.toFixed(1));
                    };
                    
                    const avgRating = calculateAverageRating();
                    setAverageRating(avgRating);
                    setBodyTypes(bodyTypesWithIcons);
                    setEngineTypes(uniqueEngineTypes);
                    setMakes(uniqueMakes);
                    setModelsByMake(makeToModels);
                    setAllCars(vehicles);
                    
                    // Apply initial filters from URL if present
                    if (searchParams.toString()) {
                        let filtered = [...vehicles];
                        
                        // Apply make filter
                        if (initialFilters.make) {
                            filtered = filtered.filter(car => 
                                car.make && car.make.toLowerCase() === initialFilters.make.toLowerCase());
                        }
                        
                        // Apply model filter
                        if (initialFilters.model) {
                            filtered = filtered.filter(car => 
                                car.model && car.model.toLowerCase() === initialFilters.model.toLowerCase());
                        }
                        
                        // Apply steering filter
                        if (initialFilters.steering && initialFilters.steering !== '') {
                            filtered = filtered.filter(car => 
                                car.steering && car.steering.toLowerCase() === initialFilters.steering?.toLowerCase());
                        }
                        
                        // Apply body type filter
                        if (initialFilters.bodyType && initialFilters.bodyType !== '') {
                            filtered = filtered.filter(car => 
                                car.bodyType && car.bodyType.toLowerCase() === initialFilters.bodyType.toLowerCase());
                        }
                        
                        // Apply price range filter
                        if (initialFilters.priceRange && initialFilters.priceRange !== '') {
                            const priceRange = initialFilters.priceRange;
                            if (priceRange.endsWith('+')) {
                                const minPriceOnly = parseInt(priceRange.replace('+', ''));
                                filtered = filtered.filter(car => car.price >= minPriceOnly);
                            } else {
                                const [minPrice, maxPrice] = priceRange.split('-').map(Number);
                                if (minPrice && maxPrice) {
                                    filtered = filtered.filter(car => 
                                        car.price >= minPrice && car.price <= maxPrice);
                                }
                            }
                        }
                        
                        // Apply year range filters
                        const yearFrom = searchParams.get('yearFrom');
                        if (yearFrom) {
                            const yearFromValue = parseInt(yearFrom);
                            filtered = filtered.filter(car => car.year >= yearFromValue);
                        }
                        
                        const yearTo = searchParams.get('yearTo');
                        if (yearTo) {
                            const yearToValue = parseInt(yearTo);
                            filtered = filtered.filter(car => car.year <= yearToValue);
                        }
                        
                        setFilteredCars(filtered);
                    } else {
                        setFilteredCars(vehicles);
                    }
                } else {
                    throw new Error('Failed to fetch vehicles');
                }
            } catch (err: any) {
                console.error('Error fetching vehicles:', err);
                setError(err.message || 'Failed to load vehicles');
                setAllCars([]);
                setFilteredCars([]);
            } finally {
                setLoading(false);
            }
        };

        fetchVehicles();
    }, []);

    const handleFilterChange = (filters: FilterOptions) => {
        let filtered = [...allCars];

        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            filtered = filtered.filter((car) =>
                [car.make, car.model, car.description, car.vin || '', car.stockNumber || '']
                    .join(' ')
                    .toLowerCase()
                    .includes(query)
            );
        }

        if (filters.make) {
            filtered = filtered.filter((car) => car.make === filters.make);
        }

        if (filters.model) {
            filtered = filtered.filter((car) => car.model === filters.model);
        }

        if (filters.bodyType) {
            filtered = filtered.filter((car) => car.bodyType === filters.bodyType);
        }

        if (filters.transmission) {
            filtered = filtered.filter((car) => car.transmission === filters.transmission);
        }

        if (filters.fuel) {
            filtered = filtered.filter((car) => car.fuelType === filters.fuel);
        }

        if (filters.drivetrain) {
            filtered = filtered.filter((car) => car.drivetrain === filters.drivetrain);
        }

        filtered = filtered.filter(
            (car) => car.year >= filters.minYear && car.year <= filters.maxYear
        );

        filtered = filtered.filter(
            (car) => car.price >= filters.minPrice && car.price <= filters.maxPrice
        );

        filtered = filtered.filter(
            (car) => car.mileage >= filters.minMileage && car.mileage <= filters.maxMileage
        );
        
        // Apply active body type filter if selected
        if (activeBodyType) {
            filtered = filtered.filter((car) => car.bodyType === activeBodyType);
        }
        
        // Apply active engine type filter if selected
        if (activeEngineType) {
            filtered = filtered.filter((car) => car.engine === activeEngineType);
        }

        setFilteredCars(filtered);
        setCurrentPage(1);
    };

    const sortedCars = useMemo(() => {
        const cars = [...filteredCars];
        switch (activeSort) {
            case 'Price: Low to High':
                return cars.sort((a, b) => a.price - b.price);
            case 'Price: High to Low':
                return cars.sort((a, b) => b.price - a.price);
            case 'Year: Newest':
                return cars.sort((a, b) => b.year - a.year);
            default:
                return cars;
        }
    }, [filteredCars, activeSort]);

    const totalPages = Math.max(1, Math.ceil(sortedCars.length / itemsPerPage) || 1);
    const paginatedCars = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return sortedCars.slice(start, start + itemsPerPage);
    }, [sortedCars, currentPage, itemsPerPage]);

    useEffect(() => {
        const maxPage = Math.max(1, Math.ceil(sortedCars.length / itemsPerPage) || 1);
        if (currentPage > maxPage) {
            setCurrentPage(maxPage);
        }
    }, [sortedCars.length, itemsPerPage, currentPage]);

    const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(Number(event.target.value));
        setCurrentPage(1);
    };

    const goToPage = (page: number) => {
        const maxPage = Math.max(1, Math.ceil(sortedCars.length / itemsPerPage) || 1);
        const nextPage = Math.min(Math.max(page, 1), maxPage);
        setCurrentPage(nextPage);
    };
    
    // Handle body type selection
    const handleBodyTypeClick = (type: string) => {
        // If already active, deselect it
        if (activeBodyType === type) {
            setActiveBodyType('');
        } else {
            setActiveBodyType(type);
        }
        
        // Apply filters with the new body type
        const updatedFilters: FilterOptions = {
            searchQuery: '',
            make: '',
            model: '',
            bodyType: type,
            minPrice: 0,
            maxPrice: 200000,
            minYear: 1985,
            maxYear: new Date().getFullYear(),
            transmission: '',
            fuel: '',
            drivetrain: '',
            minMileage: 0,
            maxMileage: 200000,
        };
        
        handleFilterChange(updatedFilters);
    };
    
    // Handle engine type selection
    const handleEngineTypeClick = (type: string) => {
        // If already active, deselect it
        if (activeEngineType === type) {
            setActiveEngineType('');
        } else {
            setActiveEngineType(type);
        }
        
        // Re-apply filters with the updated engine type
        const updatedFilters: FilterOptions = {
            searchQuery: '',
            make: '',
            model: '',
            bodyType: '',
            minPrice: 0,
            maxPrice: 200000,
            minYear: 1985,
            maxYear: new Date().getFullYear(),
            transmission: '',
            fuel: '',
            drivetrain: '',
            minMileage: 0,
            maxMileage: 200000,
        };
        
        handleFilterChange(updatedFilters);
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <SearchFilter 
                    onFilterChange={handleFilterChange} 
                    totalVehicles={filteredCars.length}
                    loading={loading}
                    averageRating={averageRating}
                    makes={makes}
                    modelsByMake={modelsByMake}
                    initialFilters={initialFilters}
                />

                <section className={styles.quickSection}>
                    <header className={styles.sectionHeader}>
                        <h2>Sub Body Type</h2>
                        {bodyTypes.length > 6 && (
                            <button type="button">Show more</button>
                        )}
                    </header>
                    <div className={styles.iconRow}>
                        {loading ? (
                            <div className={styles.loadingChips}>Loading body types...</div>
                        ) : bodyTypes.length > 0 ? (
                            bodyTypes.slice(0, 6).map((item) => (
                                <button 
                                    key={item.label} 
                                    type="button" 
                                    className={`${styles.iconChip} ${activeBodyType === item.label ? styles.activeChip : ''}`}
                                    onClick={() => handleBodyTypeClick(item.label)}
                                >
                                    <span className={styles.icon}>{item.icon}</span>
                                    <span>{item.label}</span>
                                </button>
                            ))
                        ) : (
                            <div className={styles.noDataChips}>No body types available</div>
                        )}
                    </div>
                </section>

                <section className={styles.quickSection}>
                    <header className={styles.sectionHeader}>
                        <h2>Popular Engine Type</h2>
                        {engineTypes.length > 7 && (
                            <button type="button">Browse engine codes</button>
                        )}
                    </header>
                    <div className={styles.tagRow}>
                        {loading ? (
                            <div className={styles.loadingChips}>Loading engine types...</div>
                        ) : engineTypes.length > 0 ? (
                            engineTypes.slice(0, 7).map((engine) => (
                                <button 
                                    key={engine} 
                                    type="button" 
                                    className={`${styles.tagChip} ${activeEngineType === engine ? styles.activeChip : ''}`}
                                    onClick={() => handleEngineTypeClick(engine)}
                                >
                                    {engine}
                                </button>
                            ))
                        ) : (
                            <div className={styles.noDataChips}>No engine types available</div>
                        )}
                    </div>
                </section>

                <section className={styles.resultsHeader}>
                    <div>
                        <h2 className={styles.resultsTitle}>Search Results</h2>
                        <p className={styles.resultsMeta}>
                            {loading ? 'Loading vehicles...' : `${sortedCars.length} vehicles found`}
                        </p>
                    </div>
                    <div className={styles.sortControls}>
                        <label htmlFor="inventory-sort">Sort by</label>
                        <select
                            id="inventory-sort"
                            value={activeSort}
                            onChange={(event) => setActiveSort(event.target.value)}
                            disabled={loading}
                        >
                            {sortOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                </section>

                {loading ? (
                    <div className={styles.loadingContainer}>
                        <div className={styles.loadingSpinner}></div>
                        <p className={styles.loadingText}>Loading vehicles...</p>
                    </div>
                ) : error ? (
                    <div className={styles.errorContainer}>
                        <div className={styles.errorIcon}>⚠️</div>
                        <h3 className={styles.errorTitle}>Error loading vehicles</h3>
                        <p className={styles.errorText}>{error}</p>
                        <button 
                            className={styles.retryButton}
                            onClick={() => window.location.reload()}
                        >
                            Retry
                        </button>
                    </div>
                ) : sortedCars.length > 0 ? (
                    <div className={styles.resultsList}>
                        {paginatedCars.map((car) => (
                            <InventoryCarCard key={car.id} car={car} />
                        ))}
                    </div>
                ) : (
                    <div className={styles.noResults}>
                        <div className={styles.noResultsIcon}>🔍</div>
                        <h3 className={styles.noResultsTitle}>No vehicles found</h3>
                        <p className={styles.noResultsText}>
                            Try adjusting your filters to see more results
                        </p>
                    </div>
                )}

                {!loading && !error && sortedCars.length > 0 && (
                    <section className={styles.paginationSection}>
                        <div className={styles.pageSizeControl}>
                            <label htmlFor="inventory-page-size">Show</label>
                            <select
                                id="inventory-page-size"
                                value={itemsPerPage}
                                onChange={handlePageSizeChange}
                                disabled={loading}
                            >
                                {pageSizeOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                            <span>cars per page</span>
                        </div>

                        <div className={styles.paginationControls}>
                            <button
                                type="button"
                                className={styles.pageButton}
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={loading || currentPage === 1}
                            >
                                Previous
                            </button>
                            <span className={styles.pageIndicator}>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                type="button"
                                className={styles.pageButton}
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={loading || currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
