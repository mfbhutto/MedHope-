// Volunteer Model
// Based on volunteer registration form fields

export interface Volunteer {
  _id?: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  cnic: string; // CNIC number in format: 12345-1234567-1
  cnicFront?: string; // URL to CNIC front image in Cloudinary
  cnicBack?: string; // URL to CNIC back image in Cloudinary
  password: string; // Will be hashed in backend
  role: 'volunteer'; // Default: 'volunteer'
  
  // Optional fields that may be added later
  isVerified?: boolean;
  isActive?: boolean;
  
  // Volunteer statistics (calculated fields)
  casesVerified?: number;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

// Volunteer registration form data interface
export interface VolunteerRegistrationData {
  name: string;
  email: string;
  address: string;
  phone: string;
  cnic: string;
  cnicFront?: string;
  cnicBack?: string;
  password: string;
  confirmPassword: string;
  role: 'volunteer';
}

// Volunteer profile data (without sensitive info)
export interface VolunteerProfile {
  _id: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  cnic: string;
  cnicFront?: string;
  cnicBack?: string;
  role: 'volunteer';
  isVerified?: boolean;
  casesVerified?: number;
  createdAt?: Date;
}

