import { carsData } from '@/data/mockData';
import HeroSection from './components/HeroSection';
import RecentlyAddedSection from './components/RecentlyAddedSection';
import HowToPurchaseSection from './components/HowToPurchaseSection';
import FAQSection from './components/FAQSection';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import styles from './page.module.css';

export default function Home() {
  const recentlyAdded = carsData.slice(0, 10);

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <HeroSection />

      {/* Recently Added with Sidebar */}
      <RecentlyAddedSection
        cars={recentlyAdded}
        sidebar={<Sidebar variant="inline" />}
      />

      {/* How to Purchase Section */}
      <HowToPurchaseSection />
      {/* FAQ Section */}
      <FAQSection />
      
    </div>
  );
}
