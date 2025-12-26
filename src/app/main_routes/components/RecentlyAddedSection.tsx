'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import CompactCarCard from '@/components/CompactCarCard';
import { Car } from '@/types';
import styles from './RecentlyAddedSection.module.css';

interface RecentlyAddedSectionProps {
    cars: Car[];
    sidebar?: ReactNode;
}

export default function RecentlyAddedSection({ cars, sidebar }: RecentlyAddedSectionProps) {
    const [filters, setFilters] = useState({
        make: '',
        model: '',
        steering: '',
        type: '',
        priceRange: '',
        yearFrom: '',
        yearTo: ''
    });

    const handleFilterChange = (field: string, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
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
                    <div className={styles.searchFilters}>
                        <div className={styles.filterColumn}>
                            <select
                                className={styles.filterSelect}
                                value={filters.steering}
                                onChange={(e) => handleFilterChange('steering', e.target.value)}
                            >
                                <option value="">Steering</option>
                                <option value="right">Right Hand Drive</option>
                                <option value="left">Left Hand Drive</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className={styles.searchInputRow}>
                        <div className={styles.totalVehiclesCount}>
                            <span className={styles.totalVehiclesLabel}>Total vehicles</span>
                            <span className={styles.totalVehiclesNumber}>{cars.length}</span>
                        </div>
                        
                        <div className={styles.searchInputContainer}>
                            <input 
                                type="text" 
                                className={styles.searchInput} 
                                placeholder="Search by make, model, year..."
                            />
                            <button className={styles.searchButton}>
                                SEARCH
                            </button>
                        </div>
                    </div>
                </div>

                <div className={styles.header}>
                    <div className={styles.titleRow}>
                        <svg className={styles.clockIcon} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <h2 className={styles.title}>Recently Added</h2>
                    </div>
                    <Link href="/inventory" className={styles.viewMoreLink}>
                        View More
                        <svg viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </Link>
                </div>

                <div className={styles.grid}>
                    {cars.map((car, index) => (
                        <CompactCarCard
                            key={car.id}
                            car={car}
                            stockNumber={`SKY-${(5800 + index).toString()}`}
                        />
                    ))}
                </div>

                {/* Pagination */}
                <div className={styles.pagination}>
                    <button className={styles.paginationButton} disabled>
                        <svg viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <button className={`${styles.paginationNumber} ${styles.active}`}>1</button>
                    <button className={styles.paginationNumber}>2</button>
                    <button className={styles.paginationButton}>
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
