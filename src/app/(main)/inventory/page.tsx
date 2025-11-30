'use client';

import { useEffect, useMemo, useState } from 'react';
import SearchFilter from '@/components/SearchFilter';
import InventoryCarCard from '@/components/InventoryCarCard';
import { carsData } from '@/data/mockData';
import { FilterOptions } from '@/types';
import styles from './inventory.module.css';

const subBodyTypes = [
    { label: 'Coupe', icon: '🚗' },
    { label: 'Sedan', icon: '🚘' },
    { label: 'SUV', icon: '🚙' },
    { label: 'Hatchback', icon: '🚗' },
    { label: 'Truck', icon: '🚚' },
    { label: 'Wagon', icon: '🚙' }
];

const engineTags = ['2JZ-GTE', 'RB26DETT', 'C30A', '13B-REW', '4G63T', 'EJ257', 'SR20DET'];

const sortOptions = ['Recently Added', 'Price: Low to High', 'Price: High to Low', 'Year: Newest'];

export default function InventoryPage() {
    const [filteredCars, setFilteredCars] = useState(carsData);
    const [activeSort, setActiveSort] = useState(sortOptions[0]);
    const pageSizeOptions = [10, 50];
    const [itemsPerPage, setItemsPerPage] = useState<number>(pageSizeOptions[0]);
    const [currentPage, setCurrentPage] = useState(1);

    const handleFilterChange = (filters: FilterOptions) => {
        let filtered = [...carsData];

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

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <SearchFilter onFilterChange={handleFilterChange} />

                <section className={styles.quickSection}>
                    <header className={styles.sectionHeader}>
                        <h2>Sub Body Type</h2>
                        <button type="button">Show more</button>
                    </header>
                    <div className={styles.iconRow}>
                        {subBodyTypes.map((item) => (
                            <button key={item.label} type="button" className={styles.iconChip}>
                                <span className={styles.icon}>{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>
                </section>

                <section className={styles.quickSection}>
                    <header className={styles.sectionHeader}>
                        <h2>Popular Engine Type</h2>
                        <button type="button">Browse engine codes</button>
                    </header>
                    <div className={styles.tagRow}>
                        {engineTags.map((tag) => (
                            <button key={tag} type="button" className={styles.tagChip}>{tag}</button>
                        ))}
                    </div>
                </section>

                <section className={styles.resultsHeader}>
                    <div>
                        <h2 className={styles.resultsTitle}>Search Results</h2>
                        <p className={styles.resultsMeta}>{sortedCars.length} vehicles found</p>
                    </div>
                    <div className={styles.sortControls}>
                        <label htmlFor="inventory-sort">Sort by</label>
                        <select
                            id="inventory-sort"
                            value={activeSort}
                            onChange={(event) => setActiveSort(event.target.value)}
                        >
                            {sortOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                </section>

                {sortedCars.length > 0 ? (
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

                {sortedCars.length > 0 && (
                    <section className={styles.paginationSection}>
                        <div className={styles.pageSizeControl}>
                            <label htmlFor="inventory-page-size">Show</label>
                            <select
                                id="inventory-page-size"
                                value={itemsPerPage}
                                onChange={handlePageSizeChange}
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
                                disabled={currentPage === 1}
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
                                disabled={currentPage === totalPages}
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
