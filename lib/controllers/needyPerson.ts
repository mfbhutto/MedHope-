// Needy Person Controller
// Handles all needy person (accepter) related database operations

import NeedyPersonModel from '@/lib/models/needyPersonSchema';
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
import { NeedyPerson } from '@/lib/models/needyPerson';
import { getPriorityByArea } from '@/lib/models/needyPerson';
import bcrypt from 'bcryptjs';

/**
 * Generate unique case number
 */
async function generateCaseNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `CASE-${year}-`;

  // Find the last case number for current year
  const lastCase = await findDocuments(
    NeedyPersonModel,
    { caseNumber: { $regex: `^${prefix}` } },
    { sort: { caseNumber: -1 }, limit: 1 }
  );

  let sequence = 1;
  if (lastCase.length > 0 && lastCase[0].caseNumber) {
    const lastSequence = parseInt(lastCase[0].caseNumber.split('-')[2]);
    sequence = lastSequence + 1;
  }

  // Format with 5 digits (e.g., 00001, 00002, etc.)
  return `${prefix}${sequence.toString().padStart(5, '0')}`;
}

/**
 * Create a new needy person
 * @param data - Needy person registration data
 * @returns Promise<NeedyPerson>
 */
export async function createNeedyPerson(
  data: Omit<NeedyPerson, '_id' | 'caseNumber' | 'priority' | 'status' | 'role' | 'createdAt' | 'updatedAt'>
): Promise<NeedyPerson> {
  // Check if email already exists
  const existing = await findOneDocument(NeedyPersonModel, { email: data.email });
  if (existing) {
    throw new Error('Email already registered');
  }

  // Check if CNIC already exists
  const existingCNIC = await findOneDocument(NeedyPersonModel, { cnic: data.cnic });
  if (existingCNIC) {
    throw new Error('CNIC already registered');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Auto-assign priority based on area and district from JSON file
  const priority = getPriorityByArea(data.area, data.district);

  // Generate case number
  const caseNumber = await generateCaseNumber();

  // Create needy person data
  const needyPersonData: Partial<NeedyPerson> = {
    ...data,
    password: hashedPassword,
    role: 'accepter',
    priority,
    status: 'pending',
    caseNumber,
    isVerified: false,
    isActive: true,
    totalDonations: 0,
  };

  return await createDocument(NeedyPersonModel, needyPersonData);
}

/**
 * Get needy person by ID
 */
export async function getNeedyPersonById(id: string): Promise<NeedyPerson | null> {
  return await findDocumentById(NeedyPersonModel, id);
}

/**
 * Get needy person by email
 */
export async function getNeedyPersonByEmail(email: string): Promise<NeedyPerson | null> {
  return await findOneDocument(NeedyPersonModel, { email: email.toLowerCase().trim() });
}

/**
 * Get needy person by case number
 */
export async function getNeedyPersonByCaseNumber(caseNumber: string): Promise<NeedyPerson | null> {
  return await findOneDocument(NeedyPersonModel, { caseNumber });
}

/**
 * Check if needy person exists by email
 */
export async function needyPersonExists(email: string): Promise<boolean> {
  return await documentExists(NeedyPersonModel, { email: email.toLowerCase().trim() });
}

/**
 * Get all needy persons with filters
 */
export async function getAllNeedyPersons(
  filters: any = {},
  options: {
    limit?: number;
    skip?: number;
    sort?: any;
  } = {}
): Promise<NeedyPerson[]> {
  // If filters contains MongoDB operators like $or, use it directly
  // Otherwise, build query from individual filter properties
  const query: any = {};

  // Check if filters already contains MongoDB operators (like $or, $and, etc.)
  const hasMongoOperators = filters && Object.keys(filters).some(key => key.startsWith('$'));
  
  if (hasMongoOperators) {
    // Use filters directly if it contains MongoDB operators
    Object.assign(query, filters);
  } else {
    // Build query from individual filter properties
    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.priority) {
      query.priority = filters.priority;
    }

    if (filters.district) {
      query.district = filters.district;
    }

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
        { caseNumber: { $regex: filters.search, $options: 'i' } },
      ];
    }
  }

  return await findDocuments(NeedyPersonModel, query, options);
}

/**
 * Update needy person status
 */
export async function updateNeedyPersonStatus(
  id: string,
  status: 'pending' | 'accepted' | 'rejected'
): Promise<NeedyPerson | null> {
  return await updateDocumentById(NeedyPersonModel, id, { status });
}

/**
 * Authenticate needy person
 */
export async function authenticateNeedyPerson(
  email: string,
  password: string
): Promise<NeedyPerson | null> {
  const needyPerson = await getNeedyPersonByEmail(email);
  if (!needyPerson) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, needyPerson.password);
  if (!isPasswordValid) {
    return null;
  }

  const { password: _, ...needyPersonWithoutPassword } = needyPerson;
  return needyPersonWithoutPassword as NeedyPerson;
}




