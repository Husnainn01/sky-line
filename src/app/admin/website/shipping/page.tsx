'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AdminHeader from '../../../../components/admin/AdminHeader';
import AdminSidebar from '../../../../components/admin/AdminSidebar';
import ProtectedRoute from '../../../../components/admin/ProtectedRoute';
import PermissionGuard from '../../../../components/admin/PermissionGuard';
import styles from './shipping.module.css';

// Define types for shipping schedules
interface ShippingSchedule {
  id: string;
  origin: string;
  destination: string;
  departureDate: string;
  arrivalDate: string;
  vessel: string;
  status: 'scheduled' | 'in-transit' | 'arrived' | 'delayed';
  notes?: string;
}

// Sample shipping schedules data
const initialShippingSchedules: ShippingSchedule[] = [
  {
    id: '1',
    origin: 'Yokohama, Japan',
    destination: 'Los Angeles, USA',
    departureDate: '2023-12-15',
    arrivalDate: '2024-01-10',
    vessel: 'Pacific Star',
    status: 'scheduled',
    notes: 'Monthly direct route'
  },
  {
    id: '2',
    origin: 'Osaka, Japan',
    destination: 'Vancouver, Canada',
    departureDate: '2023-12-05',
    arrivalDate: '2023-12-28',
    vessel: 'Northern Express',
    status: 'in-transit'
  },
  {
    id: '3',
    origin: 'Tokyo, Japan',
    destination: 'Sydney, Australia',
    departureDate: '2023-11-20',
    arrivalDate: '2023-12-18',
    vessel: 'Southern Route',
    status: 'delayed',
    notes: 'Delayed due to weather conditions'
  }
];

export default function ShippingManagementPage() {
  const [shippingSchedules, setShippingSchedules] = useState<ShippingSchedule[]>(initialShippingSchedules);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<ShippingSchedule | null>(null);
  const [newSchedule, setNewSchedule] = useState<ShippingSchedule>({
    id: '',  // Will be set when adding
    origin: '',
    destination: '',
    departureDate: '',
    arrivalDate: '',
    vessel: '',
    status: 'scheduled',
    notes: ''
  });
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Filter schedules
  const filteredSchedules = shippingSchedules.filter(schedule => {
    const matchesStatus = statusFilter === 'all' ? true : schedule.status === statusFilter;
    const matchesSearch = searchTerm 
      ? `${schedule.origin} ${schedule.destination} ${schedule.vessel}`.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    return matchesStatus && matchesSearch;
  });
  
  // Delete schedule
  const deleteSchedule = (id: string) => {
    if (confirm('Are you sure you want to delete this shipping schedule?')) {
      setShippingSchedules(prevSchedules => prevSchedules.filter(schedule => schedule.id !== id));
    }
  };
  
  // Edit schedule
  const editSchedule = (schedule: ShippingSchedule) => {
    setCurrentSchedule(schedule);
    setIsEditModalOpen(true);
  };
  
  // Save edited schedule
  const saveEditedSchedule = () => {
    if (currentSchedule) {
      setShippingSchedules(prevSchedules => 
        prevSchedules.map(schedule => 
          schedule.id === currentSchedule.id ? currentSchedule : schedule
        )
      );
      setIsEditModalOpen(false);
    }
  };
  
  // Add new schedule
  const addNewSchedule = () => {
    const newId = (Math.max(...shippingSchedules.map(schedule => parseInt(schedule.id))) + 1).toString();
    setShippingSchedules([...shippingSchedules, { ...newSchedule, id: newId }]);
    setNewSchedule({
      id: '',
      origin: '',
      destination: '',
      departureDate: '',
      arrivalDate: '',
      vessel: '',
      status: 'scheduled',
      notes: ''
    });
    setIsAddModalOpen(false);
  };
  
  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'scheduled':
        return styles.scheduledBadge;
      case 'in-transit':
        return styles.inTransitBadge;
      case 'arrived':
        return styles.arrivedBadge;
      case 'delayed':
        return styles.delayedBadge;
      default:
        return '';
    }
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
                className={`${styles.filterButton} ${statusFilter === 'all' ? styles.activeFilter : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All
              </button>
              <button 
                className={`${styles.filterButton} ${statusFilter === 'scheduled' ? styles.activeFilter : ''}`}
                onClick={() => setStatusFilter('scheduled')}
              >
                Scheduled
              </button>
              <button 
                className={`${styles.filterButton} ${statusFilter === 'in-transit' ? styles.activeFilter : ''}`}
                onClick={() => setStatusFilter('in-transit')}
              >
                In Transit
              </button>
              <button 
                className={`${styles.filterButton} ${statusFilter === 'arrived' ? styles.activeFilter : ''}`}
                onClick={() => setStatusFilter('arrived')}
              >
                Arrived
              </button>
              <button 
                className={`${styles.filterButton} ${statusFilter === 'delayed' ? styles.activeFilter : ''}`}
                onClick={() => setStatusFilter('delayed')}
              >
                Delayed
              </button>
            </div>
          </div>
        </div>
        
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Origin</th>
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
                    <td>{schedule.origin}</td>
                    <td>{schedule.destination}</td>
                    <td>{new Date(schedule.departureDate).toLocaleDateString()}</td>
                    <td>{new Date(schedule.arrivalDate).toLocaleDateString()}</td>
                    <td>{schedule.vessel}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusBadgeClass(schedule.status)}`}>
                        {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1).replace('-', ' ')}
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
                  <label htmlFor="origin" className={styles.formLabel}>Origin</label>
                  <input 
                    type="text" 
                    id="origin" 
                    className={styles.formInput}
                    value={newSchedule.origin}
                    onChange={(e) => setNewSchedule({...newSchedule, origin: e.target.value})}
                    placeholder="e.g., Yokohama, Japan"
                  />
                </div>
                
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
                  <label htmlFor="status" className={styles.formLabel}>Status</label>
                  <select 
                    id="status" 
                    className={styles.formSelect}
                    value={newSchedule.status}
                    onChange={(e) => setNewSchedule({...newSchedule, status: e.target.value as ShippingSchedule['status']})}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="in-transit">In Transit</option>
                    <option value="arrived">Arrived</option>
                    <option value="delayed">Delayed</option>
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
                  <label htmlFor="edit-origin" className={styles.formLabel}>Origin</label>
                  <input 
                    type="text" 
                    id="edit-origin" 
                    className={styles.formInput}
                    value={currentSchedule.origin}
                    onChange={(e) => setCurrentSchedule({...currentSchedule, origin: e.target.value})}
                  />
                </div>
                
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
                  <label htmlFor="edit-status" className={styles.formLabel}>Status</label>
                  <select 
                    id="edit-status" 
                    className={styles.formSelect}
                    value={currentSchedule.status}
                    onChange={(e) => setCurrentSchedule({...currentSchedule, status: e.target.value as ShippingSchedule['status']})}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="in-transit">In Transit</option>
                    <option value="arrived">Arrived</option>
                    <option value="delayed">Delayed</option>
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
