// API Route: POST /api/volunteer/cases/approve
// Approve or reject a case assigned to volunteer (volunteer only)

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { updateDocumentById } from '@/lib/db';
import NeedyPersonModel from '@/lib/models/needyPersonSchema';
import { getVolunteerByEmail } from '@/lib/controllers/volunteer';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    // Connect to database first
    await connectToDatabase();

    // Parse request body
    const body = await request.json();
    const { caseId, action, volunteerEmail, rejectionReasons } = body;

    // Verify volunteer
    if (!volunteerEmail) {
      return NextResponse.json(
        { message: 'Volunteer email is required' },
        { status: 400 }
      );
    }

    const volunteer = await getVolunteerByEmail(volunteerEmail);
    if (!volunteer || !volunteer.isActive) {
      return NextResponse.json(
        { message: 'Unauthorized. Volunteer access required.' },
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

    // Get the case and verify it's assigned to this volunteer
    // Use raw MongoDB to fetch since we used raw MongoDB to save volunteerId
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }
    
    const collectionName = NeedyPersonModel.collection.name;
    const collection = db.collection(collectionName);
    const caseObjectId = mongoose.Types.ObjectId.isValid(caseId)
      ? new mongoose.Types.ObjectId(caseId)
      : caseId;
    
    // Fetch using raw MongoDB to ensure we get the volunteerId field
    const caseDataRaw = await collection.findOne({ _id: caseObjectId });
    if (!caseDataRaw) {
      return NextResponse.json(
        { message: 'Case not found' },
        { status: 404 }
      );
    }

    // Verify the case is assigned to this volunteer
    // Convert both to ObjectId for proper comparison (since volunteerId is stored as ObjectId)
    const volunteerObjectId = typeof volunteer._id === 'string'
      ? new mongoose.Types.ObjectId(volunteer._id)
      : volunteer._id;
    
    // Get volunteerId from raw document
    const caseVolunteerId = caseDataRaw.volunteerId;
    
    console.log('Checking case assignment:', {
      caseId: caseObjectId.toString(),
      caseVolunteerId: caseVolunteerId?.toString(),
      caseVolunteerIdType: typeof caseVolunteerId,
      volunteerId: volunteerObjectId?.toString(),
      volunteerIdType: typeof volunteerObjectId,
      hasVolunteerId: !!caseVolunteerId
    });
    
    if (!caseVolunteerId) {
      return NextResponse.json(
        { message: 'Case is not assigned to any volunteer' },
        { status: 403 }
      );
    }
    
    // Compare ObjectIds properly
    const caseVolunteerObjectId = typeof caseVolunteerId === 'string'
      ? new mongoose.Types.ObjectId(caseVolunteerId)
      : caseVolunteerId;
    
    if (!caseVolunteerObjectId.equals(volunteerObjectId)) {
      console.log('Case volunteer ID mismatch:', {
        caseVolunteerId: caseVolunteerObjectId.toString(),
        volunteerId: volunteerObjectId.toString(),
        equal: caseVolunteerObjectId.equals(volunteerObjectId)
      });
      return NextResponse.json(
        { message: 'Case is not assigned to you' },
        { status: 403 }
      );
    }

    // Update volunteer approval status
    const volunteerApprovalStatus = action === 'approve' ? 'approved' : 'rejected';
    const updateData: any = { volunteerApprovalStatus };
    
    // If rejecting, include rejection reasons
    if (action === 'reject') {
      if (!rejectionReasons || !Array.isArray(rejectionReasons) || rejectionReasons.length === 0) {
        return NextResponse.json(
          { message: 'Rejection reasons are required when rejecting a case' },
          { status: 400 }
        );
      }
      // Validate rejection reasons
      const validReasons = ['Personal information issue', 'Financial information issue', 'Disease information issue'];
      const invalidReasons = rejectionReasons.filter((reason: string) => !validReasons.includes(reason));
      if (invalidReasons.length > 0) {
        return NextResponse.json(
          { message: `Invalid rejection reasons: ${invalidReasons.join(', ')}` },
          { status: 400 }
        );
      }
      updateData.volunteerRejectionReasons = rejectionReasons;
    } else {
      // Clear rejection reasons if approving
      updateData.volunteerRejectionReasons = [];
    }
    
    // Use raw MongoDB to update since we used raw MongoDB to save
    const updateResult = await collection.updateOne(
      { _id: caseObjectId },
      { $set: updateData }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { message: 'Case not found' },
        { status: 404 }
      );
    }

    // Fetch updated case using Mongoose for response
    const updatedCase = await NeedyPersonModel.findById(caseId).lean();

    return NextResponse.json(
      {
        message: `Case ${action === 'approve' ? 'approved' : 'rejected'} by volunteer successfully`,
        case: updatedCase,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Volunteer case approval error:', error);
    return NextResponse.json(
      {
        message: error.message || 'Failed to update case status',
      },
      { status: 500 }
    );
  }
}

