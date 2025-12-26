'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
}

export default function AddHeroPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [heroImage, setHeroImage] = useState<HeroImage>({
    id: '',
    imageUrl: '',
    title: '',
    subtitle: '',
    tagline: '',
    isActive: true,
    imagePosition: 'center',
    backgroundSize: 'cover',
    imageWidth: 1920,
    imageHeight: 1080
  });

  // Handle image upload
  const handleImageUpload = (images: UploadedImage[]) => {
    if (images.length > 0) {
      const uploadedImage = images[0];
      const imageUrl = uploadedImage.url || uploadedImage.preview;
      setHeroImage(prev => ({ ...prev, imageUrl }));
    }
    setUploadedImages(images);
  };

  // Save hero image
  const saveHeroImage = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Validate required fields
      if (!heroImage.imageUrl) {
        setError('Please upload an image');
        setIsLoading(false);
        return;
      }
      
      if (!heroImage.title) {
        setError('Please enter a title');
        setIsLoading(false);
        return;
      }
      
      if (!heroImage.subtitle) {
        setError('Please enter a subtitle');
        setIsLoading(false);
        return;
      }
      
      if (!heroImage.tagline) {
        setError('Please enter a tagline');
        setIsLoading(false);
        return;
      }
      
      // Get API base URL from environment variable
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
      
      // Get authentication token
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }
      
      // Call the API to create a new hero section
      const response = await fetch(`${API_BASE_URL}/hero-sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(heroImage)
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
        throw new Error(data.message || 'Failed to create hero section');
      }
      
      if (data.success) {
        // Navigate back to hero sections list
        router.push('/admin/website/hero');
      }
    } catch (err) {
      console.error('Error creating hero section:', err);
      setError(`Failed to create hero section: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.dashboardLayout}>
      <AdminSidebar />
      <div className={styles.mainContent}>
        <AdminHeader title="Add Hero Section" />
        
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Add New Hero Section</h1>
            <p className={styles.pageDescription}>
              Create a new hero section for your website homepage.
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
              onChange={(e) => setHeroImage(prev => ({...prev, title: e.target.value}))}
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
              onChange={(e) => setHeroImage(prev => ({...prev, subtitle: e.target.value}))}
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
              onChange={(e) => setHeroImage(prev => ({...prev, tagline: e.target.value}))}
              placeholder="Enter tagline"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="imagePosition" className={styles.formLabel}>Image Position</label>
            <select
              id="imagePosition"
              className={styles.formInput}
              value={heroImage.imagePosition || 'center'}
              onChange={(e) => setHeroImage(prev => ({...prev, imagePosition: e.target.value}))}
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
              onChange={(e) => setHeroImage(prev => ({...prev, backgroundSize: e.target.value}))}
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
                  onChange={(e) => setHeroImage(prev => ({...prev, imageWidth: parseInt(e.target.value)}))}
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
                  onChange={(e) => setHeroImage(prev => ({...prev, imageHeight: parseInt(e.target.value)}))}
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
                onChange={(e) => setHeroImage(prev => ({...prev, isActive: e.target.checked}))}
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
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Hero Section'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
