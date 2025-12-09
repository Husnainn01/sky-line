import express from 'express';
import { bookmarkController } from '../controllers/bookmarkController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// All bookmark routes require authentication
router.use(authMiddleware);

// Get all bookmarks for the current user
router.get('/', bookmarkController.getUserBookmarks);

// Add a bookmark
router.post('/', bookmarkController.addBookmark);

// Remove a bookmark
router.delete('/:bookmarkId', bookmarkController.removeBookmark);

// Update bookmark notes
router.patch('/:bookmarkId/notes', bookmarkController.updateBookmarkNotes);

export default router;
