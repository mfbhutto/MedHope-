// Needy Person (Accepter) Model
// Based on needy person registration form (3-step form)

// Import area data for priority assignment
import areaData from '@/karachi-areas-list.json';

export interface NeedyPerson {
  _id?: string;
  
  // Step 1: Personal Information
  name: string;
  email: string;
  originalEmail?: string; // Original email for linking cases to the same user
  cnic: string; // Format: 12345-1234567-1
  district: string; // Karachi district
  area: string; // Area within district
  manualArea?: string; // If area entered manually
  address: string; // Complete manual address
  phone: string;
  password: string; // Will be hashed in backend
  
  // Step 2: Financial Information
  age: number;
  maritalStatus: 'single' | 'married';
  numberOfChildren?: number;
  firstChildAge?: number;
  lastChildAge?: number;
  salaryRange: string; // e.g., 'Below 20,000', '20,000 - 30,000', etc.
  houseOwnership: 'own' | 'rent';
  rentAmount?: number; // If houseOwnership is 'rent'
  houseSize: string; // e.g., '40 yards', '60 yards', etc.
  utilityBill?: string; // File path or URL to uploaded utility bill
  zakatEligible: boolean;
  
  // Step 3: Disease Information
  diseaseType: 'chronic' | 'other';
  chronicDisease?: string; // If diseaseType is 'chronic'
  otherDisease?: string; // If diseaseType is 'other'
  manualDisease?: string; // If otherDisease is 'Other'
  testNeeded: boolean;
  selectedTests?: string[]; // Array of selected lab tests
  description: string; // Disease description
  hospitalName: string;
  doctorName: string;
  amountNeeded: number; // Total amount needed in PKR
  document?: string; // File path or URL to uploaded medical document
  
  // Automatic Fields (not from user input)
  role: 'accepter'; // Default: 'accepter'
  priority: 'High' | 'Medium' | 'Low'; // Auto-assigned based on area
  status: 'pending' | 'accepted' | 'rejected'; // Default: 'pending'
  
  // Optional fields
  isVerified?: boolean;
  isActive?: boolean;
  
  // Case-related fields
  caseNumber: string; // Auto-generated unique case number (e.g., "CASE-2024-001")
  totalDonations?: number;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

// Priority mapping based on area (auto-assigned)
// This is kept for backward compatibility but getPriorityByArea now uses JSON file
export const areaPriorityMap: { [key: string]: 'High' | 'Medium' | 'Low' } = {
  // High Priority Areas (typically underserved)
  'Orangi Town': 'High',
  'Baldia Town': 'High',
  'Korangi': 'High',
  'Landhi': 'High',
  'Malir City': 'High',
  'Quaidabad': 'High',
  'Bin Qasim': 'High',
  'Manghopir': 'High',
  'Hub River': 'High',
  'Korangi Industrial Area': 'High',
  'Korangi Creek': 'High',
  'Korangi Crossing': 'High',
  
  // Medium Priority Areas
  'Gulberg Town': 'Medium',
  'Liaquatabad Town': 'Medium',
  'North Nazimabad': 'Medium',
  'New Karachi': 'Medium',
  'Shah Faisal Colony': 'Medium',
  'Shah Faisal': 'Medium',
  'Faisal Cantonment': 'Medium',
  'Airport Area': 'Medium',
  'Airport': 'Medium',
  'Shahrah-e-Faisal': 'Medium',
  'Garden East': 'Medium',
  'Garden West': 'Medium',
  'Jamshed Town': 'Medium',
  
  // Low Priority Areas (typically well-served)
  'Gulshan-e-Iqbal': 'Low',
  'Clifton': 'Low',
  'Defence': 'Low',
  'DHA': 'Low',
  'PECHS': 'Low',
  'SITE': 'Low',
};

// Function to get priority based on area and district from JSON file
export function getPriorityByArea(area: string, district?: string): 'High' | 'Medium' | 'Low' {
  if (!area) {
    return 'Medium'; // Default priority if area not found
  }

  // Normalize strings for comparison
  const normalizeString = (str: string) => str.toLowerCase().trim().replace(/\s+/g, ' ');

  // Find matching area in the JSON data
  const matchedArea = (areaData as any[]).find((item: any) => {
    // If district is provided, match both district and area
    if (district) {
      const districtMatch = normalizeString(item.District) === normalizeString(district);
      const areaName = normalizeString(item.AreasName);
      const userArea = normalizeString(area);
      
      // Exact match or partial match
      const areaMatch = areaName === userArea ||
                       areaName.includes(userArea) ||
                       userArea.includes(areaName) ||
                       areaName.startsWith(userArea) ||
                       userArea.startsWith(areaName);
      
      return districtMatch && areaMatch;
    } else {
      // If no district, just match area
      const areaName = normalizeString(item.AreasName);
      const userArea = normalizeString(area);
      
      const areaMatch = areaName === userArea ||
                       areaName.includes(userArea) ||
                       userArea.includes(areaName) ||
                       areaName.startsWith(userArea) ||
                       userArea.startsWith(areaName);
      
      return areaMatch;
    }
  });

  if (matchedArea) {
    // Map class to priority: Lower → High, Middle → Medium, Elite → Low
    const classToPriority: { [key: string]: 'High' | 'Medium' | 'Low' } = {
      'Lower': 'High',
      'Middle': 'Medium',
      'Elite': 'Low',
    };
    return classToPriority[matchedArea.Class] || 'Medium';
  }

  // If area not found in list, try old hardcoded map as fallback
  return areaPriorityMap[area] || 'Medium';
}

// Function to generate unique case number
// Format: CASE-YYYY-XXXXX (e.g., CASE-2024-00001)
export async function generateCaseNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `CASE-${year}-`;
  
  // This function should be implemented in backend to:
  // 1. Query database for the last case number of the current year
  // 2. Extract the sequence number
  // 3. Increment by 1
  // 4. Format with leading zeros (5 digits)
  // 5. Return the new case number
  
  // Example implementation logic:
  // const lastCase = await NeedyPerson.findOne({ 
  //   caseNumber: { $regex: `^${prefix}` } 
  // }).sort({ caseNumber: -1 });
  // 
  // let sequence = 1;
  // if (lastCase && lastCase.caseNumber) {
  //   const lastSequence = parseInt(lastCase.caseNumber.split('-')[2]);
  //   sequence = lastSequence + 1;
  // }
  // 
  // return `${prefix}${sequence.toString().padStart(5, '0')}`;
  
  // For now, return a placeholder (backend will implement the actual logic)
  return `${prefix}00001`;
}

// Needy person registration form data interfaces
export interface NeedyPersonStep1Data {
  name: string;
  email: string;
  cnic: string;
  district: string;
  area: string;
  manualArea?: string;
  manualAddress: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface NeedyPersonStep2Data {
  age: string;
  maritalStatus: 'single' | 'married';
  numberOfChildren?: string;
  firstChildAge?: string;
  lastChildAge?: string;
  salaryRange: string;
  houseOwnership: 'own' | 'rent';
  rentAmount?: string;
  houseSize: string;
  utilityBill: FileList;
  zakatEligible: boolean;
}

export interface NeedyPersonStep3Data {
  diseaseType: 'chronic' | 'other';
  chronicDisease?: string;
  otherDisease?: string;
  manualDisease?: string;
  testNeeded: boolean;
  selectedTests?: string[];
  description: string;
  hospitalName: string;
  doctorName: string;
  amountNeeded: string;
  document: FileList;
}

// Needy person profile data (without sensitive info)
export interface NeedyPersonProfile {
  _id: string;
  name: string;
  email: string;
  cnic: string;
  district: string;
  area: string;
  address: string;
  phone: string;
  age: number;
  maritalStatus: 'single' | 'married';
  salaryRange: string;
  houseOwnership: 'own' | 'rent';
  rentAmount?: number;
  houseSize: string;
  zakatEligible: boolean;
  diseaseType: 'chronic' | 'other';
  disease: string; // Combined disease field
  amountNeeded: number;
  priority: 'High' | 'Medium' | 'Low';
  status: 'pending' | 'accepted' | 'rejected';
  role: 'accepter';
  caseNumber: string; // Auto-generated unique case number
  createdAt?: Date;
}

// MongoDB Schema structure (for reference when implementing backend)
/*
const needyPersonSchema = {
  // Step 1: Personal Information
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  cnic: { type: String, required: true, unique: true, trim: true },
  district: { type: String, required: true, enum: ['Central', 'East', 'South', 'West', 'Malir', 'Korangi'] },
  area: { type: String, required: true, trim: true },
  manualArea: { type: String, trim: true },
  address: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  
  // Step 2: Financial Information
  age: { type: Number, required: true, min: 1, max: 120 },
  maritalStatus: { type: String, required: true, enum: ['single', 'married'] },
  numberOfChildren: { type: Number, default: 0, min: 0 },
  firstChildAge: { type: Number, min: 0 },
  lastChildAge: { type: Number, min: 0 },
  salaryRange: { type: String, required: true },
  houseOwnership: { type: String, required: true, enum: ['own', 'rent'] },
  rentAmount: { type: Number, min: 0 },
  houseSize: { type: String, required: true },
  utilityBill: { type: String }, // File path or URL
  zakatEligible: { type: Boolean, default: false },
  
  // Step 3: Disease Information
  diseaseType: { type: String, required: true, enum: ['chronic', 'other'] },
  chronicDisease: { type: String },
  otherDisease: { type: String },
  manualDisease: { type: String },
  testNeeded: { type: Boolean, default: false },
  selectedTests: [{ type: String }],
  description: { type: String, required: true, trim: true },
  hospitalName: { type: String, required: true, trim: true },
  doctorName: { type: String, required: true, trim: true },
  amountNeeded: { type: Number, required: true, min: 1 },
  document: { type: String }, // File path or URL
  
  // Automatic Fields
  role: { type: String, default: 'accepter', enum: ['accepter'] },
  priority: { type: String, default: 'Medium', enum: ['High', 'Medium', 'Low'] }, // Auto-assigned based on area
  status: { type: String, default: 'pending', enum: ['pending', 'accepted', 'rejected'] },
  
  // Optional fields
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  caseNumber: { type: String, required: true, unique: true, index: true }, // Auto-generated unique case number
  totalDonations: { type: Number, default: 0 },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

// Pre-save hook to auto-assign priority and generate case number
needyPersonSchema.pre('save', async function(next) {
  // Auto-assign priority based on area
  if (this.isNew && this.area) {
    this.priority = getPriorityByArea(this.area);
  }
  
  // Auto-generate case number if not provided
  if (this.isNew && !this.caseNumber) {
    const year = new Date().getFullYear();
    const prefix = `CASE-${year}-`;
    
    // Find the last case number for current year
    const lastCase = await this.constructor.findOne({ 
      caseNumber: { $regex: `^${prefix}` } 
    }).sort({ caseNumber: -1 });
    
    let sequence = 1;
    if (lastCase && lastCase.caseNumber) {
      const lastSequence = parseInt(lastCase.caseNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }
    
    // Format with 5 digits (e.g., 00001, 00002, etc.)
    this.caseNumber = `${prefix}${sequence.toString().padStart(5, '0')}`;
  }
  
  next();
});
*/

