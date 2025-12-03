import { carsData } from '@/data/mockData';
import HeroSection from '@/components/sections/HeroSection';
import RecentlyAddedSection from '@/components/sections/RecentlyAddedSection';
import HowToPurchaseSection from '@/components/sections/HowToPurchaseSection';
import FAQSection from '@/components/sections/FAQSection';
import Sidebar from '@/components/Sidebar';
import styles from './(main)/page.module.css';

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
