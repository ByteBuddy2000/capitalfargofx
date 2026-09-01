import mongoose, { type Model, type Schema, type Types } from 'mongoose';

export type ReferralStatus = 'ACTIVE' | 'INACTIVE';

export interface IReferral extends mongoose.Document {
  _id: Types.ObjectId;
  referrerId: Types.ObjectId;
  referredUserId: Types.ObjectId;
  totalDeposits: number;
  commissionsEarned: number;
  level: number;
  status: ReferralStatus;
  createdAt: Date;
  updatedAt: Date;
}

const referralSchema: Schema<IReferral> = new mongoose.Schema(
  {
    referrerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    referredUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    totalDeposits: { type: Number, default: 0, min: 0 },
    commissionsEarned: { type: Number, default: 0, min: 0 },
    level: { type: Number, default: 1, min: 1 },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true },
);

export const Referral: Model<IReferral> = mongoose.models.Referral || mongoose.model<IReferral>('Referral', referralSchema);
