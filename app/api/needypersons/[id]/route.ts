// API Route: GET /api/needypersons/[id]
// Get a single needy person by ID

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getNeedyPersonById } from '@/lib/controllers/needyPerson';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to database
    await connectToDatabase();

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: 'Needy person ID is required' },
        { status: 400 }
      );
    }

    // Get needy person by ID
    const needyPerson = await getNeedyPersonById(id);

    if (!needyPerson) {
      return NextResponse.json(
        { message: 'Needy person not found' },
        { status: 404 }
      );
    }

    // Remove sensitive information (password)
    const { password, ...safeNeedyPerson } = needyPerson;

    return NextResponse.json(
      {
        message: 'Needy person retrieved successfully',
        needyPerson: safeNeedyPerson,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching needy person:', error);
    return NextResponse.json(
      {
        message: error.message || 'Failed to fetch needy person',
      },
      { status: 500 }
    );
  }
}




