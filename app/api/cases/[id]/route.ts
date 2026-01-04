// API Route: GET /api/cases/[id]
// Get a single case by ID for needy persons (requires user email verification)

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getNeedyPersonById } from '@/lib/controllers/needyPerson';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to database
    await connectToDatabase();

    // Get user email from query params (to verify ownership)
    const userEmail = request.nextUrl.searchParams.get('email');
    
    if (!userEmail) {
      return NextResponse.json(
        { message: 'User email is required' },
        { status: 400 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: 'Case ID is required' },
        { status: 400 }
      );
    }

    // Get needy person by ID
    const needyPerson = await getNeedyPersonById(id);

    if (!needyPerson) {
      return NextResponse.json(
        { message: 'Case not found' },
        { status: 404 }
      );
    }

    // Verify that this case belongs to the requesting user
    // Cases are linked by originalEmail field or exact email match
    const isOwner = 
      needyPerson.email.toLowerCase() === userEmail.toLowerCase() ||
      (needyPerson as any).originalEmail?.toLowerCase() === userEmail.toLowerCase();

    if (!isOwner) {
      return NextResponse.json(
        { message: 'Unauthorized. You can only view your own cases.' },
        { status: 403 }
      );
    }

    // Get disease name
    let diseaseName = '';
    if (needyPerson.diseaseType === 'chronic') {
      diseaseName = (needyPerson as any).chronicDisease || 'Chronic Disease';
    } else {
      if ((needyPerson as any).otherDisease === 'Other') {
        diseaseName = (needyPerson as any).manualDisease || 'Other Disease';
      } else {
        diseaseName = (needyPerson as any).otherDisease || 'Other Disease';
      }
    }

    // Transform to case format with all fields
    const caseData = {
      _id: needyPerson._id?.toString(),
      caseNumber: (needyPerson as any).caseNumber || `CASE-${needyPerson._id?.toString().slice(-6)}`,
      name: needyPerson.name,
      email: needyPerson.email,
      phone: needyPerson.phone,
      cnic: needyPerson.cnic,
      address: needyPerson.address,
      district: needyPerson.district,
      area: needyPerson.area,
      manualArea: (needyPerson as any).manualArea,
      // Step 2: Financial Information
      age: (needyPerson as any).age,
      maritalStatus: (needyPerson as any).maritalStatus,
      numberOfChildren: (needyPerson as any).numberOfChildren,
      firstChildAge: (needyPerson as any).firstChildAge,
      lastChildAge: (needyPerson as any).lastChildAge,
      salaryRange: (needyPerson as any).salaryRange,
      houseOwnership: (needyPerson as any).houseOwnership,
      rentAmount: (needyPerson as any).rentAmount,
      houseSize: (needyPerson as any).houseSize,
      utilityBill: (needyPerson as any).utilityBill,
      zakatEligible: (needyPerson as any).zakatEligible || false,
      // Step 3: Disease Information
      diseaseType: needyPerson.diseaseType,
      diseaseName: diseaseName,
      chronicDisease: (needyPerson as any).chronicDisease,
      otherDisease: (needyPerson as any).otherDisease,
      manualDisease: (needyPerson as any).manualDisease,
      testNeeded: (needyPerson as any).testNeeded,
      selectedTests: (needyPerson as any).selectedTests || [],
      description: needyPerson.description || '',
      hospitalName: (needyPerson as any).hospitalName || '',
      doctorName: (needyPerson as any).doctorName || '',
      amountNeeded: (needyPerson as any).amountNeeded || 0,
      document: (needyPerson as any).document,
      estimatedTotalCost: (needyPerson as any).amountNeeded || 0,
      priority: (needyPerson as any).priority || 'Medium',
      status: (needyPerson as any).status || 'pending',
      isZakatEligible: (needyPerson as any).zakatEligible || false,
      totalDonations: (needyPerson as any).totalDonations || 0,
      createdAt: (needyPerson as any).createdAt,
      updatedAt: (needyPerson as any).updatedAt,
    };

    // Remove sensitive information (password if exists)
    const { password, ...safeCase } = caseData as any;

    return NextResponse.json(
      {
        message: 'Case retrieved successfully',
        case: safeCase,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching case:', error);
    return NextResponse.json(
      {
        message: error.message || 'Failed to fetch case',
      },
      { status: 500 }
    );
  }
}

