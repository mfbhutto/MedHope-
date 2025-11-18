// Admin Schema
// Mongoose schema for Admin model

import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { Admin } from './admin';

// Admin Schema
const adminSchema = new Schema<Admin>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      default: 'admin',
      enum: ['admin'],
      immutable: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Hash password before saving
adminSchema.pre('save', async function (next) {
  // Only hash if password is modified and not already hashed
  if (!this.isModified('password')) {
    return next();
  }
  
  // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
  if (this.password && this.password.startsWith('$2')) {
    // Password is already hashed, skip hashing
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Create and export the model
const AdminModel: Model<Admin> =
  mongoose.models.Admin || mongoose.model<Admin>('Admin', adminSchema);

export default AdminModel;

