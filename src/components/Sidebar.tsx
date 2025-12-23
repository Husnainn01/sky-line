'use client';

import Link from 'next/link';
import styles from './Sidebar.module.css';

type SidebarVariant = 'fixed' | 'inline';

interface SidebarProps {
    variant?: SidebarVariant;
}

export default function Sidebar({ variant = 'fixed' }: SidebarProps) {
    const sidebarClassName = `${styles.sidebar}${variant === 'inline' ? ` ${styles.inline}` : ''}`;

    const makes = [
        { name: 'Toyota', icon: '/images/icons/logo_toyota.png' },
        { name: 'Honda', icon: '/images/icons/logo_honda.png' },
        { name: 'Nissan', icon: '/images/icons/logo_nissan.png' },
        { name: 'Mazda', icon: '/images/icons/logo_mazda.png' },
        { name: 'Suzuki', icon: '/images/icons/logo_suzuki.png' },
        { name: 'Mitsubishi', icon: '/images/icons/logo_mitsubishi.png' },
        { name: 'Daihatsu', icon: '/images/icons/logo_daihatsu.png' },
        { name: 'Subaru', icon: '/images/icons/logo_subaru.png' },
        { name: 'Hino', icon: '/images/icons/logo_hino.png' },
        { name: 'Volkswagen' }
    ];

    const types = [
        { name: 'Sedan', query: 'sedan', icon: '/images/icons/icon_type-sedan.svg' },
        { name: 'SUV', query: 'suv', icon: '/images/icons/icon_type-suv.svg' },
        { name: 'Truck', query: 'truck', icon: '/images/icons/icon_type-pick-up.svg' },
        { name: 'Van', query: 'van', icon: '/images/icons/icon_type-van.svg' },
        { name: 'Mini Van', query: 'mini-van', icon: '/images/icons/icon_type-mini-van.svg' },
        { name: 'Commercial', query: 'commercial', icon: '/images/icons/icon_type-heavy-equipment.svg' },
        { name: 'Agricultural', query: 'agricultural', icon: '/images/icons/icon_type-bus.svg' }
    ];

    return (
        <aside className={sidebarClassName}>
            {/* Shop By Make */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <svg className={styles.headerIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M7 17L17 7M17 7H8M17 7V16" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <h3 className={styles.sectionTitle}>Shop By Make</h3>
                </div>
                <ul className={styles.list}>
                    {makes.map((make) => (
                        <li key={make.name} className={styles.listItem}>
                            <Link href={`/inventory?make=${make.name.toLowerCase()}`} className={styles.link}>
                                {make.icon ? (
                                    <img
                                        src={make.icon}
                                        alt={`${make.name} logo`}
                                        className={styles.makeIcon}
                                        loading="lazy"
                                    />
                                ) : (
                                    <svg className={styles.carIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 17h14v-5l-1.5-4.5h-11L5 12v5z" />
                                        <circle cx="7.5" cy="17.5" r="1.5" />
                                        <circle cx="16.5" cy="17.5" r="1.5" />
                                    </svg>
                                )}
                                <span>{make.name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
                <Link href="/inventory" className={styles.viewAll}>
                    <span>View All Makes</span>
                    <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                </Link>
                <p className={styles.subtext}>Explore our complete collection</p>
            </div>

            {/* Shop By Type */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <svg className={styles.headerIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <line x1="9" y1="3" x2="9" y2="21" />
                    </svg>
                    <h3 className={styles.sectionTitle}>Shop By Type</h3>
                </div>
                <ul className={styles.list}>
                    {types.map((type) => (
                        <li key={type.name} className={styles.listItem}>
                            <Link href={`/inventory?type=${type.query}`} className={styles.link}>
                                {type.icon ? (
                                    <img
                                        src={type.icon}
                                        alt={`${type.name} icon`}
                                        className={styles.typeIcon}
                                        loading="lazy"
                                    />
                                ) : (
                                    <svg className={styles.carIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 17h14v-5l-1.5-4.5h-11L5 12v5z" />
                                        <circle cx="7.5" cy="17.5" r="1.5" />
                                        <circle cx="16.5" cy="17.5" r="1.5" />
                                    </svg>
                                )}
                                <span>{type.name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}
