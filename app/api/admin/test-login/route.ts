// API Route: POST /api/admin/test-login
// Test endpoint to verify admin credentials and password hash
// This is for debugging only - remove in production!

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getAdminByEmail } from '@/lib/controllers/admin';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const admin = await getAdminByEmail(normalizedEmail);

    if (!admin) {
      return NextResponse.json(
        {
          found: false,
          message: 'Admin not found',
          email: normalizedEmail,
        },
        { status: 200 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    return NextResponse.json(
      {
        found: true,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        isActive: admin.isActive,
        passwordHashInfo: {
          length: admin.password.length,
          startsWith: admin.password.substring(0, 20),
          isBcryptHash: admin.password.startsWith('$2'),
        },
        passwordMatch: isPasswordValid,
        message: isPasswordValid
          ? 'Password matches!'
          : 'Password does not match',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Test login error:', error);
    return NextResponse.json(
      {
        message: error.message || 'Test failed',
        error: error.toString(),
      },
      { status: 500 }
    );
  }
}

