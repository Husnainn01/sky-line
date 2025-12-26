import multer from 'multer';

// Configure storage for multer
const storage = multer.memoryStorage();

// File filter to only allow images
const fileFilter = (req: any, file: any, cb: any) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Create multer upload instance
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 30 // Allow up to 30 files
  },
  fileFilter: fileFilter,
});

// Middleware for handling upload errors
export const handleUploadError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 30 files per upload',
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  } else if (err) {
    // An unknown error occurred
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
};

export default { upload, handleUploadError };
