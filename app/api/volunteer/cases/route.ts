// API Route: GET /api/volunteer/cases
// Get cases assigned to a volunteer

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getVolunteerByEmail } from '@/lib/controllers/volunteer';
import NeedyPersonModel from '@/lib/models/needyPersonSchema';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Get volunteer email from query params
    const volunteerEmail = request.nextUrl.searchParams.get('volunteerEmail');
    
    if (!volunteerEmail) {
      return NextResponse.json(
        { message: 'Volunteer email is required' },
        { status: 400 }
      );
    }

    // Verify volunteer
    const volunteer = await getVolunteerByEmail(volunteerEmail);
    if (!volunteer || !volunteer.isActive) {
      return NextResponse.json(
        { message: 'Unauthorized. Volunteer access required.' },
        { status: 401 }
      );
    }

    // Convert volunteer._id to ObjectId for proper comparison
    // Since volunteerId is stored as ObjectId in the schema, we need to query with ObjectId
    const volunteerObjectId = typeof volunteer._id === 'string' 
      ? new mongoose.Types.ObjectId(volunteer._id)
      : volunteer._id;

    console.log('Volunteer ID for query:', {
      original: volunteer._id,
      converted: volunteerObjectId,
      type: typeof volunteer._id,
      volunteerObjectIdString: volunteerObjectId.toString()
    });

    // Get cases assigned to this volunteer
    // Use raw MongoDB to query since we use raw MongoDB to save volunteerId
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }
    
    const collectionName = NeedyPersonModel.collection.name;
    const collection = db.collection(collectionName);
    
    // Query using raw MongoDB for consistency
    const casesRaw = await collection.find({
      volunteerId: volunteerObjectId
    }).sort({ createdAt: -1 }).toArray(); // Newest first

    console.log(`Found ${casesRaw.length} cases for volunteer ${volunteer._id}`);

    // Transform cases to response format
    const formattedCases = casesRaw.map((caseItem: any) => {
      // Get disease name
      let diseaseName = '';
      if (caseItem.diseaseType === 'chronic') {
        diseaseName = caseItem.chronicDisease || 'Chronic Disease';
      } else {
        if (caseItem.otherDisease === 'Other') {
          diseaseName = caseItem.manualDisease || 'Other Disease';
        } else {
          diseaseName = caseItem.otherDisease || 'Other Disease';
        }
      }

      return {
        _id: caseItem._id.toString(),
        caseNumber: caseItem.caseNumber || `CASE-${caseItem._id.toString().slice(-6)}`,
        name: caseItem.name,
        email: caseItem.email,
        phone: caseItem.phone,
        district: caseItem.district,
        area: caseItem.area,
        diseaseType: caseItem.diseaseType,
        diseaseName: diseaseName,
        description: caseItem.description || '',
        hospitalName: caseItem.hospitalName || '',
        doctorName: caseItem.doctorName || '',
        amountNeeded: caseItem.amountNeeded || 0,
        estimatedTotalCost: caseItem.amountNeeded || 0,
        priority: caseItem.priority || 'Medium',
        status: caseItem.status || 'pending',
        volunteerApprovalStatus: caseItem.volunteerApprovalStatus ?? 'pending',
        isZakatEligible: caseItem.zakatEligible || false,
        createdAt: caseItem.createdAt,
        updatedAt: caseItem.updatedAt,
      };
    });

    return NextResponse.json(
      {
        message: 'Cases retrieved successfully',
        cases: formattedCases,
        count: formattedCases.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching volunteer cases:', error);
    return NextResponse.json(
      {
        message: error.message || 'Failed to fetch cases',
        cases: [],
      },
      { status: 500 }
    );
  }
}

