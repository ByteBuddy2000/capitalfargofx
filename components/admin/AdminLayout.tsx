import React, { useState } from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Users, 
  Layers, 
  Wallet, 
  Settings, 
  ScrollText, 
  ArrowLeft, 
  LogOut,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Menu,
  X
} from 'lucide-react';
import { User } from '../../types';
import { storage } from '../../lib/storage';
import { Button } from '../ui/Button';

export type AdminTab = 
  | 'overview' 
  | 'deposits' 
  | 'withdrawals' 
  | 'users' 
  | 'plans' 
  | 'referrals' 
  | 'wallets' 
  | 'settings' 
  | 'audit';

interface AdminLayoutProps {
  currentUser: User;
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onNavigateDashboard: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentUser,
  activeTab,
  onTabChange,
  onNavigateDashboard,
  onLogout,
  children,
}) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const pendingDepositsCount = storage.getDeposits().filter(d => d.status === 'PENDING').length;
  const pendingWithdrawalsCount = storage.getWithdrawals().filter(w => w.status === 'PENDING').length;

  const adminNavItems = [
    { id: 'overview' as AdminTab, label: 'Control Center', icon: <LayoutDashboard className="w-4 h-4" /> },
    { 
      id: 'deposits' as AdminTab, 
      label: 'Deposit Approvals', 
      icon: <ArrowDownToLine className="w-4 h-4 text-emerald-400" />,
      badge: pendingDepositsCount > 0 ? pendingDepositsCount : undefined,
    },
    { 
      id: 'withdrawals' as AdminTab, 
      label: 'Withdrawal Orders', 
      icon: <ArrowUpFromLine className="w-4 h-4 text-amber-400" />,
      badge: pendingWithdrawalsCount > 0 ? pendingWithdrawalsCount : undefined,
    },
    { id: 'users' as AdminTab, label: 'User Directory', icon: <Users className="w-4 h-4" /> },
    { id: 'plans' as AdminTab, label: 'Investment Plans', icon: <Layers className="w-4 h-4 text-blue-400" /> },
    { id: 'referrals' as AdminTab, label: 'Affiliate Network', icon: <Users className="w-4 h-4 text-purple-400" /> },
    { id: 'wallets' as AdminTab, label: 'Receiving Wallets', icon: <Wallet className="w-4 h-4 text-teal-400" /> },
    { id: 'settings' as AdminTab, label: 'Platform Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'audit' as AdminTab, label: 'Audit Trail Logs', icon: <ScrollText className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-extrabold text-white tracking-tight">
                  CapitalFargo<span className="text-amber-400">Admin</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-950 text-amber-300 rounded-md border border-amber-800">
                  Institutional Security Suite
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              onClick={onNavigateDashboard}
              className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 text-xs"
            >
              Switch to Investor Dashboard
            </Button>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Admin: @{currentUser.username}</span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Desktop Admin Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 bg-slate-900 rounded-3xl p-4 border border-slate-800 shadow-sm sticky top-24">
          <div className="px-3 py-3 mb-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm">
              👑
            </div>
            <div>
              <p className="text-xs font-bold text-white truncate">{currentUser.fullName}</p>
              <p className="text-[10px] text-amber-400 font-mono">Super Administrator</p>
            </div>
          </div>

          <nav className="space-y-1">
            {adminNavItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-slate-950' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-slate-950 text-amber-400' : 'bg-amber-500 text-slate-950 animate-pulse'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-8 pt-4 border-t border-slate-800 space-y-1">
            <button
              onClick={onNavigateDashboard}
              className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-2.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Investor Portal
            </button>
            <button
              onClick={onLogout}
              className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition-colors flex items-center gap-2.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Mobile Slide-Out Drawer */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-slate-950/80" onClick={() => setMobileDrawerOpen(false)} />
            <div className="relative bg-slate-900 w-72 h-full p-6 shadow-2xl z-10 flex flex-col justify-between border-r border-slate-800">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-amber-400" />
                    <span className="font-black text-white">Admin Suite</span>
                  </div>
                  <button onClick={() => setMobileDrawerOpen(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-300">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {adminNavItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        onTabChange(item.id);
                        setMobileDrawerOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                        activeTab === item.id
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={onLogout}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-slate-800 rounded-xl flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Admin Content */}
        <main className="lg:col-span-9 w-full">
          {children}
        </main>

      </div>

    </div>
  );
};
