import styles from './hero.module.css';

export default function Loading() {
  return (
    <div className={styles.dashboardLayout}>
      <div className={styles.mainContent}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading...</p>
        </div>
      </div>
    </div>
  );
}
