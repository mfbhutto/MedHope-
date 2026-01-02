// API Route: GET /api/notifications
// Get user notifications

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getUserNotifications, getUnreadNotificationCount } from '@/lib/controllers/notification';
import { getStoredUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Get user from auth token/cookie (you'll need to implement this based on your auth system)
    // For now, we'll get it from query params, but ideally from session/cookie
    const userId = request.nextUrl.searchParams.get('userId');
    const userModel = request.nextUrl.searchParams.get('userModel') as 'Donor' | 'NeedyPerson' | 'Admin';
    const unreadOnly = request.nextUrl.searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');

    if (!userId || !userModel) {
      return NextResponse.json(
        { message: 'User ID and user model are required' },
        { status: 400 }
      );
    }

    const notifications = await getUserNotifications(userId, userModel, {
      limit,
      unreadOnly,
    });

    const unreadCount = await getUnreadNotificationCount(userId, userModel);

    return NextResponse.json(
      {
        message: 'Notifications retrieved successfully',
        notifications,
        unreadCount,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      {
        message: error.message || 'Failed to fetch notifications',
        notifications: [],
        unreadCount: 0,
      },
      { status: 500 }
    );
  }
}

