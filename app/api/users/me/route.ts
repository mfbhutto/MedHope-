// API Route: GET /api/users/me
// Get current user profile

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getDonorByEmail } from '@/lib/controllers/donor';
import { getNeedyPersonByEmail } from '@/lib/controllers/needyPerson';

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Get user email from query params or headers
    // The frontend should send the email
    const userEmail = request.nextUrl.searchParams.get('email');
    const authHeader = request.headers.get('authorization');

    if (!userEmail) {
      return NextResponse.json(
        { message: 'User email is required' },
        { status: 400 }
      );
    }

    // Try to find donor first
    const donor = await getDonorByEmail(userEmail);
    if (donor) {
      // Remove password from response
      const { password, ...donorWithoutPassword } = donor;
      return NextResponse.json(
        {
          message: 'User retrieved successfully',
          user: donorWithoutPassword,
        },
        { status: 200 }
      );
    }

    // Try to find needy person
    const needyPerson = await getNeedyPersonByEmail(userEmail);
    if (needyPerson) {
      // Remove password from response
      const { password, ...needyPersonWithoutPassword } = needyPerson;
      return NextResponse.json(
        {
          message: 'User retrieved successfully',
          user: needyPersonWithoutPassword,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: 'User not found' },
      { status: 404 }
    );
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      {
        message: error.message || 'Failed to fetch user',
      },
      { status: 500 }
    );
  }
}

