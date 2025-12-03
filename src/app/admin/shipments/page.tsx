'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AdminHeader from '../../../components/admin/AdminHeader';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import styles from './shipments.module.css';

// Define shipment status type
type ShipmentStatus = 'processing' | 'booked' | 'shipped' | 'delivered';

// Define shipment type
interface Shipment {
  id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  vehicles: {
    id: string;
    make: string;
    model: string;
    year: number;
    image: string;
    vin?: string;
  }[];
  shipmentType: 'roro' | 'container';
  status: ShipmentStatus;
  createdAt: string;
  estimatedDelivery: string;
  destination: {
    country: string;
    port: string;
    address: string;
  };
  trackingNumber: string;
  shippingCost: number;
  documents: {
    name: string;
    url: string;
    uploadedAt: string;
  }[];
}

// Mock data for shipments
const mockShipments: Shipment[] = [
  {
    id: 'SHP-100001',
    customer: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1 (555) 123-4567'
    },
    vehicles: [
      {
        id: '1',
        make: 'Toyota',
        model: 'Supra MK4',
        year: 1995,
        image: '/cars/supra.png',
        vin: 'JZA80-0005801'
      }
    ],
    shipmentType: 'roro',
    status: 'processing',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedDelivery: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    destination: {
      country: 'United States',
      port: 'Los Angeles, CA',
      address: '123 Main St, Los Angeles, CA 90001'
    },
    trackingNumber: 'JDM-TRK-12345',
    shippingCost: 2500,
    documents: [
      {
        name: 'Bill of Lading',
        url: '/documents/bill-of-lading-12345.pdf',
        uploadedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        name: 'Export Certificate',
        url: '/documents/export-certificate-12345.pdf',
        uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'SHP-100002',
    customer: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+61 (2) 9876-5432'
    },
    vehicles: [
      {
        id: '2',
        make: 'Nissan',
        model: 'Skyline GT-R R34',
        year: 1999,
        image: '/cars/skyline.png',
        vin: 'BNR34-001244'
      },
      {
        id: '3',
        make: 'Honda',
        model: 'NSX',
        year: 1991,
        image: '/cars/nsx.png',
        vin: 'NA1-1003456'
      }
    ],
    shipmentType: 'container',
    status: 'booked',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedDelivery: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    destination: {
      country: 'Australia',
      port: 'Sydney',
      address: '456 Park Ave, Sydney, NSW 2000'
    },
    trackingNumber: 'JDM-TRK-12346',
    shippingCost: 4800,
    documents: [
      {
        name: 'Bill of Lading',
        url: '/documents/bill-of-lading-12346.pdf',
        uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'SHP-100003',
    customer: {
      name: 'Michael Johnson',
      email: 'michael@example.com',
      phone: '+44 (20) 1234-5678'
    },
    vehicles: [
      {
        id: '4',
        make: 'Mazda',
        model: 'RX-7 FD',
        year: 1993,
        image: '/cars/rx7.png',
        vin: 'FD3S-006789'
      }
    ],
    shipmentType: 'roro',
    status: 'shipped',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedDelivery: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    destination: {
      country: 'United Kingdom',
      port: 'Southampton',
      address: '789 High St, Southampton, UK SO14 2AA'
    },
    trackingNumber: 'JDM-TRK-12347',
    shippingCost: 3200,
    documents: [
      {
        name: 'Bill of Lading',
        url: '/documents/bill-of-lading-12347.pdf',
        uploadedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        name: 'Export Certificate',
        url: '/documents/export-certificate-12347.pdf',
        uploadedAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        name: 'Shipping Manifest',
        url: '/documents/shipping-manifest-12347.pdf',
        uploadedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'SHP-100004',
    customer: {
      name: 'David Wilson',
      email: 'david@example.com',
      phone: '+1 (604) 555-7890'
    },
    vehicles: [
      {
        id: '5',
        make: 'Mitsubishi',
        model: 'Lancer Evolution IX',
        year: 2006,
        image: '/cars/evo.png',
        vin: 'CT9A-030123'
      }
    ],
    shipmentType: 'roro',
    status: 'delivered',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedDelivery: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    destination: {
      country: 'Canada',
      port: 'Vancouver, BC',
      address: '321 Maple St, Vancouver, BC V6B 5Z6'
    },
    trackingNumber: 'JDM-TRK-12348',
    shippingCost: 2800,
    documents: [
      {
        name: 'Bill of Lading',
        url: '/documents/bill-of-lading-12348.pdf',
        uploadedAt: new Date(Date.now() - 58 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        name: 'Export Certificate',
        url: '/documents/export-certificate-12348.pdf',
        uploadedAt: new Date(Date.now() - 57 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        name: 'Delivery Confirmation',
        url: '/documents/delivery-confirmation-12348.pdf',
        uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }
];

export default function ShipmentsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter shipments based on status and search term
  const filteredShipments = mockShipments.filter(shipment => {
    // Filter by status
    const statusMatch = statusFilter === 'all' || shipment.status === statusFilter;
    
    // Filter by search term
    const searchMatch = searchTerm === '' || 
      shipment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.destination.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.vehicles.some(vehicle => 
        `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    return statusMatch && searchMatch;
  });

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Count shipments by status
  const countByStatus = (status: ShipmentStatus | 'all') => {
    if (status === 'all') {
      return mockShipments.length;
    }
    return mockShipments.filter(shipment => shipment.status === status).length;
  };

  return (
    <div className={styles.dashboardLayout}>
      <AdminSidebar />
      <div className={styles.mainContent}>
        <AdminHeader title="Shipments" />
        
        <div className={styles.container}>
          <div className={styles.header}>
            <Link href="/admin/shipments/new" className={styles.addButton}>
              Create New Shipment
            </Link>
          </div>
          
          <div className={styles.filters}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Search by ID, customer, tracking number, or destination"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              <span className={styles.searchIcon}>🔍</span>
            </div>
            
            <div className={styles.tabsContainer}>
              <button 
                className={`${styles.tabButton} ${statusFilter === 'all' ? styles.activeTab : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All ({countByStatus('all')})
              </button>
              <button 
                className={`${styles.tabButton} ${statusFilter === 'processing' ? styles.activeTab : ''}`}
                onClick={() => setStatusFilter('processing')}
              >
                Processing ({countByStatus('processing')})
              </button>
              <button 
                className={`${styles.tabButton} ${statusFilter === 'booked' ? styles.activeTab : ''}`}
                onClick={() => setStatusFilter('booked')}
              >
                Booked ({countByStatus('booked')})
              </button>
              <button 
                className={`${styles.tabButton} ${statusFilter === 'shipped' ? styles.activeTab : ''}`}
                onClick={() => setStatusFilter('shipped')}
              >
                Shipped ({countByStatus('shipped')})
              </button>
              <button 
                className={`${styles.tabButton} ${statusFilter === 'delivered' ? styles.activeTab : ''}`}
                onClick={() => setStatusFilter('delivered')}
              >
                Delivered ({countByStatus('delivered')})
              </button>
            </div>
          </div>
          
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{countByStatus('all')}</span>
              <span className={styles.statLabel}>Total Shipments</span>
            </div>
            <div className={styles.statCard}>
              <span className={`${styles.statValue} ${styles.processingValue}`}>{countByStatus('processing')}</span>
              <span className={styles.statLabel}>Processing</span>
            </div>
            <div className={styles.statCard}>
              <span className={`${styles.statValue} ${styles.bookedValue}`}>{countByStatus('booked')}</span>
              <span className={styles.statLabel}>Booked</span>
            </div>
            <div className={styles.statCard}>
              <span className={`${styles.statValue} ${styles.shippedValue}`}>{countByStatus('shipped')}</span>
              <span className={styles.statLabel}>Shipped</span>
            </div>
            <div className={styles.statCard}>
              <span className={`${styles.statValue} ${styles.deliveredValue}`}>{countByStatus('delivered')}</span>
              <span className={styles.statLabel}>Delivered</span>
            </div>
          </div>
          
          {filteredShipments.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path>
                  <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"></path>
                  <path d="M12 3v6"></path>
                </svg>
              </div>
              <h3>No shipments found</h3>
              <p>No shipments match your current filters. Try adjusting your search or filter criteria.</p>
              <button className={styles.emptyButton} onClick={() => {setStatusFilter('all'); setSearchTerm('')}}>
                Reset Filters
              </button>
            </div>
          ) : (
            <div className={styles.shipmentsList}>
              {filteredShipments.map(shipment => (
                <div key={shipment.id} className={styles.shipmentCard}>
                  <div className={styles.shipmentHeader}>
                    <div className={styles.shipmentInfo}>
                      <h3 className={styles.shipmentId}>{shipment.id}</h3>
                      <div className={styles.shipmentMeta}>
                        <span className={styles.shipmentDate}>Created on {formatDate(shipment.createdAt)}</span>
                        <span className={styles.shipmentDot}>•</span>
                        <span className={styles.shipmentType}>
                          {shipment.shipmentType === 'roro' ? 'RoRo Shipping' : 'Container Shipping'}
                        </span>
                      </div>
                    </div>
                    <div className={`${styles.shipmentStatus} ${styles[`status${shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1)}`]}`}>
                      {shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1)}
                    </div>
                  </div>
                  
                  <div className={styles.shipmentCustomer}>
                    <div className={styles.customerInfo}>
                      <span className={styles.customerLabel}>Customer</span>
                      <span className={styles.customerName}>{shipment.customer.name}</span>
                      <span className={styles.customerContact}>{shipment.customer.email} • {shipment.customer.phone}</span>
                    </div>
                    <div className={styles.destinationInfo}>
                      <span className={styles.destinationLabel}>Destination</span>
                      <span className={styles.destinationCountry}>{shipment.destination.country}</span>
                      <span className={styles.destinationDetails}>{shipment.destination.port}</span>
                    </div>
                  </div>
                  
                  <div className={styles.shipmentVehicles}>
                    {shipment.vehicles.map(vehicle => (
                      <div key={vehicle.id} className={styles.shipmentVehicle}>
                        <div className={styles.vehicleImage}>
                          <Image 
                            src={vehicle.image} 
                            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                            width={160}
                            height={120}
                            className={styles.vehicleImg}
                          />
                        </div>
                        <div className={styles.vehicleDetails}>
                          <h4 className={styles.vehicleName}>{vehicle.year} {vehicle.make} {vehicle.model}</h4>
                          {vehicle.vin && (
                            <div className={styles.vehicleMeta}>
                              <span>VIN: {vehicle.vin}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className={styles.shipmentDetails}>
                    <div className={styles.detailsGrid}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Tracking Number</span>
                        <span className={styles.detailValue}>{shipment.trackingNumber}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Estimated Delivery</span>
                        <span className={styles.detailValue}>{formatDate(shipment.estimatedDelivery)}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Shipping Cost</span>
                        <span className={styles.detailValue}>{formatCurrency(shipment.shippingCost)}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Documents</span>
                        <span className={styles.detailValue}>{shipment.documents.length} files</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.shipmentActions}>
                    <Link href={`/admin/shipments/${shipment.id}`} className={styles.viewButton}>
                      View Details
                    </Link>
                    <Link href={`/admin/shipments/${shipment.id}/edit`} className={styles.editButton}>
                      Edit Shipment
                    </Link>
                    <Link href={`/admin/shipments/${shipment.id}/documents`} className={styles.documentButton}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                      Documents
                    </Link>
                    <Link href={`/admin/shipments/${shipment.id}/track`} className={styles.trackButton}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      Track
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
