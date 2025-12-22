'use client';

import React, { useState, useEffect } from 'react';
import { getAuthToken } from '../../../../utils/sessionManager';
import Link from 'next/link';
import AdminHeader from '../../../../components/admin/AdminHeader';
import AdminSidebar from '../../../../components/admin/AdminSidebar';
import ProtectedRoute from '../../../../components/admin/ProtectedRoute';
import PermissionGuard from '../../../../components/admin/PermissionGuard';
import styles from './faq.module.css';

// Define types for FAQ items
interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// FAQ categories - matching the frontend categories
const faqCategoryOptions = [
  { value: 'vehicle-import', label: 'Vehicle Import' },
  { value: 'auction', label: 'Auction Process' },
  { value: 'shipping', label: 'Shipping & Logistics' },
  { value: 'payment', label: 'Payment & Costs' },
  { value: 'after-sales', label: 'After-Sales Support' }
];

// Extract just the values for filtering
const faqCategories = faqCategoryOptions.map(cat => cat.value);

// Empty initial state - will be populated from API
const initialFAQs: FAQItem[] = [];

export default function FAQManagementPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch FAQs from backend
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setIsLoading(true);
        setApiError(null);
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
        
        const response = await fetch(`${API_BASE_URL}/faqs`);
        if (!response.ok) {
          throw new Error('Failed to fetch FAQs');
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.success && data.data) {
          // Map MongoDB _id to id for frontend consistency
          const mappedData = data.data.map((item: any) => ({
            ...item,
            id: item._id // Map _id to id
          }));
          console.log('Mapped FAQs:', mappedData);
          setFaqs(mappedData);
        } else {
          console.log('No FAQs found or invalid data');
          setFaqs([]);
        }
      } catch (error) {
        console.error('Error fetching FAQs:', error);
        setApiError('Failed to load FAQs. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFAQs();
  }, []);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentFAQ, setCurrentFAQ] = useState<FAQItem | null>(null);
  const [newFAQ, setNewFAQ] = useState<FAQItem>({
    id: '',  // Will be set when adding
    question: '',
    answer: '',
    category: 'vehicle-import', // Default to first category
    order: 1,
    isActive: true
  });
  
  // Filter states
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedFAQs, setExpandedFAQs] = useState<string[]>([]);
  
  // Filter FAQs
  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = categoryFilter === 'all' ? true : faq.category === categoryFilter;
    const matchesSearch = searchTerm 
      ? `${faq.question} ${faq.answer}`.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    return matchesCategory && matchesSearch;
  });
  
  // Group FAQs by category
  const groupedFAQs = filteredFAQs.reduce((groups, faq) => {
    const category = faq.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(faq);
    return groups;
  }, {} as Record<string, FAQItem[]>);
  
  // Delete FAQ
  const deleteFAQ = async (id: string) => {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      try {
        // Find the FAQ to delete
        const faqToDelete = faqs.find(faq => faq.id === id);
        
        if (!faqToDelete) {
          alert('FAQ not found');
          return;
        }
        
        // Get API base URL from environment variable
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
        
        // Get authentication token
        const token = getAuthToken();
        if (!token) {
          throw new Error('Authentication required. Please log in.');
        }
        
        // Call the API to delete the FAQ
        const response = await fetch(`${API_BASE_URL}/faqs/${id}`, {
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
          throw new Error(data.message || 'Failed to delete FAQ');
        }
        
        // Update local state with a new array to avoid reference issues
        setFaqs(prevFaqs => prevFaqs.filter(faq => faq.id !== id));
        
        // Show success message
        alert('FAQ deleted successfully!');
      } catch (err) {
        console.error('Error deleting FAQ:', err);
        alert(`Failed to delete FAQ: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  };
  
  // Edit FAQ
  const editFAQ = (faq: FAQItem) => {
    setCurrentFAQ(faq);
    setIsEditModalOpen(true);
  };
  
  // Save edited FAQ
  const saveEditedFAQ = async () => {
    if (currentFAQ) {
      try {
        // Get API base URL from environment variable
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
        
        // Get authentication token
        const token = getAuthToken();
        if (!token) {
          throw new Error('Authentication required. Please log in.');
        }
        
        // Call the API to update the FAQ
        const response = await fetch(`${API_BASE_URL}/faqs/${currentFAQ.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(currentFAQ)
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
          throw new Error(data.message || 'Failed to update FAQ');
        }
        
        if (data.success) {
          // Update the FAQ in state
          setFaqs(prevFAQs => 
            prevFAQs.map(faq => 
              faq.id === currentFAQ.id ? { ...data.data, id: data.data._id } : faq
            )
          );
          setIsEditModalOpen(false);
          alert('FAQ updated successfully!');
        }
      } catch (err) {
        console.error('Error updating FAQ:', err);
        alert(`Failed to update FAQ: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  };
  
  // Add new FAQ
  const addNewFAQ = async () => {
    try {
      // Get API base URL from environment variable
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
      
      // Get authentication token
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }
      
      // Calculate the next order number for the category
      const categoryFAQs = faqs.filter(faq => faq.category === newFAQ.category);
      const nextOrder = categoryFAQs.length > 0 
        ? Math.max(...categoryFAQs.map(faq => faq.order)) + 1 
        : 1;
      
      // Call the API to create the FAQ
      const response = await fetch(`${API_BASE_URL}/faqs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...newFAQ, order: nextOrder })
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
        throw new Error(data.message || 'Failed to create FAQ');
      }
      
      if (data.success) {
        // Add the new FAQ to state with proper ID mapping
        setFaqs(prevFaqs => [...prevFaqs, { ...data.data, id: data.data._id }]);
        setNewFAQ({
          id: '',
          question: '',
          answer: '',
          category: 'vehicle-import',
          order: 1,
          isActive: true
        });
        setIsAddModalOpen(false);
        alert('FAQ created successfully!');
      }
    } catch (err) {
      console.error('Error creating FAQ:', err);
      alert(`Failed to create FAQ: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };
  
  // Toggle FAQ active status
  const toggleFAQActive = async (id: string) => {
    try {
      // Find the FAQ to toggle
      const faqToToggle = faqs.find(faq => faq.id === id);
      
      if (!faqToToggle) {
        alert('FAQ not found');
        return;
      }
      
      // Get API base URL from environment variable
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
      
      // Get authentication token
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }
      
      // Call the API to update the FAQ
      const response = await fetch(`${API_BASE_URL}/faqs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...faqToToggle, isActive: !faqToToggle.isActive })
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
        throw new Error(data.message || 'Failed to update FAQ');
      }
      
      if (data.success) {
        // Update FAQ in state with proper ID mapping
        setFaqs(prevFAQs => 
          prevFAQs.map(faq => 
            faq.id === id ? { ...data.data, id: data.data._id } : faq
          )
        );
        
        // Show success message
        alert(`FAQ ${faqToToggle.isActive ? 'deactivated' : 'activated'} successfully!`);
      }
    } catch (err) {
      console.error('Error updating FAQ:', err);
      alert(`Failed to update FAQ: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };
  
  // Toggle FAQ expansion
  const toggleFAQExpansion = (id: string) => {
    setExpandedFAQs(prevExpanded => 
      prevExpanded.includes(id)
        ? prevExpanded.filter(faqId => faqId !== id)
        : [...prevExpanded, id]
    );
  };
  
  // Move FAQ up in order
  const moveFAQUp = (faq: FAQItem) => {
    const categoryFAQs = faqs.filter(f => f.category === faq.category);
    const sortedCategoryFAQs = [...categoryFAQs].sort((a, b) => a.order - b.order);
    
    const currentIndex = sortedCategoryFAQs.findIndex(f => f.id === faq.id);
    if (currentIndex <= 0) return; // Already at the top
    
    const updatedFAQs = [...faqs];
    const currentFAQ = updatedFAQs.find(f => f.id === faq.id);
    const previousFAQ = updatedFAQs.find(f => f.id === sortedCategoryFAQs[currentIndex - 1].id);
    
    if (currentFAQ && previousFAQ) {
      // Swap orders
      const tempOrder = currentFAQ.order;
      currentFAQ.order = previousFAQ.order;
      previousFAQ.order = tempOrder;
      setFaqs(updatedFAQs);
    }
  };
  
  // Move FAQ down in order
  const moveFAQDown = (faq: FAQItem) => {
    const categoryFAQs = faqs.filter(f => f.category === faq.category);
    const sortedCategoryFAQs = [...categoryFAQs].sort((a, b) => a.order - b.order);
    
    const currentIndex = sortedCategoryFAQs.findIndex(f => f.id === faq.id);
    if (currentIndex === -1 || currentIndex >= sortedCategoryFAQs.length - 1) return; // Already at the bottom
    
    const updatedFAQs = [...faqs];
    const currentFAQ = updatedFAQs.find(f => f.id === faq.id);
    const nextFAQ = updatedFAQs.find(f => f.id === sortedCategoryFAQs[currentIndex + 1].id);
    
    if (currentFAQ && nextFAQ) {
      // Swap orders
      const tempOrder = currentFAQ.order;
      currentFAQ.order = nextFAQ.order;
      nextFAQ.order = tempOrder;
      setFaqs(updatedFAQs);
    }
  };

  return (
    <div className={styles.dashboardLayout}>
      <AdminSidebar />
      <div className={styles.mainContent}>
        <AdminHeader title="FAQ Management" />
        
        <ProtectedRoute
          requiredPermission={{ resource: 'content', action: 'read' }}
        >
          <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>FAQ Management</h1>
            <p className={styles.pageDescription}>
              Create, edit, and organize frequently asked questions.
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
              Add New FAQ
            </button>
          </PermissionGuard>
        </div>
        
        <div className={styles.filterBar}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <svg className={styles.searchIcon} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          
          <div className={styles.categoryFilter}>
            <span className={styles.filterLabel}>Category:</span>
            <div className={styles.filterButtons}>
              <button 
                className={`${styles.filterButton} ${categoryFilter === 'all' ? styles.activeFilter : ''}`}
                onClick={() => setCategoryFilter('all')}
              >
                All
              </button>
              {faqCategoryOptions.map(category => (
                <button 
                  key={category.value}
                  className={`${styles.filterButton} ${categoryFilter === category.value ? styles.activeFilter : ''}`}
                  onClick={() => setCategoryFilter(category.value)}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {Object.keys(groupedFAQs).length > 0 ? (
          <div className={styles.faqAccordion}>
            {Object.entries(groupedFAQs).map(([category, categoryFAQs]) => (
              <div key={category} className={styles.faqCategory}>
                <h2 className={styles.categoryTitle}>
                  {faqCategoryOptions.find(cat => cat.value === category)?.label || category}
                </h2>
                
                {[...categoryFAQs].sort((a, b) => a.order - b.order).map(faq => (
                  <div 
                    key={faq.id} 
                    className={`${styles.faqItem} ${!faq.isActive ? styles.inactiveFAQ : ''}`}
                  >
                    <div className={styles.faqHeader}>
                      <div className={styles.faqQuestion} onClick={() => toggleFAQExpansion(faq.id)}>
                        <div className={styles.questionText}>
                          <span className={styles.questionNumber}>{faq.order}.</span>
                          {faq.question}
                        </div>
                        <svg 
                          className={`${styles.expandIcon} ${expandedFAQs.includes(faq.id) ? styles.expanded : ''}`} 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="20" 
                          height="20" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </div>
                      
                      <div className={styles.faqActions}>
                        <PermissionGuard requiredPermission={{ resource: 'content', action: 'update' }}>
                          <button 
                            className={`${styles.actionButton} ${styles.moveButton}`}
                            onClick={() => moveFAQUp(faq)}
                            title="Move Up"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="18 15 12 9 6 15"></polyline>
                            </svg>
                          </button>
                        </PermissionGuard>
                        <PermissionGuard requiredPermission={{ resource: 'content', action: 'update' }}>
                          <button 
                            className={`${styles.actionButton} ${styles.moveButton}`}
                            onClick={() => moveFAQDown(faq)}
                            title="Move Down"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </button>
                        </PermissionGuard>
                        <PermissionGuard requiredPermission={{ resource: 'content', action: 'update' }}>
                          <button 
                            className={`${styles.actionButton} ${faq.isActive ? styles.deactivateButton : styles.activateButton}`}
                            onClick={() => toggleFAQActive(faq.id)}
                            title={faq.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {faq.isActive ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18.36 6.64A9 9 0 0 1 20.77 15"></path>
                                <path d="M6.16 6.16a9 9 0 1 0 12.68 12.68"></path>
                                <path d="M12 2v2"></path>
                                <path d="m2 2 20 20"></path>
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                                <line x1="12" y1="2" x2="12" y2="12"></line>
                              </svg>
                            )}
                          </button>
                        </PermissionGuard>
                        <PermissionGuard requiredPermission={{ resource: 'content', action: 'update' }}>
                          <button 
                            className={`${styles.actionButton} ${styles.editButton}`}
                            onClick={() => editFAQ(faq)}
                            title="Edit"
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
                            onClick={() => deleteFAQ(faq.id)}
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </PermissionGuard>
                      </div>
                    </div>
                    
                    {expandedFAQs.includes(faq.id) && (
                      <div className={styles.faqAnswer}>
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noResults}>
            <div className={styles.noResultsIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <h3 className={styles.noResultsTitle}>No FAQs Found</h3>
            <p className={styles.noResultsText}>No FAQs match your search criteria. Try adjusting your filters or add a new FAQ.</p>
            <button 
              className={styles.resetButton}
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
        
        {/* Add New FAQ Modal */}
        {isAddModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Add New FAQ</h2>
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
                  <label htmlFor="category" className={styles.formLabel}>Category</label>
                  <select 
                    id="category" 
                    className={styles.formSelect}
                    value={newFAQ.category}
                    onChange={(e) => setNewFAQ({...newFAQ, category: e.target.value})}
                  >
                    {faqCategoryOptions.map(category => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="question" className={styles.formLabel}>Question</label>
                  <input 
                    type="text" 
                    id="question" 
                    className={styles.formInput}
                    value={newFAQ.question}
                    onChange={(e) => setNewFAQ({...newFAQ, question: e.target.value})}
                    placeholder="Enter the question"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="answer" className={styles.formLabel}>Answer</label>
                  <textarea 
                    id="answer" 
                    className={styles.formTextarea}
                    value={newFAQ.answer}
                    onChange={(e) => setNewFAQ({...newFAQ, answer: e.target.value})}
                    placeholder="Enter the answer"
                    rows={5}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input 
                      type="checkbox" 
                      checked={newFAQ.isActive}
                      onChange={(e) => setNewFAQ({...newFAQ, isActive: e.target.checked})}
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
                  onClick={addNewFAQ}
                  disabled={!newFAQ.question || !newFAQ.answer}
                >
                  Add FAQ
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Edit FAQ Modal */}
        {isEditModalOpen && currentFAQ && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Edit FAQ</h2>
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
                  <label htmlFor="edit-category" className={styles.formLabel}>Category</label>
                  <select 
                    id="edit-category" 
                    className={styles.formSelect}
                    value={currentFAQ.category}
                    onChange={(e) => setCurrentFAQ({...currentFAQ, category: e.target.value})}
                  >
                    {faqCategoryOptions.map(category => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="edit-question" className={styles.formLabel}>Question</label>
                  <input 
                    type="text" 
                    id="edit-question" 
                    className={styles.formInput}
                    value={currentFAQ.question}
                    onChange={(e) => setCurrentFAQ({...currentFAQ, question: e.target.value})}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="edit-answer" className={styles.formLabel}>Answer</label>
                  <textarea 
                    id="edit-answer" 
                    className={styles.formTextarea}
                    value={currentFAQ.answer}
                    onChange={(e) => setCurrentFAQ({...currentFAQ, answer: e.target.value})}
                    rows={5}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input 
                      type="checkbox" 
                      checked={currentFAQ.isActive}
                      onChange={(e) => setCurrentFAQ({...currentFAQ, isActive: e.target.checked})}
                      className={styles.checkbox}
                    />
                    Active
                  </label>
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
                  onClick={saveEditedFAQ}
                  disabled={!currentFAQ.question || !currentFAQ.answer}
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
