import { Request, Response } from 'express';
import { uploadFileToR2, uploadFilesToR2 } from '../services/storageService';
import multer from 'multer';

// Extend Express Request type to include file and files properties
interface MulterRequest extends Request {
  file?: Express.Multer.File;
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
}

export const uploadController = {
  /**
   * Upload a single image
   */
  async uploadSingleImage(req: MulterRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const file = req.file;
      const folder = req.body.folder || 'vehicles';
      
      // Upload file to R2
      const fileUrl = await uploadFileToR2(file, folder);
      
      res.json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          url: fileUrl,
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        }
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading file',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },
  
  /**
   * Upload multiple images
   */
  async uploadMultipleImages(req: MulterRequest, res: Response) {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      const files = req.files as Express.Multer.File[];
      const folder = req.body.folder || 'vehicles';
      
      // Upload files to R2
      const fileUrls = await uploadFilesToR2(files, folder);
      
      // Map file details
      const fileDetails = files.map((file, index) => ({
        url: fileUrls[index],
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      }));
      
      res.json({
        success: true,
        message: 'Files uploaded successfully',
        data: fileDetails
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading files',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }
};
