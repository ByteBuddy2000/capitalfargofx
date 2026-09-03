import mongoose, { type Model, type Schema, type Types } from 'mongoose';

export type DepositAsset = 'BTC' | 'ETH' | 'USDT';
export type DepositStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface IDeposit extends mongoose.Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  planId: Types.ObjectId;
  amount: number;
  asset: DepositAsset;
  network: string;
  receivingAddress: string;
  txHash: string;
  status: DepositStatus;
  adminNotes: string;
  approvedAt?: Date | null;
  rejectedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const depositSchema: Schema<IDeposit> = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
    amount: { type: Number, required: true, min: 0.01 },
    asset: { type: String, enum: ['BTC', 'ETH', 'USDT'], required: true },
    network: { type: String, required: true, trim: true, minlength: 2 },
    receivingAddress: { type: String, required: true, trim: true, minlength: 10 },
    txHash: { type: String, required: true, trim: true, minlength: 10, maxlength: 200 },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING', index: true },
    adminNotes: { type: String, default: '' },
    approvedAt: { type: Date, default: null },
    rejectedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

depositSchema.index({ userId: 1, createdAt: -1 });
depositSchema.index({ txHash: 1 }, { unique: true });

export const Deposit: Model<IDeposit> = mongoose.models.Deposit || mongoose.model<IDeposit>('Deposit', depositSchema);
