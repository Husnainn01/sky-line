'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import AdminHeader from '../../../../components/admin/AdminHeader';
import AdminSidebar from '../../../../components/admin/AdminSidebar';
import styles from './shipmentDetail.module.css';

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
  timeline?: {
    date: string;
    status: string;
    description: string;
    location?: string;
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
    ],
    timeline: [
      {
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Order Created',
        description: 'Shipment order created and confirmed'
      },
      {
        date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Documentation',
        description: 'Bill of Lading issued'
      },
      {
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Documentation',
        description: 'Export Certificate issued'
      },
      {
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Processing',
        description: 'Vehicle inspection completed'
      },
      {
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Processing',
        description: 'Preparing for shipping'
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
    ],
    timeline: [
      {
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Order Created',
        description: 'Shipment order created and confirmed'
      },
      {
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Documentation',
        description: 'Bill of Lading issued'
      },
      {
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Booked',
        description: 'Vessel booking confirmed',
        location: 'Yokohama Port, Japan'
      }
    ]
  }
];

export default function ShipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  // Find the shipment by ID
  const shipment = mockShipments.find(s => s.id === id);
  
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
  
  // If shipment not found, show error
  if (!shipment) {
    return (
      <div className={styles.dashboardLayout}>
        <AdminSidebar />
        <div className={styles.mainContent}>
          <AdminHeader title="Shipment Not Found" />
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h2 className={styles.errorTitle}>Shipment Not Found</h2>
            <p className={styles.errorMessage}>The shipment you are looking for does not exist or has been removed.</p>
            <Link href="/admin/shipments" className={styles.backButton}>
              Back to Shipments
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Update shipment status
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(false);
  
  const updateShipmentStatus = (newStatus: ShipmentStatus) => {
    setUpdatingStatus(true);
    
    // Simulate API call
    setTimeout(() => {
      setUpdatingStatus(false);
      setStatusUpdateSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setStatusUpdateSuccess(false);
      }, 3000);
    }, 1000);
  };
  
  return (
    <div className={styles.dashboardLayout}>
      <AdminSidebar />
      <div className={styles.mainContent}>
        <AdminHeader title={`Shipment ${shipment.id}`} />
        
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.breadcrumbs}>
              <Link href="/admin/shipments" className={styles.breadcrumbLink}>
                Shipments
              </Link>
              <span className={styles.breadcrumbSeparator}>/</span>
              <span className={styles.breadcrumbCurrent}>{shipment.id}</span>
            </div>
            
            <div className={styles.actions}>
              <Link href={`/admin/shipments/${id}/edit`} className={styles.editButton}>
                Edit Shipment
              </Link>
            </div>
          </div>
          
          {statusUpdateSuccess && (
            <div className={styles.successAlert}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>Shipment status updated successfully</span>
            </div>
          )}
          
          <div className={styles.shipmentOverview}>
            <div className={styles.overviewHeader}>
              <div className={styles.overviewInfo}>
                <h2 className={styles.overviewTitle}>{shipment.shipmentType === 'roro' ? 'RoRo Shipping' : 'Container Shipping'}</h2>
                <div className={styles.overviewMeta}>
                  <span>Created on {formatDate(shipment.createdAt)}</span>
                  <span className={styles.metaDot}>•</span>
                  <span>{shipment.vehicles.length} vehicle{shipment.vehicles.length > 1 ? 's' : ''}</span>
                </div>
              </div>
              
              <div className={styles.statusSection}>
                <div className={`${styles.statusBadge} ${styles[`status${shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1)}`]}`}>
                  {shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1)}
                </div>
                
                <div className={styles.statusActions}>
                  <label htmlFor="status-select" className={styles.statusLabel}>Update Status:</label>
                  <select 
                    id="status-select"
                    className={styles.statusSelect}
                    defaultValue={shipment.status}
                    onChange={(e) => updateShipmentStatus(e.target.value as ShipmentStatus)}
                    disabled={updatingStatus}
                  >
                    <option value="processing">Processing</option>
                    <option value="booked">Booked</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                  {updatingStatus && <span className={styles.statusUpdating}>Updating...</span>}
                </div>
              </div>
            </div>
            
            <div className={styles.infoGrid}>
              <div className={styles.infoCard}>
                <h3 className={styles.infoTitle}>Customer Information</h3>
                <div className={styles.infoContent}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Name</span>
                    <span className={styles.infoValue}>{shipment.customer.name}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Email</span>
                    <span className={styles.infoValue}>{shipment.customer.email}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Phone</span>
                    <span className={styles.infoValue}>{shipment.customer.phone}</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.infoCard}>
                <h3 className={styles.infoTitle}>Destination</h3>
                <div className={styles.infoContent}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Country</span>
                    <span className={styles.infoValue}>{shipment.destination.country}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Port</span>
                    <span className={styles.infoValue}>{shipment.destination.port}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Address</span>
                    <span className={styles.infoValue}>{shipment.destination.address}</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.infoCard}>
                <h3 className={styles.infoTitle}>Shipping Details</h3>
                <div className={styles.infoContent}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Tracking Number</span>
                    <span className={styles.infoValue}>{shipment.trackingNumber}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Estimated Delivery</span>
                    <span className={styles.infoValue}>{formatDate(shipment.estimatedDelivery)}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Shipping Cost</span>
                    <span className={styles.infoValue}>{formatCurrency(shipment.shippingCost)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.sectionTitle}>Vehicles</div>
          <div className={styles.vehiclesGrid}>
            {shipment.vehicles.map(vehicle => (
              <div key={vehicle.id} className={styles.vehicleCard}>
                <div className={styles.vehicleImageContainer}>
                  <Image 
                    src={vehicle.image} 
                    alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    width={300}
                    height={200}
                    className={styles.vehicleImage}
                  />
                </div>
                <div className={styles.vehicleInfo}>
                  <h3 className={styles.vehicleName}>{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                  {vehicle.vin && (
                    <div className={styles.vehicleVin}>
                      <span className={styles.vinLabel}>VIN:</span>
                      <span className={styles.vinValue}>{vehicle.vin}</span>
                    </div>
                  )}
                  <Link href={`/admin/vehicles/stock/${vehicle.id}`} className={styles.viewVehicleButton}>
                    View Vehicle Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className={styles.sectionTitle}>Documents</div>
          <div className={styles.documentsSection}>
            <div className={styles.documentsList}>
              {shipment.documents.map((doc, index) => (
                <div key={index} className={styles.documentItem}>
                  <div className={styles.documentIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                  </div>
                  <div className={styles.documentInfo}>
                    <span className={styles.documentName}>{doc.name}</span>
                    <span className={styles.documentDate}>Uploaded on {formatDate(doc.uploadedAt)}</span>
                  </div>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className={styles.documentDownload}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                  </a>
                </div>
              ))}
            </div>
            
            <div className={styles.uploadSection}>
              <button className={styles.uploadButton}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                Upload New Document
              </button>
            </div>
          </div>
          
          {shipment.timeline && (
            <>
              <div className={styles.sectionTitle}>Shipment Timeline</div>
              <div className={styles.timelineSection}>
                {shipment.timeline.map((event, index) => (
                  <div key={index} className={styles.timelineItem}>
                    <div className={styles.timelineDate}>{formatDate(event.date)}</div>
                    <div className={styles.timelinePoint}></div>
                    <div className={styles.timelineContent}>
                      <div className={styles.timelineStatus}>{event.status}</div>
                      <div className={styles.timelineDescription}>{event.description}</div>
                      {event.location && (
                        <div className={styles.timelineLocation}>{event.location}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
