'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
import styles from './ImageUploader.module.css';
import { getAuthToken } from '../../utils/sessionManager';

export interface UploadedImage {
  id: string;
  file?: File;
  preview: string;
  name: string;
  size?: number;
  url?: string; // For existing images from server
  uploading?: boolean; // Flag to indicate if image is currently uploading
  error?: boolean; // Flag to indicate if there was an error uploading
  position: number; // Position number for ordering
}

interface ImageUploaderProps {
  initialImages?: UploadedImage[];
  maxFiles?: number;
  onChange: (images: UploadedImage[]) => void;
  maxSizeMB?: number;
  acceptedFileTypes?: string[];
  folder?: 'vehicles' | 'hero' | 'auction' | 'general';
  aspectRatio?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  initialImages = [],
  maxFiles = 30,
  onChange,
  maxSizeMB = 5,
  acceptedFileTypes = ['image/jpeg', 'image/png', 'image/webp'],
  folder = 'vehicles',
  aspectRatio
}) => {
  const [images, setImages] = useState<UploadedImage[]>(initialImages);
  const [error, setError] = useState<string | null>(null);
  
  // Convert MB to bytes
  const maxSize = maxSizeMB * 1024 * 1024;
  
  // Initialize with initial images
  useEffect(() => {
    if (initialImages.length > 0) {
      // Make sure all images have a position property
      const imagesWithPositions = initialImages.map((img, index) => ({
        ...img,
        position: img.position || index + 1
      }));
      setImages(imagesWithPositions);
    }
  }, [initialImages]);
  
  // Notify parent component only when images are initialized
  useEffect(() => {
    if (images.length > 0) {
      // Only notify on initial load, not on every change
      // This prevents feedback loops
    }
  }, []);
  
  // Upload file to R2 storage
  const uploadFileToR2 = async (file: File): Promise<string> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // Create form data for file upload
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', folder); // Use the folder prop

      // Get API base URL from environment variable
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
      
      // Upload to R2 via the API
      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      return data.data.url;
    } catch (error) {
      console.error('Error uploading to R2:', error);
      throw error;
    }
  };

  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    // Check for rejected files
    if (rejectedFiles.length > 0) {
      const rejectionReasons = rejectedFiles.map(rejection => {
        if (rejection.errors[0].code === 'file-too-large') {
          return `${rejection.file.name} is too large (max ${maxSizeMB}MB)`;
        }
        if (rejection.errors[0].code === 'file-invalid-type') {
          return `${rejection.file.name} is not a supported image type`;
        }
        return `${rejection.file.name} was rejected`;
      });
      setError(rejectionReasons.join(', '));
      return;
    }
    
    // Check if adding these files would exceed the max number
    if (images.length + acceptedFiles.length > maxFiles) {
      setError(`You can only upload a maximum of ${maxFiles} images`);
      return;
    }
    
    setError(null);
    
    // Process and upload each file
    try {
      // Create temporary preview images
      const tempImages = acceptedFiles.map((file, idx) => ({
        id: uuidv4(),
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        uploading: true,
        position: images.length + idx + 1 // Set position based on current count
      }));
      
      // Add temporary images to the state
      setImages(prevImages => [...prevImages, ...tempImages]);
      
      // Upload each file to R2 and get URLs
      const uploadPromises = acceptedFiles.map(async (file, index) => {
        try {
          const r2Url = await uploadFileToR2(file);
          return {
            id: tempImages[index].id,
            file: undefined, // Clear the file reference after upload
            preview: r2Url, // Use the R2 URL as preview
            name: file.name,
            size: file.size,
            uploading: false,
            url: r2Url,
            position: tempImages[index].position // Preserve the position
          };
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          return {
            ...tempImages[index],
            uploading: false,
            error: true,
            position: tempImages[index].position
          };
        }
      });
      
      // Wait for all uploads to complete
      const uploadedImages = await Promise.all(uploadPromises);
      
      // Update images state with uploaded URLs
      setImages(prevImages => {
        // Replace temp images with uploaded ones, keep other existing images
        return prevImages.map(img => {
          const uploadedImg = uploadedImages.find(u => u.id === img.id);
          return uploadedImg || img;
        });
      });
    } catch (error) {
      console.error('Error processing uploads:', error);
      setError('Failed to upload one or more images. Please try again.');
    }
  }, [images, maxFiles, maxSizeMB]);
  
  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': []
    },
    maxSize,
    multiple: true
  });
  
  // Handle image removal
  const removeImage = (id: string) => {
    setImages(prevImages => {
      const removedImagePosition = prevImages.find(img => img.id === id)?.position || 0;
      const updatedImages = prevImages.filter(image => image.id !== id);
      
      // Reorder positions after removal
      return updatedImages.map(img => {
        if (img.position > removedImagePosition) {
          return { ...img, position: img.position - 1 };
        }
        return img;
      });
    });
  };
  
  // Handle position change for an image
  const handlePositionChange = (id: string, newPosition: number) => {
    // Ensure position is within valid range
    const validPosition = Math.max(1, Math.min(newPosition, images.length));
    
    // Find current position without state update
    const currentPosition = images.find(img => img.id === id)?.position || 0;
    
    // Don't do anything if position didn't change
    if (currentPosition === validPosition) return;
    
    // Create a new array with updated positions
    const updatedImages = images.map(img => {
      // The image we're changing
      if (img.id === id) {
        return { ...img, position: validPosition };
      }
      // Moving down - shift images in between up
      else if (currentPosition < validPosition && img.position > currentPosition && img.position <= validPosition) {
        return { ...img, position: img.position - 1 };
      }
      // Moving up - shift images in between down
      else if (currentPosition > validPosition && img.position < currentPosition && img.position >= validPosition) {
        return { ...img, position: img.position + 1 };
      }
      return img;
    });
    
    // Sort by position for display
    const sortedImages = [...updatedImages].sort((a, b) => a.position - b.position);
    
    // Update state once with the final result
    setImages(sortedImages);
    
    // Notify parent component of the change
    onChange(sortedImages);
  };
  
  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      images.forEach(image => {
        if (image.preview && !image.url) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, [images]);
  
  return (
    <div className={styles.imageUploaderContainer}>
      <div
        {...getRootProps()}
        className={`${styles.dropzone} ${isDragActive ? styles.active : ''}`}
      >
        <input {...getInputProps()} />
        <div className={styles.dropzoneContent}>
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
            <path d="M12 12v9"></path>
            <path d="m16 16-4-4-4 4"></path>
          </svg>
          <p className={styles.dropzoneText}>
            Drag & drop images here, or <span>browse</span>
          </p>
          <p className={styles.dropzoneHint}>
            Supports: JPG, PNG, WebP (Max {maxSizeMB}MB)
          </p>
        </div>
      </div>
      
      {error && (
        <div className={styles.errorMessage}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {error}
        </div>
      )}
      
      {images.length > 0 && (
        <div className={styles.imagesContainer}>
          <div className={styles.imagesHeader}>
            <h4 className={styles.imagesTitle}>
              {images.length} {images.length === 1 ? 'Image' : 'Images'} 
              {images.length > 1 && <span className={styles.dragHint}>(Drag to reorder)</span>}
            </h4>
            {images.length > 0 && (
              <button 
                type="button" 
                className={styles.clearButton}
                onClick={() => setImages([])}
              >
                Clear All
              </button>
            )}
          </div>
          
          <div className={styles.imageGrid}>
            {/* Sort images by position for display */}
            {[...images].sort((a, b) => a.position - b.position).map((image) => (
              <div key={image.id} className={styles.imageItem}>
                <div className={styles.positionBadge}>
                  {image.position}
                </div>
                <div className={styles.positionButtons}>
                  <button 
                    type="button"
                    onClick={() => {
                      if (image.position > 1) {
                        handlePositionChange(image.id, image.position - 1);
                      }
                    }}
                    className={styles.positionButton}
                    disabled={image.position <= 1}
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      if (image.position < images.length) {
                        handlePositionChange(image.id, image.position + 1);
                      }
                    }}
                    className={styles.positionButton}
                    disabled={image.position >= images.length}
                    title="Move down"
                  >
                    ↓
                  </button>
                </div>
                          <div className={`${styles.imagePreview} ${image.uploading ? styles.uploading : ''} ${image.error ? styles.error : ''}`}>
                            <img src={image.preview} alt={image.name} />
                            {image.uploading ? (
                              <div className={styles.uploadingOverlay}>
                                <div className={styles.spinner}></div>
                                <span>Uploading...</span>
                              </div>
                            ) : image.error ? (
                              <div className={styles.errorOverlay}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <line x1="12" y1="8" x2="12" y2="12"></line>
                                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                <span>Upload failed</span>
                              </div>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => removeImage(image.id)}
                              className={styles.removeButton}
                              title="Remove image"
                              disabled={image.uploading}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                            <div className={styles.imageInfo}>
                              <span className={styles.imageName}>{image.name}</span>
                              {image.size && (
                                <span className={styles.imageSize}>
                                  {(image.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
