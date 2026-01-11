// Volunteer Model
// Based on volunteer registration form fields

export interface Volunteer {
  _id?: string;
  name: string;
  email: string;
  address: string;
  phone: string;
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
  role: 'volunteer';
  isVerified?: boolean;
  casesVerified?: number;
  createdAt?: Date;
}

