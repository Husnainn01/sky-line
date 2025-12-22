'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from './Navbar.module.css';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [language, setLanguage] = useState('English');

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    // No need to check login status manually - AuthContext handles this

    return (
        <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
            {/* Top Bar */}
            <div className={styles.topBar}>
                <div className={styles.topBarContainer}>
                    <div className={styles.topBarLeft}>
                        <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className={styles.topBarLink}>
                            <svg className={styles.icon} viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <span>Nagoya , Japan - Skyline TRD</span>
                        </a>
                        <a href="tel:+81-90-4296-9045" className={styles.topBarLink}>
                            <svg className={styles.icon} viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                            <span>+81 90 4296 9045</span>
                        </a>
                    </div>
                    <div className={styles.topBarRight}>
                        <div className={styles.languageSelector}>
                            <svg className={styles.icon} viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                            </svg>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className={styles.languageDropdown}
                            >
                                <option value="English">English</option>
                                <option value="日本語">日本語</option>
                                <option value="Русский">Русский</option>
                            </select>
                        </div>
                        
                        {isAuthenticated && user ? (
                            <>
                                <span className={styles.userWelcome}>Welcome, {user.name?.split(' ')[0] || user.email?.split('@')[0]}</span>
                                <Link href="/dashboard" className={styles.topBarLinkButton}>
                                    Dashboard
                                </Link>
                                <button onClick={() => logout()} className={styles.topBarLink}>Logout</button>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/login" className={styles.topBarLink}>Login</Link>
                                <Link href="/auth/register" className={styles.topBarLinkButton}>Register</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <nav className={styles.mainNav}>
                <div className={styles.mainNavContainer}>
                    <Link href="/" className={styles.logo}>
                        <div className={styles.logoIcon}>
                            <img 
                                src="/images/logo/footer.png" 
                                alt="SkylineTRD Logo" 
                                width={180} 
                                height={180} 
                            />
                        </div>
                        {/* <div className={styles.logoTextContainer}>
                            <span className={styles.logoText}>Your Success</span>
                            <span className={styles.logoAccent}>Partner</span>
                        </div> */}
                    </Link>

                    <div className={`${styles.navLinks} ${isMobileMenuOpen ? styles.mobileOpen : ''}`}>
                        <Link href="/" className={styles.navLink}>Home</Link>
                        <div className={styles.navItemWithDropdown}>
                            <div className={styles.navLink}>
                                Inventory
                                <svg className={styles.dropdownIcon} viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className={styles.navDropdown}>
                                <Link href="/inventory" className={styles.dropdownLink}>
                                    <span className={styles.dropdownIcon}>🚗</span>
                                    Available Inventory
                                </Link>
                                <Link href="/auction" className={styles.dropdownLink}>
                                    <span className={styles.dropdownIcon}>🔨</span>
                                    Auction Vehicles
                                </Link>
                            </div>
                        </div>
                        <Link href="/about" className={styles.navLink}>About Us</Link>
                        <Link href="/shipping" className={styles.navLink}>Shipping Info</Link>
                        <div className={styles.navItemWithDropdown}>
                            <div className={styles.navLink}>
                                How to Buy
                                <svg className={styles.dropdownIcon} viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className={styles.navDropdown}>
                                <Link href="/process" className={styles.dropdownLink}>
                                    <span className={styles.dropdownIcon}>📋</span>
                                    Complete Guide
                                </Link>
                                <Link href="/process#banking-details" className={styles.dropdownLink}>
                                    <span className={styles.dropdownIcon}>🏦</span>
                                    Banking Details
                                </Link>
                            </div>
                        </div>
                        <Link href="/contact" className={styles.navLink}>Contact</Link>
                        <Link href="/faq" className={styles.navLink}>FAQ</Link>

                        <Link href="/quote" className={styles.ctaButton}>
                            Get a Quote
                        </Link>
                    </div>

                    <button
                        className={styles.mobileMenuButton}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span className={`${styles.hamburger} ${isMobileMenuOpen ? styles.open : ''}`}></span>
                    </button>
                </div>
            </nav>
        </header>
    );
}
