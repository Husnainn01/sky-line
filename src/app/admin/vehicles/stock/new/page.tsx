'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminHeader from '../../../../../components/admin/AdminHeader';
import AdminSidebar from '../../../../../components/admin/AdminSidebar';
import ImageUploader, { UploadedImage } from '../../../../../components/admin/ImageUploader';
import { getAuthToken, verifySession } from '../../../../../utils/sessionManager';
import styles from './vehicleForm.module.css';

export default function NewVehiclePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Predefined badges
  const predefinedBadges = [
    { id: 'hot', label: 'Hot Stock', color: '#ef4444' },
    { id: '50off', label: '50% Off', color: '#f59e0b' },
    { id: 'winter', label: 'Winter Special', color: '#3b82f6' },
    { id: 'new', label: 'New Arrival', color: '#10b981' },
    { id: 'limited', label: 'Limited Edition', color: '#8b5cf6' },
    { id: 'sale', label: 'On Sale', color: '#ec4899' },
  ];

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
    steering: 'Right Hand',
    badge: '',
    customBadge: '',
    slug: '',
    customBadgeColor: '#c70f0f'
  });
  
  // Images state
  const [images, setImages] = useState<UploadedImage[]>([]);
  
  // Custom badge state
  const [showCustomBadge, setShowCustomBadge] = useState(false);
  
  // Helper function to properly capitalize vehicle makes and models
  const properCapitalize = (text: string): string => {
    // Special case for common abbreviations like BMW, GMC, etc.
    const commonAbbreviations = ['bmw', 'gmc', 'amg', 'jdm'];
    if (commonAbbreviations.includes(text.toLowerCase())) {
      return text.toUpperCase();
    }
    
    // For hyphenated names like Alfa-Romeo
    if (text.includes('-')) {
      return text.split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join('-');
    }
    
    // Standard title case
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };
  
  // Generate slug from make, model and year
  const generateSlug = (make: string, model: string, year: number | string) => {
    return `${make}-${model}-${year}`
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');
  };

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Special handling for make and model fields to ensure proper capitalization
    if (name === 'make' || name === 'model') {
      const formattedValue = properCapitalize(value.trim());
      setFormData(prev => {
        // Update make or model
        const updatedData = { ...prev, [name]: formattedValue };
        
        // If we have both make and model, update the slug
        if (updatedData.make && updatedData.model) {
          updatedData.slug = generateSlug(updatedData.make, updatedData.model, updatedData.year);
        }
        
        return updatedData;
      });
    } else if (name === 'year') {
      setFormData(prev => {
        // Update year - convert string to number
        const yearValue = parseInt(value, 10);
        const updatedData = { ...prev, [name]: yearValue };
        
        // If we have make and model, update the slug
        if (updatedData.make && updatedData.model) {
          updatedData.slug = generateSlug(updatedData.make, updatedData.model, updatedData.year);
        }
        
        return updatedData;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that at least one image is uploaded
    if (images.length === 0) {
      // Scroll to the images section
      document.querySelector('#images-section')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Convert features string to array
      const featuresArray = formData.features
        .split(',')
        .map(feature => feature.trim())
        .filter(feature => feature !== '');
      
      // Prepare badge data
      let badgeData = null;
      if (formData.badge === 'custom' && formData.customBadge) {
        badgeData = {
          text: formData.customBadge,
          color: formData.customBadgeColor
        };
      } else if (formData.badge) {
        const selectedBadge = predefinedBadges.find(b => b.id === formData.badge);
        if (selectedBadge) {
          badgeData = {
            text: selectedBadge.label,
            color: selectedBadge.color
          };
        }
      }
      
      // Use the slug from formData or generate a new one if it's empty
      const slug = formData.slug || generateSlug(formData.make, formData.model, formData.year);
      
      // Prepare data for submission
      const vehicleData = {
        make: formData.make,
        model: formData.model,
        year: formData.year,
        price: parseFloat(formData.price as string),
        mileage: parseFloat(formData.mileage as string),
        type: 'stock', // This is a stock vehicle
        condition: formData.condition,
        transmission: formData.transmission,
        fuelType: formData.fuelType,
        driveType: formData.drivetrain,
        bodyType: formData.bodyType,
        exteriorColor: formData.color || 'Not specified',
        interiorColor: 'Not specified', // Add this field to the form if needed
        doors: formData.doors ? parseInt(formData.doors as string, 10) : 2,
        seats: 4, // Default value, add to form if needed
        engineSize: formData.engine || 'Not specified',
        features: featuresArray,
        description: formData.description,
        status: formData.available ? 'available' : 'sold',
        location: formData.location,
        vin: formData.vin || undefined,
        slug: slug, // Use the slug we prepared above
        stockNumber: formData.stockNumber || `SKY-${formData.make.substring(0, 3).toUpperCase()}-${Date.now().toString().substring(8)}`, // Generate unique stock number if not provided
        specifications: {
          steering: formData.steering,
          cylinders: formData.cylinders || 'Not specified'
        },
        // For now, we'll use placeholder URLs until we implement S3
        images: images.map(img => img.preview),
        badge: badgeData
      };
      
      console.log('Submitting vehicle data:', vehicleData);
      
      // First verify the session
      const isSessionValid = await verifySession();
      if (!isSessionValid) {
        throw new Error('Your session has expired. Please log in again.');
      }
      
      // Then get the token
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      // Make API call to create vehicle
      const response = await fetch('http://localhost:5001/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(vehicleData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // Check for duplicate key errors
        if (response.status === 409 || (errorData.message && errorData.message.includes('duplicate key'))) {
          if (errorData.message.includes('stockNumber')) {
            throw new Error('A vehicle with this stock number already exists. Please use a different stock number.');
          } else if (errorData.message.includes('vin')) {
            throw new Error('A vehicle with this VIN already exists. Please check the VIN and try again.');
          } else {
            throw new Error('Duplicate vehicle information detected. Please check your entries and try again.');
          }
        }
        
        throw new Error(errorData.message || 'Failed to create vehicle');
      }
      
      // Redirect to stock vehicles page after successful submission
      router.push('/admin/vehicles/stock');
      
    } catch (error) {
      console.error('Error submitting vehicle data:', error);
      alert(`Failed to create vehicle: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className={styles.dashboardLayout}>
      <AdminSidebar />
      <div className={styles.mainContent}>
        <AdminHeader title="Add New Vehicle" />
        
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.breadcrumbs}>
              <Link href="/admin/vehicles/stock" className={styles.breadcrumbLink}>
                Stock Vehicles
              </Link>
              <span className={styles.breadcrumbSeparator}>/</span>
              <span className={styles.breadcrumbCurrent}>Add New Vehicle</span>
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
            
            <div id="images-section" className={styles.formGroup}>
              <label className={styles.label}>Vehicle Images *</label>
              <ImageUploader 
                initialImages={images}
                onChange={setImages}
                maxFiles={10}
                maxSizeMB={5}
              />
              {images.length === 0 && (
                <p className={styles.errorText}>At least one image is required</p>
              )}
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
            
            <div className={styles.formGroup}>
              <label htmlFor="badge" className={styles.label}>Promotional Badge</label>
              <select
                id="badge"
                name="badge"
                value={formData.badge}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => ({ ...prev, badge: value }));
                  setShowCustomBadge(value === 'custom');
                }}
                className={styles.select}
              >
                <option value="">No Badge</option>
                {predefinedBadges.map(badge => (
                  <option key={badge.id} value={badge.id}>{badge.label}</option>
                ))}
                <option value="custom">Custom Badge</option>
              </select>
              
              {formData.badge && formData.badge !== 'custom' && (
                <div className={styles.badgePreview}>
                  <span 
                    className={styles.badge}
                    style={{ 
                      backgroundColor: predefinedBadges.find(b => b.id === formData.badge)?.color 
                    }}
                  >
                    {predefinedBadges.find(b => b.id === formData.badge)?.label}
                  </span>
                </div>
              )}
              
              {showCustomBadge && (
                <div className={styles.customBadgeFields}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="customBadge" className={styles.label}>Badge Text</label>
                      <input
                        type="text"
                        id="customBadge"
                        name="customBadge"
                        value={formData.customBadge}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="Special Offer"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="customBadgeColor" className={styles.label}>Badge Color</label>
                      <div className={styles.colorPickerContainer}>
                        <input
                          type="color"
                          id="customBadgeColor"
                          name="customBadgeColor"
                          value={formData.customBadgeColor}
                          onChange={handleChange}
                          className={styles.colorPicker}
                        />
                        <input
                          type="text"
                          value={formData.customBadgeColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, customBadgeColor: e.target.value }))}
                          className={styles.colorInput}
                          placeholder="#c70f0f"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {formData.customBadge && (
                    <div className={styles.badgePreview}>
                      <span 
                        className={styles.badge}
                        style={{ backgroundColor: formData.customBadgeColor }}
                      >
                        {formData.customBadge}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className={styles.formActions}>
          <Link href="/admin/vehicles/stock" className={styles.cancelButton}>
            Cancel
          </Link>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Vehicle'}
          </button>
        </div>
      </form>
        </div>
      </div>
    </div>
  );
}
