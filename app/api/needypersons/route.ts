// API Route: GET /api/needypersons
// Get all needy persons (for donors to view)

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getAllNeedyPersons } from '@/lib/controllers/needyPerson';

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as 'pending' | 'accepted' | 'rejected' | null;
    const priority = searchParams.get('priority') as 'High' | 'Medium' | 'Low' | null;
    const district = searchParams.get('district');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    // Build filters
    const filters: any = {
      isActive: true, // Only show active needy persons
    };

    if (status) {
      filters.status = status;
    }

    if (priority) {
      filters.priority = priority;
    }

    if (district) {
      filters.district = district;
    }

    // Get needy persons
    const needyPersons = await getAllNeedyPersons(filters, {
      limit,
      skip,
      sort: { priority: 1, createdAt: -1 }, // Sort by priority (High first) and newest first
    });

    // Remove sensitive information (password, etc.)
    const safeNeedyPersons = needyPersons.map((person: any) => {
      const { password, ...safePerson } = person;
      return safePerson;
    });

    return NextResponse.json(
      {
        message: 'Needy persons retrieved successfully',
        needyPersons: safeNeedyPersons,
        count: safeNeedyPersons.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching needy persons:', error);
    return NextResponse.json(
      {
        message: error.message || 'Failed to fetch needy persons',
      },
      { status: 500 }
    );
  }
}




