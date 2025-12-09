'use client';

import React, { useState, useEffect } from 'react';
import { bookmarkApi } from '@/lib/api';
import styles from './BookmarkButton.module.css';

interface BookmarkButtonProps {
  vehicleId: string;
  initialBookmarked?: boolean;
}

export default function BookmarkButton({ vehicleId, initialBookmarked = false }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if vehicle is already bookmarked
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      try {
        const response = await bookmarkApi.getBookmarks();
        const bookmarks = response.bookmarks || [];
        const isAlreadyBookmarked = bookmarks.some((bookmark: any) => 
          bookmark.vehicle._id === vehicleId || bookmark.vehicle.id === vehicleId
        );
        setIsBookmarked(isAlreadyBookmarked);
      } catch (err) {
        console.error('Error checking bookmark status:', err);
      }
    };

    if (!initialBookmarked) {
      checkBookmarkStatus();
    }
  }, [vehicleId, initialBookmarked]);

  const handleToggleBookmark = async () => {
    setIsLoading(true);
    setError('');

    try {
      if (isBookmarked) {
        // Find the bookmark ID first
        const response = await bookmarkApi.getBookmarks();
        const bookmarks = response.bookmarks || [];
        const bookmark = bookmarks.find((b: any) => 
          b.vehicle._id === vehicleId || b.vehicle.id === vehicleId
        );
        
        if (bookmark) {
          await bookmarkApi.removeBookmark(bookmark._id);
        }
      } else {
        await bookmarkApi.addBookmark(vehicleId);
      }
      
      setIsBookmarked(!isBookmarked);
    } catch (err: any) {
      console.error('Error toggling bookmark:', err);
      setError(err.message || 'Failed to update bookmark');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      className={`${styles.bookmarkButton} ${isBookmarked ? styles.bookmarked : ''} ${isLoading ? styles.loading : ''}`}
      onClick={handleToggleBookmark}
      disabled={isLoading}
      title={isBookmarked ? 'Remove from saved vehicles' : 'Save this vehicle'}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill={isBookmarked ? 'currentColor' : 'none'} 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
      </svg>
      <span>{isBookmarked ? 'Saved' : 'Save'}</span>
      {error && <div className={styles.error}>{error}</div>}
    </button>
  );
}
