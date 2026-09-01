import mongoose, { type Model, type Schema, type Types } from 'mongoose';

export type WithdrawalAsset = 'BTC' | 'ETH' | 'USDT';
export type WithdrawalStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';

export interface IWithdrawal extends mongoose.Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  amount: number;
  asset: WithdrawalAsset;
  network: string;
  destinationAddress: string;
  status: WithdrawalStatus;
  txHash: string;
  adminNotes: string;
  processedAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const withdrawalSchema: Schema<IWithdrawal> = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0.01 },
    asset: { type: String, enum: ['BTC', 'ETH', 'USDT'], required: true },
    network: { type: String, required: true, trim: true },
    destinationAddress: { type: String, required: true, trim: true },
    status: { type: String, enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED'], default: 'PENDING', index: true },
    txHash: { type: String, default: '' },
    adminNotes: { type: String, default: '' },
    processedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

withdrawalSchema.index({ userId: 1, createdAt: -1 });

export const Withdrawal: Model<IWithdrawal> = mongoose.models.Withdrawal || mongoose.model<IWithdrawal>('Withdrawal', withdrawalSchema);
