// Needy Person Mongoose Schema and Model
import mongoose, { Schema, Model } from 'mongoose';
import { NeedyPerson } from './needyPerson';
import { getPriorityByArea } from './needyPerson';

// Needy Person Schema
const needyPersonSchema = new Schema<NeedyPerson>(
  {
    // Step 1: Personal Information
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
    originalEmail: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
    },
    cnic: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    district: {
      type: String,
      required: true,
      enum: ['Central', 'East', 'South', 'West', 'Malir', 'Korangi'],
    },
    area: {
      type: String,
      required: true,
      trim: true,
    },
    manualArea: {
      type: String,
      trim: true,
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
    // Step 2: Financial Information
    age: {
      type: Number,
      required: true,
      min: 1,
      max: 120,
    },
    maritalStatus: {
      type: String,
      required: true,
      enum: ['single', 'married'],
    },
    numberOfChildren: {
      type: Number,
      default: 0,
      min: 0,
    },
    firstChildAge: {
      type: Number,
      min: 0,
    },
    lastChildAge: {
      type: Number,
      min: 0,
    },
    salaryRange: {
      type: String,
      required: true,
    },
    houseOwnership: {
      type: String,
      required: true,
      enum: ['own', 'rent'],
    },
    rentAmount: {
      type: Number,
      min: 0,
    },
    houseSize: {
      type: String,
      required: true,
    },
    utilityBill: {
      type: String,
    },
    zakatEligible: {
      type: Boolean,
      default: false,
    },
    // Step 3: Disease Information
    diseaseType: {
      type: String,
      required: true,
      enum: ['chronic', 'other'],
    },
    chronicDisease: {
      type: String,
    },
    otherDisease: {
      type: String,
    },
    manualDisease: {
      type: String,
    },
    testNeeded: {
      type: Boolean,
      default: false,
    },
    selectedTests: [
      {
        type: String,
      },
    ],
    description: {
      type: String,
      required: true,
      trim: true,
    },
    hospitalName: {
      type: String,
      required: true,
      trim: true,
    },
    doctorName: {
      type: String,
      required: true,
      trim: true,
    },
    amountNeeded: {
      type: Number,
      required: true,
      min: 1,
    },
    document: {
      type: String,
    },
    // Automatic Fields
    role: {
      type: String,
      default: 'accepter',
      enum: ['accepter'],
      immutable: true,
    },
    priority: {
      type: String,
      default: 'Medium',
      enum: ['High', 'Medium', 'Low'],
    },
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'accepted', 'rejected'],
    },
    caseNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    // Optional fields
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
    // Volunteer assignment fields
    volunteerId: {
      type: Schema.Types.ObjectId,
      ref: 'Volunteer',
      default: null,
    },
    volunteerApprovalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: null,
    },
    volunteerRejectionReasons: {
      type: [String],
      default: [],
      enum: ['Personal information issue', 'Financial information issue', 'Disease information issue'],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Pre-save hook to auto-assign priority and ensure role
needyPersonSchema.pre('save', function (next) {
  if (this.isNew) {
    this.role = 'accepter';
    // Auto-assign priority based on area and district from JSON file
    // Only assign if priority is not already set (allows manual override)
    if (this.area && !this.priority) {
      this.priority = getPriorityByArea(this.area, this.district);
    }
  }
  next();
});

// Create and export the model
const NeedyPersonModel: Model<NeedyPerson> =
  mongoose.models.NeedyPerson ||
  mongoose.model<NeedyPerson>('NeedyPerson', needyPersonSchema);

export default NeedyPersonModel;




