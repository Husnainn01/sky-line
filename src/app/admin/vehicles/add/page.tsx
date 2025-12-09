'use client';

import React from 'react';
import AdminHeader from '../../../../components/admin/AdminHeader';
import AdminSidebar from '../../../../components/admin/AdminSidebar';
import ProtectedRoute from '../../../../components/admin/ProtectedRoute';
import styles from './addVehicle.module.css';

// This is just an example implementation
export default function AddVehiclePage() {
  return (
    <div className={styles.dashboardLayout}>
      <AdminSidebar />
      <div className={styles.mainContent}>
        <AdminHeader title="Add New Vehicle" />
        
        <ProtectedRoute 
          requiredPermission={{ resource: 'vehicles', action: 'create' }}
        >
          <div className={styles.container}>
            <div className={styles.header}>
              <div className={styles.headerTitle}>
                <h1 className={styles.title}>Add New Vehicle</h1>
                <p className={styles.subtitle}>Enter vehicle details to add to inventory</p>
              </div>
            </div>
            
            {/* Vehicle form would go here */}
            <form className={styles.form}>
              {/* Form fields */}
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>Vehicle Information</h2>
                
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="make" className={styles.formLabel}>Make*</label>
                    <input
                      type="text"
                      id="make"
                      name="make"
                      className={styles.formInput}
                      placeholder="e.g. Toyota"
                      required
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="model" className={styles.formLabel}>Model*</label>
                    <input
                      type="text"
                      id="model"
                      name="model"
                      className={styles.formInput}
                      placeholder="e.g. Supra"
                      required
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="year" className={styles.formLabel}>Year*</label>
                    <input
                      type="number"
                      id="year"
                      name="year"
                      className={styles.formInput}
                      placeholder="e.g. 1998"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className={styles.formActions}>
                <button type="submit" className={styles.submitButton}>
                  Add Vehicle
                </button>
              </div>
            </form>
          </div>
        </ProtectedRoute>
      </div>
    </div>
  );
}
