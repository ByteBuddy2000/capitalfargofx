import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import DashboardClient from './DashboardClient';
import type { User } from '@/types';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/login');
  }

  const user: User = {
    id: session.user.id,
    fullName: session.user.fullName || session.user.name?.split(' ')[0] || '',
    username: session.user.username || '',
    email: session.user.email,
    role: session.user.role,
    status: session.user.status || 'ACTIVE',
    btcWallet: session.user.btcWallet || '',
    ethWallet: session.user.ethWallet || '',
    usdtWallet: session.user.usdtWallet || '',
    uplineId: null,
    uplineUsername: session.user.uplineUsername,
    availableBalance: 0,
    earningBalance: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    referralEarnings: 0,
    createdAt: '',
    updatedAt: '',
  };

  return <DashboardClient currentUser={user} />;
}