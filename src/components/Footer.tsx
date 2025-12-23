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

function renderSocialIcon(icon: string, label: string) {
    const iconPath = `/images/icons/${icon}.svg`;

    return (
        <img
            src={iconPath}
            alt={`${label} icon`}
            className={styles.socialIconImage}
            loading="lazy"
        />
    );
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
                                    <span className={styles.contactIcon}>
                                        <img 
                                            src={item.icon} 
                                            alt={`${item.label} icon`} 
                                            className={styles.contactIconImage}
                                            loading="lazy"
                                        />
                                    </span>
                                    <span>{item.label}</span>
                                </li>
                            ))}
                        </ul>
                        <div className={styles.socialList}>
                            {socialLinks.map((social) => (
                                <a key={social.label} href={social.href} aria-label={social.label} className={styles.socialButton}>
                                    {renderSocialIcon(social.icon, social.label)}
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
