import mongoose, { type Model, type Schema, type Types } from 'mongoose';

export type InvestmentStatus = 'ACTIVE' | 'MATURED' | 'COMPLETED' | 'CANCELLED';

export interface IInvestment extends mongoose.Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  planId: Types.ObjectId;
  depositId: Types.ObjectId;
  amount: number;
  returnPercentage: number;
  expectedProfit: number;
  totalExpectedReturn: number;
  durationHours: number;
  startDate: Date;
  maturityDate: Date;
  status: InvestmentStatus;
  principalReturn: boolean;
  payoutProcessed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const investmentSchema: Schema<IInvestment> = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
    depositId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deposit', required: true, unique: true },
    amount: { type: Number, required: true, min: 0.01 },
    returnPercentage: { type: Number, required: true, min: 0 },
    expectedProfit: { type: Number, required: true, min: 0 },
    totalExpectedReturn: { type: Number, required: true, min: 0 },
    durationHours: { type: Number, required: true, min: 1 },
    startDate: { type: Date, required: true },
    maturityDate: { type: Date, required: true, index: true },
    status: { type: String, enum: ['ACTIVE', 'MATURED', 'COMPLETED', 'CANCELLED'], default: 'ACTIVE', index: true },
    principalReturn: { type: Boolean, default: true },
    payoutProcessed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Investment: Model<IInvestment> = mongoose.models.Investment || mongoose.model<IInvestment>('Investment', investmentSchema);
