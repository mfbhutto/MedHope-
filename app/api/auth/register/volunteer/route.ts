// API Route: POST /api/auth/register/volunteer
// Register a new volunteer

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { createVolunteer, volunteerExists } from '@/lib/controllers/volunteer';

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

    // Validate phone number format
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { message: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Validate phone number contains only valid characters (no letters)
    if (/[a-zA-Z]/.test(phone)) {
      return NextResponse.json(
        { message: 'Phone number cannot contain letters' },
        { status: 400 }
      );
    }

    // Validate phone number digit count (10-15 digits)
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      return NextResponse.json(
        { message: 'Phone number must contain at least 10 digits' },
        { status: 400 }
      );
    }
    if (digitsOnly.length > 15) {
      return NextResponse.json(
        { message: 'Phone number cannot exceed 15 digits' },
        { status: 400 }
      );
    }

    // Check if volunteer already exists
    const exists = await volunteerExists(email);
    if (exists) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 409 }
      );
    }

    // Create volunteer
    const volunteer = await createVolunteer({
      name,
      email,
      address,
      phone,
      password,
      role: role || 'volunteer',
    });

    // Remove password from response
    const { password: _, ...volunteerWithoutPassword } = volunteer;

    return NextResponse.json(
      {
        message: 'Volunteer registered successfully',
        user: volunteerWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Volunteer registration error:', error);
    return NextResponse.json(
      {
        message: error.message || 'Registration failed',
      },
      { status: 500 }
    );
  }
}

