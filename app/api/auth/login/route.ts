// API Route: POST /api/auth/login
// Login for both donors and needy persons (accepters)

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { authenticateDonor } from '@/lib/controllers/donor';
import { authenticateNeedyPerson } from '@/lib/controllers/needyPerson';
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

    // Try to authenticate as admin first
    let user = await authenticateAdmin(email, password);

    // If not an admin, try as donor
    if (!user) {
      user = await authenticateDonor(email, password);
    }

    // If not a donor, try as needy person (accepter)
    if (!user) {
      user = await authenticateNeedyPerson(email, password);
    }

    // If still not found, invalid credentials
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (user.isActive === false) {
      return NextResponse.json(
        { message: 'Your account has been deactivated. Please contact support.' },
        { status: 403 }
      );
    }

    // Ensure role is explicitly set (should already be set from schema defaults)
    const userResponse = {
      ...user,
      role: user.role || 'unknown',
      _id: user._id || (user as any)._id,
    };

    // Log for debugging
    console.log('Login successful for user:', {
      email: userResponse.email || (userResponse as any).email,
      role: userResponse.role,
      hasId: !!userResponse._id,
    });

    // Return user data (password already removed by authenticate functions)
    return NextResponse.json(
      {
        message: 'Login successful',
        user: userResponse,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        message: error.message || 'Login failed',
      },
      { status: 500 }
    );
  }
}

