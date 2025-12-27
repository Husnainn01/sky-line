'use client';
import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { useState, useEffect, useMemo } from 'react';
import { shippingApi } from '@/lib/api';
import TranslatableText from '@/components/TranslatableText';

export default function ShippingPage() {
  const [filters, setFilters] = useState({
    destination: '',
    departurePort: '',
    status: '',
    dateRange: '',
  });
  
  // State for API data
  const [upcomingShipments, setUpcomingShipments] = useState<any[]>([]);
  const [shippingRates, setShippingRates] = useState<any[]>([]);
  const [shippingInfo, setShippingInfo] = useState<any[]>([]);
  const [ports, setPorts] = useState<string[]>([]);
  const [destinations, setDestinations] = useState<string[]>([]);
  
  // Loading and error states
  const [loading, setLoading] = useState({
    shipments: true,
    rates: true,
    info: true,
    ports: true,
    destinations: true
  });
  const [error, setError] = useState<string | null>(null);

  const dateRanges = [
    'Next 7 days',
    'Next 14 days',
    'Next 30 days',
    'All upcoming',
  ];

  // Fetch data from API
  useEffect(() => {
    const fetchShippingData = async () => {
      try {
        // Fetch upcoming shipments
        setLoading(prev => ({ ...prev, shipments: true }));
        const shipmentsResponse = await shippingApi.getAllShippingSchedules();
        if (shipmentsResponse.success) {
          setUpcomingShipments(shipmentsResponse.data || []);
        } else {
          console.error('Failed to fetch shipments:', shipmentsResponse.message);
        }
        
        // Fetch shipping rates using mock data
        setLoading(prev => ({ ...prev, rates: true }));
        const ratesResponse = await shippingApi.getShippingRates();
        if (ratesResponse.success) {
          setShippingRates(ratesResponse.data || []);
        }
        
        // Fetch shipping info using mock data
        setLoading(prev => ({ ...prev, info: true }));
        const infoResponse = await shippingApi.getShippingInfo();
        if (infoResponse.success) {
          setShippingInfo(infoResponse.data || []);
        }
        
        // Fetch departure ports using mock data
        setLoading(prev => ({ ...prev, ports: true }));
        const portsResponse = await shippingApi.getDeparturePorts();
        if (portsResponse.success) {
          setPorts(portsResponse.data || []);
        }
        
        // Fetch destinations using mock data
        setLoading(prev => ({ ...prev, destinations: true }));
        const destinationsResponse = await shippingApi.getDestinations();
        if (destinationsResponse.success) {
          setDestinations(destinationsResponse.data || []);
        }
        
      } catch (err: any) {
        console.error('Error fetching shipping data:', err);
        setError(err.message || 'Failed to load shipping data');
        
        // Fallback to mock data if API fails
        setUpcomingShipments([
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
        ]);
        
        setShippingRates([
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
        ]);
        
        setShippingInfo([
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
        ]);
        
        setPorts([
          'Yokohama',
          'Tokyo',
          'Osaka',
          'Kawasaki',
          'Kobe',
          'Nagoya',
        ]);
        
        setDestinations([
          'USA (West Coast)',
          'USA (East Coast)',
          'Europe',
          'Australia',
          'New Zealand',
          'Southeast Asia',
        ]);
      } finally {
        // Set loading to false for all data types
        setLoading({
          shipments: false,
          rates: false,
          info: false,
          ports: false,
          destinations: false
        });
      }
    };
    
    fetchShippingData();
  }, []);

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
  
  // Apply filters to shipments
  const filteredShipments = useMemo(() => {
    if (!upcomingShipments.length) return [];
    
    return upcomingShipments.filter(shipment => {
      // Filter by destination
      if (filters.destination) {
        const destination = shipment.destination || shipment.route || '';
        if (!destination.toLowerCase().includes(filters.destination.toLowerCase())) {
          return false;
        }
      }
      
      // Filter by departure port
      if (filters.departurePort) {
        // Handle both old and new data structure
        if (shipment.port) {
          const departurePort = shipment.port.split('→')[0].trim();
          if (!departurePort.includes(filters.departurePort)) {
            return false;
          }
        } else {
          // If no port info, skip this filter
          console.log('No port information available for filtering');
        }
      }
      
      // Filter by status
      if (filters.status) {
        if (shipment.status && shipment.status !== filters.status) {
          return false;
        }
        // For new data structure with isActive
        if (shipment.isActive !== undefined) {
          const activeStatus = shipment.isActive ? 'open' : 'closed';
          if (activeStatus !== filters.status) {
            return false;
          }
        }
      }
      
      // Date range filtering
      if (filters.dateRange) {
        const departureDate = new Date(shipment.departureDate || shipment.departure);
        const today = new Date();
        
        if (filters.dateRange === 'Next 7 days') {
          const nextWeek = new Date();
          nextWeek.setDate(today.getDate() + 7);
          if (departureDate > nextWeek || departureDate < today) {
            return false;
          }
        } else if (filters.dateRange === 'Next 14 days') {
          const next2Weeks = new Date();
          next2Weeks.setDate(today.getDate() + 14);
          if (departureDate > next2Weeks || departureDate < today) {
            return false;
          }
        } else if (filters.dateRange === 'Next 30 days') {
          const nextMonth = new Date();
          nextMonth.setDate(today.getDate() + 30);
          if (departureDate > nextMonth || departureDate < today) {
            return false;
          }
        }
      }
      
      return true;
    });
  }, [upcomingShipments, filters]);

  // Format date for display
  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            <TranslatableText text="Shipping Information" />
          </h1>
          <p className={styles.subtitle}>
            <TranslatableText text="Track upcoming vessel schedules, shipping rates, and learn about our global shipping services" />
          </p>
        </header>

        <section className={styles.filterSection}>
          <div className={styles.filterGrid}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>
                <TranslatableText text="Destination" />
              </label>
              <select
                name="destination"
                value={filters.destination}
                onChange={handleFilterChange}
                className={styles.filterSelect}
              >
                <option value="">
                  <TranslatableText text="All Destinations" />
                </option>
                {destinations.map(dest => (
                  <option key={dest} value={dest}>
                    <TranslatableText text={dest} />
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>
                <TranslatableText text="Departure Port" />
              </label>
              <select
                name="departurePort"
                value={filters.departurePort}
                onChange={handleFilterChange}
                className={styles.filterSelect}
              >
                <option value="">
                  <TranslatableText text="All Ports" />
                </option>
                {ports.map(port => (
                  <option key={port} value={port}>
                    <TranslatableText text={port} />
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>
                <TranslatableText text="Status" />
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className={styles.filterSelect}
              >
                <option value="">
                  <TranslatableText text="All Status" />
                </option>
                <option value="open">
                  <TranslatableText text="Open" />
                </option>
                <option value="limited">
                  <TranslatableText text="Limited" />
                </option>
                <option value="closed">
                  <TranslatableText text="Closed" />
                </option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>
                <TranslatableText text="Date Range" />
              </label>
              <select
                name="dateRange"
                value={filters.dateRange}
                onChange={handleFilterChange}
                className={styles.filterSelect}
              >
                <option value="">
                  <TranslatableText text="All Dates" />
                </option>
                {dateRanges.map(range => (
                  <option key={range} value={range}>
                    <TranslatableText text={range} />
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.filterActions}>
            <button
              onClick={handleReset}
              className={`${styles.filterButton} ${styles.filterReset}`}
            >
              <TranslatableText text="Reset Filters" />
            </button>
            <button
              className={`${styles.filterButton} ${styles.filterApply}`}
            >
              <TranslatableText text="Apply Filters" />
            </button>
          </div>
        </section>

        <div className={styles.resultsInfo}>
          <span>
            {filteredShipments.length}{' '}
            <TranslatableText text="shipping schedules found" />
          </span>
          {error && (
            <span className={styles.errorMessage}>
              <TranslatableText text={error} />
            </span>
          )}
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <TranslatableText text="Upcoming Shipping Schedule" />
          </h2>
          {loading.shipments ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>
                <TranslatableText text="Loading shipping schedules..." />
              </p>
            </div>
          ) : filteredShipments.length === 0 ? (
            <div className={styles.emptyContainer}>
              <p>
                <TranslatableText text="No shipping schedules found matching your filters." />
              </p>
            </div>
          ) : (
            <div className={styles.scheduleGrid}>
              {filteredShipments.map((shipment, index) => (
                <div key={shipment._id || shipment.vessel || `shipment-${index}`} className={styles.scheduleCard}>
                  <div className={styles.scheduleHeader}>
                    <span className={styles.scheduleIcon}>🚢</span>
                    <h3 className={styles.scheduleTitle}>{shipment.destination || shipment.route}</h3>
                  </div>
                  <div className={styles.scheduleDetails}>
                    <div className={styles.scheduleRow}>
                      <span className={styles.scheduleLabel}>
                        <TranslatableText text="Vessel" />
                      </span>
                      <span className={styles.scheduleValue}>{shipment.vessel}</span>
                    </div>
                    {shipment.port && (
                      <div className={styles.scheduleRow}>
                        <span className={styles.scheduleLabel}>
                          <TranslatableText text="Ports" />
                        </span>
                        <span className={styles.scheduleValue}>{shipment.port}</span>
                      </div>
                    )}
                    <div className={styles.scheduleRow}>
                      <span className={styles.scheduleLabel}>
                        <TranslatableText text="Departure" />
                      </span>
                      <span className={styles.scheduleValue}>{formatDate(shipment.departureDate || shipment.departure)}</span>
                    </div>
                    <div className={styles.scheduleRow}>
                      <span className={styles.scheduleLabel}>
                        <TranslatableText text="Arrival" />
                      </span>
                      <span className={styles.scheduleValue}>{formatDate(shipment.arrivalDate || shipment.arrival)}</span>
                    </div>
                    {shipment.capacity && (
                      <div className={styles.scheduleRow}>
                        <span className={styles.scheduleLabel}>
                          <TranslatableText text="Capacity" />
                        </span>
                        <span className={styles.scheduleValue}>{shipment.capacity}</span>
                      </div>
                    )}
                    {shipment.status && (
                      <div className={styles.scheduleRow}>
                        <span className={styles.scheduleLabel}>
                          <TranslatableText text="Status" />
                        </span>
                        <span className={`${styles.scheduleStatus} ${styles['status' + shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1)]}`}>
                          {shipment.status.toUpperCase()}
                        </span>
                      </div>
                    )}
                    {shipment.isActive !== undefined && (
                      <div className={styles.scheduleRow}>
                        <span className={styles.scheduleLabel}>
                          <TranslatableText text="Status" />
                        </span>
                        <span className={`${styles.scheduleStatus} ${shipment.isActive ? styles.statusOpen : styles.statusClosed}`}>
                          {shipment.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                    )}
                    {shipment.notes && (
                      <div className={styles.scheduleRow}>
                        <span className={styles.scheduleLabel}>
                          <TranslatableText text="Notes" />
                        </span>
                        <span className={styles.scheduleValue}>{shipment.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <TranslatableText text="Shipping Rates" />
          </h2>
          {loading.rates ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>
                <TranslatableText text="Loading shipping rates..." />
              </p>
            </div>
          ) : shippingRates.length === 0 ? (
            <div className={styles.emptyContainer}>
              <p>
                <TranslatableText text="No shipping rates available at this time." />
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.ratesTable}>
                <thead>
                  <tr>
                    <th>
                      <TranslatableText text="Destination" />
                    </th>
                    <th>
                      <TranslatableText text="20ft Container" />
                    </th>
                    <th>
                      <TranslatableText text="40ft Container" />
                    </th>
                    <th>
                      <TranslatableText text="RoRo" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shippingRates.map((rate, index) => (
                    <tr key={rate.destination || `rate-${index}`}>
                      <td>
                        <TranslatableText text={rate.destination} />
                      </td>
                      <td>
                        <TranslatableText text="USD" /> ${rate.container20ft}
                      </td>
                      <td>
                        <TranslatableText text="USD" /> ${rate.container40ft}
                      </td>
                      <td>
                        <TranslatableText text="USD" /> ${rate.roro}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <TranslatableText text="Shipping Information" />
          </h2>
          {loading.info ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>
                <TranslatableText text="Loading shipping information..." />
              </p>
            </div>
          ) : shippingInfo.length === 0 ? (
            <div className={styles.emptyContainer}>
              <p>
                <TranslatableText text="No shipping information available at this time." />
              </p>
            </div>
          ) : (
            <div className={styles.infoGrid}>
              {shippingInfo.map((info, index) => (
                <div key={info.title || `info-${index}`} className={styles.infoCard}>
                  <h3 className={styles.infoTitle}>
                    <TranslatableText text={info.title} />
                  </h3>
                  <ul className={styles.infoList}>
                    {info.items.map((item: string, itemIndex: number) => (
                      <li key={`${info.title}-item-${itemIndex}`} className={styles.infoItem}>
                        <span className={styles.infoIcon}>•</span>
                        <span>
                          <TranslatableText text={item} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className={styles.contactBox}>
          <h2 className={styles.contactTitle}>
            <TranslatableText text="Need Shipping Assistance?" />
          </h2>
          <p className={styles.contactText}>
            <TranslatableText text="Our shipping experts are here to help you with customs clearance, documentation, and logistics planning." />
          </p>
          <Link href="/contact" className={styles.contactButton}>
            <TranslatableText text="Contact Shipping Team" />
          </Link>
        </div>
      </div>
    </div>
  );
}
