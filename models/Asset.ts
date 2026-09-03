import mongoose, { type Model, type Schema, type Types } from 'mongoose';

export const ASSET_SYMBOLS = ['BTC', 'ETH', 'USDT'] as const;
export type AssetSymbol = (typeof ASSET_SYMBOLS)[number];

export interface IAsset extends mongoose.Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  symbol: AssetSymbol;
  availableBalance: number;
  lockedBalance: number;
  walletAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

const assetSchema: Schema<IAsset> = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    symbol: { type: String, enum: ASSET_SYMBOLS, required: true },
    availableBalance: { type: Number, default: 0, min: 0 },
    lockedBalance: { type: Number, default: 0, min: 0 },
    walletAddress: { type: String, default: '', trim: true },
  },
  { timestamps: true },
);

assetSchema.index({ userId: 1, symbol: 1 }, { unique: true });

export const Asset: Model<IAsset> = mongoose.models.Asset || mongoose.model<IAsset>('Asset', assetSchema);