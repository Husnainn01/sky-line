'use client';

import React, { useState, useEffect } from 'react';
import { getAuthToken } from '../../../../utils/sessionManager';
import Link from 'next/link';
import AdminHeader from '../../../../components/admin/AdminHeader';
import AdminSidebar from '../../../../components/admin/AdminSidebar';
import ProtectedRoute from '../../../../components/admin/ProtectedRoute';
import PermissionGuard from '../../../../components/admin/PermissionGuard';
import styles from './shipping.module.css';

// Define types for shipping schedules to match backend model
interface ShippingSchedule {
  id: string;
  destination: string;
  departureDate: string;
  arrivalDate: string;
  vessel: string;
  notes?: string;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

// Empty initial state - will be populated from API
const initialShippingSchedules: ShippingSchedule[] = [];

export default function ShippingManagementPage() {
  const [shippingSchedules, setShippingSchedules] = useState<ShippingSchedule[]>(initialShippingSchedules);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch shipping schedules from backend
  useEffect(() => {
    const fetchShippingSchedules = async () => {
      try {
        setIsLoading(true);
        setApiError(null);
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
        
        const response = await fetch(`${API_BASE_URL}/shipping-schedules`);
        if (!response.ok) {
          throw new Error('Failed to fetch shipping schedules');
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.success && data.data) {
          // Map MongoDB _id to id for frontend consistency
          const mappedData = data.data.map((item: any) => ({
            ...item,
            id: item._id // Map _id to id
          }));
          console.log('Mapped shipping schedules:', mappedData);
          setShippingSchedules(mappedData);
        } else {
          console.log('No shipping schedules found or invalid data');
          setShippingSchedules([]);
        }
      } catch (err) {
        console.error('Error fetching shipping schedules:', err);
        setApiError('Failed to load shipping schedules. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchShippingSchedules();
  }, []);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<ShippingSchedule | null>(null);
  const [newSchedule, setNewSchedule] = useState<ShippingSchedule>({
    id: '',  // Will be set when adding
    destination: '',
    departureDate: '',
    arrivalDate: '',
    vessel: '',
    notes: '',
    isActive: true,
    order: 0
  });
  
  // Filter states
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Filter schedules
  const filteredSchedules = shippingSchedules.filter(schedule => {
    const matchesActive = activeFilter === 'all' ? true : 
                         (activeFilter === 'active' ? schedule.isActive : !schedule.isActive);
    const matchesSearch = searchTerm 
      ? `${schedule.destination} ${schedule.vessel}`.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    return matchesActive && matchesSearch;
  });
  
  // Delete schedule
  const deleteSchedule = async (id: string) => {
    if (confirm('Are you sure you want to delete this shipping schedule?')) {
      try {
        // Find the schedule to delete
        const scheduleToDelete = shippingSchedules.find(schedule => schedule.id === id);
        
        if (!scheduleToDelete) {
          alert('Shipping schedule not found');
          return;
        }
        
        // Get API base URL from environment variable
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
        
        // Get authentication token
        const token = getAuthToken();
        if (!token) {
          throw new Error('Authentication required. Please log in.');
        }
        
        // Call the API to delete the shipping schedule
        const response = await fetch(`${API_BASE_URL}/shipping-schedules/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Get response text first to check if it's valid JSON
        const responseText = await response.text();
        let data;
        
        try {
          // Handle empty response
          data = responseText ? JSON.parse(responseText) : { success: true };
        } catch (e) {
          console.error('Invalid JSON response:', responseText);
          throw new Error('Server returned invalid JSON');
        }
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to delete shipping schedule');
        }
        
        // Update local state with a new array to avoid reference issues
        setShippingSchedules(prevSchedules => prevSchedules.filter(schedule => schedule.id !== id));
        
        // Show success message
        alert('Shipping schedule deleted successfully!');
      } catch (err) {
        console.error('Error deleting shipping schedule:', err);
        alert(`Failed to delete shipping schedule: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  };
  
  // Edit schedule
  const editSchedule = (schedule: ShippingSchedule) => {
    setCurrentSchedule(schedule);
    setIsEditModalOpen(true);
  };
  
  // Save edited schedule
  const saveEditedSchedule = async () => {
    if (currentSchedule) {
      try {
        // Get API base URL from environment variable
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
        
        // Get authentication token
        const token = getAuthToken();
        if (!token) {
          throw new Error('Authentication required. Please log in.');
        }
        
        // Call the API to update the shipping schedule
        const response = await fetch(`${API_BASE_URL}/shipping-schedules/${currentSchedule.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(currentSchedule)
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
          throw new Error(data.message || 'Failed to update shipping schedule');
        }
        
        if (data.success) {
          // Update the shipping schedule in state
          setShippingSchedules(prevSchedules => 
            prevSchedules.map(schedule => 
              schedule.id === currentSchedule.id ? { ...data.data, id: data.data._id } : schedule
            )
          );
          setIsEditModalOpen(false);
          alert('Shipping schedule updated successfully!');
        }
      } catch (err) {
        console.error('Error updating shipping schedule:', err);
        alert(`Failed to update shipping schedule: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  };
  
  // Add new schedule
  const addNewSchedule = async () => {
    try {
      // Get API base URL from environment variable
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
      
      // Get authentication token
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }
      
      // Calculate the next order number
      const nextOrder = shippingSchedules.length > 0 
        ? Math.max(...shippingSchedules.map(schedule => schedule.order)) + 1 
        : 1;
      
      // Call the API to create the shipping schedule
      const response = await fetch(`${API_BASE_URL}/shipping-schedules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...newSchedule, order: nextOrder })
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
        throw new Error(data.message || 'Failed to create shipping schedule');
      }
      
      if (data.success) {
        // Add the new shipping schedule to state with proper ID mapping
        setShippingSchedules(prevSchedules => [...prevSchedules, { ...data.data, id: data.data._id }]);
        setNewSchedule({
          id: '',
          destination: '',
          departureDate: '',
          arrivalDate: '',
          vessel: '',
          notes: '',
          isActive: true,
          order: 0
        });
        setIsAddModalOpen(false);
        alert('Shipping schedule created successfully!');
      }
    } catch (err) {
      console.error('Error creating shipping schedule:', err);
      alert(`Failed to create shipping schedule: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };
  
  // Get active status badge class
  const getActiveBadgeClass = (isActive: boolean) => {
    return isActive ? styles.activeBadge : styles.inactiveBadge;
  };

  return (
    <div className={styles.dashboardLayout}>
      <AdminSidebar />
      <div className={styles.mainContent}>
        <AdminHeader title="Shipping Management" />
        
        <ProtectedRoute
          requiredPermission={{ resource: 'content', action: 'read' }}
        >
          <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Shipping Management</h1>
            <p className={styles.pageDescription}>
              Manage shipping schedules, routes, and information.
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
              Add New Schedule
            </button>
          </PermissionGuard>
        </div>
        
        <div className={styles.filterBar}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search by origin, destination, or vessel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <svg className={styles.searchIcon} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          
          <div className={styles.statusFilter}>
            <span className={styles.filterLabel}>Status:</span>
            <div className={styles.filterButtons}>
              <button 
                className={`${styles.filterButton} ${activeFilter === 'all' ? styles.activeFilter : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                All
              </button>
              <button 
                className={`${styles.filterButton} ${activeFilter === 'active' ? styles.activeFilter : ''}`}
                onClick={() => setActiveFilter('active')}
              >
                Active
              </button>
              <button 
                className={`${styles.filterButton} ${activeFilter === 'inactive' ? styles.activeFilter : ''}`}
                onClick={() => setActiveFilter('inactive')}
              >
                Inactive
              </button>
            </div>
          </div>
        </div>
        
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Destination</th>
                <th>Departure Date</th>
                <th>Arrival Date</th>
                <th>Vessel</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.length > 0 ? (
                filteredSchedules.map(schedule => (
                  <tr key={schedule.id} className={styles.tableRow}>
                    <td>{schedule.destination}</td>
                    <td>{new Date(schedule.departureDate).toLocaleDateString()}</td>
                    <td>{new Date(schedule.arrivalDate).toLocaleDateString()}</td>
                    <td>{schedule.vessel}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${getActiveBadgeClass(schedule.isActive)}`}>
                        {schedule.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{schedule.notes || '-'}</td>
                    <td className={styles.actionsCell}>
                      <PermissionGuard requiredPermission={{ resource: 'content', action: 'update' }}>
                        <button 
                          className={`${styles.actionButton} ${styles.editButton}`}
                          onClick={() => editSchedule(schedule)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                      </PermissionGuard>
                      <PermissionGuard requiredPermission={{ resource: 'content', action: 'delete' }}>
                        <button 
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          onClick={() => deleteSchedule(schedule.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </PermissionGuard>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className={styles.noResults}>
                    No shipping schedules found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Add New Schedule Modal */}
        {isAddModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Add New Shipping Schedule</h2>
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
                  <label htmlFor="destination" className={styles.formLabel}>Destination</label>
                  <input 
                    type="text" 
                    id="destination" 
                    className={styles.formInput}
                    value={newSchedule.destination}
                    onChange={(e) => setNewSchedule({...newSchedule, destination: e.target.value})}
                    placeholder="e.g., Los Angeles, USA"
                  />
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="departureDate" className={styles.formLabel}>Departure Date</label>
                    <input 
                      type="date" 
                      id="departureDate" 
                      className={styles.formInput}
                      value={newSchedule.departureDate}
                      onChange={(e) => setNewSchedule({...newSchedule, departureDate: e.target.value})}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="arrivalDate" className={styles.formLabel}>Arrival Date</label>
                    <input 
                      type="date" 
                      id="arrivalDate" 
                      className={styles.formInput}
                      value={newSchedule.arrivalDate}
                      onChange={(e) => setNewSchedule({...newSchedule, arrivalDate: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="vessel" className={styles.formLabel}>Vessel</label>
                  <input 
                    type="text" 
                    id="vessel" 
                    className={styles.formInput}
                    value={newSchedule.vessel}
                    onChange={(e) => setNewSchedule({...newSchedule, vessel: e.target.value})}
                    placeholder="e.g., Pacific Star"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="isActive" className={styles.formLabel}>Status</label>
                  <select 
                    id="isActive" 
                    className={styles.formSelect}
                    value={newSchedule.isActive ? 'true' : 'false'}
                    onChange={(e) => setNewSchedule({...newSchedule, isActive: e.target.value === 'true'})}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="notes" className={styles.formLabel}>Notes (Optional)</label>
                  <textarea 
                    id="notes" 
                    className={styles.formTextarea}
                    value={newSchedule.notes}
                    onChange={(e) => setNewSchedule({...newSchedule, notes: e.target.value})}
                    placeholder="Additional information about this shipping schedule"
                  />
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
                  onClick={addNewSchedule}
                >
                  Add Schedule
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Edit Schedule Modal */}
        {isEditModalOpen && currentSchedule && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Edit Shipping Schedule</h2>
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
                
                <div className={styles.formGroup}>
                  <label htmlFor="edit-destination" className={styles.formLabel}>Destination</label>
                  <input 
                    type="text" 
                    id="edit-destination" 
                    className={styles.formInput}
                    value={currentSchedule.destination}
                    onChange={(e) => setCurrentSchedule({...currentSchedule, destination: e.target.value})}
                  />
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="edit-departureDate" className={styles.formLabel}>Departure Date</label>
                    <input 
                      type="date" 
                      id="edit-departureDate" 
                      className={styles.formInput}
                      value={currentSchedule.departureDate}
                      onChange={(e) => setCurrentSchedule({...currentSchedule, departureDate: e.target.value})}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="edit-arrivalDate" className={styles.formLabel}>Arrival Date</label>
                    <input 
                      type="date" 
                      id="edit-arrivalDate" 
                      className={styles.formInput}
                      value={currentSchedule.arrivalDate}
                      onChange={(e) => setCurrentSchedule({...currentSchedule, arrivalDate: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="edit-vessel" className={styles.formLabel}>Vessel</label>
                  <input 
                    type="text" 
                    id="edit-vessel" 
                    className={styles.formInput}
                    value={currentSchedule.vessel}
                    onChange={(e) => setCurrentSchedule({...currentSchedule, vessel: e.target.value})}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="edit-isActive" className={styles.formLabel}>Status</label>
                  <select 
                    id="edit-isActive" 
                    className={styles.formSelect}
                    value={currentSchedule.isActive ? 'true' : 'false'}
                    onChange={(e) => setCurrentSchedule({...currentSchedule, isActive: e.target.value === 'true'})}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="edit-notes" className={styles.formLabel}>Notes (Optional)</label>
                  <textarea 
                    id="edit-notes" 
                    className={styles.formTextarea}
                    value={currentSchedule.notes || ''}
                    onChange={(e) => setCurrentSchedule({...currentSchedule, notes: e.target.value})}
                  />
                </div>
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
                  onClick={saveEditedSchedule}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
        </ProtectedRoute>
      </div>
    </div>
  );
}
