// Volunteer Controller
// Handles all volunteer-related database operations

import VolunteerModel from '@/lib/models/volunteerSchema';
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
import { Volunteer, VolunteerRegistrationData, VolunteerProfile } from '@/lib/models/volunteer';
import bcrypt from 'bcryptjs';

/**
 * Create a new volunteer
 * @param data - Volunteer registration data
 * @returns Promise<Volunteer>
 */
export async function createVolunteer(
  data: Omit<VolunteerRegistrationData, 'confirmPassword'>
): Promise<Volunteer> {
  // Check if email already exists
  const existingVolunteer = await findOneDocument(VolunteerModel, { email: data.email });
  if (existingVolunteer) {
    throw new Error('Email already registered');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Create volunteer data
  const volunteerData: Partial<Volunteer> = {
    name: data.name,
    email: data.email.toLowerCase().trim(),
    address: data.address,
    phone: data.phone,
    cnic: data.cnic,
    cnicFront: data.cnicFront,
    cnicBack: data.cnicBack,
    password: hashedPassword,
    role: 'volunteer',
    isVerified: false,
    isActive: true,
    casesVerified: 0,
  };

  return await createDocument(VolunteerModel, volunteerData);
}

/**
 * Get volunteer by ID
 * @param id - Volunteer ID
 * @returns Promise<Volunteer | null>
 */
export async function getVolunteerById(id: string): Promise<Volunteer | null> {
  return await findDocumentById(VolunteerModel, id);
}

/**
 * Get volunteer by email
 * @param email - Volunteer email
 * @returns Promise<Volunteer | null>
 */
export async function getVolunteerByEmail(email: string): Promise<Volunteer | null> {
  return await findOneDocument(VolunteerModel, { email: email.toLowerCase().trim() });
}

/**
 * Get all volunteers with optional filters
 * @param filters - Query filters
 * @param options - Query options (limit, skip, sort)
 * @returns Promise<Volunteer[]>
 */
export async function getAllVolunteers(
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
): Promise<Volunteer[]> {
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

  return await findDocuments(VolunteerModel, query, options);
}

/**
 * Update volunteer by ID
 * @param id - Volunteer ID
 * @param data - Update data (password will be hashed if provided)
 * @returns Promise<Volunteer | null>
 */
export async function updateVolunteer(
  id: string,
  data: Partial<Omit<Volunteer, '_id' | 'password'>> & { password?: string }
): Promise<Volunteer | null> {
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

  return await updateDocumentById(VolunteerModel, id, updateData);
}

/**
 * Delete volunteer by ID
 * @param id - Volunteer ID
 * @returns Promise<Volunteer | null>
 */
export async function deleteVolunteer(id: string): Promise<Volunteer | null> {
  return await deleteDocumentById(VolunteerModel, id);
}

/**
 * Verify volunteer email
 * @param id - Volunteer ID
 * @returns Promise<Volunteer | null>
 */
export async function verifyVolunteer(id: string): Promise<Volunteer | null> {
  return await updateDocumentById(VolunteerModel, id, { isVerified: true });
}

/**
 * Activate/Deactivate volunteer
 * @param id - Volunteer ID
 * @param isActive - Active status
 * @returns Promise<Volunteer | null>
 */
export async function setVolunteerActiveStatus(
  id: string,
  isActive: boolean
): Promise<Volunteer | null> {
  return await updateDocumentById(VolunteerModel, id, { isActive });
}

/**
 * Check if volunteer exists by email
 * @param email - Volunteer email
 * @returns Promise<boolean>
 */
export async function volunteerExists(email: string): Promise<boolean> {
  return await documentExists(VolunteerModel, { email: email.toLowerCase().trim() });
}

/**
 * Count volunteers with filters
 * @param filters - Query filters
 * @returns Promise<number>
 */
export async function countVolunteers(filters: {
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

  return await countDocuments(VolunteerModel, query);
}

/**
 * Get volunteer profile (without sensitive data)
 * @param id - Volunteer ID
 * @returns Promise<VolunteerProfile | null>
 */
export async function getVolunteerProfile(id: string): Promise<VolunteerProfile | null> {
  const volunteer = await getVolunteerById(id);
  if (!volunteer) {
    return null;
  }

  // Remove password from profile
  const { password, ...profile } = volunteer;
  return profile as VolunteerProfile;
}

/**
 * Authenticate volunteer (verify password)
 * @param email - Volunteer email
 * @param password - Plain text password
 * @returns Promise<Volunteer | null>
 */
export async function authenticateVolunteer(
  email: string,
  password: string
): Promise<Volunteer | null> {
  const volunteer = await getVolunteerByEmail(email);
  if (!volunteer) {
    return null;
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, volunteer.password);
  if (!isPasswordValid) {
    return null;
  }

  // Return volunteer without password
  const { password: _, ...volunteerWithoutPassword } = volunteer;
  return volunteerWithoutPassword as Volunteer;
}

