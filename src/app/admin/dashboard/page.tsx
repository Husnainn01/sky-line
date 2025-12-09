'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
// Import directly with relative paths to fix TypeScript errors
import AdminHeader from '../../../components/admin/AdminHeader';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import { getUser } from '../../../utils/sessionManager';
import { dashboardApi, vehicleApi } from '../../../lib/api';
import styles from './dashboard.module.css';

// Define interfaces for dashboard data
interface MonthlyRevenue {
  month: string;
  amount: number;
}

interface VehiclesByType {
  stock: number;
  auction: number;
  sold: number;
  pending: number;
}

interface TopSellingModel {
  model: string;
  count: number;
  percentage: number;
}

interface RecentOrder {
  id: string;
  customer: string;
  vehicle: string;
  amount: number;
  status: string;
  date: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('yearly');
  const [userName, setUserName] = useState('Admin');
  
  // State for dashboard data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [vehiclesByType, setVehiclesByType] = useState<VehiclesByType>({ stock: 0, auction: 0, sold: 0, pending: 0 });
  const [topSellingModels, setTopSellingModels] = useState<TopSellingModel[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalVehicles, setTotalVehicles] = useState(0);
  
  // Get user data and dashboard data when component mounts
  useEffect(() => {
    const user = getUser();
    if (user) {
      // Use name if available, otherwise use email or fallback to 'Admin'
      setUserName(user.name || user.email?.split('@')[0] || 'Admin');
    }
    
    // Fetch dashboard data
    fetchDashboardData();
  }, []);
  
  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch dashboard data from API
      const dashboardData = await dashboardApi.getDashboardData();
      
      // Set monthly revenue data
      if (dashboardData.monthlyRevenue) {
        setMonthlyRevenue(dashboardData.monthlyRevenue);
        // Calculate total revenue
        const total = dashboardData.monthlyRevenue.reduce(
          (sum: number, month: MonthlyRevenue) => sum + month.amount, 0
        );
        setTotalRevenue(total);
      }
      
      // Set vehicles by type data
      if (dashboardData.vehiclesByType) {
        setVehiclesByType(dashboardData.vehiclesByType);
        // Calculate total vehicles
        const total = Object.values(dashboardData.vehiclesByType as VehiclesByType).reduce(
          (sum: number, count: number) => sum + count, 0
        );
        setTotalVehicles(total);
      }
      
      // Set top selling models data
      if (dashboardData.topSellingModels) {
        setTopSellingModels(dashboardData.topSellingModels);
      }
      
      // Set recent orders data
      if (dashboardData.recentOrders) {
        setRecentOrders(dashboardData.recentOrders);
      }
      
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
      
      // Set fallback data for development
      setMonthlyRevenue([
        { month: 'Jan', amount: 65000 },
        { month: 'Feb', amount: 72000 },
        { month: 'Mar', amount: 58000 },
        { month: 'Apr', amount: 75000 },
        { month: 'May', amount: 82000 },
        { month: 'Jun', amount: 95000 },
        { month: 'Jul', amount: 105000 },
        { month: 'Aug', amount: 92000 },
        { month: 'Sep', amount: 86000 },
        { month: 'Oct', amount: 94000 },
        { month: 'Nov', amount: 98000 },
        { month: 'Dec', amount: 120000 },
      ]);
      
      setVehiclesByType({
        stock: 86,
        auction: 38,
        sold: 45,
        pending: 12,
      });
      
      setTopSellingModels([
        { model: 'Toyota Supra', count: 12, percentage: 15 },
        { model: 'Nissan Skyline', count: 10, percentage: 12.5 },
        { model: 'Honda NSX', count: 8, percentage: 10 },
        { model: 'Mazda RX-7', count: 7, percentage: 8.75 },
        { model: 'Mitsubishi Evo', count: 6, percentage: 7.5 },
      ]);
      
      setRecentOrders([
        { id: 'ORD-7829', customer: 'John Smith', vehicle: '2002 Nissan Skyline GT-R', amount: 42500, status: 'completed', date: '2023-11-28' },
        { id: 'ORD-7830', customer: 'Emma Johnson', vehicle: '1995 Toyota Supra RZ', amount: 68000, status: 'processing', date: '2023-11-29' },
        { id: 'ORD-7831', customer: 'Michael Brown', vehicle: '1992 Mazda RX-7 FD', amount: 35000, status: 'processing', date: '2023-11-30' },
        { id: 'ORD-7832', customer: 'Sarah Davis', vehicle: '1991 Honda NSX', amount: 75000, status: 'pending', date: '2023-12-01' },
      ]);
      
      // Calculate totals from fallback data
      setTotalRevenue(1042000); // Sum of all monthly revenue
      setTotalVehicles(181); // Sum of all vehicle types
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={styles.dashboardLayout}>
      <AdminSidebar />
      <div className={styles.mainContent}>
        <AdminHeader title="Dashboard" />
        
        <div className={styles.welcomeSection}>
          <div className={styles.welcomeContent}>
            <h1 className={styles.welcomeTitle}>Welcome back, {userName}</h1>
            <p className={styles.welcomeSubtitle}>Here's what's happening with your inventory today.</p>
          </div>
          <div className={styles.dateTimeDisplay}>
            <div className={styles.currentDate}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>
        
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p className={styles.loadingMessage}>Loading dashboard data...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p className={styles.errorMessage}>{error}</p>
            <button 
              onClick={() => fetchDashboardData()}
              className={styles.retryButton}
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className={styles.overviewCards}>
          <div className={styles.overviewCard}>
            <div className={styles.overviewIconWrapper} style={{ backgroundColor: 'rgba(199, 15, 15, 0.1)' }}>
              <svg className={styles.overviewIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#c70f0f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.6-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
                <circle cx="7" cy="17" r="2"></circle>
                <path d="M9 17h6"></path>
                <circle cx="17" cy="17" r="2"></circle>
              </svg>
            </div>
            <div className={styles.overviewContent}>
              <h3 className={styles.overviewTitle}>Total Vehicles</h3>
              <p className={styles.overviewValue}>{totalVehicles}</p>
              <div className={styles.overviewTrend}>
                <svg className={styles.trendUpIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
                <span>+8% from last month</span>
              </div>
            </div>
          </div>
          
          <div className={styles.overviewCard}>
            <div className={styles.overviewIconWrapper} style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
              <svg className={styles.overviewIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div className={styles.overviewContent}>
              <h3 className={styles.overviewTitle}>Total Revenue</h3>
              <p className={styles.overviewValue}>${(totalRevenue / 1000).toFixed(0)}k</p>
              <div className={styles.overviewTrend}>
                <svg className={styles.trendUpIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
                <span>+12% from last month</span>
              </div>
            </div>
          </div>
          
          <div className={styles.overviewCard}>
            <div className={styles.overviewIconWrapper} style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
              <svg className={styles.overviewIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
              </svg>
            </div>
            <div className={styles.overviewContent}>
              <h3 className={styles.overviewTitle}>Active Auctions</h3>
              <p className={styles.overviewValue}>{vehiclesByType.auction}</p>
              <div className={styles.overviewTrend}>
                <svg className={styles.trendUpIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
                <span>+5% from last month</span>
              </div>
            </div>
          </div>
          
          <div className={styles.overviewCard}>
            <div className={styles.overviewIconWrapper} style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
              <svg className={styles.overviewIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                <path d="M3 6h18"></path>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </div>
            <div className={styles.overviewContent}>
              <h3 className={styles.overviewTitle}>Pending Orders</h3>
              <p className={styles.overviewValue}>{vehiclesByType.pending}</p>
              <div className={styles.overviewTrend}>
                <svg className={styles.trendDownIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
                <span className={styles.trendDown}>-2% from last month</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.dashboardGrid}>
          <div className={styles.revenueChart}>
            <div className={styles.chartHeader}>
              <h2 className={styles.chartTitle}>Revenue Overview</h2>
              <div className={styles.chartControls}>
                <select 
                  className={styles.periodSelect}
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
            <div className={styles.chartContainer}>
              <div className={styles.barChart}>
                {monthlyRevenue.map((month, index) => (
                  <div key={index} className={styles.barGroup}>
                    <div 
                      className={styles.bar} 
                      style={{ 
                        height: `${(month.amount / 120000) * 100}%`,
                        backgroundColor: month.amount > 90000 ? '#c70f0f' : '#3b82f6'
                      }}
                    ></div>
                    <div className={styles.barLabel}>{month.month}</div>
                  </div>
                ))}
              </div>
              <div className={styles.chartYAxis}>
                <div className={styles.yAxisLabel}>$120k</div>
                <div className={styles.yAxisLabel}>$90k</div>
                <div className={styles.yAxisLabel}>$60k</div>
                <div className={styles.yAxisLabel}>$30k</div>
                <div className={styles.yAxisLabel}>$0</div>
              </div>
            </div>
          </div>
          
          <div className={styles.inventoryBreakdown}>
            <h2 className={styles.chartTitle}>Inventory Breakdown</h2>
            <div className={styles.donutChartContainer}>
              <div className={styles.donutChart}>
                <svg viewBox="0 0 36 36" className={styles.donutSvg}>
                  <circle 
                    cx="18" cy="18" r="15.91549430918954" 
                    fill="transparent" 
                    stroke="#c70f0f" 
                    strokeWidth="3" 
                    strokeDasharray={`${(vehiclesByType.stock / totalVehicles) * 100} ${100 - (vehiclesByType.stock / totalVehicles) * 100}`} 
                    strokeDashoffset="25" 
                    className={styles.donutSegment}
                  ></circle>
                  <circle 
                    cx="18" cy="18" r="15.91549430918954" 
                    fill="transparent" 
                    stroke="#3b82f6" 
                    strokeWidth="3" 
                    strokeDasharray={`${(vehiclesByType.auction / totalVehicles) * 100} ${100 - (vehiclesByType.auction / totalVehicles) * 100}`} 
                    strokeDashoffset={`${100 - (vehiclesByType.stock / totalVehicles) * 100 + 25}`} 
                    className={styles.donutSegment}
                  ></circle>
                  <circle 
                    cx="18" cy="18" r="15.91549430918954" 
                    fill="transparent" 
                    stroke="#f59e0b" 
                    strokeWidth="3" 
                    strokeDasharray={`${(vehiclesByType.sold / totalVehicles) * 100} ${100 - (vehiclesByType.sold / totalVehicles) * 100}`} 
                    strokeDashoffset={`${100 - ((vehiclesByType.stock + vehiclesByType.auction) / totalVehicles) * 100 + 25}`} 
                    className={styles.donutSegment}
                  ></circle>
                  <circle 
                    cx="18" cy="18" r="15.91549430918954" 
                    fill="transparent" 
                    stroke="#10b981" 
                    strokeWidth="3" 
                    strokeDasharray={`${(vehiclesByType.pending / totalVehicles) * 100} ${100 - (vehiclesByType.pending / totalVehicles) * 100}`} 
                    strokeDashoffset={`${100 - ((vehiclesByType.stock + vehiclesByType.auction + vehiclesByType.sold) / totalVehicles) * 100 + 25}`} 
                    className={styles.donutSegment}
                  ></circle>
                  <g className={styles.donutText}>
                    <text x="18" y="16" textAnchor="middle" className={styles.donutNumber}>{totalVehicles}</text>
                    <text x="18" y="22" textAnchor="middle" className={styles.donutLabel}>Vehicles</text>
                  </g>
                </svg>
              </div>
              <div className={styles.donutLegend}>
                <div className={styles.legendItem}>
                  <span className={styles.legendColor} style={{ backgroundColor: '#c70f0f' }}></span>
                  <span className={styles.legendLabel}>Stock ({vehiclesByType.stock})</span>
                </div>
                <div className={styles.legendItem}>
                  <span className={styles.legendColor} style={{ backgroundColor: '#3b82f6' }}></span>
                  <span className={styles.legendLabel}>Auction ({vehiclesByType.auction})</span>
                </div>
                <div className={styles.legendItem}>
                  <span className={styles.legendColor} style={{ backgroundColor: '#f59e0b' }}></span>
                  <span className={styles.legendLabel}>Sold ({vehiclesByType.sold})</span>
                </div>
                <div className={styles.legendItem}>
                  <span className={styles.legendColor} style={{ backgroundColor: '#10b981' }}></span>
                  <span className={styles.legendLabel}>Pending ({vehiclesByType.pending})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.dashboardGrid}>
          <div className={styles.topSellingModels}>
            <h2 className={styles.chartTitle}>Top Selling Models</h2>
            <div className={styles.modelsList}>
              {topSellingModels.map((model, index) => (
                <div key={index} className={styles.modelItem}>
                  <div className={styles.modelInfo}>
                    <span className={styles.modelRank}>{index + 1}</span>
                    <span className={styles.modelName}>{model.model}</span>
                    <span className={styles.modelCount}>{model.count} sold</span>
                  </div>
                  <div className={styles.modelBarContainer}>
                    <div 
                      className={styles.modelBar} 
                      style={{ width: `${model.percentage}%` }}
                    ></div>
                    <span className={styles.modelPercentage}>{model.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className={styles.recentActivity}>
            <div className={styles.activityHeader}>
              <h2 className={styles.chartTitle}>Recent Activity</h2>
              <Link href="/admin/activity" className={styles.viewAllLink}>View All</Link>
            </div>
            <div className={styles.activityList}>
              <div className={styles.activityItem}>
                <div className={styles.activityIconWrapper} style={{ backgroundColor: 'rgba(199, 15, 15, 0.1)' }}>
                  <svg className={styles.activityIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#c70f0f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.6-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
                    <circle cx="7" cy="17" r="2"></circle>
                    <path d="M9 17h6"></path>
                    <circle cx="17" cy="17" r="2"></circle>
                  </svg>
                </div>
                <div className={styles.activityContent}>
                  <h4 className={styles.activityTitle}>New Vehicle Added</h4>
                  <p className={styles.activityDesc}>2023 Toyota Supra GR added to stock inventory</p>
                  <p className={styles.activityTime}>2 hours ago</p>
                </div>
              </div>
              
              <div className={styles.activityItem}>
                <div className={styles.activityIconWrapper} style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                  <svg className={styles.activityIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
                  </svg>
                </div>
                <div className={styles.activityContent}>
                  <h4 className={styles.activityTitle}>Auction Ended</h4>
                  <p className={styles.activityDesc}>1998 Nissan Skyline GT-R sold for $45,000</p>
                  <p className={styles.activityTime}>Yesterday</p>
                </div>
              </div>
              
              <div className={styles.activityItem}>
                <div className={styles.activityIconWrapper} style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                  <svg className={styles.activityIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path>
                    <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"></path>
                  </svg>
                </div>
                <div className={styles.activityContent}>
                  <h4 className={styles.activityTitle}>Shipment Updated</h4>
                  <p className={styles.activityDesc}>Honda NSX shipment status changed to "In Transit"</p>
                  <p className={styles.activityTime}>2 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.recentOrders}>
          <div className={styles.ordersHeader}>
            <h2 className={styles.chartTitle}>Recent Orders</h2>
            <Link href="/admin/orders" className={styles.viewAllLink}>View All Orders</Link>
          </div>
          <div className={styles.tableContainer}>
            <table className={styles.ordersTable}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, index) => (
                  <tr key={index}>
                    <td className={styles.orderId}>{order.id}</td>
                    <td>{order.customer}</td>
                    <td>{order.vehicle}</td>
                    <td className={styles.orderAmount}>${order.amount.toLocaleString()}</td>
                    <td>{new Date(order.date).toLocaleDateString()}</td>
                    <td>
                      <span className={`${styles.orderStatus} ${styles[order.status]}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className={styles.orderActions}>
                        <button className={styles.actionButton}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </button>
                        <button className={styles.actionButton}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
