import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Layers, 
  Clock, 
  Users, 
  Copy, 
  Check, 
  ArrowRight, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Info,
  Play
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { User, Investment, Transaction, InvestmentPlan } from '../../types';
import { storage } from '../../lib/storage';
import { authApi } from '../../lib/api';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';
import { DashboardTab } from './DashboardLayout';

interface DashboardOverviewProps {
  currentUser: User;
  onNavigateTab: (tab: DashboardTab) => void;
  onSelectPlanForDeposit?: (plan: InvestmentPlan) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  currentUser,
  onNavigateTab,
}) => {
  const [copiedRef, setCopiedRef] = useState(false);
  const [chartTimeframe, setChartTimeframe] = useState<'7D' | '30D' | '3M' | '1Y'>('30D');
  const { success, info } = useToast();

  const [investments, setInvestments] = useState<Investment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  React.useEffect(() => {
    Promise.all([authApi.investments(), authApi.transactions()]).then(([loadedInvestments, loadedTransactions]) => {
      setInvestments(loadedInvestments);
      setTransactions(loadedTransactions.slice(0, 5));
    }).catch(() => undefined);
  }, []);
  const activeInvestments = investments.filter(i => i && i.status === 'ACTIVE');
  const activeCapital = activeInvestments.reduce((sum, i) => sum + (i?.amount || 0), 0);

  const [pendingWithdrawals, setPendingWithdrawals] = useState(0);
  React.useEffect(() => {
    authApi.withdrawals().then(withdrawals => setPendingWithdrawals(withdrawals.filter(withdrawal => withdrawal.status === 'PENDING').reduce((sum, withdrawal) => sum + withdrawal.amount, 0))).catch(() => undefined);
  }, []);

  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}/?ref=${currentUser.username}`
    : `/?ref=${currentUser.username}`;

  const copyReferralLink = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(referralLink);
    }
    setCopiedRef(true);
    success('Referral Link Copied', 'Share with your partners to earn 5% instant commissions');
    setTimeout(() => setCopiedRef(false), 2500);
  };

  // Simulated Dynamic Chart Data based on user balances
  const getChartData = () => {
    const base = currentUser.totalDeposits || 10000;
    const profit = currentUser.earningBalance || 2500;
    if (chartTimeframe === '7D') {
      return [
        { name: 'Day 1', balance: base * 0.9, profit: profit * 0.2 },
        { name: 'Day 2', balance: base * 0.92, profit: profit * 0.35 },
        { name: 'Day 3', balance: base * 0.95, profit: profit * 0.5 },
        { name: 'Day 4', balance: base * 0.97, profit: profit * 0.65 },
        { name: 'Day 5', balance: base * 0.99, profit: profit * 0.8 },
        { name: 'Day 6', balance: base, profit: profit * 0.92 },
        { name: 'Today', balance: base + profit, profit: profit },
      ];
    }
    if (chartTimeframe === '3M') {
      return [
        { name: 'Month 1', balance: base * 0.4, profit: profit * 0.2 },
        { name: 'Month 2', balance: base * 0.75, profit: profit * 0.6 },
        { name: 'Month 3', balance: base + profit, profit: profit },
      ];
    }
    if (chartTimeframe === '1Y') {
      return [
        { name: 'Q1', balance: base * 0.2, profit: profit * 0.1 },
        { name: 'Q2', balance: base * 0.5, profit: profit * 0.3 },
        { name: 'Q3', balance: base * 0.8, profit: profit * 0.7 },
        { name: 'Q4', balance: base + profit, profit: profit },
      ];
    }
    // 30D default
    return [
      { name: 'W1', balance: base * 0.6, profit: profit * 0.2 },
      { name: 'W2', balance: base * 0.8, profit: profit * 0.45 },
      { name: 'W3', balance: base * 0.95, profit: profit * 0.75 },
      { name: 'W4', balance: base + profit, profit: profit },
    ];
  };

  const handleSimulateFastForward = async (investmentId: string) => {
    try {
      const result = await authApi.settleInvestment(investmentId);
      setInvestments(current => current.map(investment => investment.id === result.investment.id ? result.investment : investment));
      success('Contract Matured & Settled', `Principal and ${result.investment.expectedProfit.toLocaleString()} profit deposited to balance!`);
    } catch (error) {
      info('Notice', error instanceof Error ? error.message : 'Unable to settle investment.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Portfolio Balance */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs hover:border-[#2563EB]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wide">
              Total Balance
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold mt-1 text-[#0F172A] tracking-tight">
            ${((currentUser?.availableBalance || 0) + (currentUser?.earningBalance || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E2E8F0]">
            <span className="text-[10px] text-[#059669] font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              +14.8% this cycle
            </span>
            <button
              onClick={() => onNavigateTab('withdraw')}
              className="text-[11px] font-bold text-[#2563EB] hover:underline cursor-pointer"
            >
              Withdraw →
            </button>
          </div>
        </div>

        {/* Card 2: Active Capital */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs hover:border-[#2563EB]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wide">
              Active Investments
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold mt-1 text-[#2563EB] tracking-tight">
            ${(activeCapital || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E2E8F0]">
            <span className="text-[10px] text-[#64748B] font-semibold">
              {activeInvestments?.length || 0} Active Contracts
            </span>
            <button
              onClick={() => onNavigateTab('investments')}
              className="text-[11px] font-bold text-[#2563EB] hover:underline cursor-pointer"
            >
              Details →
            </button>
          </div>
        </div>

        {/* Card 3: Total ROI Earnings */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs hover:border-[#059669]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wide">
              Total Earnings
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#059669]/10 text-[#059669] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold mt-1 text-[#059669] tracking-tight">
            +${((currentUser?.earningBalance || 0) + (currentUser?.referralEarnings || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E2E8F0]">
            <span className="text-[10px] text-[#059669] font-semibold">
              Automated Yield & Referral
            </span>
            <span className="text-[10px] font-bold text-[#64748B]">All-Time</span>
          </div>
        </div>

        {/* Card 4: Accent Solid Blue Card - Total Deposits */}
        <div className="bg-[#2563EB] p-5 rounded-2xl text-white shadow-md relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10 w-24 h-24 bg-white rounded-full pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold opacity-80 uppercase tracking-wide">
              Total Deposited
            </span>
            <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center">
              <ArrowDownToLine className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold mt-1 relative z-10 tracking-tight">
            ${(currentUser?.totalDeposits || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20 relative z-10">
            <span className="text-[10px] opacity-90 font-semibold">
              Verified Capital
            </span>
            <button
              onClick={() => onNavigateTab('deposit')}
              className="text-[11px] font-bold text-white underline hover:opacity-80 cursor-pointer"
            >
              + Deposit
            </button>
          </div>
        </div>

      </div>

      {/* Row 2: Performance Chart (8 cols) + Asset Allocation / Receiving Wallets (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left 8 Cols: Portfolio Visual Chart */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-[#0F172A] tracking-tight">Performance & Yield Analytics</h3>
              <p className="text-xs text-[#64748B]">Real-time portfolio valuation and accumulated earnings</p>
            </div>

            {/* Timeframe Selector with Sleek Buttons */}
            <div className="flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] p-1 rounded-xl">
              {(['7D', '30D', '3M', '1Y'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setChartTimeframe(tf)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    chartTimeframe === tf
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val.toLocaleString()}`} />
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, '']}
                  contentStyle={{ backgroundColor: '#0B172A', borderRadius: '12px', border: '1px solid #1E293B', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="balance" name="Portfolio Valuation" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#balanceGrad)" />
                <Area type="monotone" dataKey="profit" name="Accumulated Yield" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#profitGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 4 Cols: Supported Crypto Assets & Quick Deposit */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base font-bold text-[#0F172A]">Asset Allocation</h4>
                <p className="text-xs text-[#64748B]">Multi-chain liquidity channels</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#059669]/10 text-[#059669]">
                Active 24/7
              </span>
            </div>

            <div className="space-y-3 mt-4">
              {/* Bitcoin Row */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F7931A]/10 flex items-center justify-center text-[#F7931A] font-bold text-xs">
                    ₿
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0F172A]">Bitcoin</p>
                    <p className="text-[10px] text-[#64748B]">BTC Mainnet</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-[#0F172A] font-mono">Instant</p>
                  <p className="text-[10px] text-[#059669] font-medium">3 Confirms</p>
                </div>
              </div>

              {/* Ethereum Row */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#627EEA]/10 flex items-center justify-center text-[#627EEA] font-bold text-xs">
                    Ξ
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0F172A]">Ethereum</p>
                    <p className="text-[10px] text-[#64748B]">ERC-20</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-[#0F172A] font-mono">Instant</p>
                  <p className="text-[10px] text-[#059669] font-medium">12 Confirms</p>
                </div>
              </div>

              {/* Tether USDT Row */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#26A17B]/10 flex items-center justify-center text-[#26A17B] font-bold text-xs">
                    ₮
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0F172A]">Tether USDT</p>
                    <p className="text-[10px] text-[#64748B]">TRC-20 / ERC-20</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-[#0F172A] font-mono">Zero Fee</p>
                  <p className="text-[10px] text-[#059669] font-medium">Fast Payout</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={() => onNavigateTab('deposit')}
            className="w-full mt-6 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#2563EB] hover:bg-[#2563EB] hover:text-white transition-all cursor-pointer text-center"
          >
            + Start New Investment
          </button>
        </div>

      </div>

      {/* Row 3: Active Investments + Referral Link Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 8 Cols: Active Investments */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-[#0F172A] tracking-tight">Active Investment Contracts</h3>
              <p className="text-xs text-[#64748B]">Structured yield contracts currently maturing</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onNavigateTab('investments')}
              className="text-xs font-bold bg-[#F8FAFC] border-[#E2E8F0] text-[#2563EB] hover:bg-[#2563EB] hover:text-white"
            >
              All Contracts ({investments?.length || 0})
            </Button>
          </div>

          {(activeInvestments?.length || 0) === 0 ? (
            <div className="text-center py-10 bg-[#F8FAFC] rounded-2xl border border-dashed border-[#E2E8F0]">
              <Layers className="w-8 h-8 text-[#64748B] mx-auto mb-2 opacity-60" />
              <h4 className="text-sm font-bold text-[#0F172A]">No Active Investment Contracts</h4>
              <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
                Fund an institutional tier to begin automated daily yield compounding and principal protection.
              </p>
              <Button
                size="sm"
                variant="primary"
                onClick={() => onNavigateTab('deposit')}
                className="mt-4 bg-[#2563EB] hover:bg-blue-700 text-white font-bold"
              >
                Start an Investment
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(() => {
                const now = Date.now();
                return activeInvestments.map(inv => {
                  const start = new Date(inv.startDate).getTime();
                  const end = new Date(inv.maturityDate).getTime();
                  const progress = Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
                  
                  return (
                    <div key={inv.id} className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#2563EB]/40 transition-all">
                    <div className="flex items-center justify-between mb-2.5">
                      <div>
                        <span className="text-xs font-bold text-[#0F172A]">{inv.planName} Plan</span>
                        <span className="text-[10px] text-[#64748B] font-mono block">ID: {inv.id.substring(0, 10)}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#059669]/10 text-[#059669]">
                        +{inv.returnPercentage}% ROI
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs my-2.5 bg-white p-2.5 rounded-lg border border-[#E2E8F0]">
                      <div>
                        <span className="text-[#64748B] text-[10px] block">Principal</span>
                        <span className="font-bold font-mono text-[#0F172A]">${(inv?.amount || 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[#64748B] text-[10px] block">Expected Yield</span>
                        <span className="font-bold font-mono text-[#059669]">+${(inv?.expectedProfit || 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[#64748B] text-[10px] block">Total Return</span>
                        <span className="font-bold font-mono text-[#0F172A]">${(inv?.totalReturn || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-[#64748B]">
                        <span>Maturity Progress</span>
                        <span className="font-bold text-[#0F172A]">{progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#2563EB] rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#64748B] mt-2.5 pt-2 border-t border-[#E2E8F0]">
                      <span>Matures: {new Date(inv.maturityDate).toLocaleDateString()}</span>
                      
                      <button
                        onClick={() => handleSimulateFastForward(inv.id)}
                        className="text-[10px] font-bold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
                        title="Simulate maturity for testing"
                      >
                        <Play className="w-2.5 h-2.5" />
                        Settle Maturity
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 4 Cols: Affiliate Referral Link Quick Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#0B172A] text-white rounded-2xl p-6 border border-[#E2E8F0]/10 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="p-1.5 rounded-lg bg-[#2563EB]/20 text-[#2563EB]">
                <Users className="w-4 h-4" />
              </span>
              <h4 className="text-sm font-bold text-white">Affiliate Partner Program</h4>
            </div>

            <p className="text-xs text-white/70 leading-relaxed mb-4">
              Earn an instant <strong className="text-[#059669]">5.00% commission</strong> directly credited to your available balance whenever your downline funds a contract.
            </p>

            <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 flex items-center justify-between gap-2 mb-4">
              <span className="text-xs font-mono text-white/90 truncate">
                {referralLink}
              </span>
              <button
                onClick={copyReferralLink}
                className="p-2 rounded-lg bg-[#2563EB] hover:bg-blue-600 text-white transition-colors cursor-pointer shrink-0"
                title="Copy Referral Link"
              >
                {copiedRef ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('referrals')}
              className="w-full justify-center bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs font-bold"
            >
              View Affiliate Network →
            </Button>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A] mb-1">
              <ShieldCheck className="w-4 h-4 text-[#059669]" />
              <span>Immutable Ledger Protection</span>
            </div>
            <p className="text-[11px] text-[#64748B] leading-relaxed">
              Every balance movement, yield payout, and withdrawal request is tracked on an immutable double-entry ledger.
            </p>
          </div>
        </div>

      </div>

      {/* Row 4: Recent Financial Activity Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#0F172A] tracking-tight">Recent Financial Activity</h3>
            <p className="text-xs text-[#64748B]">Audited transaction history and ledger receipts</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onNavigateTab('transactions')}
            className="text-xs font-bold bg-[#F8FAFC] border-[#E2E8F0] text-[#2563EB] hover:bg-[#2563EB] hover:text-white"
          >
            Full Ledger →
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[10px] uppercase font-bold text-[#64748B] border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-5">Type</th>
                <th className="py-3 px-5">Description</th>
                <th className="py-3 px-5">Amount</th>
                <th className="py-3 px-5">Asset</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {(transactions?.length || 0) === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-xs text-[#64748B]">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                    <td className="py-3.5 px-5">
                      <span className="font-bold text-[#0F172A] uppercase tracking-wider text-[10px] bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-0.5 rounded-md">
                        {tx.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-[#0F172A] font-medium">{tx.description}</td>
                    <td className="py-3.5 px-5 font-mono font-bold">
                      <span className={tx.type === 'WITHDRAWAL' || tx.type === 'INVESTMENT_DEBIT' ? 'text-[#0F172A]' : 'text-[#059669]'}>
                        {tx.type === 'WITHDRAWAL' || tx.type === 'INVESTMENT_DEBIT' ? '-' : '+'}${(tx?.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-[#64748B]">{tx.cryptoCurrency || 'USD'}</td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        tx.status === 'COMPLETED' 
                          ? 'bg-[#059669]/10 text-[#059669]' 
                          : tx.status === 'PENDING'
                          ? 'bg-amber-500/10 text-amber-600'
                          : 'bg-rose-500/10 text-rose-600'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right text-[#64748B] font-mono text-[11px]">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
