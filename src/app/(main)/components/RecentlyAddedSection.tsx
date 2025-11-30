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
                    <div className={styles.searchHeader}>
                        <svg className={styles.searchIcon} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                        <h3 className={styles.searchTitle}>SEARCH FOR CARS</h3>
                    </div>

                    <div className={styles.filtersRow}>
                        <select
                            className={styles.filterSelect}
                            value={filters.make}
                            onChange={(e) => handleFilterChange('make', e.target.value)}
                        >
                            <option value="">Make</option>
                            <option value="toyota">Toyota</option>
                            <option value="nissan">Nissan</option>
                            <option value="honda">Honda</option>
                            <option value="mazda">Mazda</option>
                            <option value="subaru">Subaru</option>
                            <option value="mitsubishi">Mitsubishi</option>
                        </select>

                        <select
                            className={styles.filterSelect}
                            value={filters.model}
                            onChange={(e) => handleFilterChange('model', e.target.value)}
                        >
                            <option value="">Model</option>
                            <option value="skyline">Skyline</option>
                            <option value="supra">Supra</option>
                            <option value="rx7">RX-7</option>
                            <option value="nsx">NSX</option>
                        </select>

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

                    <div className={styles.filtersRow}>
                        <select
                            className={styles.filterSelect}
                            value={filters.type}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                        >
                            <option value="">Type</option>
                            <option value="sedan">Sedan</option>
                            <option value="coupe">Coupe</option>
                            <option value="suv">SUV</option>
                            <option value="sports">Sports Car</option>
                        </select>

                        <select
                            className={styles.filterSelect}
                            value={filters.priceRange}
                            onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                        >
                            <option value="">Price Range</option>
                            <option value="0-10000">$0 - $10,000</option>
                            <option value="10000-25000">$10,000 - $25,000</option>
                            <option value="25000-50000">$25,000 - $50,000</option>
                            <option value="50000+">$50,000+</option>
                        </select>

                        <select
                            className={styles.filterSelect}
                            value={filters.yearFrom}
                            onChange={(e) => handleFilterChange('yearFrom', e.target.value)}
                        >
                            <option value="">Year From</option>
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
                        >
                            <option value="">Year To</option>
                            <option value="1995">1995</option>
                            <option value="2000">2000</option>
                            <option value="2005">2005</option>
                            <option value="2010">2010</option>
                            <option value="2015">2015</option>
                            <option value="2020">2020</option>
                            <option value="2024">2024</option>
                        </select>

                        <div className={styles.resultsCount}>
                            <span className={styles.countNumber}>{cars.length} items match</span>
                        </div>

                        <button className={styles.searchButton}>
                            SEARCH
                        </button>
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
