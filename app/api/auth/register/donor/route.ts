// API Route: POST /api/auth/register/donor
// Register a new donor

import { NextRequest, NextResponse } from 'next/server';
import { createDonor, donorExists } from '@/lib/controllers/donor';
import { connectToDatabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Parse request body
    const body = await request.json();
    const { name, email, address, phone, password, role } = body;

    // Validate required fields
    if (!name || !email || !address || !phone || !password) {
      return NextResponse.json(
        { message: 'All fields are required' },
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

    // Check if donor already exists
    const exists = await donorExists(email);
    if (exists) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 409 }
      );
    }

    // Create donor
    const donor = await createDonor({
      name,
      email,
      address,
      phone,
      password,
      role: role || 'donor',
    });

    // Remove password from response
    const { password: _, ...donorWithoutPassword } = donor;

    return NextResponse.json(
      {
        message: 'Donor registered successfully',
        user: donorWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Donor registration error:', error);
    return NextResponse.json(
      {
        message: error.message || 'Registration failed',
      },
      { status: 500 }
    );
  }
}




