'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import AdminHeader from '../../../../../../components/admin/AdminHeader';
import AdminSidebar from '../../../../../../components/admin/AdminSidebar';
import ImageUploader, { UploadedImage } from '../../../../../../components/admin/ImageUploader';
import ConfirmDialog from '../../../../../../components/admin/ConfirmDialog';
import { getAuthToken, verifySession } from '../../../../../../utils/sessionManager';
import styles from '../../new/vehicleForm.module.css';

export default function EditVehiclePage() {
  const params = useParams();
  const router = useRouter();
  
  // Extract ID from URL and ensure it's not undefined
  let id = params?.id as string;
  
  // Debug params
  console.log('Params:', params);
  console.log('Raw ID:', id);
  
  // Fix for the 'undefined' string issue
  if (id === 'undefined' || !id) {
    console.error('Invalid ID: ID is undefined');
    // In Next.js App Router, we can't access router.query directly
    // Instead, we'll need to extract from the current URL
    // Check if window is available (client-side only)
    if (typeof window !== 'undefined') {
      const urlParts = window.location.pathname.split('/');
      const potentialId = urlParts[urlParts.length - 2]; // The ID should be the second-to-last part
      if (potentialId && potentialId !== 'edit') {
        id = potentialId;
        console.log('Extracted ID from URL path:', id);
      } else {
        console.error('Could not extract ID from URL path');
      }
    } else {
      console.log('Running on server side, cannot extract ID from URL');
    }
  }
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  // Predefined badges
  const predefinedBadges = [
    { id: 'hot', label: 'Hot Stock', color: '#ef4444' },
    { id: '50off', label: '50% Off', color: '#f59e0b' },
    { id: 'winter', label: 'Winter Special', color: '#3b82f6' },
    { id: 'new', label: 'New Arrival', color: '#10b981' },
    { id: 'limited', label: 'Limited Edition', color: '#8b5cf6' },
    { id: 'sale', label: 'On Sale', color: '#ec4899' },
  ];
  
  // Custom badge state
  const [showCustomBadge, setShowCustomBadge] = useState(false);
  
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
    customBadgeColor: '#c70f0f'
  });
  
  // Load vehicle data
  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        // Check if ID is valid
        if (!id) {
          console.error('Vehicle ID is undefined');
          setNotFound(true);
          setIsLoading(false);
          return;
        }
        
        // Get the authentication token
        const token = getAuthToken();
        if (!token) {
          console.error('Authentication required');
          router.push('/admin/login');
          return;
        }

        console.log(`Fetching vehicle with ID: ${id}`);
        const response = await fetch(`http://localhost:5001/api/vehicles/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            setNotFound(true);
          } else if (response.status === 401) {
            router.push('/admin/login');
          } else {
            throw new Error('Failed to fetch vehicle data');
          }
          return;
        }
        
        const data = await response.json();
        const vehicle = data.data;
        
        if (!vehicle) {
          setNotFound(true);
          return;
        }
        
        // Ensure vehicle has an id property
        if (!vehicle.id && vehicle._id) {
          vehicle.id = vehicle._id;
        }
        
        console.log('Fetched vehicle data:', vehicle);
        
        // Set up images array from vehicle data
        if (vehicle.images && vehicle.images.length > 0) {
          const uploadedImages: UploadedImage[] = vehicle.images.map((url: string, index: number) => ({
            id: `existing-${index}`,
            file: null,
            preview: url,
            name: url.split('/').pop() || `image-${index}.jpg`
          }));
          setImages(uploadedImages);
        }
        
        // Handle badge data
        let badgeId = '';
        let customBadgeText = '';
        let customBadgeColor = '#c70f0f';
        
        if (vehicle.badge) {
          // Check if it's a predefined badge
          const matchingBadge = predefinedBadges.find(b => 
            b.label === vehicle.badge.text && b.color === vehicle.badge.color
          );
          
          if (matchingBadge) {
            badgeId = matchingBadge.id;
          } else {
            // It's a custom badge
            badgeId = 'custom';
            customBadgeText = vehicle.badge.text;
            customBadgeColor = vehicle.badge.color;
            setShowCustomBadge(true);
          }
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
          drivetrain: vehicle.driveType,
          description: vehicle.description,
          features: Array.isArray(vehicle.features) ? vehicle.features.join(', ') : '',
          condition: vehicle.condition,
          location: vehicle.location,
          available: vehicle.status === 'available',
          bodyType: vehicle.bodyType || 'Coupe',
          vin: vehicle.vin || '',
          engine: vehicle.engineSize || '',
          cylinders: vehicle.specifications?.cylinders || '',
          color: vehicle.exteriorColor || '',
          doors: vehicle.doors?.toString() || '',
          stockNumber: vehicle.stockNumber || '',
          steering: vehicle.specifications?.steering || 'Right Hand',
          badge: badgeId,
          customBadge: customBadgeText,
          customBadgeColor: customBadgeColor
        });
      } catch (error) {
        console.error('Error fetching vehicle:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVehicle();
  }, [id, router]);
  
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
  
  // Open cancel confirmation dialog
  const openCancelConfirm = () => {
    setShowCancelConfirm(true);
  };
  
  // Close cancel confirmation dialog
  const closeCancelConfirm = () => {
    setShowCancelConfirm(false);
  };
  
  // Handle cancel edit
  const handleCancel = () => {
    setShowCancelConfirm(false);
    router.push(`/admin/vehicles/stock/${id}`);
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
      
      // Prepare data for submission
      const vehicleData = {
        make: formData.make,
        model: formData.model,
        year: formData.year,
        price: parseFloat(formData.price as string),
        mileage: parseFloat(formData.mileage as string),
        type: 'stock',
        condition: formData.condition,
        transmission: formData.transmission,
        fuelType: formData.fuelType,
        driveType: formData.drivetrain,
        bodyType: formData.bodyType,
        exteriorColor: formData.color || 'Not specified',
        interiorColor: 'Not specified',
        doors: formData.doors ? parseInt(formData.doors as string, 10) : 2,
        seats: 4,
        engineSize: formData.engine || 'Not specified',
        features: featuresArray,
        description: formData.description,
        status: formData.available ? 'available' : 'sold',
        location: formData.location,
        vin: formData.vin || undefined,
        stockNumber: formData.stockNumber || undefined,
        specifications: {
          steering: formData.steering,
          cylinders: formData.cylinders || 'Not specified'
        },
        // Use images from the image uploader
        images: images.map(img => img.preview),
        badge: badgeData
      };
      
      console.log('Updating vehicle data:', vehicleData);
      
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
      
      // Make sure we have a valid ID
      if (!id) {
        throw new Error('Vehicle ID is missing');
      }
      
      console.log('Submitting update for vehicle ID:', id);
      
      // Send the updated vehicle data to the API
      const response = await fetch(`http://localhost:5001/api/vehicles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(vehicleData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update vehicle');
      }
      
      // Redirect to vehicle detail page after successful update
      router.push(`/admin/vehicles/stock/${id}`);
      
    } catch (error) {
      console.error('Error updating vehicle data:', error);
      alert(`Failed to update vehicle: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
          <button 
            type="button" 
            onClick={openCancelConfirm} 
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Update Vehicle'}
          </button>
        </div>
      </form>
      
      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showCancelConfirm}
        title="Discard Changes"
        message="Are you sure you want to cancel? All unsaved changes will be lost."
        confirmText="Discard"
        cancelText="Continue Editing"
        onConfirm={handleCancel}
        onCancel={closeCancelConfirm}
      />
    </div>
    </div>
    </div>
  );
}
