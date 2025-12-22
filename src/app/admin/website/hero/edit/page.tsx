'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ImageUploader, { UploadedImage } from '../../../../../components/admin/ImageUploader';
import AdminHeader from '../../../../../components/admin/AdminHeader';
import AdminSidebar from '../../../../../components/admin/AdminSidebar';
import { getAuthToken } from '../../../../../utils/sessionManager';
import styles from '../hero.module.css';

interface HeroImage {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  tagline: string;
  isActive: boolean;
  imagePosition?: string;
  backgroundSize?: string;
  imageWidth?: number;
  imageHeight?: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function EditHeroPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get ID from query params
  const heroId = searchParams.get('id');
  
  // Log the extracted ID
  console.log('Hero ID from query params:', heroId);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [heroImage, setHeroImage] = useState<HeroImage | null>(null);

  // Fetch hero section data
  useEffect(() => {
    console.log('useEffect triggered with heroId:', heroId);
    const fetchHeroSection = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Validate ID
        if (!heroId || heroId === 'undefined') {
          setError('Invalid hero section ID');
          setIsLoading(false);
          return;
        }
        
        // Get API base URL from environment variable
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
        
        console.log(`Fetching hero section with ID: ${heroId} from ${API_BASE_URL}/hero-sections/${heroId}`);
        
        // Make sure we're using a valid MongoDB ObjectId
        if (heroId && heroId.length === 24) {
          const response = await fetch(`${API_BASE_URL}/hero-sections/${heroId}`);
        
          if (!response.ok) {
            throw new Error(`Failed to fetch hero section: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('API Response:', data);
          
          if (data.success && data.data) {
            // Map MongoDB _id to id for frontend consistency
            const mappedData = {
              ...data.data,
              id: data.data._id // Ensure we have both _id and id
            };
            console.log('Mapped hero data:', mappedData);
            setHeroImage(mappedData);
            
            // Set initial uploaded image
            if (mappedData.imageUrl) {
              setUploadedImages([{
                id: '1',
                preview: mappedData.imageUrl,
                name: 'Current Image',
                url: mappedData.imageUrl
              }]);
            }
          } else {
            throw new Error('Failed to fetch hero section data');
          }
        } else {
          throw new Error('Invalid hero section ID format');
        }
        
      } catch (err) {
        console.error('Error fetching hero section:', err);
        setError(`Failed to load hero section: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (heroId) {
      fetchHeroSection();
    }
  }, [heroId]);

  // Handle image upload
  const handleImageUpload = (images: UploadedImage[]) => {
    if (images.length > 0 && heroImage) {
      const uploadedImage = images[0];
      const imageUrl = uploadedImage.url || uploadedImage.preview;
      
      // Use functional update to avoid dependency on heroImage
      setHeroImage(prev => {
        if (prev && prev.imageUrl !== imageUrl) {
          return { ...prev, imageUrl };
        }
        return prev;
      });
    }
    
    // Only update if the images have changed
    if (JSON.stringify(uploadedImages) !== JSON.stringify(images)) {
      setUploadedImages(images);
    }
  };

  // Save hero image
  const saveHeroImage = async () => {
    if (!heroImage) return;
    
    try {
      setIsSaving(true);
      setError(null);
      
      // Validate ID
      if (!heroId || heroId === 'undefined' || heroId.length !== 24) {
        setError('Invalid hero section ID');
        setIsSaving(false);
        return;
      }
      
      // Validate required fields
      if (!heroImage.imageUrl) {
        setError('Please upload an image');
        setIsSaving(false);
        return;
      }
      
      if (!heroImage.title) {
        setError('Please enter a title');
        setIsSaving(false);
        return;
      }
      
      if (!heroImage.subtitle) {
        setError('Please enter a subtitle');
        setIsSaving(false);
        return;
      }
      
      if (!heroImage.tagline) {
        setError('Please enter a tagline');
        setIsSaving(false);
        return;
      }
      
      // Get API base URL from environment variable
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
      
      // Get authentication token
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }
      
      console.log(`Updating hero section with ID: ${heroId}`);
      
      // Call the API to update the hero section
      const response = await fetch(`${API_BASE_URL}/hero-sections/${heroId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...heroImage,
          id: heroId, // Ensure the ID is correctly set
          imagePosition: heroImage.imagePosition || 'center',
          backgroundSize: heroImage.backgroundSize || 'cover',
          imageWidth: heroImage.backgroundSize === 'custom' ? heroImage.imageWidth : undefined,
          imageHeight: heroImage.backgroundSize === 'custom' ? heroImage.imageHeight : undefined
        })
      });
      
      // Get response text first to check if it's valid JSON
      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Invalid JSON response:', responseText);
        throw new Error('Server returned invalid JSON');
      }
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update hero section');
      }
      
      if (data.success) {
        // Navigate back to hero sections list
        router.push('/admin/website/hero');
      }
    } catch (err) {
      console.error('Error updating hero section:', err);
      setError(`Failed to update hero section: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.dashboardLayout}>
        <AdminSidebar />
        <div className={styles.mainContent}>
          <AdminHeader title="Edit Hero Section" />
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading hero section...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !heroImage) {
    return (
      <div className={styles.dashboardLayout}>
        <AdminSidebar />
        <div className={styles.mainContent}>
          <AdminHeader title="Edit Hero Section" />
          <div className={styles.errorContainer}>
            <h2>Error</h2>
            <p>{error}</p>
            <Link href="/admin/website/hero" className={styles.primaryButton}>
              Back to Hero Sections
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!heroImage) {
    return (
      <div className={styles.dashboardLayout}>
        <AdminSidebar />
        <div className={styles.mainContent}>
          <AdminHeader title="Edit Hero Section" />
          <div className={styles.errorContainer}>
            <h2>Hero Section Not Found</h2>
            <p>The requested hero section could not be found.</p>
            <Link href="/admin/website/hero" className={styles.primaryButton}>
              Back to Hero Sections
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
        <AdminHeader title="Edit Hero Section" />
        
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Edit Hero Section</h1>
            <p className={styles.pageDescription}>
              Update your website hero section.
            </p>
          </div>
          <div>
            <Link href="/admin/website/hero" className={styles.secondaryButton}>
              Cancel
            </Link>
          </div>
        </div>
        
        <div className={styles.formContainer}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}
          
          <div className={styles.formGroup}>
            <label htmlFor="image" className={styles.formLabel}>Hero Image</label>
            <ImageUploader
              initialImages={uploadedImages}
              maxFiles={1}
              onChange={handleImageUpload}
              folder="hero"
              aspectRatio="16:9"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.formLabel}>Title</label>
            <input 
              type="text" 
              id="title" 
              className={styles.formInput}
              value={heroImage.title}
              onChange={(e) => setHeroImage(prev => prev ? {...prev, title: e.target.value} : null)}
              placeholder="Enter title"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="subtitle" className={styles.formLabel}>Subtitle</label>
            <input 
              type="text" 
              id="subtitle" 
              className={styles.formInput}
              value={heroImage.subtitle}
              onChange={(e) => setHeroImage(prev => prev ? {...prev, subtitle: e.target.value} : null)}
              placeholder="Enter subtitle"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="tagline" className={styles.formLabel}>Tagline</label>
            <input 
              type="text" 
              id="tagline" 
              className={styles.formInput}
              value={heroImage.tagline}
              onChange={(e) => setHeroImage(prev => prev ? {...prev, tagline: e.target.value} : null)}
              placeholder="Enter tagline"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="imagePosition" className={styles.formLabel}>Image Position</label>
            <select
              id="imagePosition"
              className={styles.formInput}
              value={heroImage.imagePosition || 'center'}
              onChange={(e) => setHeroImage(prev => prev ? {...prev, imagePosition: e.target.value} : null)}
            >
              <option value="center">Center</option>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="backgroundSize" className={styles.formLabel}>Background Size</label>
            <select
              id="backgroundSize"
              className={styles.formInput}
              value={heroImage.backgroundSize || 'cover'}
              onChange={(e) => setHeroImage(prev => prev ? {...prev, backgroundSize: e.target.value} : null)}
            >
              <option value="cover">Cover (fill)</option>
              <option value="contain">Contain (fit)</option>
              <option value="100% auto">Full Width</option>
              <option value="auto 100%">Full Height</option>
              <option value="custom">Custom Dimensions</option>
            </select>
          </div>
          
          {heroImage.backgroundSize === 'custom' && (
            <div className={styles.dimensionsContainer}>
              <div className={styles.formGroup}>
                <label htmlFor="imageWidth" className={styles.formLabel}>Width (px)</label>
                <input
                  type="number"
                  id="imageWidth"
                  className={styles.formInput}
                  value={heroImage.imageWidth || 1920}
                  onChange={(e) => setHeroImage(prev => prev ? {...prev, imageWidth: parseInt(e.target.value)} : null)}
                  min="100"
                  max="3840"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="imageHeight" className={styles.formLabel}>Height (px)</label>
                <input
                  type="number"
                  id="imageHeight"
                  className={styles.formInput}
                  value={heroImage.imageHeight || 1080}
                  onChange={(e) => setHeroImage(prev => prev ? {...prev, imageHeight: parseInt(e.target.value)} : null)}
                  min="100"
                  max="2160"
                />
              </div>
            </div>
          )}
          
          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={heroImage.isActive}
                onChange={(e) => setHeroImage(prev => prev ? {...prev, isActive: e.target.checked} : null)}
                className={styles.checkbox}
              />
              Active
            </label>
          </div>
          
          <div className={styles.formActions}>
            <Link href="/admin/website/hero" className={styles.cancelButton}>
              Cancel
            </Link>
            <button 
              className={styles.saveButton}
              onClick={saveHeroImage}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
