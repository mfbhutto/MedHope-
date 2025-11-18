// API Route: GET /api/admin/pending-cases
// Get all pending cases for superadmin review

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getAllNeedyPersons } from '@/lib/controllers/needyPerson';
import { getAdminByEmail } from '@/lib/controllers/admin';

export async function GET(request: NextRequest) {
  try {
    // Connect to database first
    await connectToDatabase();

    // Get admin email from query params
    const searchParams = request.nextUrl.searchParams;
    const adminEmail = searchParams.get('adminEmail');

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

    // Get status filter
    const status = searchParams.get('status') || 'pending'; // pending, accepted, rejected, or all

    // Build filters
    const filters: any = {
      isActive: true,
    };

    if (status !== 'all') {
      filters.status = status;
    }

    // Get needy persons (cases) from database
    const needyPersons = await getAllNeedyPersons(filters, {
      sort: { createdAt: -1 }, // Newest first
    });

    // Transform needy persons to cases format
    const cases = needyPersons.map((person) => ({
      _id: person._id,
      caseNumber: person.caseNumber,
      name: person.name,
      email: person.email,
      phone: person.phone,
      district: person.district,
      area: person.area,
      diseaseType: person.diseaseType,
      diseaseName: person.chronicDisease || person.otherDisease || person.manualDisease,
      description: person.description,
      hospitalName: person.hospitalName,
      doctorName: person.doctorName,
      estimatedTotalCost: person.amountNeeded,
      priority: person.priority,
      status: person.status,
      isZakatEligible: person.zakatEligible,
      createdAt: person.createdAt,
      updatedAt: person.updatedAt,
    }));

    return NextResponse.json(
      {
        cases,
        total: cases.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching pending cases:', error);
    return NextResponse.json(
      {
        message: error.message || 'Failed to fetch cases',
      },
      { status: 500 }
    );
  }
}

