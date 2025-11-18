// Admin Controller
// Functions for admin operations

import AdminModel from '@/lib/models/adminSchema';
import { Admin, AdminProfile } from '@/lib/models/admin';
import { findOneDocument, findDocuments } from '@/lib/db';
import bcrypt from 'bcryptjs';

/**
 * Authenticate admin
 */
export async function authenticateAdmin(
  email: string,
  password: string
): Promise<AdminProfile | null> {
  // Normalize email to lowercase for case-insensitive matching
  const normalizedEmail = email.toLowerCase().trim();
  
  const admin = await findOneDocument(AdminModel, { email: normalizedEmail, isActive: true });
  
  if (!admin) {
    console.log('Admin not found for email:', normalizedEmail);
    return null;
  }

  // Check if password exists and is valid
  if (!admin.password) {
    console.log('Admin has no password set');
    return null;
  }

  // Debug: Log password hash info
  console.log('🔍 Password check:', {
    email: normalizedEmail,
    storedHashLength: admin.password.length,
    storedHashStart: admin.password.substring(0, 20),
    isBcryptHash: admin.password.startsWith('$2'),
  });

  const isPasswordValid = await bcrypt.compare(password, admin.password);
  if (!isPasswordValid) {
    console.log('❌ Password comparison failed for email:', normalizedEmail);
    console.log('   Input password length:', password.length);
    console.log('   Stored hash length:', admin.password.length);
    return null;
  }

  console.log('✅ Password comparison successful for:', normalizedEmail);

  const { password: _, ...adminWithoutPassword } = admin;
  // Ensure email and _id are included
  return {
    ...adminWithoutPassword,
    email: admin.email,
    _id: admin._id?.toString() || (admin as any)._id?.toString(),
  } as AdminProfile;
}

/**
 * Get admin by email
 */
export async function getAdminByEmail(email: string): Promise<Admin | null> {
  return await findOneDocument(AdminModel, { email });
}

/**
 * Get admin by ID
 */
export async function getAdminById(id: string): Promise<Admin | null> {
  return await findOneDocument(AdminModel, { _id: id });
}

/**
 * Create admin (for initial setup)
 */
export async function createAdmin(
  data: Omit<Admin, '_id' | 'role' | 'createdAt' | 'updatedAt'>
): Promise<Admin> {
  // Check if admin with email already exists
  const existingAdmin = await getAdminByEmail(data.email);
  if (existingAdmin) {
    throw new Error('Admin with this email already exists');
  }

  // Password will be hashed by the schema pre-save hook
  // So we pass the plain password here
  const admin = new AdminModel({
    name: data.name,
    email: data.email,
    password: data.password, // Plain password - schema will hash it
    role: 'admin',
    isActive: data.isActive !== undefined ? data.isActive : true,
  });

  await admin.save();
  const { password: _, ...adminWithoutPassword } = admin.toObject();
  return adminWithoutPassword as Admin;
}

