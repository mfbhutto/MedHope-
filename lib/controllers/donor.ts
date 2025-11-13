// Donor Controller
// Handles all donor-related database operations

import DonorModel from '@/lib/models/donorSchema';
import {
  createDocument,
  findDocumentById,
  findDocuments,
  findOneDocument,
  updateDocumentById,
  deleteDocumentById,
  countDocuments,
  documentExists,
} from '@/lib/db';
import { Donor, DonorRegistrationData, DonorProfile } from '@/lib/models/donor';
import bcrypt from 'bcryptjs';

/**
 * Create a new donor
 * @param data - Donor registration data
 * @returns Promise<Donor>
 */
export async function createDonor(
  data: Omit<DonorRegistrationData, 'confirmPassword'>
): Promise<Donor> {
  // Check if email already exists
  const existingDonor = await findOneDocument(DonorModel, { email: data.email });
  if (existingDonor) {
    throw new Error('Email already registered');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Create donor data
  const donorData: Partial<Donor> = {
    name: data.name,
    email: data.email.toLowerCase().trim(),
    address: data.address,
    phone: data.phone,
    password: hashedPassword,
    role: 'donor',
    isVerified: false,
    isActive: true,
    totalDonations: 0,
    totalAmountDonated: 0,
    casesHelped: 0,
  };

  return await createDocument(DonorModel, donorData);
}

/**
 * Get donor by ID
 * @param id - Donor ID
 * @returns Promise<Donor | null>
 */
export async function getDonorById(id: string): Promise<Donor | null> {
  return await findDocumentById(DonorModel, id);
}

/**
 * Get donor by email
 * @param email - Donor email
 * @returns Promise<Donor | null>
 */
export async function getDonorByEmail(email: string): Promise<Donor | null> {
  return await findOneDocument(DonorModel, { email: email.toLowerCase().trim() });
}

/**
 * Get all donors with optional filters
 * @param filters - Query filters
 * @param options - Query options (limit, skip, sort)
 * @returns Promise<Donor[]>
 */
export async function getAllDonors(
  filters: {
    isVerified?: boolean;
    isActive?: boolean;
    search?: string; // Search by name or email
  } = {},
  options: {
    limit?: number;
    skip?: number;
    sort?: any;
  } = {}
): Promise<Donor[]> {
  const query: any = {};

  if (filters.isVerified !== undefined) {
    query.isVerified = filters.isVerified;
  }

  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { email: { $regex: filters.search, $options: 'i' } },
    ];
  }

  return await findDocuments(DonorModel, query, options);
}

/**
 * Update donor by ID
 * @param id - Donor ID
 * @param data - Update data (password will be hashed if provided)
 * @returns Promise<Donor | null>
 */
export async function updateDonor(
  id: string,
  data: Partial<Omit<Donor, '_id' | 'password'>> & { password?: string }
): Promise<Donor | null> {
  const updateData: any = { ...data };

  // Hash password if provided
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  // Ensure email is lowercase if provided
  if (updateData.email) {
    updateData.email = updateData.email.toLowerCase().trim();
  }

  // Don't allow role to be changed
  delete updateData.role;

  return await updateDocumentById(DonorModel, id, updateData);
}

/**
 * Delete donor by ID
 * @param id - Donor ID
 * @returns Promise<Donor | null>
 */
export async function deleteDonor(id: string): Promise<Donor | null> {
  return await deleteDocumentById(DonorModel, id);
}

/**
 * Verify donor email
 * @param id - Donor ID
 * @returns Promise<Donor | null>
 */
export async function verifyDonor(id: string): Promise<Donor | null> {
  return await updateDocumentById(DonorModel, id, { isVerified: true });
}

/**
 * Activate/Deactivate donor
 * @param id - Donor ID
 * @param isActive - Active status
 * @returns Promise<Donor | null>
 */
export async function setDonorActiveStatus(
  id: string,
  isActive: boolean
): Promise<Donor | null> {
  return await updateDocumentById(DonorModel, id, { isActive });
}

/**
 * Update donor statistics
 * @param id - Donor ID
 * @param stats - Statistics to update
 * @returns Promise<Donor | null>
 */
export async function updateDonorStats(
  id: string,
  stats: {
    totalDonations?: number;
    totalAmountDonated?: number;
    casesHelped?: number;
  }
): Promise<Donor | null> {
  const updateData: any = {};

  if (stats.totalDonations !== undefined) {
    updateData.totalDonations = stats.totalDonations;
  }

  if (stats.totalAmountDonated !== undefined) {
    updateData.totalAmountDonated = stats.totalAmountDonated;
  }

  if (stats.casesHelped !== undefined) {
    updateData.casesHelped = stats.casesHelped;
  }

  return await updateDocumentById(DonorModel, id, updateData);
}

/**
 * Increment donor statistics
 * @param id - Donor ID
 * @param stats - Statistics to increment
 * @returns Promise<Donor | null>
 */
export async function incrementDonorStats(
  id: string,
  stats: {
    totalDonations?: number;
    totalAmountDonated?: number;
    casesHelped?: number;
  }
): Promise<Donor | null> {
  const donor = await getDonorById(id);
  if (!donor) {
    return null;
  }

  const updateData: any = {};

  if (stats.totalDonations !== undefined) {
    updateData.totalDonations = (donor.totalDonations || 0) + stats.totalDonations;
  }

  if (stats.totalAmountDonated !== undefined) {
    updateData.totalAmountDonated =
      (donor.totalAmountDonated || 0) + stats.totalAmountDonated;
  }

  if (stats.casesHelped !== undefined) {
    updateData.casesHelped = (donor.casesHelped || 0) + stats.casesHelped;
  }

  return await updateDocumentById(DonorModel, id, updateData);
}

/**
 * Check if donor exists by email
 * @param email - Donor email
 * @returns Promise<boolean>
 */
export async function donorExists(email: string): Promise<boolean> {
  return await documentExists(DonorModel, { email: email.toLowerCase().trim() });
}

/**
 * Count donors with filters
 * @param filters - Query filters
 * @returns Promise<number>
 */
export async function countDonors(filters: {
  isVerified?: boolean;
  isActive?: boolean;
} = {}): Promise<number> {
  const query: any = {};

  if (filters.isVerified !== undefined) {
    query.isVerified = filters.isVerified;
  }

  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }

  return await countDocuments(DonorModel, query);
}

/**
 * Get donor profile (without sensitive data)
 * @param id - Donor ID
 * @returns Promise<DonorProfile | null>
 */
export async function getDonorProfile(id: string): Promise<DonorProfile | null> {
  const donor = await getDonorById(id);
  if (!donor) {
    return null;
  }

  // Remove password from profile
  const { password, ...profile } = donor;
  return profile as DonorProfile;
}

/**
 * Authenticate donor (verify password)
 * @param email - Donor email
 * @param password - Plain text password
 * @returns Promise<Donor | null>
 */
export async function authenticateDonor(
  email: string,
  password: string
): Promise<Donor | null> {
  const donor = await getDonorByEmail(email);
  if (!donor) {
    return null;
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, donor.password);
  if (!isPasswordValid) {
    return null;
  }

  // Return donor without password
  const { password: _, ...donorWithoutPassword } = donor;
  return donorWithoutPassword as Donor;
}




