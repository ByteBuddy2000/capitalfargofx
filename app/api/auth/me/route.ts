import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { User, type IUser } from '@/models/User';
import { Asset } from '@/models/Asset';

interface PublicUserData {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: string;
  status: string;
  btcWallet?: string;
  ethWallet?: string;
  usdtWallet?: string;
  uplineId?: string | null;
  uplineUsername?: string | null;
  availableBalance: number;
  earningBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  referralEarnings: number;
  kycStatus: string;
  createdAt: string;
  updatedAt: string;
  assets: Array<{
    id: string;
    symbol: string;
    availableBalance: number;
    lockedBalance: number;
    walletAddress: string;
  }>;
  [key: string]: unknown;
}

const publicUser = (user: IUser, assets: PublicUserData['assets']): PublicUserData => ({
  id: user._id.toString(),
  fullName: user.fullName,
  username: user.username,
  email: user.email,
  role: user.role,
  status: user.status,
  btcWallet: user.btcWallet,
  ethWallet: user.ethWallet,
  usdtWallet: user.usdtWallet,
  uplineId: user.uplineId?.toString() || null,
  uplineUsername: user.uplineUsername,
  availableBalance: user.availableBalance,
  earningBalance: user.earningBalance,
  totalDeposits: user.totalDeposits,
  totalWithdrawals: user.totalWithdrawals,
  referralEarnings: user.referralEarnings,
  kycStatus: user.kycStatus,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
  assets,
});

export async function GET(): Promise<NextResponse<{ user: PublicUserData } | { message: string }>> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const user = await User.findById(userId).select('-passwordHash').exec();

    if (!user) {
      return NextResponse.json({ message: 'User account not found.' }, { status: 404 });
    }

    const assets = await Asset.find({ userId: user._id }).sort({ symbol: 1 }).lean();
    return NextResponse.json({
      user: publicUser(user, assets.map(asset => ({
        id: asset._id.toString(),
        symbol: asset.symbol,
        availableBalance: asset.availableBalance,
        lockedBalance: asset.lockedBalance,
        walletAddress: asset.walletAddress,
      }))),
    }, { headers: { 'Cache-Control': 'private, no-store, max-age=0' } });
  } catch (error: unknown) {
    console.error('Failed to load authenticated user:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
};