// API Route: GET /api/stats
// Get platform statistics

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { countDonors } from '@/lib/controllers/donor';

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Get total count of active donors
    const donorCount = await countDonors({ isActive: true });

    return NextResponse.json(
      {
        message: 'Stats retrieved successfully',
        stats: {
          donorCount,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      {
        message: error.message || 'Failed to fetch stats',
      },
      { status: 500 }
    );
  }
}

