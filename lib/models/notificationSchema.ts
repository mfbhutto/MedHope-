import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true, // Index for faster queries
      refPath: 'userModel', // Dynamic reference
    },
    userModel: {
      type: String,
      required: true,
      enum: ['Donor', 'NeedyPerson', 'Admin'], // User type
    },
    type: {
      type: String,
      required: true,
      enum: [
        'case_submitted', // Case submitted - notify superadmin
        'case_approved', // Case approved - notify needy person
        'case_rejected', // Case rejected - notify needy person
        'donation_received', // Donation received - notify superadmin
        'donation_confirmed', // Donation confirmed - notify donor (optional)
      ],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      // Reference to case or donation ID
    },
    relatedType: {
      type: String,
      enum: ['case', 'donation'],
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, userModel: 1 });

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

