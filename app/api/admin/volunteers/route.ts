// API Route: GET /api/admin/volunteers
// Get all volunteers (admin only)

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getAllVolunteers } from '@/lib/controllers/volunteer';
import { getAdminByEmail } from '@/lib/controllers/admin';

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Get admin email from query params
    const adminEmail = request.nextUrl.searchParams.get('adminEmail');
    
    if (!adminEmail) {
      return NextResponse.json(
        { message: 'Admin email is required' },
        { status: 400 }
      );
    }

    // Verify admin
    const admin = await getAdminByEmail(adminEmail);
    if (!admin || (admin.role !== 'admin' && admin.role !== 'superadmin') || !admin.isActive) {
      return NextResponse.json(
        { message: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    // Get all volunteers (no filters, get all)
    const volunteers = await getAllVolunteers({}, {
      sort: { createdAt: -1 }, // Sort by newest first
    });

    // Remove password from response
    const safeVolunteers = volunteers.map((volunteer: any) => {
      const { password, ...volunteerWithoutPassword } = volunteer;
      return volunteerWithoutPassword;
    });

    return NextResponse.json(
      {
        message: 'Volunteers retrieved successfully',
        volunteers: safeVolunteers,
        count: safeVolunteers.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching volunteers:', error);
    return NextResponse.json(
      {
        message: error.message || 'Failed to fetch volunteers',
      },
      { status: 500 }
    );
  }
}

