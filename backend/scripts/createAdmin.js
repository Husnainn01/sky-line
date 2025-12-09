/**
 * Script to create an initial admin user
 * 
 * Usage:
 * node scripts/createAdmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { WorkOS } = require('@workos-inc/node');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://skylinetr:6EOAFUQuVmJPdC6v@skylinetr.uyqhmrw.mongodb.net';

// WorkOS configuration
const workos = new WorkOS(process.env.WORKOS_API_KEY || 'sk_test_a2V5XzAxSzFDVzc4WURDWjk1WU1FMFhDNzY3MFBGLGw5dmxoandINzlmZmZvSG1hd0NEOGRTUE0');

// Admin details
const adminData = {
  name: 'Admin User',
  email: 'husnain.shafique234@gmail.com',
  password: 'SkylineTRD@2025', // Strong password that meets WorkOS requirements
  role: 'superadmin'
};

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    createAdmin();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Define Admin schema
const adminSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  active: Boolean,
  workosId: String,
  mfaEnabled: Boolean,
  mfaFactorId: String,
  lastLogin: Date,
  permissions: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const Admin = mongoose.model('Admin', adminSchema);

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log(`Admin with email ${adminData.email} already exists`);
      process.exit(0);
    }
    
    // Create admin in our database
    const admin = new Admin({
      name: adminData.name,
      email: adminData.email,
      password: adminData.password,
      role: adminData.role,
      active: true,
      emailVerified: false // Explicitly set to false until verified
    });
    
    await admin.save();
    console.log(`Admin created in database: ${admin.email}`);
    
    // Create admin in WorkOS
    try {
      const workosUser = await workos.userManagement.createUser({
        email: adminData.email,
        firstName: adminData.name.split(' ')[0],
        lastName: adminData.name.split(' ').slice(1).join(' ') || '',
        password: adminData.password,
        metadata: {
          isAdmin: 'true',
          role: adminData.role
        }
      });
      
      // Update our database with the WorkOS ID
      admin.workosId = workosUser.id;
      await admin.save();
      
      console.log(`Admin created in WorkOS with ID: ${workosUser.id}`);
      
      // Send verification email
      try {
        const verificationEmail = await workos.userManagement.sendVerificationEmail({
          userId: workosUser.id,
          redirectUri: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/verify-email`
        });
        
        console.log('\n===== IMPORTANT =====');
        console.log('Verification email has been sent to:', adminData.email);
        console.log('The admin must verify their email before they can log in.');
        console.log('Please check the email inbox and click the verification link.');
        console.log('=====================\n');
      } catch (verificationError) {
        console.error('Failed to send verification email:', verificationError);
        console.log('\n===== IMPORTANT =====');
        console.log('Email verification is required but the verification email could not be sent.');
        console.log('You will need to manually verify the email in the WorkOS dashboard or');
        console.log('use the WorkOS API to send a verification email later.');
        console.log('=====================\n');
      }
    } catch (workosError) {
      console.error('Failed to create admin in WorkOS:', workosError);
      console.log('Admin was created in the database but not in WorkOS');
    }
    
    console.log('Admin creation complete');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}
