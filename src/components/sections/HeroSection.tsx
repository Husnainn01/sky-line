import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './HeroSection.module.css';

interface HeroContent {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  tagline: string;
  isActive: boolean;
  imagePosition?: string; // Optional position property
  backgroundSize?: string; // Optional size property
  imageWidth?: number;
  imageHeight?: number;
}

// Helper function to get the appropriate position class
const getPositionClass = (position?: string) => {
  switch (position) {
    case 'top':
      return styles.positionTop;
    case 'bottom':
      return styles.positionBottom;
    case 'left':
      return styles.positionLeft;
    case 'right':
      return styles.positionRight;
    case 'center':
    default:
      return styles.positionCenter;
  }
};

// Helper function to get the background size and position styles
const getBackgroundStyles = (heroContent?: HeroContent | null) => {
  if (!heroContent) return { backgroundSize: 'cover' };
  
  const styles: any = {
    backgroundPosition: heroContent.imagePosition || 'center',
  };
  
  if (heroContent.backgroundSize === 'custom' && heroContent.imageWidth && heroContent.imageHeight) {
    styles.backgroundSize = `${heroContent.imageWidth}px ${heroContent.imageHeight}px`;
  } else if (heroContent.backgroundSize) {
    styles.backgroundSize = heroContent.backgroundSize;
  } else {
    styles.backgroundSize = 'cover';
  }
  
  return styles;
};

export default function HeroSection() {
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch hero content from API
  useEffect(() => {
    const fetchHeroContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get API base URL from environment variable
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
        
        const response = await fetch(`${API_BASE_URL}/hero-sections/active`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch hero content: ${response.status}`);
        }
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          // If not JSON, use default content
          console.error('Invalid content type:', contentType);
          return;
        }
        
        const data = await response.json().catch(err => {
          console.error('JSON parsing error:', err);
          return { success: false };
        });
        
        if (data.success && data.data) {
          setHeroContent(data.data);
        }
      } catch (err) {
        console.error('Error fetching hero content:', err);
        setError('Failed to load hero content');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHeroContent();
  }, []);
    return (
        <section className={styles.hero}>
            {/* Background Image with Overlay */}
            <div 
                className={`${styles.heroBackground} ${getPositionClass(heroContent?.imagePosition)}`}
                style={{
                    backgroundImage: heroContent ? `url(${heroContent.imageUrl})` : 'url(/images/hero-car.jpg)',
                    ...getBackgroundStyles(heroContent)
                }}
            >
                <div className={styles.heroOverlay}></div>
            </div>

            {/* Content */}
            <div className={styles.heroContainer}>
                <div className={styles.heroContent}>
                    {/* Small Tagline */}
                    <div className={styles.heroTagline}>
                        <span className={styles.taglineLine}></span>
                        <span className={styles.taglineText}>{heroContent?.tagline || 'PREMIUM AUTO EXPORT'}</span>
                    </div>

                    {/* Main Heading */}
                    <h1 className={styles.heroTitle}>
                        {heroContent?.title || 'Export Quality Vehicles Worldwide'}
                        {!heroContent && <><br />Worldwide <span className={styles.titleAccent}>From Japan</span></>}
                    </h1>

                    {/* Subtitle */}
                    <p className={styles.heroSubtitle}>
                        {heroContent?.subtitle || 'JDM Global connects you with premium vehicles for export to any destination. Browse our inventory and find your perfect car today.'}
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
