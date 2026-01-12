// API Route: POST /api/auth/register/volunteer
// Register a new volunteer

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { createVolunteer, volunteerExists } from '@/lib/controllers/volunteer';
import { uploadFileToCloudinary } from '@/lib/cloudinary';
import VolunteerModel from '@/lib/models/volunteerSchema';
import { findOneDocument } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Parse form data (multipart/form-data)
    const formData = await request.formData();
    
    // Extract text fields
    const name = formData.get('name');
    const email = formData.get('email');
    const address = formData.get('address');
    const phone = formData.get('phone');
    const cnic = formData.get('cnic');
    const password = formData.get('password');
    const role = formData.get('role');
    
    // Extract files
    const cnicFrontFile = formData.get('cnicFront');
    const cnicBackFile = formData.get('cnicBack');
    
    // Type assertions and validation
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { message: 'Name is required' },
        { status: 400 }
      );
    }
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }
    if (!address || typeof address !== 'string') {
      return NextResponse.json(
        { message: 'Address is required' },
        { status: 400 }
      );
    }
    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { message: 'Phone is required' },
        { status: 400 }
      );
    }
    if (!cnic || typeof cnic !== 'string') {
      return NextResponse.json(
        { message: 'CNIC is required' },
        { status: 400 }
      );
    }
    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { message: 'Password is required' },
        { status: 400 }
      );
    }
    
    const roleString: 'volunteer' = 'volunteer'; // Always 'volunteer' for volunteer registration
    const cnicFrontFileTyped = cnicFrontFile instanceof File ? cnicFrontFile : null;
    const cnicBackFileTyped = cnicBackFile instanceof File ? cnicBackFile : null;

    // Validate CNIC format
    const cnicRegex = /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/;
    if (!cnicRegex.test(cnic)) {
      return NextResponse.json(
        { message: 'Invalid CNIC format. Use format: 12345-1234567-1' },
        { status: 400 }
      );
    }

    // Validate CNIC images are provided
    if (!cnicFrontFileTyped || !cnicBackFileTyped || cnicFrontFileTyped.size === 0 || cnicBackFileTyped.size === 0) {
      return NextResponse.json(
        { message: 'Both CNIC front and back images are required' },
        { status: 400 }
      );
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

    // Validate phone number format
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { message: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Validate phone number contains only valid characters (no letters)
    if (/[a-zA-Z]/.test(phone)) {
      return NextResponse.json(
        { message: 'Phone number cannot contain letters' },
        { status: 400 }
      );
    }

    // Validate phone number digit count (10-15 digits)
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      return NextResponse.json(
        { message: 'Phone number must contain at least 10 digits' },
        { status: 400 }
      );
    }
    if (digitsOnly.length > 15) {
      return NextResponse.json(
        { message: 'Phone number cannot exceed 15 digits' },
        { status: 400 }
      );
    }

    // Check if volunteer already exists by email
    const existsByEmail = await volunteerExists(email);
    if (existsByEmail) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 409 }
      );
    }

    // Check if CNIC already exists
    const existsByCnic = await findOneDocument(VolunteerModel, { cnic: cnic.trim() });
    if (existsByCnic) {
      return NextResponse.json(
        { message: 'CNIC already registered' },
        { status: 409 }
      );
    }

    // Handle file uploads - upload to Cloudinary
    let cnicFrontUrl: string | undefined;
    let cnicBackUrl: string | undefined;

    if (cnicFrontFileTyped && cnicFrontFileTyped.size > 0) {
      try {
        // Upload to Cloudinary
        const uploadResult = await uploadFileToCloudinary(cnicFrontFileTyped, 'volunteer-cnic');
        cnicFrontUrl = uploadResult.secure_url;
      } catch (error) {
        console.error('Error uploading CNIC front to Cloudinary:', error);
        return NextResponse.json(
          { message: 'Failed to save CNIC front image. Please check Cloudinary configuration in .env file.' },
          { status: 500 }
        );
      }
    }

    if (cnicBackFileTyped && cnicBackFileTyped.size > 0) {
      try {
        // Upload to Cloudinary
        const uploadResult = await uploadFileToCloudinary(cnicBackFileTyped, 'volunteer-cnic');
        cnicBackUrl = uploadResult.secure_url;
      } catch (error) {
        console.error('Error uploading CNIC back to Cloudinary:', error);
        return NextResponse.json(
          { message: 'Failed to save CNIC back image. Please check Cloudinary configuration in .env file.' },
          { status: 500 }
        );
      }
    }

    // Create volunteer
    const volunteer = await createVolunteer({
      name,
      email,
      address,
      phone,
      cnic,
      cnicFront: cnicFrontUrl,
      cnicBack: cnicBackUrl,
      password,
      role: roleString,
    });

    // Remove password from response
    const { password: _, ...volunteerWithoutPassword } = volunteer;

    return NextResponse.json(
      {
        message: 'Volunteer registered successfully',
        user: volunteerWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Volunteer registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Registration failed';
    return NextResponse.json(
      {
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

