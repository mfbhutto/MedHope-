// API Route: POST /api/admin/cases/[id]/assign-volunteer
// Assign a case to a volunteer (admin only)

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import NeedyPersonModel from '@/lib/models/needyPersonSchema';
import { getAdminByEmail } from '@/lib/controllers/admin';
import { getVolunteerById } from '@/lib/controllers/volunteer';
import mongoose from 'mongoose';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to database
    await connectToDatabase();

    // Get admin email and volunteerId from request body
    const body = await request.json();
    const { adminEmail, volunteerId } = body;

    if (!adminEmail) {
      return NextResponse.json(
        { message: 'Admin email is required' },
        { status: 400 }
      );
    }

    if (!volunteerId) {
      return NextResponse.json(
        { message: 'Volunteer ID is required' },
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

    // Verify volunteer exists and is active
    const volunteer = await getVolunteerById(volunteerId);
    if (!volunteer || !volunteer.isActive) {
      return NextResponse.json(
        { message: 'Volunteer not found or inactive' },
        { status: 404 }
      );
    }

    // Convert volunteerId to ObjectId if it's a string
    // Mongoose schema expects ObjectId, so we must convert string to ObjectId
    const volunteerObjectId = mongoose.Types.ObjectId.isValid(volunteerId)
      ? new mongoose.Types.ObjectId(volunteerId)
      : volunteerId;

    console.log('Assigning case to volunteer:', {
      caseId: params.id,
      volunteerId: volunteerId,
      volunteerObjectId: volunteerObjectId.toString(),
      volunteerName: volunteer.name
    });

    // Convert params.id to ObjectId
    const caseObjectId = new mongoose.Types.ObjectId(params.id);

    // Use raw MongoDB collection to update directly, bypassing Mongoose schema
    // This ensures the fields are actually saved to the database
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }

    const collectionName = NeedyPersonModel.collection.name;
    const collection = db.collection(collectionName);
    
    console.log('Using raw MongoDB update for collection:', collectionName);
    console.log('Updating document with:', {
      caseId: caseObjectId.toString(),
      volunteerId: volunteerObjectId.toString(),
      volunteerApprovalStatus: 'pending'
    });

    // Use raw MongoDB updateOne to bypass Mongoose
    const updateResult = await collection.updateOne(
      { _id: caseObjectId },
      {
        $set: {
          volunteerId: volunteerObjectId,
          volunteerApprovalStatus: 'pending'
        }
      }
    );

    console.log('Raw MongoDB update result:', {
      matchedCount: updateResult.matchedCount,
      modifiedCount: updateResult.modifiedCount,
      acknowledged: updateResult.acknowledged
    });

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { message: 'Case not found' },
        { status: 404 }
      );
    }

    // Verify the update using raw MongoDB query
    const rawDoc = await collection.findOne({ _id: caseObjectId });
    console.log('Raw MongoDB document after update:', {
      hasVolunteerId: !!rawDoc?.volunteerId,
      volunteerId: rawDoc?.volunteerId?.toString(),
      volunteerApprovalStatus: rawDoc?.volunteerApprovalStatus,
      hasVolunteerIdKey: rawDoc ? 'volunteerId' in rawDoc : false,
      hasVolunteerApprovalStatusKey: rawDoc ? 'volunteerApprovalStatus' in rawDoc : false
    });

    // Fetch the document using Mongoose to verify and return
    const updatedCase = await NeedyPersonModel.findById(params.id).lean();

    console.log('Case updated successfully:', {
      caseId: params.id,
      storedVolunteerId: updatedCase?.volunteerId,
      storedVolunteerIdType: typeof updatedCase?.volunteerId,
      storedVolunteerIdString: updatedCase?.volunteerId?.toString(),
      volunteerApprovalStatus: updatedCase?.volunteerApprovalStatus,
      hasVolunteerId: !!updatedCase?.volunteerId,
      fullDocumentKeys: Object.keys(updatedCase || {}),
      volunteerIdInKeys: Object.keys(updatedCase || {}).includes('volunteerId')
    });

    // Convert to plain object for response
    const caseData = updatedCase;

    return NextResponse.json(
      {
        message: 'Case assigned to volunteer successfully',
        case: caseData,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error assigning case to volunteer:', error);
    return NextResponse.json(
      {
        message: error.message || 'Failed to assign case to volunteer',
      },
      { status: 500 }
    );
  }
}

