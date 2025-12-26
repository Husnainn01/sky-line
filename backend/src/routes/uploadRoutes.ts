import express from 'express';
import { uploadController } from '../controllers/uploadController';
import { upload, handleUploadError } from '../middleware/uploadMiddleware';
import { adminAuthMiddleware } from '../middleware/adminAuthMiddleware';

const router = express.Router();

// Apply admin authentication middleware to all upload routes
router.use(adminAuthMiddleware);

// Single image upload route
router.post(
  '/image',
  upload.single('image'),
  handleUploadError,
  uploadController.uploadSingleImage
);

// Multiple images upload route
router.post(
  '/images',
  upload.array('images', 30), // Allow up to 30 images
  handleUploadError,
  uploadController.uploadMultipleImages
);

export default router;
