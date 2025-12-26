'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { vehicleApi } from '@/lib/api';
import { auctionService } from '@/lib/auctionService';
import { AuctionCar } from '@/types/auction';
import AdminHeader from '../../../../../../components/admin/AdminHeader';
import AdminSidebar from '../../../../../../components/admin/AdminSidebar';
import ImageUploader, { UploadedImage } from '../../../../../../components/admin/ImageUploader';
import styles from '../../new/auctionForm.module.css';

export default function EditAuctionVehiclePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    mileage: '',
    engine: '',
    transmission: 'Manual',
    grade: 'A',
    color: '',
    auctionStatus: 'upcoming' as 'upcoming' | 'live' | 'past',
    auctionHouse: '',
    auctionDate: '',
    timeRemaining: '',
    startingBid: '',
    currentBid: '',
    estimatedPrice: '',
    finalPrice: '',
    soldStatus: '' as '' | 'sold' | 'unsold',
    features: '',
    condition: 'Excellent',
    inspectionReport: '',
    inspectionGrade: '',
    exteriorGrade: '',
    interiorGrade: '',
    description: '',
    location: 'Tokyo, Japan'
  });
  
  // Images state
  const [images, setImages] = useState<UploadedImage[]>([]);
  
  // Fetch auction vehicle data
  useEffect(() => {
    const fetchAuctionVehicle = async () => {
      try {
        setLoading(true);
        const auctionVehicle = await auctionService.getAuctionVehicleById(id);
        
        // Format auction date
        let auctionDate = '';
        if (auctionVehicle.auctionDate) {
          try {
            // Try to parse the date string
            const date = new Date(auctionVehicle.auctionDate);
            auctionDate = date.toISOString().split('T')[0];
          } catch (e) {
            console.error('Error parsing auction date:', e);
            auctionDate = '';
          }
        }
        
        // Populate form data
        setFormData({
          make: auctionVehicle.make,
          model: auctionVehicle.model,
          year: auctionVehicle.year,
          mileage: auctionVehicle.mileage.toString(),
          engine: auctionVehicle.engine,
          transmission: auctionVehicle.transmission,
          grade: auctionVehicle.grade,
          color: auctionVehicle.color,
          auctionStatus: auctionVehicle.auctionStatus,
          auctionHouse: auctionVehicle.auctionHouse,
          auctionDate: auctionDate,
          timeRemaining: auctionVehicle.timeRemaining || '',
          startingBid: auctionVehicle.startingBid.toString(),
          currentBid: auctionVehicle.currentBid.toString(),
          estimatedPrice: auctionVehicle.estimatedPrice.toString(),
          finalPrice: auctionVehicle.finalPrice ? auctionVehicle.finalPrice.toString() : '',
          soldStatus: auctionVehicle.soldStatus || '',
          features: auctionVehicle.features ? auctionVehicle.features.join(', ') : '',
          condition: auctionVehicle.condition,
          inspectionReport: auctionVehicle.inspectionReport || '',
          inspectionGrade: auctionVehicle.inspectionGrade || '',
          exteriorGrade: auctionVehicle.exteriorGrade || '',
          interiorGrade: auctionVehicle.interiorGrade || '',
          description: auctionVehicle.description || '',
          location: auctionVehicle.location
        });
        
        // Set images
        if (auctionVehicle.images && auctionVehicle.images.length > 0) {
          const uploadedImages: UploadedImage[] = auctionVehicle.images.map((img, index) => ({
            id: `existing-${index}`,
            name: `image-${index}.jpg`,
            preview: img,
            url: img, // Use url for existing images
            position: index + 1 // Add position property
          }));
          setImages(uploadedImages);
        }
        
        setLoading(false);
      } catch (err) {
        console.error(`Error fetching auction vehicle with ID ${id}:`, err);
        setError('Failed to load auction vehicle. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchAuctionVehicle();
  }, [id]);
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
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
      
      // Prepare data for submission
      const vehicleData = {
        make: formData.make,
        model: formData.model,
        year: formData.year,
        price: parseFloat(formData.estimatedPrice as string),
        type: 'auction',
        condition: formData.condition,
        mileage: parseFloat(formData.mileage as string),
        engineSize: formData.engine,
        transmission: formData.transmission,
        fuelType: 'Gasoline', // Default value
        driveType: 'RWD', // Default value
        bodyType: 'Coupe', // Default value
        exteriorColor: formData.color,
        interiorColor: 'Black', // Default value
        doors: 2, // Default value
        seats: 4, // Default value
        
        // Auction specific fields
        auctionGrade: formData.grade,
        auctionLocation: formData.auctionHouse,
        bidEndTime: new Date(formData.auctionDate),
        startingBid: parseFloat(formData.startingBid as string),
        currentBid: parseFloat(formData.currentBid as string),
        minimumBid: parseFloat(formData.startingBid as string),
        bidIncrement: 10000, // Default value
        
        // Features and specifications
        features: featuresArray,
        specifications: {},
        description: formData.description,
        
        // Media
        images: images.map(img => img.preview),
        
        // Status and logistics
        status: formData.auctionStatus === 'live' ? 'auction' : formData.auctionStatus === 'past' && formData.soldStatus === 'sold' ? 'sold' : 'available',
        location: formData.location
      };
      
      // Send to API
      const response = await vehicleApi.updateVehicle(id, vehicleData);
      console.log('API response:', response);
      
      // Redirect to auction vehicle detail page after successful submission
      router.push(`/admin/vehicles/auction/${id}`);
      
    } catch (error) {
      console.error('Error updating auction data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Format today's date as YYYY-MM-DD for the date input's min attribute
  const today = new Date().toISOString().split('T')[0];
  
  // Show loading state
  if (loading) {
    return (
      <div className={styles.dashboardLayout}>
        <AdminSidebar />
        <div className={styles.mainContent}>
          <AdminHeader title="Loading Auction..." />
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p className={styles.loadingMessage}>Loading auction details...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className={styles.dashboardLayout}>
        <AdminSidebar />
        <div className={styles.mainContent}>
          <AdminHeader title="Error" />
          <div className={styles.errorContainer}>
            <h1 className={styles.errorTitle}>Error Loading Auction</h1>
            <p className={styles.errorMessage}>{error}</p>
            <button 
              onClick={() => router.push('/admin/vehicles/auction')}
              className={styles.backButton}
            >
              Back to Auction Vehicles
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.dashboardLayout}>
      <AdminSidebar />
      <div className={styles.mainContent}>
        <AdminHeader title={`Edit Auction: ${formData.year} ${formData.make} ${formData.model}`} />
        
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.breadcrumbs}>
              <Link href="/admin/vehicles/auction" className={styles.breadcrumbLink}>
                Auction Vehicles
              </Link>
              <span className={styles.breadcrumbSeparator}>/</span>
              <Link href={`/admin/vehicles/auction/${id}`} className={styles.breadcrumbLink}>
                {formData.year} {formData.make} {formData.model}
              </Link>
              <span className={styles.breadcrumbSeparator}>/</span>
              <span className={styles.breadcrumbCurrent}>Edit</span>
            </div>
          </div>
      
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGrid}>
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>Vehicle Information</h2>
                
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
                    maxFiles={30}
                    maxSizeMB={5}
                  />
                  {images.length === 0 && (
                    <p className={styles.errorText}>At least one image is required</p>
                  )}
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="engine" className={styles.label}>Engine *</label>
                    <input
                      type="text"
                      id="engine"
                      name="engine"
                      value={formData.engine}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="3.0L 2JZ-GTE"
                      required
                    />
                  </div>
                  
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
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="grade" className={styles.label}>Grade *</label>
                    <select
                      id="grade"
                      name="grade"
                      value={formData.grade}
                      onChange={handleChange}
                      className={styles.select}
                      required
                    >
                      <option value="A">A (Excellent)</option>
                      <option value="B">B (Very Good)</option>
                      <option value="C">C (Good)</option>
                      <option value="D">D (Fair)</option>
                      <option value="E">E (Poor)</option>
                    </select>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="color" className={styles.label}>Color *</label>
                    <input
                      type="text"
                      id="color"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="Red"
                      required
                    />
                  </div>
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
                <h2 className={styles.sectionTitle}>Auction Details</h2>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="auctionStatus" className={styles.label}>Auction Status *</label>
                    <select
                      id="auctionStatus"
                      name="auctionStatus"
                      value={formData.auctionStatus}
                      onChange={handleChange}
                      className={styles.select}
                      required
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="live">Live</option>
                      <option value="past">Past</option>
                    </select>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="auctionHouse" className={styles.label}>Auction House *</label>
                    <input
                      type="text"
                      id="auctionHouse"
                      name="auctionHouse"
                      value={formData.auctionHouse}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="JDM Auction House"
                      required
                    />
                  </div>
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="auctionDate" className={styles.label}>Auction Date *</label>
                    <input
                      type="date"
                      id="auctionDate"
                      name="auctionDate"
                      value={formData.auctionDate}
                      onChange={handleChange}
                      className={styles.input}
                      min={formData.auctionStatus === 'past' ? '' : today}
                      required
                    />
                  </div>
                  
                  {formData.auctionStatus === 'live' && (
                    <div className={styles.formGroup}>
                      <label htmlFor="timeRemaining" className={styles.label}>Time Remaining *</label>
                      <input
                        type="text"
                        id="timeRemaining"
                        name="timeRemaining"
                        value={formData.timeRemaining}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="2 hours"
                        required={formData.auctionStatus === 'live'}
                      />
                    </div>
                  )}
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="startingBid" className={styles.label}>Starting Bid (JPY) *</label>
                    <input
                      type="number"
                      id="startingBid"
                      name="startingBid"
                      value={formData.startingBid}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="10000"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="currentBid" className={styles.label}>Current Bid (JPY) *</label>
                    <input
                      type="number"
                      id="currentBid"
                      name="currentBid"
                      value={formData.currentBid}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="12500"
                      min="0"
                      required
                    />
                  </div>
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="estimatedPrice" className={styles.label}>Estimated Price (JPY) *</label>
                    <input
                      type="number"
                      id="estimatedPrice"
                      name="estimatedPrice"
                      value={formData.estimatedPrice}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="25000"
                      min="0"
                      required
                    />
                  </div>
                  
                  {formData.auctionStatus === 'past' && (
                    <div className={styles.formGroup}>
                      <label htmlFor="finalPrice" className={styles.label}>Final Price (JPY) *</label>
                      <input
                        type="number"
                        id="finalPrice"
                        name="finalPrice"
                        value={formData.finalPrice}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="23500"
                        min="0"
                        required={formData.auctionStatus === 'past'}
                      />
                    </div>
                  )}
                </div>
                
                {formData.auctionStatus === 'past' && (
                  <div className={styles.formGroup}>
                    <label htmlFor="soldStatus" className={styles.label}>Sold Status *</label>
                    <select
                      id="soldStatus"
                      name="soldStatus"
                      value={formData.soldStatus}
                      onChange={handleChange}
                      className={styles.select}
                      required={formData.auctionStatus === 'past'}
                    >
                      <option value="">Select Status</option>
                      <option value="sold">Sold</option>
                      <option value="unsold">Unsold</option>
                    </select>
                  </div>
                )}
                
                <h3 className={styles.subsectionTitle}>Inspection Details</h3>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="inspectionGrade" className={styles.label}>Inspection Grade</label>
                    <select
                      id="inspectionGrade"
                      name="inspectionGrade"
                      value={formData.inspectionGrade}
                      onChange={handleChange}
                      className={styles.select}
                    >
                      <option value="">Select Grade</option>
                      <option value="A">A (Excellent)</option>
                      <option value="B">B (Very Good)</option>
                      <option value="C">C (Good)</option>
                      <option value="D">D (Fair)</option>
                      <option value="E">E (Poor)</option>
                    </select>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="inspectionReport" className={styles.label}>Inspection Report URL</label>
                    <input
                      type="text"
                      id="inspectionReport"
                      name="inspectionReport"
                      value={formData.inspectionReport}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="https://example.com/report.pdf"
                    />
                  </div>
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="exteriorGrade" className={styles.label}>Exterior Grade</label>
                    <select
                      id="exteriorGrade"
                      name="exteriorGrade"
                      value={formData.exteriorGrade}
                      onChange={handleChange}
                      className={styles.select}
                    >
                      <option value="">Select Grade</option>
                      <option value="A">A (Excellent)</option>
                      <option value="B">B (Very Good)</option>
                      <option value="C">C (Good)</option>
                      <option value="D">D (Fair)</option>
                      <option value="E">E (Poor)</option>
                    </select>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="interiorGrade" className={styles.label}>Interior Grade</label>
                    <select
                      id="interiorGrade"
                      name="interiorGrade"
                      value={formData.interiorGrade}
                      onChange={handleChange}
                      className={styles.select}
                    >
                      <option value="">Select Grade</option>
                      <option value="A">A (Excellent)</option>
                      <option value="B">B (Very Good)</option>
                      <option value="C">C (Good)</option>
                      <option value="D">D (Fair)</option>
                      <option value="E">E (Poor)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.formActions}>
              <Link href={`/admin/vehicles/auction/${id}`} className={styles.cancelButton}>
                Cancel
              </Link>
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
