import { redirect } from 'next/navigation';
import { auth } from "@/auth";
import { connectToDatabase } from '@/lib/mongodb';
import { User as UserModel } from '@/models/User';
import DashboardClient from './DashboardClient';
import type { User } from '@/types';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/login');
  }

  await connectToDatabase();
  const storedUser = await UserModel.findById(session.user.id).select('-passwordHash').lean();

  if (!storedUser) redirect('/login');

  const user: User = {
    id: storedUser._id.toString(),
    fullName: storedUser.fullName,
    username: storedUser.username,
    email: storedUser.email,
    role: storedUser.role,
    status: storedUser.status,
    btcWallet: storedUser.btcWallet,
    ethWallet: storedUser.ethWallet,
    usdtWallet: storedUser.usdtWallet,
    uplineId: storedUser.uplineId?.toString() || null,
    uplineUsername: storedUser.uplineUsername,
    availableBalance: storedUser.availableBalance,
    earningBalance: storedUser.earningBalance,
    totalDeposits: storedUser.totalDeposits,
    totalWithdrawals: storedUser.totalWithdrawals,
    referralEarnings: storedUser.referralEarnings,
    kycStatus: storedUser.kycStatus,
    createdAt: storedUser.createdAt.toISOString(),
    updatedAt: storedUser.updatedAt.toISOString(),
    assets: [],
  };

  return <DashboardClient currentUser={user} />;
}