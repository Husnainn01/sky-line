import Link from 'next/link';
import styles from './HeroSection.module.css';

export default function HeroSection() {
    return (
        <section className={styles.hero}>
            {/* Background Image with Overlay */}
            <div className={styles.heroBackground}>
                <div className={styles.heroOverlay}></div>
            </div>

            {/* Content */}
            <div className={styles.heroContainer}>
                <div className={styles.heroContent}>
                    {/* Small Tagline */}
                    <div className={styles.heroTagline}>
                        <span className={styles.taglineLine}></span>
                        <span className={styles.taglineText}>PREMIUM AUTO EXPORT</span>
                    </div>

                    {/* Main Heading */}
                    <h1 className={styles.heroTitle}>
                        Export Quality Vehicles<br />
                        Worldwide <span className={styles.titleAccent}>From Japan</span>
                    </h1>

                    {/* Subtitle */}
                    <p className={styles.heroSubtitle}>
                        JDM Global connects you with premium vehicles for export to any destination. Browse our inventory and find your perfect car today.
                    </p>

                    {/* CTA Buttons */}
                    <div className={styles.heroActions}>
                        <Link href="/inventory" className={styles.ctaButton}>
                            Browse Our Cars
                            <svg className={styles.ctaIcon} viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </Link>
                        <Link href="/contact" className={styles.ctaButtonSecondary}>
                            Request a Quote
                        </Link>
                    </div>
                </div>

                {/* Featured Stats */}
                <div className={styles.heroStats}>
                    <div className={styles.statItem}>
                        <div className={styles.statNumber}>500+</div>
                        <div className={styles.statLabel}>Vehicles Exported</div>
                    </div>
                    <div className={styles.statDivider}></div>
                    <div className={styles.statItem}>
                        <div className={styles.statNumber}>50+</div>
                        <div className={styles.statLabel}>Countries Served</div>
                    </div>
                    <div className={styles.statDivider}></div>
                    <div className={styles.statItem}>
                        <div className={styles.statNumber}>100%</div>
                        <div className={styles.statLabel}>Verified Quality</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
