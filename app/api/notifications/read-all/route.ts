// API Route: POST /api/notifications/read-all
// Mark all notifications as read for a user

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { markAllNotificationsAsRead } from '@/lib/controllers/notification';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const { userId, userModel } = await request.json();

    if (!userId || !userModel) {
      return NextResponse.json(
        { message: 'User ID and user model are required' },
        { status: 400 }
      );
    }

    const count = await markAllNotificationsAsRead(
      userId,
      userModel as 'Donor' | 'NeedyPerson' | 'Admin'
    );

    return NextResponse.json(
      {
        message: `${count} notifications marked as read`,
        count,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json(
      {
        message: error.message || 'Failed to mark all notifications as read',
        count: 0,
      },
      { status: 500 }
    );
  }
}

