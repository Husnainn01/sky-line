'use client';

import { useState, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CompactCarCard from '@/components/CompactCarCard';
import { Car } from '@/types';
import styles from './RecentlyAddedSection.module.css';
import TranslatableText from '@/components/TranslatableText';

interface RecentlyAddedSectionProps {
    cars: Car[];
    loading?: boolean;
    error?: string | null;
    sidebar?: ReactNode;
    makes?: string[];
    modelsByMake?: Record<string, string[]>;
    bodyTypes?: string[];
}

export default function RecentlyAddedSection({ 
    cars, 
    loading = false, 
    error = null, 
    sidebar,
    makes = [],
    modelsByMake = {},
    bodyTypes = []
}: RecentlyAddedSectionProps) {
    const router = useRouter();
    // State for filtered cars
    const [filteredCars, setFilteredCars] = useState<Car[]>(cars);
    const [filters, setFilters] = useState({
        make: '',
        model: '',
        steering: '',
        type: '',
        priceRange: '',
        yearFrom: '',
        yearTo: ''
    });
    
    // State for available models based on selected make
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    
    // State to track if search has been performed
    const [searchPerformed, setSearchPerformed] = useState(false);

    
    // Update filteredCars when cars prop changes
    useEffect(() => {
        setFilteredCars(cars);
    }, [cars]);
    
    // Update available models when make changes
    useEffect(() => {
        if (filters.make) {
            // Collect all models for the selected make (case-insensitive)
            const allModelsForMake: string[] = [];
            
            // Look through all makes in modelsByMake
            Object.keys(modelsByMake).forEach(make => {
                // If this make matches the selected make (case-insensitive)
                if (make.toLowerCase() === filters.make.toLowerCase()) {
                    // Add all models for this make to our collection
                    allModelsForMake.push(...modelsByMake[make]);
                }
            });
            
            // Deduplicate models
            const uniqueModels = Array.from(new Set(allModelsForMake)).sort();
            setAvailableModels(uniqueModels);
            
            if (uniqueModels.length === 0) {
                console.log('No models found for make:', filters.make);
            }
        } else {
            setAvailableModels([]);
            
            // Reset model if make is cleared
            if (filters.model) {
                setFilters(prev => ({ ...prev, model: '' }));
            }
        }
    }, [filters.make, filters.model, modelsByMake]);

    const handleFilterChange = (field: string, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };
    
    // Function to reset filters and search state
    const resetFilters = () => {
        setFilters({
            make: '',
            model: '',
            steering: '',
            type: '',
            priceRange: '',
            yearFrom: '',
            yearTo: ''
        });
        setFilteredCars(cars);
        setSearchPerformed(false);
    };
    
    // Function to apply filters and redirect to inventory page
    const applyFilters = () => {
        // Build the query string from the filters
        const queryParams = new URLSearchParams();
        
        // Add each filter to the query params if it has a value
        if (filters.make) queryParams.append('make', filters.make);
        if (filters.model) queryParams.append('model', filters.model);
        if (filters.steering) queryParams.append('steering', filters.steering);
        if (filters.type) queryParams.append('bodyType', filters.type);
        if (filters.priceRange) queryParams.append('priceRange', filters.priceRange);
        if (filters.yearFrom) queryParams.append('yearFrom', filters.yearFrom);
        if (filters.yearTo) queryParams.append('yearTo', filters.yearTo);
        
        // Redirect to the inventory page with the filters as query parameters
        router.push(`/inventory?${queryParams.toString()}`);
    };

    const layoutClassName = `${styles.layout} ${sidebar ? styles.layoutWithSidebar : ''}`.trim();

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={layoutClassName}>
                    {sidebar && (
                        <aside className={styles.sidebarWrapper}>
                            {sidebar}
                        </aside>
                    )}

                    <div className={styles.content}>
                {/* Search Filter Bar */}
                <div className={styles.searchBar}>
                    <div className={styles.searchHeader}>
                        <svg className={styles.searchIcon} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                        <h3 className={styles.searchTitle}><TranslatableText text="SEARCH FOR CARS" /></h3>
                    </div>

                    <div className={styles.filtersRow}>
                        <select
                            className={styles.filterSelect}
                            value={filters.make}
                            onChange={(e) => handleFilterChange('make', e.target.value)}
                            style={{position: 'relative', zIndex: 5}}
                        >
                            <option value=""><TranslatableText text="Make" /></option>
                            {/* Display each make only once */}
                            {makes
                                // Remove duplicates by converting to Set and back to array
                                .filter((make, index, self) => 
                                    index === self.findIndex(m => m.toLowerCase() === make.toLowerCase())
                                )
                                // Sort alphabetically
                                .sort()
                                // Create option elements
                                .map(make => (
                                    <option key={make} value={make}>{make}</option>
                                ))
                            }
                        </select>

                        <select
                            className={styles.filterSelect}
                            value={filters.model}
                            onChange={(e) => handleFilterChange('model', e.target.value)}
                            disabled={!filters.make} // Disable if no make is selected
                            style={{position: 'relative', zIndex: 4}}
                        >
                            <option value="">{filters.make ? <TranslatableText text="Model" /> : <TranslatableText text="Select Make First" />}</option>
                            {availableModels.map(model => (
                                <option key={model} value={model}>{model}</option>
                            ))}
                        </select>

                        <select
                            className={styles.filterSelect}
                            value={filters.steering}
                            onChange={(e) => handleFilterChange('steering', e.target.value)}
                            style={{position: 'relative', zIndex: 3}}
                        >
                            <option value=""><TranslatableText text="Steering" /></option>
                            <option value="right"><TranslatableText text="Right Hand Drive" /></option>
                            <option value="left"><TranslatableText text="Left Hand Drive" /></option>
                        </select>
                    </div>

                    <div className={styles.filtersRow}>
                        <select
                            className={styles.filterSelect}
                            value={filters.type}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                            style={{position: 'relative', zIndex: 5}}
                        >
                            <option value=""><TranslatableText text="Type" /></option>
                            {/* Display each body type only once */}
                            {bodyTypes
                                // Remove duplicates by converting to Set and back to array
                                .filter((type, index, self) => 
                                    index === self.findIndex(t => t.toLowerCase() === type.toLowerCase())
                                )
                                // Sort alphabetically
                                .sort()
                                // Create option elements
                                .map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))
                            }
                        </select>

                        <select
                            className={styles.filterSelect}
                            value={filters.priceRange}
                            onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                            style={{position: 'relative', zIndex: 4}}
                        >
                            <option value=""><TranslatableText text="Price Range" /></option>
                            <option value="0-10000"><TranslatableText text="$0 - $10,000" /></option>
                            <option value="10000-25000"><TranslatableText text="$10,000 - $25,000" /></option>
                            <option value="25000-50000"><TranslatableText text="$25,000 - $50,000" /></option>
                            <option value="50000+"><TranslatableText text="$50,000+" /></option>
                        </select>

                        <select
                            className={styles.filterSelect}
                            value={filters.yearFrom}
                            onChange={(e) => handleFilterChange('yearFrom', e.target.value)}
                            style={{position: 'relative', zIndex: 3}}
                        >
                            <option value=""><TranslatableText text="Year From" /></option>
                            <option value="1990">1990</option>
                            <option value="1995">1995</option>
                            <option value="2000">2000</option>
                            <option value="2005">2005</option>
                            <option value="2010">2010</option>
                            <option value="2015">2015</option>
                            <option value="2020">2020</option>
                        </select>

                        <select
                            className={styles.filterSelect}
                            value={filters.yearTo}
                            onChange={(e) => handleFilterChange('yearTo', e.target.value)}
                            style={{position: 'relative', zIndex: 2}}
                        >
                            <option value=""><TranslatableText text="Year To" /></option>
                            <option value="1995">1995</option>
                            <option value="2000">2000</option>
                            <option value="2005">2005</option>
                            <option value="2010">2010</option>
                            <option value="2015">2015</option>
                            <option value="2020">2020</option>
                            <option value="2024">2024</option>
                        </select>

                        <div className={styles.resultsCount}>
                            <span className={styles.countNumber}>
                                {searchPerformed ? 
                                    <>{filteredCars.length} <TranslatableText text="items match" /></> : 
                                    <>{cars.length} <TranslatableText text="total vehicles" /></>
                                }
                            </span>
                        </div>

                        <div className={styles.buttonGroup}>
                            <button 
                                className={styles.searchButton}
                                onClick={applyFilters}
                                type="button"
                            >
                                <TranslatableText text="SEARCH" />
                            </button>
                            
                            {searchPerformed && (
                                <button 
                                    className={styles.resetButton}
                                    onClick={resetFilters}
                                    type="button"
                                >
                                    <TranslatableText text="RESET" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.header}>
                    <div className={styles.titleRow}>
                        <svg className={styles.clockIcon} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <h2 className={styles.title}><TranslatableText text="Recently Added" /></h2>
                    </div>
                    <Link href="/inventory" className={styles.viewMoreLink}>
                        <TranslatableText text="View More" />
                        <svg viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </Link>
                </div>

                {loading ? (
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner}></div>
                        <p><TranslatableText text="Loading vehicles..." /></p>
                    </div>
                ) : error ? (
                    <div className={styles.errorContainer}>
                        <p className={styles.errorMessage}>{error}</p>
                        <p><TranslatableText text="Please try again later." /></p>
                    </div>
                ) : filteredCars.length === 0 ? (
                    <div className={styles.emptyContainer}>
                        <p><TranslatableText text="No vehicles found." /></p>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {filteredCars.map((car, index) => (
                            <CompactCarCard
                                key={car.id}
                                car={car}
                                stockNumber={car.stockNumber || `SKY-${(5800 + index).toString()}`}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                <div className={styles.pagination}>
                    <button 
                        className={styles.paginationButton} 
                        disabled
                        aria-label="Previous page"
                    >
                        <svg viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <button className={`${styles.paginationNumber} ${styles.active}`} aria-current="page">1</button>
                    <button className={styles.paginationNumber}>2</button>
                    <button 
                        className={styles.paginationButton}
                        aria-label="Next page"
                    >
                        <svg viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
