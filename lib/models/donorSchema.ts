// Donor Mongoose Schema and Model
import mongoose, { Schema, Model } from 'mongoose';
import { Donor } from './donor';

// Donor Schema
const donorSchema = new Schema<Donor>(
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
    address: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      default: 'donor',
      enum: ['donor'],
      immutable: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    totalDonations: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmountDonated: {
      type: Number,
      default: 0,
      min: 0,
    },
    casesHelped: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Ensure role is always 'donor' on new documents
donorSchema.pre('save', function (next) {
  if (this.isNew) {
    this.role = 'donor';
  }
  next();
});

// Create and export the model
// Check if model already exists to avoid re-compilation errors
const DonorModel: Model<Donor> =
  mongoose.models.Donor || mongoose.model<Donor>('Donor', donorSchema);

export default DonorModel;




