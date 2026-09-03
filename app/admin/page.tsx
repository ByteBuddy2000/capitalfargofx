'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { AdminLayout, type AdminTab } from '@/components/admin/AdminLayout';
import { AdminOverview } from '@/components/admin/AdminOverview';
import { AdminDeposits } from '@/components/admin/AdminDeposits';
import { AdminWithdrawals } from '@/components/admin/AdminWithdrawals';
import { AdminUsers } from '@/components/admin/AdminUsers';
import { AdminPlans } from '@/components/admin/AdminPlans';
import { AdminReferrals } from '@/components/admin/AdminReferrals';
import { AdminWallets } from '@/components/admin/AdminWallets';
import { AdminSettings } from '@/components/admin/AdminSettings';
import { AdminAuditLogs } from '@/components/admin/AdminAuditLogs';
import { ToastProvider } from '@/components/ui/Toast';
import type { User } from '@/types';
import { authApi } from '@/lib/api';

const emptyAdminUser: User = {
  id: 'admin',
  fullName: 'Administrator',
  username: 'admin',
  email: '',
  role: 'ADMIN',
  status: 'ACTIVE',
  btcWallet: '',
  ethWallet: '',
  usdtWallet: '',
  uplineId: null,
  availableBalance: 0,
  earningBalance: 0,
  totalDeposits: 0,
  totalWithdrawals: 0,
  referralEarnings: 0,
  createdAt: '',
  updatedAt: '',
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [adminUser, setAdminUser] = useState<User>(emptyAdminUser);

  useEffect(() => {
    void authApi.me().then(user => {
      if (user.role === 'ADMIN') setAdminUser(user);
    }).catch(() => undefined);
  }, []);

  const logout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'deposits': return <AdminDeposits currentUser={adminUser} />;
      case 'withdrawals': return <AdminWithdrawals currentUser={adminUser} />;
      case 'users': return <AdminUsers currentUser={adminUser} />;
      case 'plans': return <AdminPlans currentUser={adminUser} />;
      case 'referrals': return <AdminReferrals currentUser={adminUser} />;
      case 'wallets': return <AdminWallets currentUser={adminUser} />;
      case 'settings': return <AdminSettings currentUser={adminUser} />;
      case 'audit': return <AdminAuditLogs currentUser={adminUser} />;
      default: return <AdminOverview currentUser={adminUser} onNavigateTab={setActiveTab} />;
    }
  };

  return (
    <ToastProvider>
      <AdminLayout
        currentUser={adminUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNavigateDashboard={() => window.location.assign('/dashboard')}
        onLogout={logout}
      >
        {renderTab()}
      </AdminLayout>
    </ToastProvider>
  );
}
