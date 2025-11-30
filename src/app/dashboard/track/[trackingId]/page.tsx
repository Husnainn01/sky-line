'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

type TrackingStatus = 'delivered' | 'in_transit' | 'processing' | 'customs' | 'ready';

type DocumentStatus = 'available' | 'pending';

type TrackingEvent = {
  date: string;
  location: string;
  status: string;
  description: string;
  completed: boolean;
};

type Document = {
  name: string;
  type: string;
  uploadDate: string;
  size: string;
  status: DocumentStatus;
};

type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  image: string;
};

type TrackingData = {
  trackingNumber: string;
  status: TrackingStatus;
  estimatedDelivery: string;
  origin: {
    port: string;
    departureDate: string;
  };
  destination: {
    port: string;
    country: string;
  };
  consignee: string;
  vehicle: Vehicle | Vehicle[];
  shipmentType: 'roro' | 'container';
  carrier: string;
  vesselName: string;
  containerNumber?: string;
  events: TrackingEvent[];
  documents: Document[];
};

type MockTrackingDataType = {
  [key: string]: TrackingData;
};

// Mock tracking data
const mockTrackingData: MockTrackingDataType = {
  'JDM-TRK-12345': {
    trackingNumber: 'JDM-TRK-12345',
    status: 'in_transit',
    estimatedDelivery: '2026-01-14T00:00:00.000Z',
    origin: {
      port: 'Yokohama, Japan',
      departureDate: '2025-11-15T00:00:00.000Z',
    },
    destination: {
      port: 'Los Angeles, CA',
      country: 'United States',
    },
    consignee: 'John Doe',
    vehicle: {
      id: '1',
      make: 'Toyota',
      model: 'Supra',
      year: 1995,
      vin: 'JT2JA82J6P0056789',
      image: '/cars/supra.png',
    },
    shipmentType: 'roro',
    carrier: 'Ocean Network Express (ONE)',
    vesselName: 'ONE Commitment',
    containerNumber: '',
    events: [
      {
        date: '2025-11-15T09:30:00.000Z',
        location: 'Yokohama Port, Japan',
        status: 'Departed origin port',
        description: 'Vehicle has been loaded onto vessel and departed from origin port',
        completed: true,
      },
      {
        date: '2025-11-28T14:15:00.000Z',
        location: 'Pacific Ocean',
        status: 'In transit',
        description: 'Vessel is currently in transit across the Pacific Ocean',
        completed: true,
      },
      {
        date: '2025-12-20T00:00:00.000Z',
        location: 'Los Angeles, CA',
        status: 'Arrival at destination port',
        description: 'Vessel scheduled to arrive at destination port',
        completed: false,
      },
      {
        date: '2025-12-27T00:00:00.000Z',
        location: 'Los Angeles, CA',
        status: 'Customs clearance',
        description: 'Vehicle will undergo customs inspection and clearance',
        completed: false,
      },
      {
        date: '2026-01-10T00:00:00.000Z',
        location: 'Los Angeles, CA',
        status: 'Ready for pickup/delivery',
        description: 'Vehicle will be available for pickup or delivery arrangement',
        completed: false,
      },
      {
        date: '2026-01-14T00:00:00.000Z',
        location: 'Final Destination',
        status: 'Delivered',
        description: 'Vehicle will be delivered to the consignee',
        completed: false,
      },
    ],
    documents: [
      {
        name: 'Bill of Lading',
        type: 'PDF',
        uploadDate: '2025-11-10T00:00:00.000Z',
        size: '156 KB',
        status: 'available',
      },
      {
        name: 'Commercial Invoice',
        type: 'PDF',
        uploadDate: '2025-11-10T00:00:00.000Z',
        size: '89 KB',
        status: 'available',
      },
      {
        name: 'Packing List',
        type: 'PDF',
        uploadDate: '2025-11-10T00:00:00.000Z',
        size: '64 KB',
        status: 'available',
      },
      {
        name: 'Customs Declaration',
        type: 'PDF',
        uploadDate: '2025-11-28T00:00:00.000Z',
        size: '112 KB',
        status: 'available',
      },
      {
        name: 'Delivery Order',
        type: 'PDF',
        uploadDate: '',
        size: '',
        status: 'pending',
      },
    ],
  },
  'JDM-TRK-12346': {
    trackingNumber: 'JDM-TRK-12346',
    status: 'processing',
    estimatedDelivery: '2026-02-10T00:00:00.000Z',
    origin: {
      port: 'Tokyo, Japan',
      departureDate: '2025-12-05T00:00:00.000Z',
    },
    destination: {
      port: 'Sydney',
      country: 'Australia',
    },
    consignee: 'Jane Smith',
    vehicle: [
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
      }
    ],
    shipmentType: 'container',
    carrier: 'Maersk Line',
    vesselName: 'Maersk Edmonton',
    containerNumber: 'MRKU1234567',
    events: [
      {
        date: '2025-11-25T10:45:00.000Z',
        location: 'Tokyo, Japan',
        status: 'Order received',
        description: 'Shipping order has been received and processed',
        completed: true,
      },
      {
        date: '2025-11-30T14:20:00.000Z',
        location: 'Tokyo, Japan',
        status: 'Container loading',
        description: 'Vehicles are being loaded into shipping container',
        completed: true,
      },
      {
        date: '2025-12-05T00:00:00.000Z',
        location: 'Tokyo Port, Japan',
        status: 'Departed origin port',
        description: 'Container has been loaded onto vessel and scheduled to depart',
        completed: false,
      },
      {
        date: '2025-12-28T00:00:00.000Z',
        location: 'Sydney, Australia',
        status: 'Arrival at destination port',
        description: 'Vessel scheduled to arrive at destination port',
        completed: false,
      },
      {
        date: '2026-01-15T00:00:00.000Z',
        location: 'Sydney, Australia',
        status: 'Customs clearance',
        description: 'Container will undergo customs inspection and clearance',
        completed: false,
      },
      {
        date: '2026-02-05T00:00:00.000Z',
        location: 'Sydney, Australia',
        status: 'Ready for pickup/delivery',
        description: 'Vehicles will be available for pickup or delivery arrangement',
        completed: false,
      },
      {
        date: '2026-02-10T00:00:00.000Z',
        location: 'Final Destination',
        status: 'Delivered',
        description: 'Vehicles will be delivered to the consignee',
        completed: false,
      },
    ],
    documents: [
      {
        name: 'Bill of Lading',
        type: 'PDF',
        uploadDate: '2025-11-20T00:00:00.000Z',
        size: '178 KB',
        status: 'available',
      },
      {
        name: 'Commercial Invoice',
        type: 'PDF',
        uploadDate: '2025-11-20T00:00:00.000Z',
        size: '124 KB',
        status: 'available',
      },
      {
        name: 'Packing List',
        type: 'PDF',
        uploadDate: '2025-11-20T00:00:00.000Z',
        size: '98 KB',
        status: 'available',
      },
    ],
  },
};

export default function TrackingPage() {
  const { trackingId } = useParams();
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('timeline');

  useEffect(() => {
    // Simulate API call to fetch tracking data
    setTimeout(() => {
      if (typeof trackingId === 'string' && mockTrackingData[trackingId]) {
        setTrackingData(mockTrackingData[trackingId]);
        setLoading(false);
      } else {
        setError('Tracking information not found. Please check your tracking number and try again.');
        setLoading(false);
      }
    }, 800);
  }, [trackingId]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    return `${formatDate(dateString)} at ${formatTime(dateString)}`;
  };

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'delivered': return styles.statusDelivered;
      case 'in_transit': return styles.statusInTransit;
      case 'processing': return styles.statusProcessing;
      case 'customs': return styles.statusCustoms;
      case 'ready': return styles.statusReady;
      default: return styles.statusProcessing;
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'delivered': return 'Delivered';
      case 'in_transit': return 'In Transit';
      case 'processing': return 'Processing';
      case 'customs': return 'Customs Clearance';
      case 'ready': return 'Ready for Pickup';
      default: return 'Processing';
    }
  };

  const getProgressPercentage = () => {
    if (!trackingData) return 0;
    
    const totalEvents = trackingData.events.length;
    const completedEvents = trackingData.events.filter((event) => event.completed).length;
    
    return Math.round((completedEvents / totalEvents) * 100);
  };

  const renderVehicleInfo = () => {
    if (!trackingData) return null;
    
    if (Array.isArray(trackingData.vehicle)) {
      return (
        <div className={styles.vehiclesGrid}>
          {trackingData.vehicle.map((vehicle) => (
            <div key={vehicle.id} className={styles.vehicleCard}>
              <div className={styles.vehicleImageContainer}>
                <Image 
                  src={vehicle.image} 
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  width={100}
                  height={80}
                  className={styles.vehicleImage}
                />
              </div>
              <div className={styles.vehicleDetails}>
                <h4 className={styles.vehicleName}>{vehicle.year} {vehicle.make} {vehicle.model}</h4>
                <p className={styles.vehicleVin}>VIN: {vehicle.vin}</p>
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className={styles.singleVehicle}>
          <div className={styles.vehicleImageContainer}>
            <Image 
              src={trackingData.vehicle.image} 
              alt={`${trackingData.vehicle.year} ${trackingData.vehicle.make} ${trackingData.vehicle.model}`}
              width={100}
              height={80}
              className={styles.vehicleImage}
            />
          </div>
          <div className={styles.vehicleDetails}>
            <h3 className={styles.vehicleName}>{trackingData.vehicle.year} {trackingData.vehicle.make} {trackingData.vehicle.model}</h3>
            <p className={styles.vehicleVin}>VIN: {trackingData.vehicle.vin}</p>
          </div>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading tracking information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h2 className={styles.errorTitle}>Tracking Not Found</h2>
        <p className={styles.errorMessage}>{error}</p>
        <Link href="/dashboard/shipments" className={styles.backButton}>
          Return to Shipments
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/dashboard/shipments" className={styles.backLink}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Shipments
          </Link>
          <h1 className={styles.title}>Tracking Details</h1>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.shareButton}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            Share
          </button>
          <button className={styles.printButton}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            Print
          </button>
        </div>
      </div>

      {trackingData && (
        <div className={styles.trackingOverview}>
          <div className={styles.trackingHeader}>
            <div className={styles.trackingInfo}>
              <div className={styles.trackingNumberContainer}>
                <span className={styles.trackingLabel}>Tracking Number</span>
                <span className={styles.trackingNumber}>{trackingData.trackingNumber}</span>
              </div>
              <div className={`${styles.statusBadge} ${getStatusClass(trackingData.status)}`}>
                {getStatusText(trackingData.status)}
              </div>
            </div>
            <div className={styles.deliveryInfo}>
              <span className={styles.estimatedLabel}>Estimated Delivery</span>
              <span className={styles.estimatedDate}>{formatDate(trackingData.estimatedDelivery)}</span>
            </div>
          </div>

          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            <div className={styles.progressLabel}>
              <span>{getProgressPercentage()}% Complete</span>
            </div>
          </div>
        </div>
      )}

      {trackingData && (
        <div>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === 'timeline' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('timeline')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Timeline
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'details' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('details')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              Shipment Details
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'documents' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('documents')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              Documents
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'timeline' && (
              <div className={styles.timelineContainer}>
                <div className={styles.timeline}>
                  {trackingData.events.map((event, index) => (
                    <div 
                      key={index} 
                      className={`${styles.timelineEvent} ${event.completed ? styles.completed : ''}`}
                    >
                      <div className={styles.timelinePoint}>
                        <div className={styles.timelineMarker}></div>
                        {index < trackingData.events.length - 1 && <div className={styles.timelineLine}></div>}
                      </div>
                      <div className={styles.timelineContent}>
                        <div className={styles.timelineHeader}>
                          <h3 className={styles.timelineTitle}>{event.status}</h3>
                          <span className={styles.timelineDate}>{formatDateTime(event.date)}</span>
                        </div>
                        <div className={styles.timelineDetails}>
                          <p className={styles.timelineLocation}>{event.location}</p>
                          <p className={styles.timelineDescription}>{event.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'details' && (
              <div className={styles.detailsContainer}>
                <div className={styles.detailsSection}>
                  <h3 className={styles.sectionTitle}>Vehicle Information</h3>
                  {renderVehicleInfo()}
                </div>

                <div className={styles.detailsGrid}>
                  <div className={styles.detailsSection}>
                    <h3 className={styles.sectionTitle}>Shipment Information</h3>
                    <div className={styles.detailsList}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Shipment Type</span>
                        <span className={styles.detailValue}>
                          {trackingData.shipmentType === 'roro' ? 'RoRo (Roll-on/Roll-off)' : 'Container'}
                        </span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Carrier</span>
                        <span className={styles.detailValue}>{trackingData.carrier}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Vessel Name</span>
                        <span className={styles.detailValue}>{trackingData.vesselName}</span>
                      </div>
                      {trackingData.containerNumber && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Container Number</span>
                          <span className={styles.detailValue}>{trackingData.containerNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.detailsSection}>
                    <h3 className={styles.sectionTitle}>Route Information</h3>
                    <div className={styles.detailsList}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Origin Port</span>
                        <span className={styles.detailValue}>{trackingData.origin.port}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Departure Date</span>
                        <span className={styles.detailValue}>{formatDate(trackingData.origin.departureDate)}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Destination Port</span>
                        <span className={styles.detailValue}>{trackingData.destination.port}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Destination Country</span>
                        <span className={styles.detailValue}>{trackingData.destination.country}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.detailsSection}>
                    <h3 className={styles.sectionTitle}>Consignee Information</h3>
                    <div className={styles.detailsList}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Consignee Name</span>
                        <span className={styles.detailValue}>{trackingData.consignee}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className={styles.documentsContainer}>
                <div className={styles.documentsHeader}>
                  <h3 className={styles.sectionTitle}>Shipping Documents</h3>
                  <p className={styles.documentsDescription}>
                    Download and view all documents related to your shipment. Some documents may become available as your shipment progresses.
                  </p>
                </div>

                <div className={styles.documentsList}>
                  {trackingData.documents.map((doc, index) => (
                <div key={index} className={styles.documentItem}>
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
        )}
          </div>
        </div>
      )}
    </div>
  );
}
