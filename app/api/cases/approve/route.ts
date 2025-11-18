// API Route: POST /api/cases/approve
// Approve or reject a case (superadmin only)

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { updateDocumentById } from '@/lib/db';
import NeedyPersonModel from '@/lib/models/needyPersonSchema';
import { getAdminByEmail } from '@/lib/controllers/admin';

export async function POST(request: NextRequest) {
  try {
    // Connect to database first
    await connectToDatabase();

    // Parse request body
    const body = await request.json();
    const { caseId, action, adminEmail } = body; // adminEmail for verification

    // Verify admin
    if (!adminEmail) {
      return NextResponse.json(
        { message: 'Admin email is required' },
        { status: 400 }
      );
    }

    const admin = await getAdminByEmail(adminEmail);
    if (!admin || admin.role !== 'admin' || !admin.isActive) {
      return NextResponse.json(
        { message: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!caseId || !action) {
      return NextResponse.json(
        { message: 'Case ID and action are required' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { message: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Update case status
    const status = action === 'approve' ? 'accepted' : 'rejected';
    const updatedCase = await updateDocumentById(
      NeedyPersonModel,
      caseId,
      { status, isVerified: action === 'approve' }
    );

    if (!updatedCase) {
      return NextResponse.json(
        { message: 'Case not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: `Case ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
        case: updatedCase,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Case approval error:', error);
    return NextResponse.json(
      {
        message: error.message || 'Failed to update case status',
      },
      { status: 500 }
    );
  }
}

