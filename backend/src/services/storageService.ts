import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

// Configure S3 client for Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY || '',
    secretAccessKey: process.env.R2_SECRET_KEY || '',
  },
});

const bucketName = process.env.R2_BUCKET_NAME || '';
const publicUrl = process.env.R2_PUBLIC_URL || '';

/**
 * Upload a file to Cloudflare R2 storage
 * @param file - The file to upload (from multer)
 * @param folder - Optional folder path within the bucket
 * @returns The URL of the uploaded file
 */
export const uploadFileToR2 = async (file: any, folder = 'vehicles'): Promise<string> => {
  try {
    // Generate a unique filename
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${folder}/${uuidv4()}${fileExtension}`;
    
    // Upload file to R2
    const uploadParams = {
      Bucket: bucketName,
      Key: uniqueFilename,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    
    await s3Client.send(new PutObjectCommand(uploadParams));
    
    // Return the public URL
    return `${publicUrl}/${uniqueFilename}`;
  } catch (error) {
    console.error('Error uploading file to R2:', error);
    throw new Error('Failed to upload file to storage');
  }
};

/**
 * Upload multiple files to Cloudflare R2 storage
 * @param files - Array of files to upload (from multer)
 * @param folder - Optional folder path within the bucket
 * @returns Array of URLs of the uploaded files
 */
export const uploadFilesToR2 = async (files: any[], folder = 'vehicles'): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadFileToR2(file, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple files to R2:', error);
    throw new Error('Failed to upload files to storage');
  }
};

/**
 * Delete a file from Cloudflare R2 storage
 * @param fileUrl - The full URL of the file to delete
 * @returns Boolean indicating success
 */
export const deleteFileFromR2 = async (fileUrl: string): Promise<boolean> => {
  try {
    // Extract the key from the URL
    const key = fileUrl.replace(`${publicUrl}/`, '');
    
    const deleteParams = {
      Bucket: bucketName,
      Key: key,
    };
    
    await s3Client.send(new DeleteObjectCommand(deleteParams));
    return true;
  } catch (error) {
    console.error('Error deleting file from R2:', error);
    return false;
  }
};

/**
 * Generate a pre-signed URL for direct browser uploads
 * @param key - The key (path) where the file will be stored
 * @param contentType - The content type of the file
 * @param expiresIn - Expiration time in seconds (default: 3600)
 * @returns Pre-signed URL for direct upload
 */
export const generatePresignedUploadUrl = async (
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> => {
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
    });
    
    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    throw new Error('Failed to generate upload URL');
  }
};

/**
 * Generate a pre-signed URL for downloading a file
 * @param key - The key (path) of the file
 * @param expiresIn - Expiration time in seconds (default: 3600)
 * @returns Pre-signed URL for download
 */
export const generatePresignedDownloadUrl = async (
  key: string,
  expiresIn = 3600
): Promise<string> => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    
    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error('Error generating pre-signed download URL:', error);
    throw new Error('Failed to generate download URL');
  }
};

/**
 * Extract filename from a URL
 * @param url - The URL to extract the filename from
 * @returns The filename
 */
export const getFilenameFromUrl = (url: string): string => {
  return url.split('/').pop() || '';
};

/**
 * Check if a URL is from our R2 storage
 * @param url - The URL to check
 * @returns Boolean indicating if the URL is from our R2 storage
 */
export const isR2Url = (url: string): boolean => {
  return url.startsWith(publicUrl);
};

/**
 * Convert a URL to a file path for local storage (for fallback)
 * @param url - The URL to convert
 * @returns The local file path
 */
export const urlToLocalPath = (url: string): string => {
  const filename = getFilenameFromUrl(url);
  return path.join(process.cwd(), 'public', 'uploads', filename);
};

export default {
  uploadFileToR2,
  uploadFilesToR2,
  deleteFileFromR2,
  generatePresignedUploadUrl,
  generatePresignedDownloadUrl,
  getFilenameFromUrl,
  isR2Url,
  urlToLocalPath,
};
