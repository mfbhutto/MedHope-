// API Route: GET /api/cases/my-cases
// Get all cases for the logged-in needy person

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getAllNeedyPersons } from '@/lib/controllers/needyPerson';

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Get user email from headers (set by auth middleware or from request)
    // For now, we'll get it from query params or headers
    const authHeader = request.headers.get('authorization');
    const userEmail = request.nextUrl.searchParams.get('email');

    // If no email provided, return empty array
    if (!userEmail) {
      return NextResponse.json(
        {
          message: 'User email is required',
          cases: [],
        },
        { status: 200 }
      );
    }

    // Find all cases for this user
    // Cases are linked by originalEmail field or exact email match
    // This includes:
    // 1. The original registration (email matches exactly, no originalEmail field)
    // 2. Additional cases (originalEmail field matches user's email)
    const normalizedEmail = userEmail.toLowerCase().trim();
    const filters: any = {
      $or: [
        { email: normalizedEmail }, // Original registration
        { originalEmail: normalizedEmail }, // Additional cases
      ],
      isActive: true,
    };

    // Get all cases for this user
    const needyPersons = await getAllNeedyPersons(filters, {
      sort: { createdAt: -1 }, // Newest first
    });

    // Transform needy persons to cases format
    const cases = needyPersons.map((person: any) => {
      // Get disease name
      let diseaseName = '';
      if (person.diseaseType === 'chronic') {
        diseaseName = person.chronicDisease || 'Chronic Disease';
      } else {
        if (person.otherDisease === 'Other') {
          diseaseName = person.manualDisease || 'Other Disease';
        } else {
          diseaseName = person.otherDisease || 'Other Disease';
        }
      }

      return {
        _id: person._id.toString(),
        caseNumber: person.caseNumber || `CASE-${person._id.toString().slice(-6)}`,
        estimatedTotalCost: person.amountNeeded || 0,
        isZakatEligible: person.zakatEligible || false,
        priority: person.priority || 'Medium',
        status: person.status || 'pending',
        diseaseType: person.diseaseType,
        diseaseName: diseaseName,
        description: person.description || '',
        district: person.district || '',
        area: person.area || '',
        labTests: person.selectedTests || [],
        hospitalName: person.hospitalName,
        doctorName: person.doctorName,
        totalDonations: person.totalDonations || 0,
        createdAt: person.createdAt,
      };
    });

    // Remove sensitive information
    const safeCases = cases.map((caseItem: any) => {
      const { password, ...safeCase } = caseItem;
      return safeCase;
    });

    return NextResponse.json(
      {
        message: 'Cases retrieved successfully',
        cases: safeCases,
        count: safeCases.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching user cases:', error);
    return NextResponse.json(
      {
        message: error.message || 'Failed to fetch cases',
        cases: [],
      },
      { status: 500 }
    );
  }
}

