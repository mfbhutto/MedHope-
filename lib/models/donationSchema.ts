// Donation Mongoose Schema and Model
import mongoose, { Schema, Model } from 'mongoose';
import { Donation } from './donation';

// Donation Schema
const donationSchema = new Schema<Donation>(
  {
    donorId: {
      type: String,
      required: true,
      index: true,
    },
    caseId: {
      type: String,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['stripe', 'jazzcash', 'easypaisa', 'card'],
    },
    paymentId: {
      type: String,
    },
    transactionId: {
      type: String,
    },
    isZakatDonation: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: 'completed',
      enum: ['pending', 'completed', 'failed'],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Create and export the model
// Check if model already exists to avoid re-compilation errors
const DonationModel: Model<Donation> =
  mongoose.models.Donation || mongoose.model<Donation>('Donation', donationSchema);

export default DonationModel;

