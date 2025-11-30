'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './page.module.css';

type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  image: string;
};

type Document = {
  id: string;
  vehicleId: string;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
  status: 'available' | 'pending';
};

// Mock vehicles data
const mockVehicles: Vehicle[] = [
  {
    id: '1',
    make: 'Toyota',
    model: 'Supra',
    year: 1995,
    vin: 'JT2JA82J6P0056789',
    image: '/cars/supra.png',
  },
  {
    id: '2',
    make: 'Nissan',
    model: 'Skyline GT-R',
    year: 1999,
    vin: 'BNR34-000123',
    image: '/cars/gtr.png',
  },
  {
    id: '3',
    make: 'Honda',
    model: 'NSX',
    year: 1992,
    vin: 'JH4NA1150NT000123',
    image: '/cars/nsx.png',
  },
];

// Mock documents data grouped by vehicle
const mockDocuments: Document[] = [
  {
    id: '1',
    vehicleId: '1', // Toyota Supra
    name: 'Bill of Lading',
    type: 'PDF',
    uploadDate: '2025-11-20T00:00:00.000Z',
    size: '156 KB',
    status: 'available',
  },
  {
    id: '2',
    vehicleId: '1',
    name: 'Commercial Invoice',
    type: 'PDF',
    uploadDate: '2025-11-20T00:00:00.000Z',
    size: '89 KB',
    status: 'available',
  },
  {
    id: '3',
    vehicleId: '1',
    name: 'Export Certificate',
    type: 'PDF',
    uploadDate: '2025-11-15T00:00:00.000Z',
    size: '245 KB',
    status: 'available',
  },
  {
    id: '4',
    vehicleId: '2', // Nissan GT-R
    name: 'Bill of Lading',
    type: 'PDF',
    uploadDate: '2025-11-28T00:00:00.000Z',
    size: '148 KB',
    status: 'available',
  },
  {
    id: '5',
    vehicleId: '2',
    name: 'Vehicle Inspection Report',
    type: 'PDF',
    uploadDate: '2025-11-15T00:00:00.000Z',
    size: '2.1 MB',
    status: 'available',
  },
  {
    id: '6',
    vehicleId: '2',
    name: 'Delivery Order',
    type: 'PDF',
    uploadDate: '',
    size: '',
    status: 'pending',
  },
  {
    id: '7',
    vehicleId: '3', // Honda NSX
    name: 'Bill of Lading',
    type: 'PDF',
    uploadDate: '2025-11-25T00:00:00.000Z',
    size: '152 KB',
    status: 'available',
  },
  {
    id: '8',
    vehicleId: '3',
    name: 'Customs Declaration',
    type: 'PDF',
    uploadDate: '2025-11-25T00:00:00.000Z',
    size: '112 KB',
    status: 'available',
  },
  {
    id: '9',
    vehicleId: '3', // Honda NSX
    name: 'Delivery Order',
    type: 'PDF',
    uploadDate: '2025-11-25T00:00:00.000Z',
    size: '112 KB',
    status: 'available',
  },
];

export default function DocumentsPage() {
  const [selectedVehicle, setSelectedVehicle] = useState<string>(mockVehicles[0].id);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Pending';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const filteredDocuments = mockDocuments.filter(doc => doc.vehicleId === selectedVehicle);
  const selectedVehicleData = mockVehicles.find(v => v.id === selectedVehicle);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Documents</h1>
          <p className={styles.subtitle}>View and download your shipping documents</p>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.uploadButton}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Upload Document
          </button>
        </div>
      </div>

      <div className={styles.vehicleSelector}>
        {mockVehicles.map((vehicle) => (
          <button
            key={vehicle.id}
            className={`${styles.vehicleButton} ${selectedVehicle === vehicle.id ? styles.selectedVehicle : ''}`}
            onClick={() => setSelectedVehicle(vehicle.id)}
          >
            <div className={styles.vehicleImage}>
              <Image 
                src={vehicle.image} 
                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                width={100}
                height={80}
                className={styles.vehicleThumb}
              />
            </div>
            <div className={styles.vehicleInfo}>
              <h3>{vehicle.year} {vehicle.make} {vehicle.model}</h3>
              <p>VIN: {vehicle.vin}</p>
            </div>
          </button>
        ))}
      </div>

      {selectedVehicleData && (
        <div className={styles.selectedVehicleHeader}>
          <h2>Documents for {selectedVehicleData.year} {selectedVehicleData.make} {selectedVehicleData.model}</h2>
          <p>VIN: {selectedVehicleData.vin}</p>
        </div>
      )}

      <div className={styles.documentsList}>
        {filteredDocuments.map((doc) => (
          <div key={doc.id} className={styles.documentItem}>
            <div className={styles.documentIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div className={styles.documentInfo}>
              <h4 className={styles.documentName}>{doc.name}</h4>
              <div className={styles.documentMeta}>
                <span className={styles.documentType}>{doc.type}</span>
                {doc.status === 'available' && (
                  <>
                    <span className={styles.documentDot}>•</span>
                    <span className={styles.documentSize}>{doc.size}</span>
                    <span className={styles.documentDot}>•</span>
                    <span className={styles.documentDate}>Uploaded on {formatDate(doc.uploadDate)}</span>
                  </>
                )}
              </div>
            </div>
            <div className={styles.documentAction}>
              {doc.status === 'available' ? (
                <button className={styles.downloadButton}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download
                </button>
              ) : (
                <span className={styles.pendingBadge}>Pending</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
