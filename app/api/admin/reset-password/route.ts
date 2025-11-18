// API Route: POST /api/admin/reset-password
// Reset admin password (for fixing double-hashed passwords)

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getAdminByEmail } from '@/lib/controllers/admin';
import AdminModel from '@/lib/models/adminSchema';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { email, newPassword } = body;

    if (!email || !newPassword) {
      return NextResponse.json(
        { message: 'Email and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const admin = await getAdminByEmail(normalizedEmail);

    if (!admin) {
      return NextResponse.json(
        { message: 'Admin not found' },
        { status: 404 }
      );
    }

    // Hash the new password (only once)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update admin password directly (bypassing the pre-save hook to avoid double-hashing)
    await AdminModel.updateOne(
      { _id: admin._id },
      { $set: { password: hashedPassword } }
    );

    return NextResponse.json(
      {
        message: 'Password reset successfully',
        email: normalizedEmail,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      {
        message: error.message || 'Failed to reset password',
      },
      { status: 500 }
    );
  }
}

