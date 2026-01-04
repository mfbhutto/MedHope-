// API Route: POST /api/cases/submit
// Submit a new case for an existing registered needy person

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { createNeedyPerson, getNeedyPersonByEmail } from '@/lib/controllers/needyPerson';
import { notifyAllAdmins } from '@/lib/controllers/notification';
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

    // Extract case type and disease information (new case data)
    const caseType = formData.get('caseType') as 'medicine' | 'test' | null;
    const diseaseType = formData.get('diseaseType') as 'chronic' | 'other' | 'medicine' | null;
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
    const amountNeededStr = formData.get('amountNeeded') as string;
    const amountNeeded = amountNeededStr ? parseFloat(amountNeededStr) : 0;
    const documentFile = formData.get('document') as File | null;

    // Validate case type
    if (!caseType || (caseType !== 'medicine' && caseType !== 'test')) {
      return NextResponse.json(
        { message: 'Case type (medicine or test) is required' },
        { status: 400 }
      );
    }

    // Validate based on case type
    if (caseType === 'test') {
      // For test cases: diseaseType, selectedTests are required
      if (!diseaseType || (diseaseType !== 'chronic' && diseaseType !== 'other')) {
        return NextResponse.json(
          { message: 'Disease type is required for test cases' },
          { status: 400 }
        );
      }
      if (!selectedTests || selectedTests.length === 0) {
        return NextResponse.json(
          { message: 'At least one test must be selected' },
          { status: 400 }
        );
      }
      if (amountNeeded <= 0) {
        return NextResponse.json(
          { message: 'Amount needed is required' },
          { status: 400 }
        );
      }
    } else if (caseType === 'medicine') {
      // For medicine cases: description, hospitalName, doctorName, amountNeeded are required
      if (!description || !hospitalName || !doctorName || amountNeeded <= 0) {
        return NextResponse.json(
          { message: 'Description, hospital name, doctor name, and amount are required for medicine cases' },
          { status: 400 }
        );
      }
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

    // Determine disease name based on case type
    let diseaseName = '';
    if (caseType === 'test') {
      // For test cases, use the selected disease
      if (diseaseType === 'chronic') {
        diseaseName = chronicDisease || '';
      } else {
        diseaseName = otherDisease === 'Other' ? manualDisease || '' : otherDisease || '';
      }
    } else {
      // For medicine cases, use a generic name or the description
      diseaseName = 'Medicine/Treatment Request';
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
      diseaseType: caseType === 'test' ? diseaseType as 'chronic' | 'other' : 'other',
      chronicDisease: caseType === 'test' && diseaseType === 'chronic' ? diseaseName : undefined,
      otherDisease: caseType === 'test' && diseaseType === 'other' ? (otherDisease === 'Other' ? 'Other' : otherDisease || '') : (caseType === 'medicine' ? 'Medicine Request' : undefined),
      manualDisease: caseType === 'test' && otherDisease === 'Other' ? manualDisease || undefined : undefined,
      testNeeded: caseType === 'test',
      selectedTests: caseType === 'test' ? selectedTests : undefined,
      description,
      hospitalName,
      doctorName,
      amountNeeded,
      document: documentPath,
    });

    // Remove password from response
    const { password: _, ...caseWithoutPassword } = newCase;

    // Create notification for all superadmins
    try {
      const diseaseName = diseaseType === 'chronic' 
        ? (chronicDisease || 'Chronic Disease')
        : (otherDisease === 'Other' ? (manualDisease || 'Other Disease') : (otherDisease || 'Other Disease'));
      
      await notifyAllAdmins({
        type: 'case_submitted',
        title: 'New Case Submitted',
        message: `A new case has been submitted by ${existingUser.name} (${newCase.caseNumber}) - ${diseaseName}. Amount needed: PKR ${amountNeeded.toLocaleString()}`,
        relatedId: String(newCase._id),
        relatedType: 'case',
      });
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
      // Don't fail the case submission if notification fails
    }

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

