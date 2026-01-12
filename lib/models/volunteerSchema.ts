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
    cnic: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
      validate: {
        validator: function(v: string) {
          // CNIC format: 12345-1234567-1 (5 digits, dash, 7 digits, dash, 1 digit)
          return /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/.test(v);
        },
        message: 'CNIC must be in format: 12345-1234567-1'
      }
    },
    cnicFront: {
      type: String,
      trim: true,
    },
    cnicBack: {
      type: String,
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

