// API Route: POST /api/auth/admin-login
// Login for superadmin

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { authenticateAdmin } from '@/lib/controllers/admin';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Parse request body
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
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

    // Normalize email to lowercase (schema stores emails in lowercase)
    const normalizedEmail = email.toLowerCase().trim();

    console.log('🔐 Admin login attempt:', { email: normalizedEmail, passwordLength: password.length });

    // Authenticate admin
    const admin = await authenticateAdmin(normalizedEmail, password);

    if (!admin) {
      console.log('❌ Authentication failed for:', normalizedEmail);
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('✅ Authentication successful for:', normalizedEmail);

    // Check if admin is active
    if (admin.isActive === false) {
      return NextResponse.json(
        { message: 'Your account has been deactivated. Please contact support.' },
        { status: 403 }
      );
    }

    // Ensure user object has all required fields
    const userResponse = {
      ...admin,
      _id: admin._id?.toString() || (admin as any)._id?.toString(),
      email: admin.email,
      role: admin.role || 'admin',
    };

    // Return admin data (without password)
    return NextResponse.json(
      {
        message: 'Login successful',
        user: userResponse,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      {
        message: error.message || 'Login failed',
      },
      { status: 500 }
    );
  }
}

