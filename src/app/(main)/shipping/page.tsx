'use client';
import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { useState, useEffect, useMemo } from 'react';

// Define the ShippingSchedule type to match the backend model
type ShippingSchedule = {
  id: string;
  destination: string;
  departureDate: string;
  arrivalDate: string;
  vessel: string;
  notes?: string;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
};

export default function ShippingPage() {
  const [shippingSchedules, setShippingSchedules] = useState<ShippingSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    destination: '',
    departurePort: '',
    status: '',
    dateRange: '',
  });
  
  // Fetch shipping schedules from API
  useEffect(() => {
    const fetchShippingSchedules = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
        
        const response = await fetch(`${API_BASE_URL}/shipping-schedules`);
        if (!response.ok) {
          throw new Error('Failed to fetch shipping schedules');
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.success && data.data) {
          // Map MongoDB _id to id for frontend consistency
          const mappedData = data.data
            .filter((item: any) => item.isActive) // Only show active schedules
            .map((item: any) => ({
              ...item,
              id: item._id // Map _id to id
            }));
          console.log('Mapped shipping schedules:', mappedData);
          setShippingSchedules(mappedData);
        } else {
          console.log('No shipping schedules found or invalid data');
          setShippingSchedules([]);
        }
      } catch (err) {
        console.error('Error fetching shipping schedules:', err);
        setError('Failed to load shipping schedules. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchShippingSchedules();
  }, []);

  const ports = [
    'Yokohama',
    'Tokyo',
    'Osaka',
    'Kawasaki',
    'Kobe',
    'Nagoya',
  ];

  const destinations = [
    'USA (West Coast)',
    'USA (East Coast)',
    'Europe',
    'Australia',
    'New Zealand',
    'Southeast Asia',
  ];

  const dateRanges = [
    'Next 7 days',
    'Next 14 days',
    'Next 30 days',
    'All upcoming',
  ];

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReset = () => {
    setFilters({
      destination: '',
      departurePort: '',
      status: '',
      dateRange: '',
    });
  };

  // No mock data - using data from API

  const shippingRates = [
    {
      destination: 'USA (West Coast)',
      container20ft: '2,800',
      container40ft: '4,200',
      roro: '1,800',
    },
    {
      destination: 'USA (East Coast)',
      container20ft: '3,200',
      container40ft: '4,800',
      roro: '2,200',
    },
    {
      destination: 'Europe (Main Ports)',
      container20ft: '3,000',
      container40ft: '4,500',
      roro: '2,000',
    },
    {
      destination: 'Australia',
      container20ft: '2,500',
      container40ft: '3,800',
      roro: '1,600',
    },
    {
      destination: 'New Zealand',
      container20ft: '2,600',
      container40ft: '3,900',
      roro: '1,700',
    },
  ];

  const shippingInfo = [
    {
      title: 'Required Documents',
      items: [
        'Bill of Lading',
        'Commercial Invoice',
        'Export Declaration',
        'Import License (if required)',
        'Certificate of Origin',
      ],
    },
    {
      title: 'Container Shipping',
      items: [
        'Full container load (FCL) available',
        'Shared container options (consolidation)',
        'Temperature-controlled containers for special vehicles',
        'Professional loading and securing',
      ],
    },
    {
      title: 'RoRo Shipping',
      items: [
        'Available for self-propelled vehicles',
        'Cost-effective option',
        'Faster transit times',
        'Regular schedules to major ports',
      ],
    },
    {
      title: 'Insurance Coverage',
      items: [
        'Comprehensive marine insurance',
        'Coverage against damage and loss',
        'Door-to-door coverage available',
        'Quick claim processing',
      ],
    },
  ];

    const filteredShipments = useMemo(() => {
    return shippingSchedules.filter(schedule => {
      if (filters.destination && !schedule.destination.toLowerCase().includes(filters.destination.toLowerCase())) {
        return false;
      }
      // Date range filtering logic can be added here if needed
      return true;
    });
  }, [shippingSchedules, filters]);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Shipping Information</h1>
          <p className={styles.subtitle}>
            Track upcoming vessel schedules, shipping rates, and learn about our global shipping services
          </p>
        </header>

        <section className={styles.filterSection}>
          <div className={styles.filterGrid}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Destination</label>
              <select
                name="destination"
                value={filters.destination}
                onChange={handleFilterChange}
                className={styles.filterSelect}
              >
                <option value="">All Destinations</option>
                {destinations.map(dest => (
                  <option key={dest} value={dest}>{dest}</option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Departure Port</label>
              <select
                name="departurePort"
                value={filters.departurePort}
                onChange={handleFilterChange}
                className={styles.filterSelect}
              >
                <option value="">All Ports</option>
                {ports.map(port => (
                  <option key={port} value={port}>{port}</option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className={styles.filterSelect}
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="limited">Limited</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Date Range</label>
              <select
                name="dateRange"
                value={filters.dateRange}
                onChange={handleFilterChange}
                className={styles.filterSelect}
              >
                <option value="">All Dates</option>
                {dateRanges.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.filterActions}>
            <button
              onClick={handleReset}
              className={`${styles.filterButton} ${styles.filterReset}`}
            >
              Reset Filters
            </button>
            <button
              className={`${styles.filterButton} ${styles.filterApply}`}
            >
              Apply Filters
            </button>
          </div>
        </section>

        <div className={styles.resultsInfo}>
          <span>Found {filteredShipments.length} shipping schedules</span>
        </div>

        <header className={styles.header}>
          <h1 className={styles.title}>Shipping Information</h1>
          <p className={styles.subtitle}>
            Track upcoming vessel schedules, shipping rates, and learn about our global shipping services
          </p>
        </header>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Upcoming Shipping Schedule</h2>
          
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading shipping schedules...</p>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <div className={styles.errorIcon}>⚠️</div>
              <h3 className={styles.errorTitle}>Error loading shipping schedules</h3>
              <p>{error}</p>
            </div>
          ) : filteredShipments.length > 0 ? (
            <div className={styles.scheduleGrid}>
              {filteredShipments.map((schedule) => (
                <div key={schedule.id} className={styles.scheduleCard}>
                  <div className={styles.scheduleHeader}>
                    <span className={styles.scheduleIcon}>🚢</span>
                    <h3 className={styles.scheduleTitle}>{schedule.destination}</h3>
                  </div>
                  <div className={styles.scheduleDetails}>
                    <div className={styles.scheduleRow}>
                      <span className={styles.scheduleLabel}>Vessel</span>
                      <span className={styles.scheduleValue}>{schedule.vessel}</span>
                    </div>
                    <div className={styles.scheduleRow}>
                      <span className={styles.scheduleLabel}>Departure</span>
                      <span className={styles.scheduleValue}>{new Date(schedule.departureDate).toLocaleDateString()}</span>
                    </div>
                    <div className={styles.scheduleRow}>
                      <span className={styles.scheduleLabel}>Arrival</span>
                      <span className={styles.scheduleValue}>{new Date(schedule.arrivalDate).toLocaleDateString()}</span>
                    </div>
                    {schedule.notes && (
                      <div className={styles.scheduleRow}>
                        <span className={styles.scheduleLabel}>Notes</span>
                        <span className={styles.scheduleValue}>{schedule.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noResults}>
              <div className={styles.noResultsIcon}>🔍</div>
              <h3 className={styles.noResultsTitle}>No shipping schedules found</h3>
              <p>Try adjusting your filters or check back later</p>
            </div>
          )}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Shipping Rates</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.ratesTable}>
              <thead>
                <tr>
                  <th>Destination</th>
                  <th>20ft Container</th>
                  <th>40ft Container</th>
                  <th>RoRo</th>
                </tr>
              </thead>
              <tbody>
                {shippingRates.map((rate) => (
                  <tr key={rate.destination}>
                    <td>{rate.destination}</td>
                    <td>USD ${rate.container20ft}</td>
                    <td>USD ${rate.container40ft}</td>
                    <td>USD ${rate.roro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Shipping Information</h2>
          <div className={styles.infoGrid}>
            {shippingInfo.map((info) => (
              <div key={info.title} className={styles.infoCard}>
                <h3 className={styles.infoTitle}>{info.title}</h3>
                <ul className={styles.infoList}>
                  {info.items.map((item) => (
                    <li key={item} className={styles.infoItem}>
                      <span className={styles.infoIcon}>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <div className={styles.contactBox}>
          <h2 className={styles.contactTitle}>Need Shipping Assistance?</h2>
          <p className={styles.contactText}>
            Our shipping experts are here to help you with customs clearance, documentation, and logistics planning.
          </p>
          <Link href="/contact" className={styles.contactButton}>
            Contact Shipping Team
          </Link>
        </div>
      </div>
    </div>
  );
}
