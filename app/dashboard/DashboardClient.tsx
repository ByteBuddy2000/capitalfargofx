'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { DashboardLayout, type DashboardTab } from '@/components/dashboard/DashboardLayout';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { DepositView } from '@/components/dashboard/DepositView';
import { WithdrawView } from '@/components/dashboard/WithdrawView';
import { InvestmentsView } from '@/components/dashboard/InvestmentsView';
import { TransactionsView } from '@/components/dashboard/TransactionsView';
import { ReferralsView } from '@/components/dashboard/ReferralsView';
import { AccountView } from '@/components/dashboard/AccountView';
import { SupportView } from '@/components/dashboard/SupportView';
import { ToastProvider } from '@/components/ui/Toast';
import type { User } from '@/types';
import { authApi } from '@/lib/api';

interface DashboardClientProps {
  currentUser: User;
}

export default function DashboardClient({ currentUser: initialUser }: DashboardClientProps) {
  const [currentUser, setCurrentUser] = useState(initialUser);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  useEffect(() => {
    void authApi.me().then(setCurrentUser).catch(() => undefined);
  }, []);

  const refreshUser = () => {
    void authApi.me().then(setCurrentUser).catch(() => undefined);
  };

  const logout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <ToastProvider>
      <DashboardLayout
        currentUser={currentUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={logout}
        onNavigateAdmin={() => window.location.assign('/admin')}
        onNavigateLanding={() => window.location.assign('/')}
      >
        {activeTab === 'overview' && <DashboardOverview currentUser={currentUser} onNavigateTab={setActiveTab} />}
        {activeTab === 'deposit' && (
          <DepositView
            currentUser={currentUser}
            onDepositSuccess={refreshUser}
            onNavigateTransactions={() => setActiveTab('transactions')}
          />
        )}
        {activeTab === 'withdraw' && (
          <WithdrawView
            currentUser={currentUser}
            onWithdrawSuccess={refreshUser}
            onNavigateAccount={() => setActiveTab('account')}
            onNavigateTransactions={() => setActiveTab('transactions')}
          />
        )}
        {activeTab === 'investments' && <InvestmentsView currentUser={currentUser} onNavigateDeposit={() => setActiveTab('deposit')} />}
        {activeTab === 'transactions' && <TransactionsView currentUser={currentUser} />}
        {activeTab === 'referrals' && <ReferralsView currentUser={currentUser} />}
        {activeTab === 'account' && <AccountView currentUser={currentUser} onUpdateUser={setCurrentUser} />}
        {activeTab === 'support' && <SupportView currentUser={currentUser} />}
      </DashboardLayout>
    </ToastProvider>
  );
}