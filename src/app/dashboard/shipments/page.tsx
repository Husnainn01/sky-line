'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { carsData } from '@/data/mockData';
import styles from './page.module.css';

// Define types for the vehicles
type BaseCar = typeof carsData[0];

interface PurchasedVehicle extends BaseCar {
  purchaseId: string;
  purchaseDate: string;
  purchaseType: 'direct' | 'auction';
  shipmentStatus: 'pending' | 'processing' | 'shipped';
  price: number;
}

interface AuctionVehicle extends BaseCar {
  auctionId: string;
  auctionEndDate: string;
  winningBid: number;
  shipmentStatus: 'pending' | 'processing' | 'shipped';
  paymentStatus: 'completed' | 'pending';
}

type AvailableVehicle = PurchasedVehicle | AuctionVehicle;

interface Shipment {
  id: string;
  vehicles: AvailableVehicle[];
  shipmentType: 'roro' | 'container';
  status: 'processing' | 'booked' | 'shipped' | 'delivered';
  createdAt: string;
  estimatedDelivery: string;
  destination: {
    country: string;
    port: string;
    consignee: string;
    address: string;
  };
  trackingNumber: string;
  shippingCost: number;
}

// Mock data for user's purchased vehicles and won auctions
const mockPurchasedVehicles: PurchasedVehicle[] = carsData.slice(0, 3).map((car, index) => {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * 14) + 1;
  const purchaseDate = new Date(now.setDate(now.getDate() - randomDays));
  
  return {
    ...car,
    purchaseId: `PUR-${100000 + index}`,
    purchaseDate: purchaseDate.toISOString(),
    purchaseType: index % 2 === 0 ? 'direct' : 'auction',
    shipmentStatus: 'pending', // pending, processing, shipped
    price: car.price + Math.floor(Math.random() * 2000)
  };
});

const mockWonAuctions: AuctionVehicle[] = carsData.slice(3, 5).map((car, index) => {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * 7) + 1;
  const auctionEndDate = new Date(now.setDate(now.getDate() - randomDays));
  
  return {
    ...car,
    auctionId: `AUC-${200000 + index}`,
    auctionEndDate: auctionEndDate.toISOString(),
    winningBid: car.price + Math.floor(Math.random() * 3000),
    shipmentStatus: 'pending',
    paymentStatus: 'completed'
  };
});

// Combine purchased vehicles and won auctions
const availableVehicles: AvailableVehicle[] = [
  ...mockPurchasedVehicles,
  ...mockWonAuctions
];

// Mock data for existing shipments
const mockShipments: Shipment[] = [
  {
    id: 'SHP-100001',
    vehicles: [mockPurchasedVehicles[0]],
    shipmentType: 'roro',
    status: 'processing',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedDelivery: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    destination: {
      country: 'United States',
      port: 'Los Angeles, CA',
      consignee: 'John Doe',
      address: '123 Main St, Los Angeles, CA 90001'
    },
    trackingNumber: 'JDM-TRK-12345',
    shippingCost: 2500
  },
  {
    id: 'SHP-100002',
    vehicles: [mockWonAuctions[0], mockPurchasedVehicles[1]],
    shipmentType: 'container',
    status: 'booked',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedDelivery: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    destination: {
      country: 'Australia',
      port: 'Sydney',
      consignee: 'Jane Smith',
      address: '456 Park Ave, Sydney, NSW 2000'
    },
    trackingNumber: 'JDM-TRK-12346',
    shippingCost: 4800
  }
];

// Ports data
const ports = {
  'United States': ['Los Angeles, CA', 'Long Beach, CA', 'New York, NY', 'Seattle, WA', 'Miami, FL'],
  'Canada': ['Vancouver, BC', 'Toronto, ON', 'Montreal, QC', 'Halifax, NS'],
  'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth'],
  'New Zealand': ['Auckland', 'Wellington', 'Christchurch'],
  'United Kingdom': ['Southampton', 'Liverpool', 'London Gateway'],
  'Germany': ['Hamburg', 'Bremen', 'Bremerhaven'],
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah'],
  'Singapore': ['Singapore Port']
};

type ShipmentTab = 'create' | 'active';
type ShipmentType = 'roro' | 'container';

export default function ShipmentsPage() {
  const [activeTab, setActiveTab] = useState<ShipmentTab>('active');
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [shipmentType, setShipmentType] = useState<ShipmentType>('roro');
  const [formData, setFormData] = useState({
    country: '',
    port: '',
    consignee: '',
    address: '',
    email: '',
    phone: ''
  });
  const [availablePorts, setAvailablePorts] = useState<string[]>([]);
  const [isCreatingShipment, setIsCreatingShipment] = useState(false);
  const [shipmentCreated, setShipmentCreated] = useState(false);
  const [newShipmentId, setNewShipmentId] = useState('');

  // Handle country change to update available ports
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = e.target.value;
    setFormData(prev => ({ ...prev, country, port: '' }));
    setAvailablePorts(ports[country as keyof typeof ports] || []);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Toggle vehicle selection
  const toggleVehicleSelection = (vehicleId: string) => {
    if (selectedVehicles.includes(vehicleId)) {
      setSelectedVehicles(selectedVehicles.filter(id => id !== vehicleId));
    } else {
      // For container shipments, limit to 2 vehicles
      if (shipmentType === 'container' && selectedVehicles.length >= 2) {
        return;
      }
      setSelectedVehicles([...selectedVehicles, vehicleId]);
    }
  };

  // Handle shipment creation
  const handleCreateShipment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedVehicles.length === 0) {
      alert('Please select at least one vehicle for shipment.');
      return;
    }
    
    setIsCreatingShipment(true);
    
    // Simulate API call
    setTimeout(() => {
      // Generate a random shipment ID
      const shipmentId = `SHP-${Math.floor(100000 + Math.random() * 900000)}`;
      setNewShipmentId(shipmentId);
      setShipmentCreated(true);
      setIsCreatingShipment(false);
    }, 1500);
  };

  // Reset form after successful shipment creation
  const resetForm = () => {
    setShipmentCreated(false);
    setSelectedVehicles([]);
    setShipmentType('roro');
    setFormData({
      country: '',
      port: '',
      consignee: '',
      address: '',
      email: '',
      phone: ''
    });
    setAvailablePorts([]);
    setActiveTab('active');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Filter out vehicles that are already in active shipments
  const vehiclesAvailableForShipment = availableVehicles.filter(vehicle => 
    vehicle.shipmentStatus === 'pending'
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Shipments</h1>
          <p className={styles.subtitle}>Manage and track your vehicle shipments</p>
        </div>
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'active' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active Shipments
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'create' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Create Shipment
        </button>
      </div>

      {activeTab === 'active' && (
        <div className={styles.activeShipments}>
          {mockShipments.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path>
                  <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"></path>
                  <path d="M12 3v6"></path>
                </svg>
              </div>
              <h3>No active shipments</h3>
              <p>You don't have any active shipments. Create a new shipment for your purchased vehicles.</p>
              <button className={styles.emptyButton} onClick={() => setActiveTab('create')}>
                Create Shipment
              </button>
            </div>
          ) : (
            <div className={styles.shipmentsList}>
              {mockShipments.map(shipment => (
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
                          <div className={styles.vehicleMeta}>
                            <span>
                              {'purchaseId' in vehicle ? vehicle.purchaseId : vehicle.auctionId}
                            </span>
                            <span className={styles.vehicleDot}>•</span>
                            <span>
                              {'purchaseType' in vehicle ? vehicle.purchaseType : 'Auction'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className={styles.shipmentDetails}>
                    <div className={styles.detailsGrid}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Destination</span>
                        <span className={styles.detailValue}>{shipment.destination.country}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Port</span>
                        <span className={styles.detailValue}>{shipment.destination.port}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Consignee</span>
                        <span className={styles.detailValue}>{shipment.destination.consignee}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Tracking</span>
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
                    </div>
                  </div>
                  
                  <div className={styles.shipmentActions}>
                    <Link href={`/dashboard/shipments/${shipment.id}`} className={styles.viewButton}>
                      View Details
                    </Link>
                    <Link href={`/dashboard/track/${shipment.trackingNumber}`} className={styles.trackButton}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      Track Shipment
                    </Link>
                    <button className={styles.documentButton}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                      Documents
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'create' && !shipmentCreated && (
        <div className={styles.createShipment}>
          {vehiclesAvailableForShipment.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.6-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
                  <circle cx="7" cy="17" r="2"></circle>
                  <path d="M9 17h6"></path>
                  <circle cx="17" cy="17" r="2"></circle>
                </svg>
              </div>
              <h3>No vehicles available for shipment</h3>
              <p>You don't have any purchased vehicles or won auctions that are ready for shipment.</p>
              <Link href="/inventory" className={styles.emptyButton}>
                Browse Inventory
              </Link>
            </div>
          ) : (
            <form onSubmit={handleCreateShipment} className={styles.shipmentForm}>
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>1. Select Shipping Method</h3>
                <div className={styles.shippingMethods}>
                  <div 
                    className={`${styles.shippingMethod} ${shipmentType === 'roro' ? styles.selectedMethod : ''}`}
                    onClick={() => setShipmentType('roro')}
                  >
                    <div className={styles.methodIcon}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path>
                        <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"></path>
                        <path d="M12 3v6"></path>
                      </svg>
                    </div>
                    <div className={styles.methodInfo}>
                      <h4>RoRo Shipping</h4>
                      <p>Roll-on/Roll-off shipping. Vehicles are driven onto the vessel.</p>
                      <ul className={styles.methodFeatures}>
                        <li>Lower cost</li>
                        <li>Faster shipping</li>
                        <li>No personal items</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div 
                    className={`${styles.shippingMethod} ${shipmentType === 'container' ? styles.selectedMethod : ''}`}
                    onClick={() => setShipmentType('container')}
                  >
                    <div className={styles.methodIcon}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                        <path d="M1 10h22"></path>
                      </svg>
                    </div>
                    <div className={styles.methodInfo}>
                      <h4>Container Shipping</h4>
                      <p>Vehicles are loaded into a dedicated shipping container.</p>
                      <ul className={styles.methodFeatures}>
                        <li>Better protection</li>
                        <li>Personal items allowed</li>
                        <li>Up to 2 vehicles per container</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>2. Select Vehicles</h3>
                <p className={styles.sectionDescription}>
                  {shipmentType === 'container' 
                    ? 'Select up to 2 vehicles for container shipping.' 
                    : 'Select vehicles for RoRo shipping.'}
                </p>
                
                <div className={styles.vehicleSelection}>
                  {vehiclesAvailableForShipment.map(vehicle => (
                    <div 
                      key={vehicle.id} 
                      className={`${styles.vehicleCard} ${selectedVehicles.includes(vehicle.id) ? styles.selectedVehicle : ''}`}
                      onClick={() => toggleVehicleSelection(vehicle.id)}
                    >
                      <div className={styles.vehicleImageContainer}>
                        <Image 
                          src={vehicle.image} 
                          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                          width={120}
                          height={80}
                          className={styles.vehicleImage}
                        />
                        {selectedVehicles.includes(vehicle.id) && (
                          <div className={styles.selectedIndicator}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                              <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className={styles.vehicleCardInfo}>
                        <h4 className={styles.vehicleCardName}>{vehicle.year} {vehicle.make} {vehicle.model}</h4>
                        <div className={styles.vehicleCardDetails}>
                          <span className={styles.vehicleId}>
                            {'purchaseId' in vehicle ? vehicle.purchaseId : vehicle.auctionId}
                          </span>
                          <span className={styles.vehicleType}>
                            {'purchaseType' in vehicle ? 
                              (vehicle.purchaseType === 'direct' ? 'Direct Purchase' : 'Auction Win') : 
                              'Auction Win'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>3. Destination & Consignee Information</h3>
                
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="country">Destination Country*</label>
                    <select 
                      id="country" 
                      name="country" 
                      value={formData.country}
                      onChange={handleCountryChange}
                      required
                      className={styles.formInput}
                    >
                      <option value="">Select Country</option>
                      {Object.keys(ports).map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="port">Destination Port*</label>
                    <select 
                      id="port" 
                      name="port" 
                      value={formData.port}
                      onChange={handleInputChange}
                      required
                      disabled={!formData.country}
                      className={styles.formInput}
                    >
                      <option value="">Select Port</option>
                      {availablePorts.map(port => (
                        <option key={port} value={port}>{port}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="consignee">Consignee Name*</label>
                    <input 
                      type="text" 
                      id="consignee" 
                      name="consignee" 
                      value={formData.consignee}
                      onChange={handleInputChange}
                      required
                      className={styles.formInput}
                      placeholder="Full name as it appears on ID"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="email">Email Address*</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className={styles.formInput}
                      placeholder="email@example.com"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="phone">Phone Number*</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone" 
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className={styles.formInput}
                      placeholder="Include country code"
                    />
                  </div>
                  
                  <div className={styles.formGroup + ' ' + styles.fullWidth}>
                    <label htmlFor="address">Delivery Address*</label>
                    <textarea 
                      id="address" 
                      name="address" 
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className={styles.formTextarea}
                      placeholder="Full delivery address"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              
              <div className={styles.formActions}>
                <button 
                  type="button" 
                  className={styles.cancelButton}
                  onClick={() => setActiveTab('active')}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={isCreatingShipment || selectedVehicles.length === 0}
                >
                  {isCreatingShipment ? 'Creating Shipment...' : 'Create Shipment'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {activeTab === 'create' && shipmentCreated && (
        <div className={styles.successState}>
          <div className={styles.successIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h2 className={styles.successTitle}>Shipment Created Successfully!</h2>
          <p className={styles.successMessage}>
            Your shipment has been created and is now being processed. You can track your shipment using the details below.
          </p>
          
          <div className={styles.successDetails}>
            <div className={styles.successDetail}>
              <span className={styles.detailLabel}>Shipment ID</span>
              <span className={styles.detailValue}>{newShipmentId}</span>
            </div>
            <div className={styles.successDetail}>
              <span className={styles.detailLabel}>Shipping Method</span>
              <span className={styles.detailValue}>{shipmentType === 'roro' ? 'RoRo Shipping' : 'Container Shipping'}</span>
            </div>
            <div className={styles.successDetail}>
              <span className={styles.detailLabel}>Vehicles</span>
              <span className={styles.detailValue}>{selectedVehicles.length} vehicle(s)</span>
            </div>
            <div className={styles.successDetail}>
              <span className={styles.detailLabel}>Destination</span>
              <span className={styles.detailValue}>{formData.port}, {formData.country}</span>
            </div>
          </div>
          
          <div className={styles.successActions}>
            <button 
              className={styles.viewShipmentButton}
              onClick={() => setActiveTab('active')}
            >
              View All Shipments
            </button>
            <button 
              className={styles.newShipmentButton}
              onClick={resetForm}
            >
              Create Another Shipment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
