// API Route: POST /api/notifications/[id]/read
// Mark a notification as read

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { markNotificationAsRead } from '@/lib/controllers/notification';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const { id } = params;
    const { userId } = await request.json();

    if (!id || !userId) {
      return NextResponse.json(
        { message: 'Notification ID and user ID are required' },
        { status: 400 }
      );
    }

    const notification = await markNotificationAsRead(id, userId);

    if (!notification) {
      return NextResponse.json(
        { message: 'Notification not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Notification marked as read',
        notification,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      {
        message: error.message || 'Failed to mark notification as read',
      },
      { status: 500 }
    );
  }
}

