// models/User.ts
import mongoose, { type Model, type Schema, type Types } from 'mongoose';

export type UserRole = 'USER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';
export type KycStatus = 'VERIFIED' | 'PENDING' | 'UNVERIFIED';

export interface IUser extends mongoose.Document {
  _id: Types.ObjectId;
  fullName: string;
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  btcWallet: string;
  ethWallet: string;
  usdtWallet: string;
  uplineId: Types.ObjectId | null;
  uplineUsername: string | null;
  availableBalance: number;
  earningBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  referralEarnings: number;
  kycStatus: KycStatus;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true, lowercase: true, minlength: 3 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
    status: { type: String, enum: ['ACTIVE', 'SUSPENDED', 'BANNED'], default: 'ACTIVE' },
    btcWallet: { type: String, default: '' },
    ethWallet: { type: String, default: '' },
    usdtWallet: { type: String, default: '' },
    uplineId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    uplineUsername: { type: String, default: null },
    availableBalance: { type: Number, default: 0 },
    earningBalance: { type: Number, default: 0 },
    totalDeposits: { type: Number, default: 0 },
    totalWithdrawals: { type: Number, default: 0 },
    referralEarnings: { type: Number, default: 0 },
    kycStatus: { type: String, enum: ['VERIFIED', 'PENDING', 'UNVERIFIED'], default: 'PENDING' },
  },
  { timestamps: true },
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
