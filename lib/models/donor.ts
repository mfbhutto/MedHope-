// Donor Model
// Based on donor registration form fields

export interface Donor {
  _id?: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  password: string; // Will be hashed in backend
  role: 'donor'; // Default: 'donor'
  
  // Optional fields that may be added later
  isVerified?: boolean;
  isActive?: boolean;
  
  // Donation statistics (calculated fields)
  totalDonations?: number;
  totalAmountDonated?: number;
  casesHelped?: number;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

// Donor registration form data interface
export interface DonorRegistrationData {
  name: string;
  email: string;
  address: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: 'donor';
}

// Donor profile data (without sensitive info)
export interface DonorProfile {
  _id: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  role: 'donor';
  isVerified?: boolean;
  totalDonations?: number;
  totalAmountDonated?: number;
  casesHelped?: number;
  createdAt?: Date;
}

// MongoDB Schema structure (for reference when implementing backend)
/*
const donorSchema = {
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  address: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, default: 'donor', enum: ['donor'] }, // Automatically set to 'donor'
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  totalDonations: { type: Number, default: 0 },
  totalAmountDonated: { type: Number, default: 0 },
  casesHelped: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};
*/

