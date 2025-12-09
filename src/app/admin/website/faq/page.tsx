'use client';

import React, { useState } from 'react';
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
}

// Sample FAQ categories
const faqCategories = [
  'General',
  'Shipping',
  'Payment',
  'Vehicles',
  'Import Process'
];

// Sample FAQ data
const initialFAQs: FAQItem[] = [
  {
    id: '1',
    question: 'How do I purchase a vehicle from your website?',
    answer: 'You can browse our inventory and select a vehicle you\'re interested in. Click on the "Inquire" button to start the purchase process. Our team will guide you through the steps including payment, shipping, and import documentation.',
    category: 'General',
    order: 1,
    isActive: true
  },
  {
    id: '2',
    question: 'What payment methods do you accept?',
    answer: 'We accept bank transfers, credit cards, and cryptocurrency payments. A deposit is required to secure your vehicle, with the balance due before shipping.',
    category: 'Payment',
    order: 1,
    isActive: true
  },
  {
    id: '3',
    question: 'How long does shipping take?',
    answer: 'Shipping times vary depending on your location. Typically, it takes 4-8 weeks from Japan to the US, 6-10 weeks to Europe, and 3-6 weeks to Australia. We provide tracking information once your vehicle is in transit.',
    category: 'Shipping',
    order: 1,
    isActive: true
  },
  {
    id: '4',
    question: 'Do you provide import assistance?',
    answer: 'Yes, we handle all the necessary paperwork for importing your vehicle. Our team is experienced with import regulations for the US, EU, UK, Australia, and many other countries.',
    category: 'Import Process',
    order: 1,
    isActive: true
  },
  {
    id: '5',
    question: 'What documentation will I receive with my vehicle?',
    answer: 'All vehicles come with export certificates, auction sheets (when applicable), de-registration documents, and our own inspection reports. We also provide all necessary customs documentation.',
    category: 'Vehicles',
    order: 1,
    isActive: true
  }
];

export default function FAQManagementPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>(initialFAQs);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentFAQ, setCurrentFAQ] = useState<FAQItem | null>(null);
  const [newFAQ, setNewFAQ] = useState<FAQItem>({
    id: '',  // Will be set when adding
    question: '',
    answer: '',
    category: 'General',
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
  const deleteFAQ = (id: string) => {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      setFaqs(prevFAQs => prevFAQs.filter(faq => faq.id !== id));
    }
  };
  
  // Edit FAQ
  const editFAQ = (faq: FAQItem) => {
    setCurrentFAQ(faq);
    setIsEditModalOpen(true);
  };
  
  // Save edited FAQ
  const saveEditedFAQ = () => {
    if (currentFAQ) {
      setFaqs(prevFAQs => 
        prevFAQs.map(faq => 
          faq.id === currentFAQ.id ? currentFAQ : faq
        )
      );
      setIsEditModalOpen(false);
    }
  };
  
  // Add new FAQ
  const addNewFAQ = () => {
    const newId = (Math.max(...faqs.map(faq => parseInt(faq.id))) + 1).toString();
    
    // Calculate the next order number for the category
    const categoryFAQs = faqs.filter(faq => faq.category === newFAQ.category);
    const nextOrder = categoryFAQs.length > 0 
      ? Math.max(...categoryFAQs.map(faq => faq.order)) + 1 
      : 1;
    
    setFaqs([...faqs, { ...newFAQ, id: newId, order: nextOrder }]);
    setNewFAQ({
      id: '',
      question: '',
      answer: '',
      category: 'General',
      order: 1,
      isActive: true
    });
    setIsAddModalOpen(false);
  };
  
  // Toggle FAQ active status
  const toggleFAQActive = (id: string) => {
    setFaqs(prevFAQs => 
      prevFAQs.map(faq => 
        faq.id === id ? { ...faq, isActive: !faq.isActive } : faq
      )
    );
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
              {faqCategories.map(category => (
                <button 
                  key={category}
                  className={`${styles.filterButton} ${categoryFilter === category ? styles.activeFilter : ''}`}
                  onClick={() => setCategoryFilter(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {Object.keys(groupedFAQs).length > 0 ? (
          <div className={styles.faqAccordion}>
            {Object.entries(groupedFAQs).map(([category, categoryFAQs]) => (
              <div key={category} className={styles.faqCategory}>
                <h2 className={styles.categoryTitle}>{category}</h2>
                
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
                    {faqCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
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
                    {faqCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
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
