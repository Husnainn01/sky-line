import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

export default function HowItWorksPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>How Our Auction Service Works</h1>
          <p className={styles.subtitle}>
            Your complete guide to buying Japanese vehicles through our auction service
          </p>
        </header>

        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h2>Access to Japan's Exclusive Auto Auctions</h2>
            <p>
              Japan's auto auctions are typically closed to international buyers. Our service provides you with direct access to these exclusive auctions, where the highest quality vehicles are available at competitive prices.
            </p>
            <div className={styles.heroStats}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>120,000+</span>
                <span className={styles.statLabel}>Vehicles available weekly</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>78</span>
                <span className={styles.statLabel}>Auction houses across Japan</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>15+ years</span>
                <span className={styles.statLabel}>Of auction experience</span>
              </div>
            </div>
          </div>
          <div className={styles.heroImage}>
            <div className={styles.placeholderImage}>Japanese Auto Auction Hall</div>
          </div>
        </section>

        <section className={styles.processSection}>
          <h2 className={styles.sectionTitle}>The Auction Process</h2>
          <div className={styles.processSteps}>
            <div className={styles.processStep}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3>Browse Available Vehicles</h3>
                <p>
                  Explore our curated selection of upcoming auction vehicles. Each listing includes detailed specifications, auction grade, and inspection reports when available.
                </p>
                <div className={styles.stepImage}>
                  <div className={styles.placeholderImage}>Browsing auction vehicles</div>
                </div>
              </div>
            </div>
            
            <div className={styles.processStep}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3>Submit Your Maximum Bid</h3>
                <p>
                  Tell us which vehicle you're interested in and your maximum bid amount. Our team will contact you to confirm details and discuss bidding strategy.
                </p>
                <div className={styles.stepImage}>
                  <div className={styles.placeholderImage}>Submitting a bid</div>
                </div>
              </div>
            </div>
            
            <div className={styles.processStep}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3>We Bid On Your Behalf</h3>
                <p>
                  Our experienced auction agents will represent you at the auction, using strategic bidding techniques to secure the vehicle at the best possible price.
                </p>
                <div className={styles.stepImage}>
                  <div className={styles.placeholderImage}>Auction agent bidding</div>
                </div>
              </div>
            </div>
            
            <div className={styles.processStep}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h3>Purchase & Documentation</h3>
                <p>
                  If your bid is successful, we'll handle all the paperwork, including auction house documentation, de-registration, and export certificates.
                </p>
                <div className={styles.stepImage}>
                  <div className={styles.placeholderImage}>Documentation process</div>
                </div>
              </div>
            </div>
            
            <div className={styles.processStep}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h3>Inspection & Preparation</h3>
                <p>
                  We'll conduct a thorough inspection of the vehicle, arrange any necessary maintenance, and prepare it for international shipping.
                </p>
                <div className={styles.stepImage}>
                  <div className={styles.placeholderImage}>Vehicle inspection</div>
                </div>
              </div>
            </div>
            
            <div className={styles.processStep}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h3>Shipping & Delivery</h3>
                <p>
                  We'll arrange shipping to your destination port, provide tracking information, and assist with any customs requirements in your country.
                </p>
                <div className={styles.stepImage}>
                  <div className={styles.placeholderImage}>Vehicle shipping</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.infoSection}>
          <div className={styles.infoCard}>
            <h3>Understanding Auction Grades</h3>
            <p>
              Japanese auction houses use a standardized grading system to evaluate vehicles. Understanding these grades is crucial to making informed bidding decisions.
            </p>
            <div className={styles.gradeTable}>
              <div className={styles.gradeRow}>
                <div className={styles.gradeCell}><strong>Grade 5</strong></div>
                <div className={styles.gradeCell}>Excellent condition. Like new with minimal to no defects.</div>
              </div>
              <div className={styles.gradeRow}>
                <div className={styles.gradeCell}><strong>Grade 4.5</strong></div>
                <div className={styles.gradeCell}>Very good condition with minor defects that are difficult to notice.</div>
              </div>
              <div className={styles.gradeRow}>
                <div className={styles.gradeCell}><strong>Grade 4</strong></div>
                <div className={styles.gradeCell}>Good condition with some small defects that are easily repairable.</div>
              </div>
              <div className={styles.gradeRow}>
                <div className={styles.gradeCell}><strong>Grade 3.5</strong></div>
                <div className={styles.gradeCell}>Above average condition with noticeable but minor defects.</div>
              </div>
              <div className={styles.gradeRow}>
                <div className={styles.gradeCell}><strong>Grade 3</strong></div>
                <div className={styles.gradeCell}>Average condition with visible defects requiring some repair.</div>
              </div>
              <div className={styles.gradeRow}>
                <div className={styles.gradeCell}><strong>Grade 2</strong></div>
                <div className={styles.gradeCell}>Below average condition with significant defects.</div>
              </div>
              <div className={styles.gradeRow}>
                <div className={styles.gradeCell}><strong>Grade 1</strong></div>
                <div className={styles.gradeCell}>Poor condition requiring major repairs.</div>
              </div>
              <div className={styles.gradeRow}>
                <div className={styles.gradeCell}><strong>Grade R</strong></div>
                <div className={styles.gradeCell}>Repaired after accident damage.</div>
              </div>
            </div>
          </div>
          
          <div className={styles.infoCard}>
            <h3>Auction Inspection Reports</h3>
            <p>
              Each vehicle at auction comes with a detailed inspection report. Our team translates and explains these reports to help you make informed decisions.
            </p>
            <div className={styles.reportImage}>
              <div className={styles.placeholderImage}>Auction inspection report</div>
            </div>
            <div className={styles.reportLegend}>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: '#ff0000' }}></span>
                <span>Major damage/repair</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: '#ffaa00' }}></span>
                <span>Moderate damage/repair</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: '#ffff00' }}></span>
                <span>Minor damage/repair</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: '#00ff00' }}></span>
                <span>Perfect condition</span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.faqSection}>
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3>How much does your auction service cost?</h3>
              <p>
                Our service fee is 5% of the winning bid amount. Additional costs include auction house fees (¥50,000-¥100,000), export paperwork (¥25,000-¥45,000), and shipping costs which vary by destination.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>How long does the entire process take?</h3>
              <p>
                From winning bid to delivery at your local port typically takes 6-10 weeks, depending on your location and any customs requirements in your country.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>What happens if I win multiple auctions?</h3>
              <p>
                We can consolidate multiple vehicles into a single shipping container when possible, which can significantly reduce your overall shipping costs.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>Can I inspect the vehicle before bidding?</h3>
              <p>
                While physical inspection before bidding isn't possible due to the nature of Japanese auctions, we provide detailed inspection reports and can arrange additional inspections by our team upon request.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>What if the vehicle has hidden issues?</h3>
              <p>
                Japanese auction inspection reports are extremely thorough and reliable. However, if significant undisclosed issues are found after purchase, we can help negotiate with the auction house.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>Do you handle customs clearance?</h3>
              <p>
                We handle all export documentation from Japan. For import customs clearance in your country, we can recommend trusted customs agents or work with your preferred agent.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2>Ready to find your dream car at auction?</h2>
            <p>
              Browse our current auction listings or contact our team to discuss your specific requirements.
            </p>
            <div className={styles.ctaButtons}>
              <Link href="/auction" className={styles.ctaPrimaryButton}>
                Browse Auction Vehicles
              </Link>
              <Link href="/contact?type=auction" className={styles.ctaSecondaryButton}>
                Contact Auction Team
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
