import { NextRequest, NextResponse } from 'next/server';
import { sendContactEmail, verifyEmailConnection } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { name, email, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { message: 'All fields are required (name, email, message)' },
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

    // Verify email connection first (optional - can be removed for production)
    // Only verify if credentials are set to avoid unnecessary errors
    const hasCredentials = process.env.SMTP_USER && process.env.SMTP_APP_PASSWORD;
    if (hasCredentials) {
      const isConnected = await verifyEmailConnection();
      if (!isConnected) {
        console.warn('⚠️ Email server connection verification failed, but attempting to send anyway...');
      }
    }

    // Send email
    const result = await sendContactEmail({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    });

    return NextResponse.json(
      {
        message: 'Contact form submitted successfully',
        success: true,
        messageId: result.messageId,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Contact form API error:', error);
    return NextResponse.json(
      {
        message: error.message || 'Failed to send contact form. Please try again later.',
        success: false,
      },
      { status: 500 }
    );
  }
}

