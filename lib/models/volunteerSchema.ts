// Volunteer Mongoose Schema and Model
import mongoose, { Schema, Model } from 'mongoose';
import { Volunteer } from './volunteer';

// Volunteer Schema
const volunteerSchema = new Schema<Volunteer>(
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
      default: 'volunteer',
      enum: ['volunteer'],
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
    casesVerified: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Ensure role is always 'volunteer' on new documents
volunteerSchema.pre('save', function (next) {
  if (this.isNew) {
    this.role = 'volunteer';
  }
  next();
});

// Create and export the model
// Check if model already exists to avoid re-compilation errors
const VolunteerModel: Model<Volunteer> =
  mongoose.models.Volunteer || mongoose.model<Volunteer>('Volunteer', volunteerSchema);

export default VolunteerModel;

