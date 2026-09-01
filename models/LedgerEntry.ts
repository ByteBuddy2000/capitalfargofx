import mongoose, { type Model, type Schema, type Types } from 'mongoose';
import type { TransactionType } from './Transaction';

export type LedgerDirection = 'CREDIT' | 'DEBIT';
export type LedgerReferenceType = 'DEPOSIT' | 'WITHDRAWAL' | 'INVESTMENT' | 'REFERRAL' | 'ADMIN_ADJUSTMENT';

export interface ILedgerEntry extends mongoose.Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: TransactionType;
  amount: number;
  asset: string;
  direction: LedgerDirection;
  referenceType: LedgerReferenceType;
  referenceId: Types.ObjectId;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

const ledgerEntrySchema: Schema<ILedgerEntry> = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['DEPOSIT', 'WITHDRAWAL', 'INVESTMENT', 'PROFIT', 'REFERRAL_COMMISSION', 'REFUND', 'ADJUSTMENT'], required: true },
    amount: { type: Number, required: true, min: 0 },
    asset: { type: String, default: 'USD' },
    direction: { type: String, enum: ['CREDIT', 'DEBIT'], required: true },
    referenceType: { type: String, enum: ['DEPOSIT', 'WITHDRAWAL', 'INVESTMENT', 'REFERRAL', 'ADMIN_ADJUSTMENT'], required: true },
    referenceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    description: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true },
);

ledgerEntrySchema.index({ userId: 1, createdAt: -1 });

export const LedgerEntry: Model<ILedgerEntry> = mongoose.models.LedgerEntry || mongoose.model<ILedgerEntry>('LedgerEntry', ledgerEntrySchema);
