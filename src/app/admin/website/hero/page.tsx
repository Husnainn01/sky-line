'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import AdminHeader from '../../../../components/admin/AdminHeader';
import AdminSidebar from '../../../../components/admin/AdminSidebar';
import ProtectedRoute from '../../../../components/admin/ProtectedRoute';
import PermissionGuard from '../../../../components/admin/PermissionGuard';
import styles from './hero.module.css';

// Define types for hero images
interface HeroImage {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  active: boolean;
}

// Sample hero section data
const initialHeroImages: HeroImage[] = [
  {
    id: '1',
    image: '/images/hero-car.jpg',
    title: 'Find Your Dream JDM Car',
    subtitle: 'Premium Japanese imports with full history and documentation',
    active: true
  },
  {
    id: '2',
    image: '/cars/supra.png',
    title: 'Classic JDM Collection',
    subtitle: 'Rare and collectible Japanese vehicles',
    active: true
  },
  {
    id: '3',
    image: '/cars/gtr.png',
    title: 'Performance Imports',
    subtitle: 'High-performance vehicles direct from Japan',
    active: false
  }
];

export default function HeroSectionPage() {
  const [heroImages, setHeroImages] = useState<HeroImage[]>(initialHeroImages);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<HeroImage | null>(null);
  const [newImage, setNewImage] = useState<HeroImage>({  
    id: '',  // Will be set when adding
    image: '',
    title: '',
    subtitle: '',
    active: true
  });
  
  // Handle drag and drop reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(heroImages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setHeroImages(items);
  };
  
  // Toggle image active status
  const toggleActive = (id: string) => {
    setHeroImages(prevImages => 
      prevImages.map(img => 
        img.id === id ? { ...img, active: !img.active } : img
      )
    );
  };
  
  // Delete image
  const deleteImage = (id: string) => {
    if (confirm('Are you sure you want to delete this hero image?')) {
      setHeroImages(prevImages => prevImages.filter(img => img.id !== id));
    }
  };
  
  // Edit image
  const editImage = (image: HeroImage) => {
    setCurrentImage(image);
    setIsEditModalOpen(true);
  };
  
  // Save edited image
  const saveEditedImage = () => {
    if (currentImage) {
      setHeroImages(prevImages => 
        prevImages.map(img => 
          img.id === currentImage.id ? currentImage : img
        )
      );
      setIsEditModalOpen(false);
    }
  };
  
  // Add new image
  const addNewImage = () => {
    const newId = (Math.max(...heroImages.map(img => parseInt(img.id))) + 1).toString();
    setHeroImages([...heroImages, { ...newImage, id: newId }]);
    setNewImage({
      id: '',  // Will be set when adding
      image: '',
      title: '',
      subtitle: '',
      active: true
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className={styles.dashboardLayout}>
      <AdminSidebar />
      <div className={styles.mainContent}>
        <AdminHeader title="Hero Section Management" />
        
        <ProtectedRoute
          requiredPermission={{ resource: 'content', action: 'read' }}
        >
          <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Hero Section Management</h1>
            <p className={styles.pageDescription}>
              Manage hero section images, text, and order of appearance.
            </p>
          </div>
          <PermissionGuard
            requiredPermission={{ resource: 'content', action: 'create' }}
          >
            <button 
              className={styles.addButton}
              onClick={() => setIsAddModalOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14"></path>
                <path d="M5 12h14"></path>
              </svg>
              Add New Image
            </button>
          </PermissionGuard>
        </div>
        
        <div className={styles.heroImagesContainer}>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="heroImages">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={styles.heroImagesList}
                >
                  {heroImages.map((image, index) => (
                    <Draggable key={image.id} draggableId={image.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={styles.heroImageCard}
                        >
                          <div className={styles.dragHandle} {...provided.dragHandleProps}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="9" cy="12" r="1"></circle>
                              <circle cx="9" cy="5" r="1"></circle>
                              <circle cx="9" cy="19" r="1"></circle>
                              <circle cx="15" cy="12" r="1"></circle>
                              <circle cx="15" cy="5" r="1"></circle>
                              <circle cx="15" cy="19" r="1"></circle>
                            </svg>
                          </div>
                          
                          <div className={styles.heroImagePreview}>
                            <Image 
                              src={image.image} 
                              alt={image.title} 
                              width={300} 
                              height={150}
                              className={styles.previewImage}
                            />
                            <span className={`${styles.statusBadge} ${image.active ? styles.active : styles.inactive}`}>
                              {image.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          
                          <div className={styles.heroImageContent}>
                            <h3 className={styles.heroImageTitle}>{image.title}</h3>
                            <p className={styles.heroImageSubtitle}>{image.subtitle}</p>
                          </div>
                          
                          <div className={styles.heroImageActions}>
                            <PermissionGuard requiredPermission={{ resource: 'content', action: 'update' }}>
                              <button 
                                className={`${styles.actionButton} ${image.active ? styles.deactivateButton : styles.activateButton}`}
                                onClick={() => toggleActive(image.id)}
                              >
                                {image.active ? 'Deactivate' : 'Activate'}
                              </button>
                            </PermissionGuard>
                            <PermissionGuard requiredPermission={{ resource: 'content', action: 'update' }}>
                              <button 
                                className={`${styles.actionButton} ${styles.editButton}`}
                                onClick={() => editImage(image)}
                              >
                                Edit
                              </button>
                            </PermissionGuard>
                            <PermissionGuard requiredPermission={{ resource: 'content', action: 'delete' }}>
                              <button 
                                className={`${styles.actionButton} ${styles.deleteButton}`}
                                onClick={() => deleteImage(image.id)}
                              >
                                Delete
                              </button>
                            </PermissionGuard>
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
        
        {/* Add New Image Modal */}
        {isAddModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Add New Hero Image</h2>
                <button 
                  className={styles.modalClose}
                  onClick={() => setIsAddModalOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                  </svg>
                </button>
              </div>
                            <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label htmlFor="image" className={styles.formLabel}>Image URL</label>
                  <input 
                    type="text" 
                    id="image" 
                    className={styles.formInput}
                    value={newImage.image}
                    onChange={(e) => setNewImage({...newImage, image: e.target.value})}
                    placeholder="Enter image URL"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="title" className={styles.formLabel}>Title</label>
                  <input 
                    type="text" 
                    id="title" 
                    className={styles.formInput}
                    value={newImage.title}
                    onChange={(e) => setNewImage({...newImage, title: e.target.value})}
                    placeholder="Enter title"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="subtitle" className={styles.formLabel}>Subtitle</label>
                  <input 
                    type="text" 
                    id="subtitle" 
                    className={styles.formInput}
                    value={newImage.subtitle}
                    onChange={(e) => setNewImage({...newImage, subtitle: e.target.value})}
                    placeholder="Enter subtitle"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input 
                      type="checkbox" 
                      checked={newImage.active}
                      onChange={(e) => setNewImage({...newImage, active: e.target.checked})}
                      className={styles.checkbox}
                    />
                    Active
                  </label>
                </div>
              </div>
              
              <div className={styles.modalFooter}>
                <button 
                  className={styles.cancelButton}
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  className={styles.saveButton}
                  onClick={addNewImage}
                >
                  Add Image
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Edit Image Modal */}
        {isEditModalOpen && currentImage && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Edit Hero Image</h2>
                <button 
                  className={styles.modalClose}
                  onClick={() => setIsEditModalOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className={styles.modalBody}>
                {currentImage && (
                  <>
                    <div className={styles.formGroup}>
                      <label htmlFor="edit-image" className={styles.formLabel}>Image URL</label>
                      <input 
                        type="text" 
                        id="edit-image" 
                        className={styles.formInput}
                        value={currentImage.image}
                        onChange={(e) => setCurrentImage({...currentImage, image: e.target.value})}
                      />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="edit-title" className={styles.formLabel}>Title</label>
                      <input 
                        type="text" 
                        id="edit-title" 
                        className={styles.formInput}
                        value={currentImage.title}
                        onChange={(e) => setCurrentImage({...currentImage, title: e.target.value})}
                      />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="edit-subtitle" className={styles.formLabel}>Subtitle</label>
                      <input 
                        type="text" 
                        id="edit-subtitle" 
                        className={styles.formInput}
                        value={currentImage.subtitle}
                        onChange={(e) => setCurrentImage({...currentImage, subtitle: e.target.value})}
                      />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label className={styles.checkboxLabel}>
                        <input 
                          type="checkbox" 
                          checked={currentImage.active}
                          onChange={(e) => setCurrentImage({...currentImage, active: e.target.checked})}
                          className={styles.checkbox}
                        />
                        Active
                      </label>
                    </div>
                  </>
                )}
              </div>
              
              <div className={styles.modalFooter}>
                <button 
                  className={styles.cancelButton}
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  className={styles.saveButton}
                  onClick={saveEditedImage}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )})
        </ProtectedRoute>
      </div>
    </div>
  );
}
