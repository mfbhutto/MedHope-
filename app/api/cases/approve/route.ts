// API Route: POST /api/cases/approve
// Approve or reject a case (superadmin only)

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { updateDocumentById } from '@/lib/db';
import NeedyPersonModel from '@/lib/models/needyPersonSchema';
import { getAdminByEmail } from '@/lib/controllers/admin';
import { createNotification } from '@/lib/controllers/notification';

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
    if (!admin || (admin.role !== 'admin' && admin.role !== 'superadmin') || !admin.isActive) {
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

    // Get the case first to check volunteer approval status
    const caseData = await NeedyPersonModel.findById(caseId);
    if (!caseData) {
      return NextResponse.json(
        { message: 'Case not found' },
        { status: 404 }
      );
    }

    // If approving, check if volunteer has approved first (if case is assigned to a volunteer)
    if (action === 'approve' && caseData.volunteerId) {
      const volunteerApprovalStatus = (caseData as any).volunteerApprovalStatus;
      if (!volunteerApprovalStatus || volunteerApprovalStatus !== 'approved') {
        return NextResponse.json(
          { message: 'Case must be approved by volunteer first before admin approval' },
          { status: 400 }
        );
      }
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

    // Create notification for the needy person
    try {
      const needyPersonId = String(updatedCase._id);
      const diseaseName = (updatedCase as any).chronicDisease 
        || (updatedCase as any).manualDisease 
        || (updatedCase as any).otherDisease 
        || 'Medical Case';
      
      await createNotification({
        userId: needyPersonId,
        userModel: 'NeedyPerson',
        type: action === 'approve' ? 'case_approved' : 'case_rejected',
        title: action === 'approve' ? 'Case Approved' : 'Case Rejected',
        message: action === 'approve'
          ? `Your case (${(updatedCase as any).caseNumber || 'N/A'}) has been approved and is now visible to donors.`
          : `Your case (${(updatedCase as any).caseNumber || 'N/A'}) has been rejected. Please contact support for more information.`,
        relatedId: needyPersonId,
        relatedType: 'case',
      });
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
      // Don't fail the approve/reject if notification fails
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

