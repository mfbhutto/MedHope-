// API Route: GET /api/cases
// Get verified/accepted cases for public view (Patient Cases section)

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getAllNeedyPersons } from '@/lib/controllers/needyPerson';

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '6'); // Default to 6 for homepage
    const skip = parseInt(searchParams.get('skip') || '0');
    const service = searchParams.get('service'); // Filter by service type: 'medicine', 'laboratory', 'chronic'

    // Build filters - show only accepted cases on public pages
    // Pending cases need admin approval first
    const filters: any = {
      isActive: true,
      status: 'accepted', // Only show approved cases
    };

    // Filter by service type
    if (service === 'chronic') {
      // Chronic Disease: diseaseType must be 'chronic'
      filters.diseaseType = 'chronic';
    } else if (service === 'laboratory') {
      // Laboratory: cases that need lab tests (testNeeded is true AND has selectedTests)
      filters.$and = [
        { testNeeded: true },
        { 
          $or: [
            { selectedTests: { $exists: true, $ne: [] } },
            { selectedTests: { $not: { $size: 0 } } }
          ]
        }
      ];
    } else if (service === 'medicine') {
      // Medicine: cases that don't primarily need lab tests
      // Cases where testNeeded is false, or testNeeded is true but no selectedTests
      filters.$or = [
        { testNeeded: false },
        { testNeeded: { $exists: false } },
        { 
          $and: [
            { testNeeded: true },
            { 
              $or: [
                { selectedTests: { $exists: false } },
                { selectedTests: { $size: 0 } },
                { selectedTests: [] }
              ]
            }
          ]
        }
      ];
    }

    // Get needy persons (cases) from database
    const needyPersons = await getAllNeedyPersons(filters, {
      limit,
      skip,
      sort: { priority: 1, createdAt: -1 }, // Sort by priority (High first) and newest first
    });

    // Transform needy persons to cases format for PatientCases component
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

      // Transform to case format
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
        // Additional fields that might be useful
        name: person.name,
        age: person.age,
        hospitalName: person.hospitalName,
        doctorName: person.doctorName,
      };
    });

    // Remove sensitive information (password, etc.)
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
    console.error('Error fetching cases:', error);
    return NextResponse.json(
      {
        message: error.message || 'Failed to fetch cases',
        cases: [],
      },
      { status: 500 }
    );
  }
}

