// API Route: POST /api/admin/donors/[id]/toggle-status
// Toggle donor active status (admin only)

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { setDonorActiveStatus } from '@/lib/controllers/donor';
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

    // Update donor status
    const donor = await setDonorActiveStatus(params.id, isActive);

    if (!donor) {
      return NextResponse.json(
        { message: 'Donor not found' },
        { status: 404 }
      );
    }

    // Remove password from response
    const { password: _, ...donorWithoutPassword } = donor as any;

    return NextResponse.json(
      {
        message: `Donor ${isActive ? 'activated' : 'deactivated'} successfully`,
        donor: donorWithoutPassword,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating donor status:', error);
    return NextResponse.json(
      {
        message: error.message || 'Failed to update donor status',
      },
      { status: 500 }
    );
  }
}

