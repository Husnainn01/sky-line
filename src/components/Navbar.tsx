'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from './Navbar.module.css';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated, logout } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [language, setLanguage] = useState('English');

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const isMenuButton = target.closest('button')?.classList.contains('mobileMenuButton');
            if (!target.closest('.navLinks') && !isMenuButton) {
                setIsMobileMenuOpen(false);
                setOpenDropdown(null);
            }
        };

        if (isMobileMenuOpen) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [isMobileMenuOpen]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check initial scroll position
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu when route changes, but not for submenu navigation
    useEffect(() => {
        const isSubmenuRoute = pathname?.includes('/inventory') || pathname?.includes('/auction');
        if (!isSubmenuRoute) {
            setIsMobileMenuOpen(false);
            setOpenDropdown(null);
        }
    }, [pathname]);

    const handleDropdownClick = (dropdownName: string, event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        if (window.innerWidth <= 768) {
            setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
        }
    };

    const handleMainNavClick = (event: React.MouseEvent, dropdownName: string) => {
        event.preventDefault();
        event.stopPropagation();
        setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
    };

    const handleLinkClick = (isSubmenuItem: boolean = false) => {
        if (!isSubmenuItem) {
            setIsMobileMenuOpen(false);
            setOpenDropdown(null);
        }
    };

    // Always show submenus on mobile
    useEffect(() => {
        if (window.innerWidth <= 768) {
            setOpenDropdown('all');
        }
    }, [isMobileMenuOpen]);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setIsMobileMenuOpen(false);
                setOpenDropdown(null);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    // No need to check login status manually - AuthContext handles this

    return (
        <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
            {/* Top Bar */}
            <div className={styles.topBar}>
                <div className={styles.topBarContainer}>
                    <div className={styles.topBarLeft}>
                        <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className={styles.topBarLink}>
                            <img 
                                src="/images/icons/marker.svg" 
                                alt="Location icon" 
                                className={styles.icon}
                                loading="lazy"
                            />
                            <span>Nagoya , Japan - Skyline TRD</span>
                        </a>
                        <a href="tel:+81-90-4296-9045" className={styles.topBarLink}>
                            <img 
                                src="/images/icons/phone-call.svg" 
                                alt="Phone icon" 
                                className={styles.icon}
                                loading="lazy"
                            />
                            <span>+81 90 4296 9045</span>
                        </a>
                    </div>
                    <div className={styles.topBarRight}>
                        <div className={styles.languageSelector}>
                            <img 
                                src="/images/icons/world.svg" 
                                alt="Language globe icon" 
                                className={styles.languageIcon}
                                loading="lazy"
                            />
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
                                width={150} 
                                height={150} 
                            />
                        </div>
                        {/* <div className={styles.logoTextContainer}>
                            <span className={styles.logoText}>Your Success</span>
                            <span className={styles.logoAccent}>Partner</span>
                        </div> */}
                    </Link>

                    <div className={`${styles.navLinks} ${isMobileMenuOpen ? styles.mobileOpen : ''}`}>
                        <Link href="/" className={styles.navLink} onClick={() => handleLinkClick()}>Home</Link>
                        <div className={styles.navItemWithDropdown}>
                            <div className={styles.navLink}>
                                Inventory
                            </div>
                            <div className={`${styles.navDropdown} ${styles.dropdownOpen}`}>
                                <Link href="/inventory" className={styles.dropdownLink} onClick={() => handleLinkClick(true)}>
                                    Stock
                                </Link>
                                <Link href="/auction" className={styles.dropdownLink} onClick={() => handleLinkClick(true)}>
                                    Auction Vehicles
                                </Link>
                            </div>
                        </div>
                        <Link href="/about" className={styles.navLink} onClick={() => handleLinkClick()}>About Us</Link>
                        <Link href="/shipping" className={styles.navLink} onClick={() => handleLinkClick()}>Shipping Info</Link>
                        <div className={styles.navItemWithDropdown}>
                            <div className={styles.navLink}>
                                How to Buy
                            </div>
                            <div className={`${styles.navDropdown} ${styles.dropdownOpen}`}>
                                <Link href="/process" className={styles.dropdownLink} onClick={() => handleLinkClick(true)}>
                                    Complete Guide
                                </Link>
                                <Link href="/process#banking-details" className={styles.dropdownLink} onClick={() => handleLinkClick(true)}>
                                    Banking Details
                                </Link>
                            </div>
                        </div>
                        <Link href="/contact" className={styles.navLink} onClick={() => handleLinkClick()}>Contact</Link>
                        <Link href="/faq" className={styles.navLink} onClick={() => handleLinkClick()}>FAQ</Link>

                        <Link href="/quote" className={styles.ctaButton} onClick={() => handleLinkClick()}>
                            Get a Quote
                        </Link>
                    </div>

                    <button
                        className={`${styles.mobileMenuButton} ${isMobileMenuOpen ? styles.active : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMobileMenuOpen(!isMobileMenuOpen);
                        }}
                        aria-label="Toggle menu"
                        aria-expanded={isMobileMenuOpen}
                    >
                        <span className={`${styles.hamburger} ${isMobileMenuOpen ? styles.open : ''}`}></span>
                    </button>
                </div>
            </nav>
        </header>
    );
}
