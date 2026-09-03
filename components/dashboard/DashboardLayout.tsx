import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Layers, 
  ReceiptText, 
  Users, 
  User as UserIcon, 
  Headphones, 
  LogOut, 
  Bell, 
  Lock, 
  X,
  Menu
} from 'lucide-react';
import { User } from '../../types';
import { storage } from '../../lib/storage';
import { Button } from '../ui/Button';

export type DashboardTab = 
  | 'overview' 
  | 'deposit' 
  | 'withdraw' 
  | 'investments' 
  | 'transactions' 
  | 'referrals' 
  | 'account' 
  | 'support';

interface DashboardLayoutProps {
  currentUser: User;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onLogout: () => void;
  onNavigateAdmin: () => void;
  onNavigateLanding: () => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentUser,
  activeTab,
  onTabChange,
  onLogout,
  onNavigateAdmin,
  onNavigateLanding,
  children,
}) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const notifications = (storage.getNotifications() || []).filter(n => n && currentUser && n.userId === currentUser.id);
  const unreadCount = (notifications || []).filter(n => n && !n.read).length;

  const markNotificationAsRead = (id: string) => {
    const notifs = storage.getNotifications() || [];
    const target = notifs.find(n => n && n.id === id);
    if (target) {
      target.read = true;
      storage.saveNotifications([...notifs]);
    }
  };

  const markAllAsRead = () => {
    const notifs = (storage.getNotifications() || []).map(n => 
      (n && currentUser && n.userId === currentUser.id) ? { ...n, read: true } : n
    );
    storage.saveNotifications(notifs);
  };

  const navigationItems = [
    { id: 'overview' as DashboardTab, label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'deposit' as DashboardTab, label: 'Make Deposit', icon: <ArrowDownToLine className="w-5 h-5" /> },
    { id: 'withdraw' as DashboardTab, label: 'Withdrawals', icon: <ArrowUpFromLine className="w-5 h-5" /> },
    { id: 'investments' as DashboardTab, label: 'My Investments', icon: <Layers className="w-5 h-5" /> },
    { id: 'transactions' as DashboardTab, label: 'Transactions', icon: <ReceiptText className="w-5 h-5" /> },
    { id: 'referrals' as DashboardTab, label: 'Referrals', icon: <Users className="w-5 h-5" /> },
    { id: 'account' as DashboardTab, label: 'Account Profile', icon: <UserIcon className="w-5 h-5" /> },
    { id: 'support' as DashboardTab, label: 'Investor Support', icon: <Headphones className="w-5 h-5" /> },
  ];

  const getPageTitle = () => {
    switch (activeTab) {
      case 'overview': return { title: 'Investor Overview', subtitle: `Welcome back, ${currentUser.fullName}` };
      case 'deposit': return { title: 'Make Deposit', subtitle: 'Select an institutional investment plan and fund with cryptocurrency' };
      case 'withdraw': return { title: 'Withdraw Funds', subtitle: 'Liquidate your available balance to your verified crypto address' };
      case 'investments': return { title: 'My Investments', subtitle: 'Monitor active yield contracts and maturity schedules' };
      case 'transactions': return { title: 'Financial Activity', subtitle: 'Immutable ledger audit receipts and transaction history' };
      case 'referrals': return { title: 'Referral Network', subtitle: 'Earn instant 5% commission on qualifying partner deposits' };
      case 'account': return { title: 'Account Settings', subtitle: 'Manage verified wallet addresses and security credentials' };
      case 'support': return { title: 'Investor Support', subtitle: '24/7 priority concierge and technical inquiries' };
      default: return { title: 'Dashboard', subtitle: 'CapitalFargoFX Portfolio Portal' };
    }
  };

  const pageInfo = getPageTitle();

  return (
    <div className="flex min-h-screen w-full bg-[#F8FAFC] font-sans text-[#0F172A]">
      
      {/* Desktop Deep Navy Sleek Sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#0B172A] flex-col border-r border-[#E2E8F0] shrink-0 sticky top-0 h-screen z-20">
        
        {/* Brand Logo Header */}
        <div className="p-6 flex items-center justify-between border-b border-white/5">
          <button
            onClick={onNavigateLanding}
            className="flex items-center gap-3 cursor-pointer text-left group"
          >
            <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <div className="w-4 h-4 border-2 border-white rounded-xs transform rotate-45" />
            </div>
            <span className="font-bold text-white text-xl tracking-tight">
              CapitalFargo<span className="text-[#2563EB]">FX</span>
            </span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer text-sm font-medium ${
                  isActive
                    ? 'bg-[#2563EB]/10 border-l-4 border-[#2563EB] text-white rounded-r-md'
                    : 'text-[#64748B] hover:text-white hover:bg-white/[0.03] rounded-md'
                }`}
              >
                <span className={isActive ? 'text-[#2563EB]' : 'text-[#64748B]'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Sidebar: Investment Health Widget */}
        <div className="p-5 mt-auto border-t border-white/10 space-y-3">
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-bold">Investment Health</p>
              <span className="text-[10px] font-bold text-[#059669]">Level 2</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full mb-2.5 overflow-hidden">
              <div className="h-full w-3/4 bg-[#059669] rounded-full transition-all duration-500" />
            </div>
            <p className="text-xs text-white/70">75% Progress to VIP Gold</p>
          </div>

          <div className="flex items-center justify-between pt-2 text-xs">
            <button
              onClick={onNavigateLanding}
              className="text-[#64748B] hover:text-white transition-colors cursor-pointer text-[11px]"
            >
              Public Portal
            </button>
            <button
              onClick={onLogout}
              className="text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer text-[11px] font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        
        {/* Sleek White Top Header */}
        <header className="h-20 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30 shadow-xs">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="lg:hidden p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] hover:bg-slate-100 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">{pageInfo.title}</h1>
              <p className="text-xs sm:text-sm text-[#64748B]">{pageInfo.subtitle}</p>
            </div>
          </div>

          {/* Right Header Status, Quick Deposit & User Avatar */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Market Live Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#0F172A]">
              <div className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
              <span>Market Live</span>
            </div>

            {/* Quick Deposit Button */}
            <Button
              size="sm"
              variant="primary"
              onClick={() => onTabChange('deposit')}
              className="hidden md:inline-flex bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              + Make Deposit
            </Button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] cursor-pointer transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#2563EB] text-white font-bold text-[10px] rounded-full flex items-center justify-center shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-[#0F172A] rounded-2xl shadow-xl border border-[#E2E8F0] p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-blue-50 text-[#2563EB] px-2 py-0.5 rounded-full font-bold border border-blue-200">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[11px] font-semibold text-[#2563EB] hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {(notifications?.length || 0) === 0 ? (
                      <p className="text-xs text-[#64748B] text-center py-6">No notifications yet.</p>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationAsRead(notif.id)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                            notif.read
                              ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]'
                              : 'bg-blue-50/60 border-blue-200 text-[#0F172A] font-medium'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-[#0F172A]">{notif.title}</span>
                            <span className="text-[10px] text-[#64748B] font-mono">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-[#64748B]">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Switcher (if admin) */}
            {currentUser.role === 'ADMIN' && (
              <Button
                size="sm"
                variant="dark"
                leftIcon={<Lock className="w-3.5 h-3.5 text-amber-400" />}
                onClick={onNavigateAdmin}
                className="hidden sm:inline-flex bg-[#0B172A] border-[#E2E8F0] text-amber-300 hover:bg-slate-800 text-xs rounded-xl"
              >
                Admin Suite
              </Button>
            )}

            {/* User Profile Avatar with Initials */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
              >
                <div className="w-10 h-10 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold border-2 border-white shadow-sm">
                  {currentUser.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'AV'}
                </div>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white text-[#0F172A] rounded-2xl shadow-xl border border-[#E2E8F0] p-2 z-50">
                  <div className="px-3 py-2 border-b border-[#E2E8F0] mb-1">
                    <p className="text-xs font-bold text-[#0F172A]">{currentUser.fullName}</p>
                    <p className="text-[11px] text-[#64748B] truncate">{currentUser.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onTabChange('account');
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-[#0F172A] hover:bg-[#F8FAFC] rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4 text-[#64748B]" />
                    Account Settings
                  </button>

                  {currentUser.role === 'ADMIN' && (
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigateAdmin();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Lock className="w-4 h-4 text-amber-600" />
                      Admin Suite
                    </button>
                  )}

                  <div className="pt-1 mt-1 border-t border-[#E2E8F0]">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Slide-Out Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-[#0B172A]/80 backdrop-blur-xs" onClick={() => setMobileDrawerOpen(false)} />
          <div className="relative bg-[#0B172A] w-72 h-full p-6 shadow-2xl z-10 flex flex-col justify-between border-r border-[#E2E8F0]/10 text-white">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-[#2563EB] rounded-lg flex items-center justify-center">
                    <div className="w-3.5 h-3.5 border-2 border-white rounded-xs transform rotate-45" />
                  </div>
                  <span className="font-bold text-white text-lg">CapitalFargoFX</span>
                </div>
                <button onClick={() => setMobileDrawerOpen(false)} className="p-1 rounded-lg hover:bg-white/10 text-[#64748B]">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <nav className="space-y-1">
                {navigationItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setMobileDrawerOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg text-xs font-medium flex items-center gap-3 transition-colors ${
                      activeTab === item.id
                        ? 'bg-[#2563EB]/10 border-l-4 border-[#2563EB] text-white'
                        : 'text-[#64748B] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="pt-4 border-t border-white/10">
              <button
                onClick={onLogout}
                className="w-full text-left px-3 py-2 text-xs font-medium text-rose-400 hover:bg-white/5 rounded-xl flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#E2E8F0] py-2 px-3 flex items-center justify-around shadow-lg">
        <button
          onClick={() => onTabChange('overview')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium p-1 cursor-pointer ${
            activeTab === 'overview' ? 'text-[#2563EB] font-bold' : 'text-[#64748B]'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => onTabChange('deposit')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium p-1 cursor-pointer ${
            activeTab === 'deposit' ? 'text-[#2563EB] font-bold' : 'text-[#64748B]'
          }`}
        >
          <ArrowDownToLine className="w-5 h-5 text-[#059669]" />
          <span>Deposit</span>
        </button>

        <button
          onClick={() => onTabChange('withdraw')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium p-1 cursor-pointer ${
            activeTab === 'withdraw' ? 'text-[#2563EB] font-bold' : 'text-[#64748B]'
          }`}
        >
          <ArrowUpFromLine className="w-5 h-5" />
          <span>Withdraw</span>
        </button>

        <button
          onClick={() => onTabChange('investments')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium p-1 cursor-pointer ${
            activeTab === 'investments' ? 'text-[#2563EB] font-bold' : 'text-[#64748B]'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span>Invest</span>
        </button>

        <button
          onClick={() => onTabChange('account')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium p-1 cursor-pointer ${
            activeTab === 'account' ? 'text-[#2563EB] font-bold' : 'text-[#64748B]'
          }`}
        >
          <UserIcon className="w-5 h-5" />
          <span>Account</span>
        </button>
      </div>

    </div>
  );
};
