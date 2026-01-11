// API Route: POST /api/admin/volunteers/[id]/toggle-status
// Toggle volunteer active status (admin only)

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { setVolunteerActiveStatus } from '@/lib/controllers/volunteer';
import { getAdminByEmail } from '@/lib/controllers/admin';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to database
    await connectToDatabase();

    // Get admin email from request body
    const body = await request.json();
    const { adminEmail, isActive } = body;

    if (!adminEmail) {
      return NextResponse.json(
        { message: 'Admin email is required' },
        { status: 400 }
      );
    }

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { message: 'isActive status is required' },
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

    // Update volunteer status
    const volunteer = await setVolunteerActiveStatus(params.id, isActive);

    if (!volunteer) {
      return NextResponse.json(
        { message: 'Volunteer not found' },
        { status: 404 }
      );
    }

    // Remove password from response
    const { password: _, ...volunteerWithoutPassword } = volunteer as any;

    return NextResponse.json(
      {
        message: `Volunteer ${isActive ? 'activated' : 'deactivated'} successfully`,
        volunteer: volunteerWithoutPassword,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating volunteer status:', error);
    return NextResponse.json(
      {
        message: error.message || 'Failed to update volunteer status',
      },
      { status: 500 }
    );
  }
}

