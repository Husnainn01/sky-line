import { Response } from 'express';

/**
 * Handle API errors and send appropriate response
 * @param res Express response object
 * @param error Error object
 */
export const handleApiError = (res: Response, error: any) => {
  console.error('API Error:', error);
  
  // Check if error is a Mongoose validation error
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((err: any) => err.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: messages
    });
  }
  
  // Check if error is a Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `Duplicate value for ${field}`,
      field
    });
  }
  
  // Check if error is a custom error with status code
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message
    });
  }
  
  // Default error response
  return res.status(500).json({
    success: false,
    message: error.message || 'Server error'
  });
};

/**
 * Create a custom error with status code
 * @param message Error message
 * @param statusCode HTTP status code
 */
export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

/**
 * Express error handler middleware
 */
export const errorHandler = (err: any, req: any, res: Response, next: any) => {
  handleApiError(res, err);
};
