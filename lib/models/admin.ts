// Admin Model
// For superadmin authentication and management

export interface Admin {
  _id?: string;
  name: string;
  email: string;
  password: string; // Will be hashed in backend
  role: 'admin'; // Default: 'admin'
  
  // Optional fields
  isActive?: boolean;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

// Admin registration/login data interface
export interface AdminAuthData {
  email: string;
  password: string;
}

// Admin profile data (without sensitive info)
export interface AdminProfile {
  _id: string;
  name: string;
  email: string;
  role: 'admin';
  isActive?: boolean;
  createdAt?: Date;
}

