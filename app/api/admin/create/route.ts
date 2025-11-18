// API Route: POST /api/admin/create
// Create initial superadmin account (one-time setup)
// This should be protected in production!

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { createAdmin } from '@/lib/controllers/admin';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Parse request body
    const body = await request.json();
    const { email, password, name } = body;

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { message: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Don't hash password here - let the schema pre-save hook handle it
    // This prevents double-hashing

    // Check if admin with this email already exists
    const { getAdminByEmail } = await import('@/lib/controllers/admin');
    const existingAdmin = await getAdminByEmail(email.toLowerCase().trim());
    
    if (existingAdmin) {
      return NextResponse.json(
        { 
          message: 'Admin with this email already exists. Please use a different email or delete the existing admin first.',
          existingEmail: existingAdmin.email
        },
        { status: 400 }
      );
    }

    // Create admin (password will be hashed by schema pre-save hook)
    const admin = await createAdmin({
      name,
      email: email.toLowerCase().trim(), // Normalize email
      password: password, // Pass plain password, schema will hash it
      isActive: true,
    });

    return NextResponse.json(
      {
        message: 'Admin created successfully',
        admin: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      {
        message: error.message || 'Failed to create admin',
      },
      { status: 500 }
    );
  }
}

