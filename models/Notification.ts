import mongoose, { type Model, type Schema, type Types } from 'mongoose';

export type NotificationType = 'DEPOSIT' | 'WITHDRAWAL' | 'INVESTMENT' | 'REFERRAL' | 'SECURITY' | 'SYSTEM';

export interface INotification extends mongoose.Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema: Schema<INotification> = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['DEPOSIT', 'WITHDRAWAL', 'INVESTMENT', 'REFERRAL', 'SECURITY', 'SYSTEM'], default: 'SYSTEM' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema);
