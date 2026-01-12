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
    if (!volunteer._id) {
      return NextResponse.json(
        { message: 'Invalid volunteer data' },
        { status: 400 }
      );
    }
    
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
    const formattedCases = casesRaw.map((caseItem: Record<string, unknown>) => {
      // Get disease name
      let diseaseName = '';
      const diseaseType = caseItem.diseaseType as string;
      if (diseaseType === 'chronic') {
        diseaseName = (caseItem.chronicDisease as string) || 'Chronic Disease';
      } else {
        if ((caseItem.otherDisease as string) === 'Other') {
          diseaseName = (caseItem.manualDisease as string) || 'Other Disease';
        } else {
          diseaseName = (caseItem.otherDisease as string) || 'Other Disease';
        }
      }

      return {
        _id: caseItem._id.toString(),
        caseNumber: caseItem.caseNumber || `CASE-${caseItem._id.toString().slice(-6)}`,
        // Personal Information
        name: (caseItem.name as string) || '',
        email: (caseItem.email as string) || '',
        phone: (caseItem.phone as string) || '',
        cnic: (caseItem.cnic as string) || '',
        address: (caseItem.address as string) || '',
        district: (caseItem.district as string) || '',
        area: (caseItem.area as string) || '',
        manualArea: (caseItem.manualArea as string) || '',
        // Financial Information
        age: (caseItem.age as number) || 0,
        maritalStatus: (caseItem.maritalStatus as string) || 'single',
        numberOfChildren: (caseItem.numberOfChildren as number) || 0,
        firstChildAge: caseItem.firstChildAge as number | undefined,
        lastChildAge: caseItem.lastChildAge as number | undefined,
        salaryRange: (caseItem.salaryRange as string) || '',
        houseOwnership: (caseItem.houseOwnership as string) || 'own',
        rentAmount: caseItem.rentAmount as number | undefined,
        houseSize: (caseItem.houseSize as string) || '',
        utilityBill: (caseItem.utilityBill as string) || '',
        zakatEligible: (caseItem.zakatEligible as boolean) || false,
        // Disease Information
        diseaseType: diseaseType,
        diseaseName: diseaseName,
        chronicDisease: caseItem.chronicDisease as string | undefined,
        otherDisease: caseItem.otherDisease as string | undefined,
        manualDisease: caseItem.manualDisease as string | undefined,
        testNeeded: (caseItem.testNeeded as boolean) || false,
        selectedTests: (caseItem.selectedTests as string[]) || [],
        description: (caseItem.description as string) || '',
        hospitalName: (caseItem.hospitalName as string) || '',
        doctorName: (caseItem.doctorName as string) || '',
        amountNeeded: (caseItem.amountNeeded as number) || 0,
        document: (caseItem.document as string) || '',
        estimatedTotalCost: (caseItem.amountNeeded as number) || 0,
        priority: (caseItem.priority as string) || 'Medium',
        status: (caseItem.status as string) || 'pending',
        volunteerApprovalStatus: (caseItem.volunteerApprovalStatus as 'pending' | 'approved' | 'rejected') ?? 'pending',
        createdAt: caseItem.createdAt as string,
        updatedAt: caseItem.updatedAt as string | undefined,
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

