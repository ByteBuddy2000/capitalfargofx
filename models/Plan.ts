import mongoose, { type Model, type Schema, type Types } from 'mongoose';

export type PlanStatus = 'ACTIVE' | 'INACTIVE';

export interface IPlan extends mongoose.Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  minimumAmount: number;
  maximumAmount: number;
  returnPercentage: number;
  durationHours: number;
  referralPercentage: number;
  principalReturn: boolean;
  description: string;
  status: PlanStatus;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const planSchema: Schema<IPlan> = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    minimumAmount: { type: Number, required: true, min: 0 },
    maximumAmount: { type: Number, default: 0, min: 0 },
    returnPercentage: { type: Number, required: true, min: 0 },
    durationHours: { type: Number, required: true, min: 1 },
    referralPercentage: { type: Number, default: 0, min: 0, max: 100 },
    principalReturn: { type: Boolean, default: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Plan: Model<IPlan> = mongoose.models.Plan || mongoose.model<IPlan>('Plan', planSchema);
