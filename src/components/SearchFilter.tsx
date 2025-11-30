'use client';

import { useState } from 'react';
import { FilterOptions } from '@/types';
import styles from './SearchFilter.module.css';

interface SearchFilterProps {
    onFilterChange: (filters: FilterOptions) => void;
}

export default function SearchFilter({ onFilterChange }: SearchFilterProps) {
    const defaultFilters: FilterOptions = {
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

    const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const makeOptions = ['Toyota', 'Nissan', 'Honda', 'Mazda', 'Mitsubishi', 'Subaru'];
    const modelOptions = ['Supra MK4', 'Skyline GT-R', 'NSX', 'RX-7 FD', 'Lancer Evolution', 'WRX STI', 'Silvia S15'];
    const bodyTypes = ['Coupe', 'Sedan', 'SUV', 'Hatchback', 'Truck'];
    const fuelOptions = ['Gasoline', 'Diesel', 'Hybrid', 'Electric'];
    const drivetrainOptions = ['RWD', 'FWD', 'AWD', '4WD'];

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        const newFilters = {
            ...filters,
            [name]: name.includes('Price') || name.includes('Year') || name.includes('Mileage') ? Number(value) : value,
        };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleSearch = () => {
        onFilterChange(filters);
    };

    const clearFilters = () => {
        setFilters(defaultFilters);
        onFilterChange(defaultFilters);
    };

    const toggleAdvancedFilters = () => {
        setShowAdvancedFilters((prev) => !prev);
    };

    return (
        <div className={styles.filterContainer}>
            <div className={styles.breadcrumbs}>Japanese Used Cars &gt; Inventory</div>

            <header className={styles.headerRow}>
                <div>
                    <h1 className={styles.heading}>Japanese Performance Imports for Sale</h1>
                    <p className={styles.subheading}>Refine your search and uncover limited stock JDM icons ready for export.</p>
                </div>
                <div className={styles.searchStats}>
                    <span className={styles.statCount}>128 Vehicles</span>
                    <span className={styles.statRating}>
                        <span className={styles.ratingValue}>4.8</span>/5 customer rating
                    </span>
                </div>
            </header>

            <div className={styles.searchBarBlock}>
                <input
                    type="text"
                    name="searchQuery"
                    value={filters.searchQuery}
                    onChange={handleInputChange}
                    placeholder="Search by make, model, VIN, keyword..."
                    className={styles.searchInput}
                />
                <button
                    type="button"
                    onClick={toggleAdvancedFilters}
                    className={styles.toggleFiltersButton}
                    aria-expanded={showAdvancedFilters}
                >
                    {showAdvancedFilters ? 'Hide Filters' : 'Show More Filters'}
                </button>
            </div>

            {showAdvancedFilters && (
                <div className={styles.filtersGrid}>
                    <div className={styles.filterGroup}>
                        <label htmlFor="make" className={styles.label}>Select Maker</label>
                        <select id="make" name="make" value={filters.make} onChange={handleInputChange} className={styles.select}>
                            <option value="">Any</option>
                            {makeOptions.map((make) => (
                                <option key={make} value={make}>{make}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.filterGroup}>
                        <label htmlFor="model" className={styles.label}>Select Model</label>
                        <select id="model" name="model" value={filters.model} onChange={handleInputChange} className={styles.select}>
                            <option value="">Any</option>
                            {modelOptions.map((model) => (
                                <option key={model} value={model}>{model}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.filterGroup}>
                        <label htmlFor="bodyType" className={styles.label}>Body Type</label>
                        <select id="bodyType" name="bodyType" value={filters.bodyType} onChange={handleInputChange} className={styles.select}>
                            <option value="">Any</option>
                            {bodyTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.filterGroup}>
                        <label htmlFor="transmission" className={styles.label}>Transmission</label>
                        <select id="transmission" name="transmission" value={filters.transmission} onChange={handleInputChange} className={styles.select}>
                            <option value="">Any</option>
                            <option value="Manual">Manual</option>
                            <option value="Automatic">Automatic</option>
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label htmlFor="fuel" className={styles.label}>Fuel</label>
                        <select id="fuel" name="fuel" value={filters.fuel} onChange={handleInputChange} className={styles.select}>
                            <option value="">Any</option>
                            {fuelOptions.map((fuel) => (
                                <option key={fuel} value={fuel}>{fuel}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.filterGroup}>
                        <label htmlFor="drivetrain" className={styles.label}>Drivetrain</label>
                        <select id="drivetrain" name="drivetrain" value={filters.drivetrain} onChange={handleInputChange} className={styles.select}>
                            <option value="">Any</option>
                            {drivetrainOptions.map((drive) => (
                                <option key={drive} value={drive}>{drive}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.filterGroup}>
                        <label htmlFor="minYear" className={styles.label}>Min Year</label>
                        <input
                            type="number"
                            id="minYear"
                            name="minYear"
                            value={filters.minYear}
                            onChange={handleInputChange}
                            className={styles.input}
                            min="1980"
                            max={filters.maxYear}
                        />
                    </div>
                    <div className={styles.filterGroup}>
                        <label htmlFor="maxYear" className={styles.label}>Max Year</label>
                        <input
                            type="number"
                            id="maxYear"
                            name="maxYear"
                            value={filters.maxYear}
                            onChange={handleInputChange}
                            className={styles.input}
                            min={filters.minYear}
                            max={new Date().getFullYear()}
                        />
                    </div>
                    <div className={styles.filterGroup}>
                        <label htmlFor="minPrice" className={styles.label}>Min Price ($)</label>
                        <input
                            type="number"
                            id="minPrice"
                            name="minPrice"
                            value={filters.minPrice}
                            onChange={handleInputChange}
                            className={styles.input}
                            min="0"
                            max={filters.maxPrice}
                        />
                    </div>
                    <div className={styles.filterGroup}>
                        <label htmlFor="maxPrice" className={styles.label}>Max Price ($)</label>
                        <input
                            type="number"
                            id="maxPrice"
                            name="maxPrice"
                            value={filters.maxPrice}
                            onChange={handleInputChange}
                            className={styles.input}
                            min={filters.minPrice}
                        />
                    </div>
                    <div className={styles.filterGroup}>
                        <label htmlFor="minMileage" className={styles.label}>Min Mileage (km)</label>
                        <input
                            type="number"
                            id="minMileage"
                            name="minMileage"
                            value={filters.minMileage}
                            onChange={handleInputChange}
                            className={styles.input}
                            min="0"
                            max={filters.maxMileage}
                        />
                    </div>
                    <div className={styles.filterGroup}>
                        <label htmlFor="maxMileage" className={styles.label}>Max Mileage (km)</label>
                        <input
                            type="number"
                            id="maxMileage"
                            name="maxMileage"
                            value={filters.maxMileage}
                            onChange={handleInputChange}
                            className={styles.input}
                            min={filters.minMileage}
                        />
                    </div>
                </div>
            )}

            {showAdvancedFilters && (
                <div className={styles.actionRow}>
                    <div className={styles.tagGroup}>
                        <label className={styles.tag}><input type="checkbox" /> Sale</label>
                        <label className={styles.tag}><input type="checkbox" /> Featured</label>
                        <label className={styles.tag}><input type="checkbox" /> Limited Offer</label>
                        <label className={styles.tag}><input type="checkbox" /> JDM Exclusive</label>
                    </div>
                    <div className={styles.buttons}>
                        <button type="button" onClick={clearFilters} className={styles.resetButton}>Reset</button>
                        <button type="button" onClick={handleSearch} className={styles.searchButton}>Search</button>
                    </div>
                </div>
            )}
        </div>
    );
}
