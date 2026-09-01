import mongoose, { type Model, type Schema, type Types } from 'mongoose';

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'INVESTMENT' | 'PROFIT' | 'REFERRAL_COMMISSION' | 'REFUND' | 'ADJUSTMENT';
export type TransactionStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';

export interface ITransaction extends mongoose.Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: TransactionType;
  amount: number;
  asset: string;
  status: TransactionStatus;
  description: string;
  referenceId: Types.ObjectId | null;
  txHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema: Schema<ITransaction> = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['DEPOSIT', 'WITHDRAWAL', 'INVESTMENT', 'PROFIT', 'REFERRAL_COMMISSION', 'REFUND', 'ADJUSTMENT'], required: true },
    amount: { type: Number, required: true, min: 0 },
    asset: { type: String, default: 'USD' },
    status: { type: String, enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED', 'CANCELLED'], default: 'PENDING' },
    description: { type: String, required: true },
    referenceId: { type: mongoose.Schema.Types.ObjectId, default: null },
    txHash: { type: String, default: '' },
  },
  { timestamps: true },
);

transactionSchema.index({ userId: 1, createdAt: -1 });

export const Transaction: Model<ITransaction> = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', transactionSchema);
