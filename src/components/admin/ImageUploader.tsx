'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
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
}

interface ImageUploaderProps {
  initialImages?: UploadedImage[];
  maxFiles?: number;
  onChange: (images: UploadedImage[]) => void;
  maxSizeMB?: number;
  acceptedFileTypes?: string[];
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  initialImages = [],
  maxFiles = 10,
  onChange,
  maxSizeMB = 5,
  acceptedFileTypes = ['image/jpeg', 'image/png', 'image/webp']
}) => {
  const [images, setImages] = useState<UploadedImage[]>(initialImages);
  const [error, setError] = useState<string | null>(null);
  
  // Convert MB to bytes
  const maxSize = maxSizeMB * 1024 * 1024;
  
  // Initialize with initial images
  useEffect(() => {
    if (initialImages.length > 0) {
      setImages(initialImages);
    }
  }, [initialImages]);
  
  // Notify parent component when images change
  useEffect(() => {
    onChange(images);
  }, [images, onChange]);
  
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
      formData.append('folder', 'vehicles'); // Default folder for vehicle images

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
      const tempImages = acceptedFiles.map(file => ({
        id: uuidv4(),
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        uploading: true
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
            url: r2Url
          };
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          return {
            ...tempImages[index],
            uploading: false,
            error: true
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
      'image/*': acceptedFileTypes
    },
    maxSize,
    multiple: true
  });
  
  // Handle image removal
  const removeImage = (id: string) => {
    setImages(prevImages => {
      const updatedImages = prevImages.filter(image => image.id !== id);
      return updatedImages;
    });
  };
  
  // Handle drag end for reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setImages(items);
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
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="images" direction="horizontal">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={styles.imageGrid}
                >
                  {images.map((image, index) => (
                    <Draggable key={image.id} draggableId={image.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={styles.imageItem}
                        >
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
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
