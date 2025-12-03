'use client';

import React from 'react';
import styles from './VehicleTypeSelector.module.css';

interface VehicleTypeSelectorProps {
  selectedType: string | null;
  onChange: (type: string | null) => void;
}

export default function VehicleTypeSelector({ selectedType, onChange }: VehicleTypeSelectorProps) {
  return (
    <div className={styles.typeSelector}>
      <button
        className={`${styles.typeButton} ${selectedType === null ? styles.active : ''}`}
        onClick={() => onChange(null)}
      >
        All Vehicles
      </button>
      
      <button
        className={`${styles.typeButton} ${selectedType === 'stock' ? styles.active : ''}`}
        onClick={() => onChange('stock')}
      >
        Stock
      </button>
      
      <button
        className={`${styles.typeButton} ${selectedType === 'auction' ? styles.active : ''}`}
        onClick={() => onChange('auction')}
      >
        Auction
      </button>
    </div>
  );
}
