'use client';
import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { useState, useMemo } from 'react';

export default function ShippingPage() {
  const [filters, setFilters] = useState({
    destination: '',
    departurePort: '',
    status: '',
    dateRange: '',
  });

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

  const upcomingShipments = [
    {
      route: 'Japan to USA (West Coast)',
      vessel: 'GRAND MARK',
      departure: '2023-12-15',
      arrival: '2023-12-30',
      status: 'open',
      capacity: '80%',
      port: 'Yokohama → Los Angeles',
    },
    {
      route: 'Japan to Australia',
      vessel: 'NEPTUNE ACE',
      departure: '2023-12-18',
      arrival: '2024-01-02',
      status: 'limited',
      capacity: '90%',
      port: 'Osaka → Melbourne',
    },
    {
      route: 'Japan to Europe',
      vessel: 'MORNING COMPOSER',
      departure: '2023-12-20',
      arrival: '2024-01-10',
      status: 'open',
      capacity: '60%',
      port: 'Tokyo → Rotterdam',
    },
    {
      route: 'Japan to New Zealand',
      vessel: 'TRANS FUTURE 7',
      departure: '2023-12-22',
      arrival: '2024-01-05',
      status: 'closed',
      capacity: '100%',
      port: 'Kawasaki → Auckland',
    },
  ];

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
    return upcomingShipments.filter(shipment => {
      if (filters.destination && !shipment.route.toLowerCase().includes(filters.destination.toLowerCase())) {
        return false;
      }
      if (filters.departurePort && !shipment.port.split('→')[0].trim().includes(filters.departurePort)) {
        return false;
      }
      if (filters.status && shipment.status !== filters.status) {
        return false;
      }
      // Add date range filtering logic here if needed
      return true;
    });
  }, [upcomingShipments, filters]);

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
          <div className={styles.scheduleGrid}>
            {filteredShipments.map((shipment) => (
              <div key={shipment.vessel} className={styles.scheduleCard}>
                <div className={styles.scheduleHeader}>
                  <span className={styles.scheduleIcon}>🚢</span>
                  <h3 className={styles.scheduleTitle}>{shipment.route}</h3>
                </div>
                <div className={styles.scheduleDetails}>
                  <div className={styles.scheduleRow}>
                    <span className={styles.scheduleLabel}>Vessel</span>
                    <span className={styles.scheduleValue}>{shipment.vessel}</span>
                  </div>
                  <div className={styles.scheduleRow}>
                    <span className={styles.scheduleLabel}>Ports</span>
                    <span className={styles.scheduleValue}>{shipment.port}</span>
                  </div>
                  <div className={styles.scheduleRow}>
                    <span className={styles.scheduleLabel}>Departure</span>
                    <span className={styles.scheduleValue}>{shipment.departure}</span>
                  </div>
                  <div className={styles.scheduleRow}>
                    <span className={styles.scheduleLabel}>Arrival</span>
                    <span className={styles.scheduleValue}>{shipment.arrival}</span>
                  </div>
                  <div className={styles.scheduleRow}>
                    <span className={styles.scheduleLabel}>Capacity</span>
                    <span className={styles.scheduleValue}>{shipment.capacity}</span>
                  </div>
                  <div className={styles.scheduleRow}>
                    <span className={styles.scheduleLabel}>Status</span>
                    <span className={`${styles.scheduleStatus} ${styles['status' + shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1)]}`}>
                      {shipment.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
