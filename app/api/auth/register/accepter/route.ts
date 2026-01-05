// API Route: POST /api/auth/register/accepter
// Register a new needy person (accepter)

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { createNeedyPerson, needyPersonExists } from '@/lib/controllers/needyPerson';
import { uploadFileToCloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Parse form data (multipart/form-data)
    const formData = await request.formData();

    // Extract Step 1: Personal Information
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const cnic = formData.get('cnic') as string;
    const district = formData.get('district') as string;
    const area = formData.get('area') as string;
    const manualArea = formData.get('manualArea') as string | null;
    const address = formData.get('address') as string;
    const phone = formData.get('phone') as string;
    const password = formData.get('password') as string;

    // Extract Step 2: Financial Information
    const age = parseInt(formData.get('age') as string);
    const maritalStatus = formData.get('maritalStatus') as 'single' | 'married';
    const numberOfChildren = formData.get('numberOfChildren')
      ? parseInt(formData.get('numberOfChildren') as string)
      : undefined;
    const firstChildAge = formData.get('firstChildAge')
      ? parseInt(formData.get('firstChildAge') as string)
      : undefined;
    const lastChildAge = formData.get('lastChildAge')
      ? parseInt(formData.get('lastChildAge') as string)
      : undefined;
    const salaryRange = formData.get('salaryRange') as string;
    const houseOwnership = formData.get('houseOwnership') as 'own' | 'rent';
    const rentAmount = formData.get('rentAmount')
      ? parseFloat(formData.get('rentAmount') as string)
      : undefined;
    const houseSize = formData.get('houseSize') as string;
    const zakatEligible = formData.get('zakatEligible') === 'true';
    const utilityBillFile = formData.get('utilityBill') as File | null;

    // Extract Step 3: Disease Information
    const diseaseType = formData.get('diseaseType') as 'chronic' | 'other' | 'medicine' | null;
    const chronicDisease = formData.get('chronicDisease') as string | null;
    const otherDisease = formData.get('otherDisease') as string | null;
    const manualDisease = formData.get('manualDisease') as string | null;
    const medicineDisease = formData.get('medicineDisease') as string | null;
    const medicineManualDisease = formData.get('medicineManualDisease') as string | null;
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
      !name ||
      !email ||
      !cnic ||
      !district ||
      !area ||
      !address ||
      !phone ||
      !password
    ) {
      return NextResponse.json(
        { message: 'All personal information fields are required' },
        { status: 400 }
      );
    }

    if (!age || !maritalStatus || !salaryRange || !houseOwnership || !houseSize) {
      return NextResponse.json(
        { message: 'All financial information fields are required' },
        { status: 400 }
      );
    }

    // Validate disease information based on case type
    if (diseaseType === 'medicine') {
      // For medicine type, validate medicine disease
      if (!medicineDisease || !description || !hospitalName || !doctorName || !amountNeeded) {
        return NextResponse.json(
          { message: 'All disease information fields are required' },
          { status: 400 }
        );
      }
      // Parse medicine diseases (comma-separated string)
      const medicineDiseasesList = medicineDisease.split(',').map(d => d.trim()).filter(d => d);
      if (medicineDiseasesList.length === 0) {
        return NextResponse.json(
          { message: 'Please select at least one disease' },
          { status: 400 }
        );
      }
      if (medicineDiseasesList.includes('Other') && !medicineManualDisease) {
        return NextResponse.json(
          { message: 'Please specify the disease name for "Other"' },
          { status: 400 }
        );
      }
    } else {
      // For test type, validate disease type
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
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if accepter already exists
    const exists = await needyPersonExists(email);
    if (exists) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 409 }
      );
    }

    // Handle file uploads - upload to Cloudinary
    let utilityBillPath: string | undefined;
    let documentPath: string | undefined;

    if (utilityBillFile && utilityBillFile.size > 0) {
      try {
        // Upload to Cloudinary
        const uploadResult = await uploadFileToCloudinary(utilityBillFile, 'utility-bills');
        utilityBillPath = uploadResult.secure_url;
      } catch (error) {
        console.error('Error uploading utility bill to Cloudinary:', error);
        return NextResponse.json(
          { message: 'Failed to save utility bill file. Please check Cloudinary configuration in .env file.' },
          { status: 500 }
        );
      }
    }

    if (documentFile && documentFile.size > 0) {
      try {
        // Upload to Cloudinary
        const uploadResult = await uploadFileToCloudinary(documentFile, 'documents');
        documentPath = uploadResult.secure_url;
      } catch (error) {
        console.error('Error uploading document to Cloudinary:', error);
        return NextResponse.json(
          { message: 'Failed to save document file. Please check Cloudinary configuration in .env file.' },
          { status: 500 }
        );
      }
    }

    // Determine disease name
    let diseaseName = '';
    if (diseaseType === 'medicine') {
      // Parse medicine diseases and format them
      const medicineDiseasesList = medicineDisease ? medicineDisease.split(',').map(d => d.trim()).filter(d => d) : [];
      const formattedDiseases = medicineDiseasesList.map(d => {
        if (d === 'Other' && medicineManualDisease) {
          return medicineManualDisease;
        }
        return d;
      });
      diseaseName = formattedDiseases.length > 0 ? formattedDiseases.join(', ') : 'Medicine Request';
    } else if (diseaseType === 'chronic') {
      diseaseName = chronicDisease || '';
    } else {
      diseaseName = otherDisease === 'Other' ? manualDisease || '' : otherDisease || '';
    }

    // Create needy person
    const needyPerson = await createNeedyPerson({
      // Step 1
      name,
      email,
      cnic,
      district,
      area: area || manualArea || '',
      manualArea: manualArea || undefined,
      address,
      phone,
      password,
      // Step 2
      age,
      maritalStatus,
      numberOfChildren,
      firstChildAge,
      lastChildAge,
      salaryRange,
      houseOwnership,
      rentAmount,
      houseSize,
      utilityBill: utilityBillPath,
      zakatEligible,
      // Step 3
      diseaseType: diseaseType === 'medicine' ? 'other' : diseaseType,
      chronicDisease: diseaseType === 'chronic' ? diseaseName : undefined,
      otherDisease: diseaseType === 'other' ? (otherDisease === 'Other' ? 'Other' : otherDisease || '') : (diseaseType === 'medicine' ? diseaseName : undefined),
      manualDisease: diseaseType === 'other' && otherDisease === 'Other' ? manualDisease || undefined : (diseaseType === 'medicine' && medicineDisease && medicineDisease.includes('Other') ? medicineManualDisease || undefined : undefined),
      testNeeded,
      selectedTests,
      description,
      hospitalName,
      doctorName,
      amountNeeded,
      document: documentPath,
    });

    // Remove password from response
    const { password: _, ...needyPersonWithoutPassword } = needyPerson;

    return NextResponse.json(
      {
        message: 'Registration successful',
        user: needyPersonWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Accepter registration error:', error);
    return NextResponse.json(
      {
        message: error.message || 'Registration failed',
      },
      { status: 500 }
    );
  }
}




