import NotificationModel from '@/lib/models/notificationSchema';
import { CreateNotificationData, Notification } from '@/lib/models/notification';
import { Types } from 'mongoose';

/**
 * Create a new notification
 */
export async function createNotification(data: CreateNotificationData): Promise<Notification> {
  const notification = new NotificationModel({
    userId: new Types.ObjectId(data.userId),
    userModel: data.userModel,
    type: data.type,
    title: data.title,
    message: data.message,
    relatedId: data.relatedId ? new Types.ObjectId(data.relatedId) : undefined,
    relatedType: data.relatedType,
  });

  return await notification.save();
}

/**
 * Get all notifications for a user
 */
export async function getUserNotifications(
  userId: string | Types.ObjectId,
  userModel: 'Donor' | 'NeedyPerson' | 'Admin',
  options: { limit?: number; unreadOnly?: boolean } = {}
): Promise<Notification[]> {
  const query: any = {
    userId: new Types.ObjectId(userId),
    userModel,
  };

  if (options.unreadOnly) {
    query.isRead = false;
  }

  const notifications = await NotificationModel
    .find({ userId })
    .lean<Notification[]>();

  return notifications;

}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(
  userId: string | Types.ObjectId,
  userModel: 'Donor' | 'NeedyPerson' | 'Admin'
): Promise<number> {
  return await NotificationModel.countDocuments({
    userId: new Types.ObjectId(userId),
    userModel,
    isRead: false,
  });
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(
  notificationId: string | Types.ObjectId,
  userId: string | Types.ObjectId
): Promise<Notification | null> {
  const notification = await NotificationModel.findOneAndUpdate(
    {
      _id: new Types.ObjectId(notificationId),
      userId: new Types.ObjectId(userId),
    },
    {
      isRead: true,
      readAt: new Date(),
    },
    { new: true }
  ).lean();

  return notification as Notification | null;
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(
  userId: string | Types.ObjectId,
  userModel: 'Donor' | 'NeedyPerson' | 'Admin'
): Promise<number> {
  const result = await NotificationModel.updateMany(
    {
      userId: new Types.ObjectId(userId),
      userModel,
      isRead: false,
    },
    {
      isRead: true,
      readAt: new Date(),
    }
  );

  return result.modifiedCount;
}

/**
 * Create notification for all superadmins (when case is submitted or donation is made)
 */
export async function notifyAllAdmins(data: {
  type: 'case_submitted' | 'donation_received';
  title: string;
  message: string;
  relatedId?: string | Types.ObjectId;
  relatedType?: 'case' | 'donation';
}): Promise<void> {
  // Get all active admins/superadmins
  const AdminModel = (await import('@/lib/models/adminSchema')).default;
  const admins = await AdminModel.find({ isActive: true }).select('_id').lean();

  // Create notification for each admin
  const notifications = admins.map((admin) => ({
    userId: admin._id,
    userModel: 'Admin' as const,
    type: data.type,
    title: data.title,
    message: data.message,
    relatedId: data.relatedId ? new Types.ObjectId(data.relatedId) : undefined,
    relatedType: data.relatedType,
  }));

  if (notifications.length > 0) {
    await NotificationModel.insertMany(notifications);
  }
}

