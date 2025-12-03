'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { carsData } from '@/data/mockData';
import AdminHeader from '../../../../../../components/admin/AdminHeader';
import AdminSidebar from '../../../../../../components/admin/AdminSidebar';
import styles from '../../new/vehicleForm.module.css';

export default function EditVehiclePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    mileage: '',
    transmission: 'Manual',
    fuelType: 'Gasoline',
    drivetrain: 'RWD',
    image: '',
    description: '',
    features: '',
    condition: 'Excellent',
    location: 'Tokyo, Japan',
    available: true,
    bodyType: 'Coupe',
    vin: '',
    engine: '',
    cylinders: '',
    color: '',
    doors: '',
    stockNumber: '',
    steering: 'Right Hand'
  });
  
  // Load vehicle data
  useEffect(() => {
    const vehicle = carsData.find(car => car.id === id);
    
    if (!vehicle) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }
    
    // Convert vehicle data to form data format with proper type handling
    setFormData({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      price: vehicle.price.toString(),
      mileage: vehicle.mileage.toString(),
      transmission: vehicle.transmission,
      fuelType: vehicle.fuelType,
      drivetrain: vehicle.drivetrain,
      image: vehicle.image,
      description: vehicle.description,
      features: vehicle.features.join(', '),
      condition: vehicle.condition,
      location: vehicle.location,
      available: vehicle.available,
      bodyType: vehicle.bodyType || 'Coupe',
      vin: vehicle.vin || '',
      engine: vehicle.engine || '',
      cylinders: vehicle.cylinders?.toString() || '',
      color: vehicle.color || '',
      doors: vehicle.doors?.toString() || '',
      stockNumber: vehicle.stockNumber || '',
      steering: vehicle.steering || 'Right Hand',
    });
    
    setIsLoading(false);
  }, [id]);
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'features') {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Convert features string to array
      const featuresArray = formData.features
        .split(',')
        .map(feature => feature.trim())
        .filter(feature => feature !== '');
      
      // Prepare data for submission
      const vehicleData = {
        ...formData,
        features: featuresArray,
        price: parseFloat(formData.price as string),
        mileage: parseFloat(formData.mileage as string),
        cylinders: formData.cylinders ? parseInt(formData.cylinders as string, 10) : undefined,
        doors: formData.doors ? parseInt(formData.doors as string, 10) : undefined,
      };
      
      console.log('Updating vehicle data:', vehicleData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to vehicle detail page after successful update
      router.push(`/admin/vehicles/stock/${id}`);
      
    } catch (error) {
      console.error('Error updating vehicle data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className={styles.dashboardLayout}>
        <AdminSidebar />
        <div className={styles.mainContent}>
          <AdminHeader title="Loading..." />
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading vehicle data...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Show not found state
  if (notFound) {
    return (
      <div className={styles.dashboardLayout}>
        <AdminSidebar />
        <div className={styles.mainContent}>
          <AdminHeader title="Vehicle Not Found" />
          <div className={styles.errorContainer}>
            <h1 className={styles.errorTitle}>Vehicle Not Found</h1>
            <p className={styles.errorMessage}>The vehicle you are trying to edit does not exist or has been removed.</p>
            <Link href="/admin/vehicles/stock" className={styles.backButton}>
              Back to Stock Vehicles
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.dashboardLayout}>
      <AdminSidebar />
      <div className={styles.mainContent}>
        <AdminHeader title={`Edit ${formData.year} ${formData.make} ${formData.model}`} />
        
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.breadcrumbs}>
              <Link href="/admin/vehicles/stock" className={styles.breadcrumbLink}>
                Stock Vehicles
              </Link>
              <span className={styles.breadcrumbSeparator}>/</span>
              <Link href={`/admin/vehicles/stock/${id}`} className={styles.breadcrumbLink}>
                {formData.year} {formData.make} {formData.model}
              </Link>
              <span className={styles.breadcrumbSeparator}>/</span>
              <span className={styles.breadcrumbCurrent}>Edit</span>
            </div>
          </div>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Basic Information</h2>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="make" className={styles.label}>Make *</label>
                <input
                  type="text"
                  id="make"
                  name="make"
                  value={formData.make}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Toyota"
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="model" className={styles.label}>Model *</label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Supra"
                  required
                />
              </div>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="year" className={styles.label}>Year *</label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className={styles.input}
                  min="1970"
                  max={new Date().getFullYear() + 1}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="bodyType" className={styles.label}>Body Type</label>
                <select
                  id="bodyType"
                  name="bodyType"
                  value={formData.bodyType}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value="Coupe">Coupe</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Convertible">Convertible</option>
                  <option value="Wagon">Wagon</option>
                  <option value="Van">Van</option>
                  <option value="Truck">Truck</option>
                </select>
              </div>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="price" className={styles.label}>Price (USD) *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="25000"
                  min="0"
                  step="1"
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="mileage" className={styles.label}>Mileage (km) *</label>
                <input
                  type="number"
                  id="mileage"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="50000"
                  min="0"
                  required
                />
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="image" className={styles.label}>Image URL *</label>
              <input
                type="text"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className={styles.input}
                placeholder="/cars/example.png"
                required
              />
              <p className={styles.helpText}>Enter the path to the image (e.g., /cars/supra.png)</p>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="description" className={styles.label}>Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={styles.textarea}
                placeholder="Describe the vehicle..."
                rows={4}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="features" className={styles.label}>Features *</label>
              <textarea
                id="features"
                name="features"
                value={formData.features}
                onChange={handleChange}
                className={styles.textarea}
                placeholder="Twin-Turbo 2JZ-GTE, Original Paint, Full Service History, Clean Title"
                rows={3}
                required
              />
              <p className={styles.helpText}>Enter features separated by commas</p>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="condition" className={styles.label}>Condition *</label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className={styles.select}
                  required
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Very Good">Very Good</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="location" className={styles.label}>Location *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Tokyo, Japan"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Technical Details</h2>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="transmission" className={styles.label}>Transmission *</label>
                <select
                  id="transmission"
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleChange}
                  className={styles.select}
                  required
                >
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="fuelType" className={styles.label}>Fuel Type *</label>
                <select
                  id="fuelType"
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  className={styles.select}
                  required
                >
                  <option value="Gasoline">Gasoline</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Electric">Electric</option>
                </select>
              </div>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="drivetrain" className={styles.label}>Drivetrain *</label>
                <select
                  id="drivetrain"
                  name="drivetrain"
                  value={formData.drivetrain}
                  onChange={handleChange}
                  className={styles.select}
                  required
                >
                  <option value="RWD">RWD</option>
                  <option value="FWD">FWD</option>
                  <option value="AWD">AWD</option>
                  <option value="4WD">4WD</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="steering" className={styles.label}>Steering</label>
                <select
                  id="steering"
                  name="steering"
                  value={formData.steering}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value="Right Hand">Right Hand</option>
                  <option value="Left Hand">Left Hand</option>
                </select>
              </div>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="engine" className={styles.label}>Engine</label>
                <input
                  type="text"
                  id="engine"
                  name="engine"
                  value={formData.engine}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="3.0L 2JZ-GTE"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="cylinders" className={styles.label}>Cylinders</label>
                <input
                  type="number"
                  id="cylinders"
                  name="cylinders"
                  value={formData.cylinders}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="6"
                  min="1"
                />
              </div>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="color" className={styles.label}>Color</label>
                <input
                  type="text"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Red"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="doors" className={styles.label}>Doors</label>
                <input
                  type="number"
                  id="doors"
                  name="doors"
                  value={formData.doors}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="2"
                  min="1"
                />
              </div>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="vin" className={styles.label}>VIN</label>
                <input
                  type="text"
                  id="vin"
                  name="vin"
                  value={formData.vin}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="JZA80-0005801"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="stockNumber" className={styles.label}>Stock Number</label>
                <input
                  type="text"
                  id="stockNumber"
                  name="stockNumber"
                  value={formData.stockNumber}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="SKY-5801"
                />
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="available"
                  checked={formData.available as boolean}
                  onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.checked }))}
                  className={styles.checkbox}
                />
                <span>Available for Sale</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className={styles.formActions}>
          <Link href={`/admin/vehicles/stock/${id}`} className={styles.cancelButton}>
            Cancel
          </Link>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Update Vehicle'}
          </button>
        </div>
      </form>
    </div>
    </div>
    </div>
  );
}
