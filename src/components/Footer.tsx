import Link from 'next/link';
import styles from './Footer.module.css';

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
    { label: 'Site Map', href: '/sitemap' }
];

const socialLinks = [
    { label: 'Facebook', href: 'https://facebook.com', icon: 'facebook' },
    { label: 'Twitter', href: 'https://twitter.com', icon: 'twitter' },
    { label: 'Instagram', href: 'https://instagram.com', icon: 'instagram' },
    { label: 'YouTube', href: 'https://youtube.com', icon: 'youtube' }
];

const contactItems = [
    {
        label: 'Aichi Prefecture, Nagoya, Japan',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 21s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="10" r="3" />
            </svg>
        )
    },
    {
        label: '+81 90 4296 9045',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M22 16.92v3a2 2 0 01-2.18 2c-9.06-.8-16.14-7.86-16.92-16.92A2 2 0 014.9 2h3a1 1 0 011 .78l1.2 5a1 1 0 01-.45 1.05l-1.7 1.13a12.05 12.05 0 006.11 6.11l1.13-1.7a1 1 0 011.05-.45l5 1.2a1 1 0 01.79 1z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    },
    {
        label:'info@sky-linetrd.com',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" />
                <path d="M22 6l-10 7L2 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    }
];

function renderSocialIcon(icon: string) {
    switch (icon) {
        case 'facebook':
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M15 2h-3a4 4 0 00-4 4v3H6v4h2v9h4v-9h3l1-4h-4V6a1 1 0 011-1h3z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'twitter':
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M22 4s-.8 3.2-3 4.5c2 .1 3-1 3-1s-.5 2.5-2.7 3.8c.5 8-7.3 12-13.3 7 3 0 4.3-1 4.3-1-2.4-.2-3.5-1.7-3.8-2.6.6.2 1.2.2 1.2.2-2.5-.8-2.2-3.2-2.2-3.2.4.3 1.2.4 1.2.4C4 10.9 4.7 8.6 4.7 8.6c1.7 2 4.2 2.2 4.2 2.2C8.2 7.6 10.5 6 10.5 6c2.6-2 5.3-.6 5.3-.6 1.4-1 2.4-1.4 2.4-1.4z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'instagram':
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                    <path d="M17.5 6.5h.01" />
                </svg>
            );
        case 'youtube':
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M22.54 6.42a2.78 2.78 0 00-1.95-2C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 2 29.94 29.94 0 000 11.16 2.78 2.78 0 001.95 2C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-2 29.94 29.94 0 000-11.16z" />
                    <path d="M10 15l5-3-5-3z" />
                </svg>
            );
        default:
            return null;
    }
}

export default function Footer() {
    const currentYear = new Date().getFullYear();

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
                            Premium Japanese vehicles exported worldwide. Tailored sourcing, transparent inspections, and end-to-end logistics on every shipment.
                        </p>
                        <ul className={styles.contactList}>
                            {contactItems.map((item) => (
                                <li key={item.label}>
                                    <span className={styles.contactIcon}>{item.icon}</span>
                                    <span>{item.label}</span>
                                </li>
                            ))}
                        </ul>
                        <div className={styles.socialList}>
                            {socialLinks.map((social) => (
                                <a key={social.label} href={social.href} aria-label={social.label} className={styles.socialButton}>
                                    {renderSocialIcon(social.icon)}
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className={styles.linkColumns}>
                        {linkGroups.map((group) => (
                            <div key={group.title} className={styles.column}>
                                <h4 className={styles.columnTitle}>{group.title}</h4>
                                <ul className={styles.linkList}>
                                    {group.links.map((link) => (
                                        <li key={link.label}>
                                            <Link href={link.href} className={styles.link}>{link.label}</Link>
                                        </li>
                                    ))}
                                </ul>
                                {group.cta && (
                                    <Link href={group.cta.href} className={styles.viewMore}>
                                        {group.cta.label}
                                        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6">
                                            <path d="M4 9h10" strokeLinecap="round" />
                                            <path d="M10 5l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.bottomRow}>
                    <p className={styles.copyright}>&copy; {currentYear} Skyline TRD. All rights reserved.</p>
                    <nav className={styles.bottomNav} aria-label="Footer">
                        {bottomLinks.map((item) => (
                            <Link key={item.label} href={item.href} className={styles.bottomLink}>
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </footer>
    );
}
