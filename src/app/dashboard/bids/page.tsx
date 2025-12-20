'use client';

import React from 'react';
import ComingSoon from '@/components/ComingSoon';

export default function BidsPage() {
  return (
    <ComingSoon
      title="Auction Bidding Coming Soon"
      description="Our vehicle auction platform is currently under development. Soon you'll be able to place bids on rare JDM vehicles, track your active auctions, and receive real-time notifications when you've been outbid or won."
      icon={
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      }
      ctaText="Return to Dashboard"
      ctaLink="/dashboard"
    />
  );
}
// const mockBids = carsData.slice(0, 8).map((car, index) => {
//   const now = new Date();
//   const randomDays = Math.floor(Math.random() * 14) + 1;
//   const bidDate = new Date(now.setDate(now.getDate() - randomDays));
  
//   const endDate = new Date(bidDate);
//   endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 7) + 3);
  
//   const isEnded = endDate < new Date();
  
//   // Generate random bid data
//   const startingPrice = Math.floor(Math.random() * 5000) + 10000;
//   const currentBid = startingPrice + Math.floor(Math.random() * 10000);
//   const userBid = currentBid - Math.floor(Math.random() * 2000);
//   const bidStatus = isEnded 
//     ? Math.random() > 0.5 ? 'won' : 'lost'
//     : userBid >= currentBid ? 'winning' : 'outbid';
//   const totalBids = Math.floor(Math.random() * 20) + 5;
  
//   return {
//     ...car,
//     bidId: `BID-${100000 + index}`,
//     bidDate: bidDate.toISOString(),
//     endDate: endDate.toISOString(),
//     startingPrice,
//     currentBid,
//     userBid,
//     bidStatus,
//     totalBids,
//     isEnded
//   };
// });

// type BidStatus = 'winning' | 'outbid' | 'won' | 'lost';
// type BidFilter = 'all' | 'active' | 'won' | 'lost';

// export default function BidsPage() {
//   const [filter, setFilter] = useState<BidFilter>('all');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [sortBy, setSortBy] = useState('date-desc');

//   // Filter bids based on active filter and search query
//   const getFilteredBids = () => {
//     let filteredBids = [...mockBids];
    
//     // Apply status filter
//     if (filter === 'active') {
//       filteredBids = filteredBids.filter(bid => !bid.isEnded);
//     } else if (filter === 'won') {
//       filteredBids = filteredBids.filter(bid => bid.bidStatus === 'won');
//     } else if (filter === 'lost') {
//       filteredBids = filteredBids.filter(bid => bid.bidStatus === 'lost');
//     }
    
//     // Apply search filter
//     if (searchQuery) {
//       const query = searchQuery.toLowerCase();
//       filteredBids = filteredBids.filter(bid => 
//         bid.make.toLowerCase().includes(query) || 
//         bid.model.toLowerCase().includes(query) ||
//         bid.year.toString().includes(query) ||
//         bid.bidId.toLowerCase().includes(query)
//       );
//     }
    
//     // Apply sorting
//     filteredBids.sort((a, b) => {
//       switch(sortBy) {
//         case 'date-asc':
//           return new Date(a.bidDate).getTime() - new Date(b.bidDate).getTime();
//         case 'date-desc':
//           return new Date(b.bidDate).getTime() - new Date(a.bidDate).getTime();
//         case 'price-asc':
//           return a.userBid - b.userBid;
//         case 'price-desc':
//           return b.userBid - a.userBid;
//         default:
//           return 0;
//       }
//     });
    
//     return filteredBids;
//   };

//   const filteredBids = getFilteredBids();
  
//   const getBidStatusClass = (status: BidStatus) => {
//     switch(status) {
//       case 'winning': return styles.statusWinning;
//       case 'outbid': return styles.statusOutbid;
//       case 'won': return styles.statusWon;
//       case 'lost': return styles.statusLost;
//       default: return '';
//     }
//   };
  
//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { 
//       year: 'numeric', 
//       month: 'short', 
//       day: 'numeric' 
//     });
//   };
  
//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('en-US', { 
//       style: 'currency', 
//       currency: 'USD',
//       maximumFractionDigits: 0
//     }).format(amount);
//   };
  
//   const getTimeRemaining = (endDateStr: string) => {
//     const endDate = new Date(endDateStr);
//     const now = new Date();
    
//     if (endDate <= now) {
//       return 'Ended';
//     }
    
//     const diffMs = endDate.getTime() - now.getTime();
//     const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
//     const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
//     if (diffDays > 0) {
//       return `${diffDays}d ${diffHours}h`;
//     } else {
//       const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
//       return `${diffHours}h ${diffMinutes}m`;
//     }
//   };

//   return (
//     <div className={styles.page}>
//       <div className={styles.header}>
//         <div>
//           <h1 className={styles.title}>Auction Bids</h1>
//           <p className={styles.subtitle}>Track and manage your auction bids</p>
//         </div>
//         <Link href="/auction" className={styles.browseButton}>
//           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//             <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
//           </svg>
//           Browse Auctions
//         </Link>
//       </div>

//       <div className={styles.controls}>
//         <div className={styles.filters}>
//           <button 
//             className={`${styles.filterButton} ${filter === 'all' ? styles.activeFilter : ''}`}
//             onClick={() => setFilter('all')}
//           >
//             All Bids
//           </button>
//           <button 
//             className={`${styles.filterButton} ${filter === 'active' ? styles.activeFilter : ''}`}
//             onClick={() => setFilter('active')}
//           >
//             Active
//           </button>
//           <button 
//             className={`${styles.filterButton} ${filter === 'won' ? styles.activeFilter : ''}`}
//             onClick={() => setFilter('won')}
//           >
//             Won
//           </button>
//           <button 
//             className={`${styles.filterButton} ${filter === 'lost' ? styles.activeFilter : ''}`}
//             onClick={() => setFilter('lost')}
//           >
//             Lost
//           </button>
//         </div>
        
//         <div className={styles.searchSort}>
//           <div className={styles.searchContainer}>
//             <input
//               type="text"
//               placeholder="Search bids..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className={styles.searchInput}
//             />
//             <button className={styles.searchButton}>
//               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                 <circle cx="11" cy="11" r="8"></circle>
//                 <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
//               </svg>
//             </button>
//           </div>
          
//           <select 
//             className={styles.sortSelect}
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value)}
//           >
//             <option value="date-desc">Newest First</option>
//             <option value="date-asc">Oldest First</option>
//             <option value="price-desc">Highest Bid</option>
//             <option value="price-asc">Lowest Bid</option>
//           </select>
//         </div>
//       </div>

//       {filteredBids.length === 0 ? (
//         <div className={styles.emptyState}>
//           <div className={styles.emptyIcon}>
//             <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
//               <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
//             </svg>
//           </div>
//           <h3>No bids found</h3>
//           <p>
//             {filter === 'all' 
//               ? "You haven't placed any bids yet." 
//               : filter === 'active' 
//                 ? "You don't have any active bids." 
//                 : filter === 'won' 
//                   ? "You haven't won any auctions yet." 
//                   : "No lost auctions found."}
//           </p>
//           <Link href="/auction" className={styles.emptyButton}>
//             Browse Auctions
//           </Link>
//         </div>
//       ) : (
//         <div className={styles.bidsTable}>
//           <div className={styles.tableHeader}>
//             <div className={styles.vehicleColumn}>Vehicle</div>
//             <div className={styles.bidColumn}>Bid Details</div>
//             <div className={styles.statusColumn}>Status</div>
//             <div className={styles.actionsColumn}>Actions</div>
//           </div>
          
//           {filteredBids.map((bid) => (
//             <div key={bid.bidId} className={styles.bidRow}>
//               <div className={styles.vehicleColumn}>
//                 <div className={styles.vehicleCard}>
//                   <div className={styles.imageContainer}>
//                     <Image 
//                       src={bid.image} 
//                       alt={`${bid.year} ${bid.make} ${bid.model}`}
//                       width={100}
//                       height={70}
//                       className={styles.vehicleImage}
//                     />
//                   </div>
//                   <div className={styles.vehicleInfo}>
//                     <h3 className={styles.vehicleName}>{bid.year} {bid.make} {bid.model}</h3>
//                     <div className={styles.vehicleDetails}>
//                       <span className={styles.bidId}>Bid #{bid.bidId}</span>
//                       <span className={styles.bidDate}>Placed on {formatDate(bid.bidDate)}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
              
//               <div className={styles.bidColumn}>
//                 <div className={styles.bidDetails}>
//                   <div className={styles.bidItem}>
//                     <span className={styles.bidLabel}>Your Bid</span>
//                     <span className={styles.bidValue}>{formatCurrency(bid.userBid)}</span>
//                   </div>
//                   <div className={styles.bidItem}>
//                     <span className={styles.bidLabel}>Current Bid</span>
//                     <span className={styles.bidValue}>{formatCurrency(bid.currentBid)}</span>
//                   </div>
//                   <div className={styles.bidItem}>
//                     <span className={styles.bidLabel}>Total Bids</span>
//                     <span className={styles.bidValue}>{bid.totalBids}</span>
//                   </div>
//                 </div>
//               </div>
              
//               <div className={styles.statusColumn}>
//                 <div className={styles.statusDetails}>
//                   <div className={`${styles.statusBadge} ${getBidStatusClass(bid.bidStatus as BidStatus)}`}>
//                     {bid.bidStatus === 'winning' && 'Winning'}
//                     {bid.bidStatus === 'outbid' && 'Outbid'}
//                     {bid.bidStatus === 'won' && 'Won'}
//                     {bid.bidStatus === 'lost' && 'Lost'}
//                   </div>
                  
//                   {!bid.isEnded && (
//                     <div className={styles.timeRemaining}>
//                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                         <circle cx="12" cy="12" r="10"></circle>
//                         <polyline points="12 6 12 12 16 14"></polyline>
//                       </svg>
//                       <span>{getTimeRemaining(bid.endDate)}</span>
//                     </div>
//                   )}
                  
//                   {bid.isEnded && bid.bidStatus === 'won' && (
//                     <div className={styles.wonMessage}>
//                       Congratulations!
//                     </div>
//                   )}
//                 </div>
//               </div>
              
//               <div className={styles.actionsColumn}>
//                 <Link href={`/auction/${bid.id}`} className={styles.viewButton}>
//                   View Auction
//                 </Link>
                
//                 {!bid.isEnded && bid.bidStatus === 'outbid' && (
//                   <button className={styles.bidAgainButton}>
//                     Place New Bid
//                   </button>
//                 )}
                
//                 {bid.isEnded && bid.bidStatus === 'won' && (
//                   <Link href={`/dashboard/purchases/checkout/${bid.id}`} className={styles.checkoutButton}>
//                     Complete Purchase
//                   </Link>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
