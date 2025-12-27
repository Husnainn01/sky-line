'use client';

import styles from './Footer.module.css';
import { showPreferencesModal } from '@/utils/cookieConsent';
import TranslatableText from './TranslatableText';
import FooterColumn from './FooterColumn';
import FooterContact from './FooterContact';
import FooterSocial from './FooterSocial';
import FooterBottom from './FooterBottom';

// Define the structure directly in the component to use TranslatableText
export default function Footer() {
    const currentYear = new Date().getFullYear();
    
    const linkGroups = [
        {
            title: 'Browse Stock',
            links: [
                { label: 'Browse All Cars', href: '/inventory' },
                { label: 'Featured Vehicles', href: '/#featured' },
                { label: 'Auctions & Deals', href: '/auction' },
                { label: 'Special Offers', href: '/#special-offers' }
            ],
            cta: { label: 'View more', href: '/inventory' }
        },
        {
            title: 'Popular Markets',
            links: [
                { label: 'Australia', href: '/markets/australia' },
                { label: 'New Zealand', href: '/markets/new-zealand' },
                { label: 'United Kingdom', href: '/markets/uk' },
                { label: 'United States', href: '/markets/usa' },
                { label: 'Kenya', href: '/markets/kenya' }
            ],
            cta: { label: 'View more', href: '/markets' }
        },
        {
            title: 'Quick Links',
            links: [
                { label: 'How to Buy', href: '/#how-to-purchase' },
                { label: 'Shipping Information', href: '/shipping' },
                { label: 'About Us', href: '/about' },
                { label: 'Contact', href: '/contact' },
                { label: 'FAQ', href: '/faq' }
            ]
        },
        {
            title: 'Customer Support',
            links: [
                { label: 'Help Center', href: '/support' },
                { label: 'Track Your Order', href: '/support/track' },
                { label: 'Request a Quote', href: '/quote' },
                { label: '24/7 Support', href: '/support#live' }
            ]
        }
    ];
    
    const bottomLinks = [
        { label: 'Terms & Conditions', href: '/terms' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Disclaimer', href: '/disclaimer' },
        { label: 'Site Map', href: '/sitemap' },
        { label: 'Cookie Preferences', href: '#', onClick: () => showPreferencesModal() }
    ];
    
    const socialLinks = [
        { label: 'WhatsApp', href: 'https://wa.me/819042969045', icon: 'whatsapp' },
        { label: 'Facebook', href: 'https://facebook.com', icon: 'facebook' },
        { label: 'Instagram', href: 'https://instagram.com', icon: 'instagram' },
        { label: 'TikTok', href: 'https://tiktok.com', icon: 'tik-tok' }
    ];
    
    const contactItems = [
        {
            label: 'Aichi Prefecture, Nagoya, Japan',
            icon: '/images/icons/marker.svg',
        },
        {
            label: '+81 90 4296 9045',
            icon: '/images/icons/phone-call.svg',
        },
        {
            label:'info@sky-linetrd.com',
            icon: '/images/icons/envelope.svg',
        }
    ];

// Moved to FooterSocial component

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.topRow}>
                    <div className={styles.brandBlock}>
                        <div className={styles.logoGroup}>
                            <img 
                                src="/images/logo/footer.png" 
                                alt="SkylineTRD Logo" 
                                className={styles.footerLogo}
                            />
                        </div>
                        <p className={styles.brandTagline}>
                            <TranslatableText text="Premium Japanese vehicles exported worldwide. Tailored sourcing, transparent inspections, and end-to-end logistics on every shipment." />
                        </p>
                        <FooterContact items={contactItems} />
                        <FooterSocial links={socialLinks} />
                    </div>

                    <div className={styles.linkColumns}>
                        {linkGroups.map((group) => (
                            <FooterColumn 
                                key={group.title}
                                title={group.title}
                                links={group.links}
                                cta={group.cta}
                            />
                        ))}
                    </div>
                </div>

                <FooterBottom links={bottomLinks} year={currentYear} />
            </div>
        </footer>
    );
}
