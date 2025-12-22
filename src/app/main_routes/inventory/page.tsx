import { Suspense } from 'react';
import styles from './inventory.module.css';

// Use a separate client component to handle the search params
import InventoryContent from './inventory-content';

// Export the main component with Suspense boundary
export default function InventoryPage() {
  return (
    <Suspense fallback={
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p className={styles.loadingText}>Loading inventory...</p>
          </div>
        </div>
      </div>
    }>
      <InventoryContent />
    </Suspense>
  );
}
