// API Route: GET /api/admin/donors
// Get all donors (admin only)

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getAllDonors } from '@/lib/controllers/donor';
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

    // Get all donors (no filters, get all)
    const donors = await getAllDonors({}, {
      sort: { createdAt: -1 }, // Sort by newest first
    });

    // Remove password from response
    const safeDonors = donors.map((donor: any) => {
      const { password, ...donorWithoutPassword } = donor;
      return donorWithoutPassword;
    });

    return NextResponse.json(
      {
        message: 'Donors retrieved successfully',
        donors: safeDonors,
        count: safeDonors.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching donors:', error);
    return NextResponse.json(
      {
        message: error.message || 'Failed to fetch donors',
      },
      { status: 500 }
    );
  }
}

