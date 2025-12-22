import dotenv from 'dotenv';

// Load environment variables first, before any other imports
dotenv.config();

// Log environment variables for debugging
console.log('Environment variables loaded:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  WORKOS_API_KEY: process.env.WORKOS_API_KEY ? 'Set (hidden for security)' : 'Not set',
  WORKOS_CLIENT_ID: process.env.WORKOS_CLIENT_ID ? 'Set (hidden for security)' : 'Not set',
});

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { errorHandler } from './middleware/error';
import authRoutes from './routes/authRoutes';
import adminAuthRoutes from './routes/adminAuthRoutes';
import adminRoutes from './routes/adminRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import bookmarkRoutes from './routes/bookmarkRoutes';
import securityRoutes from './routes/securityRoutes';
import profileRoutes from './routes/profileRoutes';
import vehicleRoutes from './routes/vehicleRoutes';
import makeRoutes from './routes/makeRoutes';
import modelRoutes from './routes/modelRoutes';
import auctionVehicleRoutes from './routes/auctionVehicleRoutes';
import uploadRoutes from './routes/uploadRoutes';
import savedVehiclesRoutes from './routes/savedVehiclesRoutes';
import heroSectionRoutes from './routes/heroSectionRoutes';

// Environment variables have already been logged above

// Create Express app
const app = express();

// Enable CORS
app.use(cors());

// Serve static files
app.use(express.static('public'));

// Body-parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to JDM Global API' });
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/makes', makeRoutes);
app.use('/api/models', modelRoutes);
app.use('/api/auction-vehicles', auctionVehicleRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/saved-vehicles', savedVehiclesRoutes);
app.use('/api/hero-sections', heroSectionRoutes);

// Error handler middleware
app.use(errorHandler);

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5001;

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb+srv://skylinetr:6EOAFUQuVmJPdC6v@skylinetr.uyqhmrw.mongodb.net')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });
