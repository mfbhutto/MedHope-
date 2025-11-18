// API Route: POST /api/cases/submit
// Submit a new case for an existing registered needy person

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { createNeedyPerson, getNeedyPersonByEmail } from '@/lib/controllers/needyPerson';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Parse form data (multipart/form-data)
    const formData = await request.formData();

    // Get user email to find existing profile
    const email = formData.get('email') as string;
    if (!email) {
      return NextResponse.json(
        { message: 'User email is required' },
        { status: 400 }
      );
    }

    // Get existing user profile
    const existingUser = await getNeedyPersonByEmail(email);
    if (!existingUser) {
      return NextResponse.json(
        { message: 'User not found. Please register first.' },
        { status: 404 }
      );
    }

    // Extract disease information (new case data)
    const diseaseType = formData.get('diseaseType') as 'chronic' | 'other';
    const chronicDisease = formData.get('chronicDisease') as string | null;
    const otherDisease = formData.get('otherDisease') as string | null;
    const manualDisease = formData.get('manualDisease') as string | null;
    const testNeeded = formData.get('testNeeded') === 'true';
    const selectedTestsStr = formData.get('selectedTests') as string | null;
    const selectedTests = selectedTestsStr
      ? JSON.parse(selectedTestsStr)
      : undefined;
    const description = formData.get('description') as string;
    const hospitalName = formData.get('hospitalName') as string;
    const doctorName = formData.get('doctorName') as string;
    const amountNeeded = parseFloat(formData.get('amountNeeded') as string);
    const documentFile = formData.get('document') as File | null;

    // Validate required fields
    if (
      !diseaseType ||
      !description ||
      !hospitalName ||
      !doctorName ||
      !amountNeeded
    ) {
      return NextResponse.json(
        { message: 'All disease information fields are required' },
        { status: 400 }
      );
    }

    // Handle document file upload
    let documentPath: string | undefined;
    if (documentFile && documentFile.size > 0) {
      try {
        const timestamp = Date.now();
        const sanitizedName = documentFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${timestamp}-${sanitizedName}`;
        
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'documents');
        await mkdir(uploadsDir, { recursive: true });
        
        const filePath = join(uploadsDir, fileName);
        const bytes = await documentFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        await writeFile(filePath, buffer);
        
        documentPath = `/uploads/documents/${fileName}`;
      } catch (error) {
        console.error('Error saving document:', error);
        return NextResponse.json(
          { message: 'Failed to save document file' },
          { status: 500 }
        );
      }
    }

    // Determine disease name
    let diseaseName = '';
    if (diseaseType === 'chronic') {
      diseaseName = chronicDisease || '';
    } else {
      diseaseName = otherDisease === 'Other' ? manualDisease || '' : otherDisease || '';
    }

    // Create new case using existing user's personal and financial info
    // But with new disease information
    // Note: We need unique email/CNIC, so we'll append timestamp
    const timestamp = Date.now();
    const newCase = await createNeedyPerson({
      // Use existing user's personal info with unique identifiers
      name: existingUser.name,
      email: `${existingUser.email.split('@')[0]}+case${timestamp}@${existingUser.email.split('@')[1] || 'temp.com'}`, // Unique email
      originalEmail: existingUser.email, // Store original email to link cases
      cnic: `${existingUser.cnic}-${timestamp}`, // Unique CNIC
      district: existingUser.district,
      area: existingUser.area,
      manualArea: existingUser.manualArea,
      address: existingUser.address,
      phone: existingUser.phone,
      password: 'temp' + timestamp, // Temporary password
      
      // Use existing user's financial info
      age: existingUser.age,
      maritalStatus: existingUser.maritalStatus,
      numberOfChildren: existingUser.numberOfChildren,
      firstChildAge: existingUser.firstChildAge,
      lastChildAge: existingUser.lastChildAge,
      salaryRange: existingUser.salaryRange,
      houseOwnership: existingUser.houseOwnership,
      rentAmount: existingUser.rentAmount,
      houseSize: existingUser.houseSize,
      utilityBill: existingUser.utilityBill, // Reuse existing utility bill
      zakatEligible: existingUser.zakatEligible,
      
      // New disease information
      diseaseType,
      chronicDisease: diseaseType === 'chronic' ? diseaseName : undefined,
      otherDisease: diseaseType === 'other' ? diseaseName : undefined,
      manualDisease: otherDisease === 'Other' ? manualDisease || undefined : undefined,
      testNeeded,
      selectedTests,
      description,
      hospitalName,
      doctorName,
      amountNeeded,
      document: documentPath,
    });

    // Remove password from response
    const { password: _, ...caseWithoutPassword } = newCase;

    return NextResponse.json(
      {
        message: 'Case submitted successfully',
        case: caseWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Case submission error:', error);
    return NextResponse.json(
      {
        message: error.message || 'Failed to submit case',
      },
      { status: 500 }
    );
  }
}

