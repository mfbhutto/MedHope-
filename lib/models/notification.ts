import { Types } from 'mongoose';

export interface Notification {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  userModel: 'Donor' | 'NeedyPerson' | 'Admin';
  type: 'case_submitted' | 'case_approved' | 'case_rejected' | 'donation_received' | 'donation_confirmed';
  title: string;
  message: string;
  relatedId?: Types.ObjectId;
  relatedType?: 'case' | 'donation';
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationData {
  userId: Types.ObjectId | string;
  userModel: 'Donor' | 'NeedyPerson' | 'Admin';
  type: Notification['type'];
  title: string;
  message: string;
  relatedId?: Types.ObjectId | string;
  relatedType?: 'case' | 'donation';
}

