// API Route: POST /api/donations and GET /api/donations
// Create a new donation or get donations

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { incrementDonorStats, getDonorByEmail } from '@/lib/controllers/donor';
import DonationModel from '@/lib/models/donationSchema';
import NeedyPersonModel from '@/lib/models/needyPersonSchema';
import { createDocument, findDocuments } from '@/lib/db';
import { notifyAllAdmins } from '@/lib/controllers/notification';

export async function POST(request: NextRequest) {
  console.log('=== POST /api/donations called ===');
  try {
    // Connect to database
    await connectToDatabase();
    console.log('Database connected');

    // Parse request body
    const body = await request.json();
    console.log('Request body received:', {
      caseId: body.caseId,
      amount: body.amount,
      paymentMethod: body.paymentMethod,
      donorEmail: body.donorEmail,
    });
    
    const { caseId, amount, paymentMethod, paymentId, transactionId, isZakatDonation, donorEmail } = body;

    // Validate required fields
    if (!caseId || !amount || !paymentMethod) {
      return NextResponse.json(
        { message: 'Case ID, amount, and payment method are required' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { message: 'Donation amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Get donor from email (sent from frontend)
    // The frontend should send the donor's email from getStoredUser()
    if (!donorEmail) {
      return NextResponse.json(
        { message: 'Donor email is required' },
        { status: 400 }
      );
    }

    const donor = await getDonorByEmail(donorEmail);
    if (!donor || !donor._id) {
      console.error('Donor not found for email:', donorEmail);
      return NextResponse.json(
        { message: 'Donor not found' },
        { status: 404 }
      );
    }

    console.log('Donor found:', donor._id, 'Current stats:', {
      totalDonations: donor.totalDonations,
      totalAmountDonated: donor.totalAmountDonated,
      casesHelped: donor.casesHelped,
    });

    // Create donation record
    // Convert donor._id to string (handles both ObjectId and string)
    const donorIdString = String(donor._id);

  

    console.log('Donor ID conversion:', {
      original: donor._id,
      type: typeof donor._id,
      converted: donorIdString,
    });

    const donationData = {
      donorId: donorIdString,
      caseId: caseId,
      amount: amount,
      paymentMethod: paymentMethod,
      paymentId: paymentId || undefined,
      transactionId: transactionId || undefined,
      isZakatDonation: isZakatDonation || false,
      status: 'completed' as const,
    };

    // Check if this is the first donation to this case (before creating this one)
    const existingDonationsBefore = await DonationModel.find({
      donorId: donorIdString,
      caseId: caseId,
    });

    const isFirstDonationToCase = existingDonationsBefore.length === 0; // No previous donations to this case

    console.log('Creating donation with data:', donationData);
    
    // Try creating the donation directly with the model to catch any errors
    let donation;
    try {
      donation = await createDocument(DonationModel, donationData);
      console.log('Donation created successfully via createDocument:', {
        _id: donation._id,
        donorId: donation.donorId,
        caseId: donation.caseId,
        amount: donation.amount,
      });
    } catch (createError: any) {
      console.error('Error in createDocument:', createError);
      // Try creating directly with the model
      try {
        const newDonation = new DonationModel(donationData);
        const saved = await newDonation.save();
        donation = saved.toObject();
        console.log('Donation created successfully via direct model save:', {
          _id: donation._id,
          donorId: donation.donorId,
        });
      } catch (directError: any) {
        console.error('Error in direct model save:', directError);
        throw directError;
      }
    }
    
    // Verify the donation was saved correctly
    try {
      const verifyDonation = await DonationModel.findById(donation._id).lean().exec();
      console.log('Verified donation in DB:', {
        _id: verifyDonation?._id,
        donorId: verifyDonation?.donorId,
        donorIdType: typeof verifyDonation?.donorId,
        caseId: verifyDonation?.caseId,
        amount: verifyDonation?.amount,
      });
      
      // Also verify by querying with the donorId we just used
      const testQuery = await DonationModel.find({ donorId: donorIdString }).lean().exec();
      console.log('Test query with donorIdString:', testQuery.length, 'donations found');
    } catch (verifyError) {
      console.error('Error verifying donation:', verifyError);
    }

    console.log('Updating donor stats:', {
      donorId: donorIdString,
      isFirstDonationToCase,
      amount,
      existingDonationsCount: existingDonationsBefore.length,
      currentDonorStats: {
        totalDonations: donor.totalDonations || 0,
        totalAmountDonated: donor.totalAmountDonated || 0,
        casesHelped: donor.casesHelped || 0,
      },
    });

    const updatedDonor = await incrementDonorStats(donorIdString, {
      totalDonations: 1,
      totalAmountDonated: amount,
      casesHelped: isFirstDonationToCase ? 1 : 0, // Only increment if this is the first donation to this case
    });

    if (updatedDonor) {
      console.log('Donor stats updated:', {
        totalDonations: updatedDonor.totalDonations,
        totalAmountDonated: updatedDonor.totalAmountDonated,
        casesHelped: updatedDonor.casesHelped,
      });
    } else {
      console.error('Failed to update donor stats');
    }

    // Update needy person's total donations
    try {
      await NeedyPersonModel.findByIdAndUpdate(
        caseId,
        { $inc: { totalDonations: amount } },
        { new: true }
      );
    } catch (error) {
      console.error('Error updating needy person donations:', error);
      // Don't fail the donation, just log the error
    }

    // Create notification for all superadmins
    try {
      const needyPerson = await NeedyPersonModel.findById(caseId).lean();
      const caseNumber = (needyPerson as any)?.caseNumber || 'N/A';
      const needyPersonName = (needyPerson as any)?.name || 'Unknown';
      
      await notifyAllAdmins({
        type: 'donation_received',
        title: 'New Donation Received',
        message: `A donation of PKR ${amount.toLocaleString()} has been received from ${donor.name} for case ${caseNumber} (${needyPersonName})`,
        relatedId: String(donation._id),
        relatedType: 'donation',
      });
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
      // Don't fail the donation if notification fails
    }

    // Remove sensitive information from response
    const { __v, ...donationResponse } = donation as any;

    return NextResponse.json(
      {
        message: 'Donation created successfully',
        donation: donationResponse,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('=== DONATION CREATION ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      {
        message: error.message || 'Failed to create donation',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Get donor email from query params
    const donorEmail = request.nextUrl.searchParams.get('donorEmail');
    
    if (!donorEmail) {
      return NextResponse.json(
        { message: 'Donor email is required' },
        { status: 400 }
      );
    }

    // Get donor by email
    const donor = await getDonorByEmail(donorEmail);
    if (!donor || !donor._id) {
      return NextResponse.json(
        { message: 'Donor not found' },
        { status: 404 }
      );
    }

    // Convert donor._id to string - ensure consistent format
    let donorIdString: string;
    donorIdString = String(donor._id);
    
    // Remove any whitespace and ensure it's a valid ID
    donorIdString = donorIdString.trim();
    
    console.log('GET: Donor ID for query:', {
      original: donor._id,
      converted: donorIdString,
      type: typeof donorIdString,
    });

    console.log('Querying donations for donorId:', donorIdString, 'Type:', typeof donorIdString);
    
    // Get all donations for this donor
    // Try multiple query formats to handle different ID formats
    let donations = await findDocuments(DonationModel, 
      { donorId: donorIdString },
      { 
        sort: { createdAt: -1 }, 
        limit: 20 
      }
    );

    console.log('Found donations with string match:', donations.length);

    // If no donations found, try with ObjectId format
    if (donations.length === 0 && donor._id) {
      try {
        const mongoose = require('mongoose');
        const donorObjectId = typeof donor._id === 'string' 
          ? new mongoose.Types.ObjectId(donor._id)
          : donor._id;
        
        donations = await findDocuments(DonationModel, 
          { donorId: donorObjectId.toString() },
          { 
            sort: { createdAt: -1 }, 
            limit: 20 
          }
        );
        console.log('Found donations with ObjectId match:', donations.length);
      } catch (error) {
        console.error('Error trying ObjectId query:', error);
      }
    }

    // Debug: Check all donations to see what donorIds exist
    if (donations.length === 0) {
      const allDonations = await DonationModel.find({}).limit(10).lean().exec();
      console.log('Sample donations in DB (first 10):', allDonations.map((d: any) => ({
        _id: d._id,
        donorId: d.donorId,
        donorIdType: typeof d.donorId,
        amount: d.amount,
        caseId: d.caseId,
      })));
    }

    console.log('Final donations count:', donations.length);

    // Get case details for each donation
    const donationsWithCases = await Promise.all(
      donations.map(async (donation: any) => {
        try {
          const needyPerson = await NeedyPersonModel.findById(donation.caseId);
          return {
            _id: donation._id,
            amount: donation.amount,
            paymentMethod: donation.paymentMethod,
            isZakatDonation: donation.isZakatDonation,
            status: donation.status,
            createdAt: donation.createdAt,
            caseNumber: needyPerson?.caseNumber || 'N/A',
            caseId: donation.caseId,
          };
        } catch (error) {
          return {
            _id: donation._id,
            amount: donation.amount,
            paymentMethod: donation.paymentMethod,
            isZakatDonation: donation.isZakatDonation,
            status: donation.status,
            createdAt: donation.createdAt,
            caseNumber: 'N/A',
            caseId: donation.caseId,
          };
        }
      })
    );

    return NextResponse.json(
      {
        message: 'Donations retrieved successfully',
        donations: donationsWithCases,
        count: donationsWithCases.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching donations:', error);
    return NextResponse.json(
      {
        message: error.message || 'Failed to fetch donations',
        donations: [],
      },
      { status: 500 }
    );
  }
}

