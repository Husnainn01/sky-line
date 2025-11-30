import ContactForm from '@/components/ContactForm';
import styles from './contact.module.css';

export default function ContactPage() {
    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Get In Touch</h1>
                    <p className={styles.subtitle}>
                        Have questions about our vehicles or export process? We're here to help!
                    </p>
                </div>

                <div className={styles.content}>
                    <div className={styles.formSection}>
                        <ContactForm />
                    </div>

                    <div className={styles.infoSection}>
                        <div className={styles.infoCard}>
                            <h3 className={styles.infoTitle}>Contact Information</h3>

                            <div className={styles.infoItem}>
                                <div className={styles.infoIcon}>📧</div>
                                <div className={styles.infoDetails}>
                                    <h4 className={styles.infoLabel}>Email</h4>
                                    <p className={styles.infoValue}>info@jdmglobal.com</p>
                                </div>
                            </div>

                            <div className={styles.infoItem}>
                                <div className={styles.infoIcon}>📞</div>
                                <div className={styles.infoDetails}>
                                    <h4 className={styles.infoLabel}>Phone</h4>
                                    <p className={styles.infoValue}>+81 3-1234-5678</p>
                                </div>
                            </div>

                            <div className={styles.infoItem}>
                                <div className={styles.infoIcon}>📍</div>
                                <div className={styles.infoDetails}>
                                    <h4 className={styles.infoLabel}>Location</h4>
                                    <p className={styles.infoValue}>Tokyo, Japan</p>
                                </div>
                            </div>

                            <div className={styles.infoItem}>
                                <div className={styles.infoIcon}>🕐</div>
                                <div className={styles.infoDetails}>
                                    <h4 className={styles.infoLabel}>Business Hours</h4>
                                    <p className={styles.infoValue}>
                                        Mon - Fri: 9:00 AM - 6:00 PM JST<br />
                                        Sat: 10:00 AM - 4:00 PM JST
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.infoCard}>
                            <h3 className={styles.infoTitle}>Frequently Asked Questions</h3>

                            <div className={styles.faqItem}>
                                <h4 className={styles.faqQuestion}>How long does shipping take?</h4>
                                <p className={styles.faqAnswer}>
                                    Shipping typically takes 4-8 weeks depending on your destination.
                                </p>
                            </div>

                            <div className={styles.faqItem}>
                                <h4 className={styles.faqQuestion}>Do you handle customs clearance?</h4>
                                <p className={styles.faqAnswer}>
                                    Yes, we provide all necessary export documentation and assist with the process.
                                </p>
                            </div>

                            <div className={styles.faqItem}>
                                <h4 className={styles.faqQuestion}>Can you source specific vehicles?</h4>
                                <p className={styles.faqAnswer}>
                                    Absolutely! We can help you find the exact JDM vehicle you're looking for.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
