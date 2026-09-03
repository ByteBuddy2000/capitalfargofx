import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDownToLine,
  Check,
  Copy,
  DollarSign,
  Layers,
  Play,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  Investment,
  Transaction,
  User,
} from '../../types';
import { authApi } from '../../lib/api';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { DashboardTab } from './DashboardLayout';

interface DashboardOverviewProps {
  currentUser: User;
  onNavigateTab: (tab: DashboardTab) => void;
}

type ChartTimeframe = '7D' | '30D' | '3M' | '1Y';

interface ChartPoint {
  name: string;
  balance: number;
  profit: number;
}

const formatCurrency = (
  value: unknown,
  minimumFractionDigits = 2,
  maximumFractionDigits = 2
): string => {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) {
    return '0.00';
  }

  return amount.toLocaleString(undefined, {
    minimumFractionDigits,
    maximumFractionDigits,
  });
};

const formatDate = (value: unknown): string => {
  if (!value) {
    return '—';
  }

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString();
};

const getTimestamp = (value: unknown): number | null => {
  if (!value) {
    return null;
  }

  const timestamp = new Date(String(value)).getTime();

  return Number.isFinite(timestamp) ? timestamp : null;
};

const getTransactionTypeLabel = (type: unknown): string => {
  return String(type ?? 'UNKNOWN')
    .replace(/_/g, ' ')
    .toUpperCase();
};

const isDebitTransaction = (type: unknown): boolean => {
  const transactionType = String(type ?? '').toUpperCase();

  return (
    transactionType === 'WITHDRAWAL' ||
    transactionType === 'INVESTMENT_DEBIT' ||
    transactionType === 'TRANSFER_OUT' ||
    transactionType === 'SEND'
  );
};

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  currentUser,
  onNavigateTab,
}) => {
  const [copiedRef, setCopiedRef] = useState(false);
  const [chartTimeframe, setChartTimeframe] =
    useState<ChartTimeframe>('30D');

  const [investments, setInvestments] = useState<Investment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState(0);
  const [cryptoPrices, setCryptoPrices] = useState({ BTC: 64000, ETH: 3400, USDT: 1 });

  const [isLoading, setIsLoading] = useState(true);
  const [settlingInvestmentId, setSettlingInvestmentId] =
    useState<string | null>(null);

  const { success, info } = useToast();

  /*
   * ---------------------------------------------------------
   * Dashboard data
   * ---------------------------------------------------------
   */

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);

      const [loadedInvestments, loadedTransactions, loadedWithdrawals] =
        await Promise.all([
          authApi.investments(),
          authApi.transactions(),
          authApi.withdrawals(),
        ]);

      setInvestments(
        Array.isArray(loadedInvestments) ? loadedInvestments : []
      );

      setTransactions(
        Array.isArray(loadedTransactions)
          ? loadedTransactions.slice(0, 5)
          : []
      );

      const withdrawals = Array.isArray(loadedWithdrawals)
        ? loadedWithdrawals
        : [];

      const pendingAmount = withdrawals
        .filter(
          (withdrawal) =>
            String(withdrawal?.status ?? '').toUpperCase() === 'PENDING'
        )
        .reduce(
          (sum, withdrawal) =>
            sum + Number(withdrawal?.amount ?? 0),
          0
        );

      setPendingWithdrawals(
        Number.isFinite(pendingAmount) ? pendingAmount : 0
      );

      void authApi.prices().then(setCryptoPrices).catch(() => undefined);
    } catch {
      /*
       * Do not break the dashboard if one API request fails.
       * The existing state remains usable.
       */
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  /*
   * ---------------------------------------------------------
   * Derived values
   * ---------------------------------------------------------
   */

  const activeInvestments = useMemo(
    () =>
      investments.filter(
        (investment) =>
          investment &&
          String(investment.status ?? '').toUpperCase() === 'ACTIVE'
      ),
    [investments]
  );

  const activeCapital = useMemo(
    () =>
      activeInvestments.reduce(
        (sum, investment) =>
          sum + Number(investment?.amount ?? 0),
        0
      ),
    [activeInvestments]
  );

  const availableBalance = Number(
    currentUser?.availableBalance ?? 0
  );

  const earningBalance = Number(
    currentUser?.earningBalance ?? 0
  );

  const referralEarnings = Number(
    currentUser?.referralEarnings ?? 0
  );

  const totalDeposits = Number(
    currentUser?.totalDeposits ?? 0
  );

  const totalEarnings =
    (Number.isFinite(earningBalance) ? earningBalance : 0) +
    (Number.isFinite(referralEarnings) ? referralEarnings : 0);

  const assetValue = (symbol: 'BTC' | 'ETH' | 'USDT') => {
    const asset = currentUser.assets?.find(item => item.symbol === symbol);
    return Number(asset?.availableBalance || 0) * cryptoPrices[symbol];
  };

  const cryptoBalance = (currentUser.assets?.length || 0) > 0
    ? assetValue('BTC') + assetValue('ETH') + assetValue('USDT')
    : 0;
  const totalBalance = cryptoBalance > 0
    ? cryptoBalance + (Number.isFinite(earningBalance) ? earningBalance : 0)
    : (Number.isFinite(availableBalance) ? availableBalance : 0) +
      (Number.isFinite(earningBalance) ? earningBalance : 0);

  /*
   * ---------------------------------------------------------
   * Referral
   * ---------------------------------------------------------
   */

  const referralLink = useMemo(() => {
    const username = encodeURIComponent(
      String(currentUser?.username ?? '')
    );

    if (
      typeof window !== 'undefined' &&
      window.location?.origin
    ) {
      return `${window.location.origin}/?ref=${username}`;
    }

    return `/?ref=${username}`;
  }, [currentUser?.username]);

  const copyReferralLink = async () => {
    try {
      if (
        typeof navigator !== 'undefined' &&
        navigator.clipboard
      ) {
        await navigator.clipboard.writeText(referralLink);
      } else {
        throw new Error('Clipboard is not available.');
      }

      setCopiedRef(true);

      success(
        'Referral Link Copied',
        'Share with your partners to earn 5% instant commissions.'
      );

      window.setTimeout(() => {
        setCopiedRef(false);
      }, 2500);
    } catch {
      info(
        'Unable to Copy',
        'Please copy the referral link manually.'
      );
    }
  };

  /*
   * ---------------------------------------------------------
   * Chart
   *
   * NOTE:
   * This remains a presentation chart based on account totals.
   * It should NOT be interpreted as historical transaction data.
   * ---------------------------------------------------------
   */

  const chartData = useMemo<ChartPoint[]>(() => {
    const base = Math.max(
      0,
      Number.isFinite(totalDeposits) ? totalDeposits : 0
    );

    const profit = Math.max(
      0,
      Number.isFinite(earningBalance) ? earningBalance : 0
    );

    if (chartTimeframe === '7D') {
      return [
        {
          name: 'Day 1',
          balance: base * 0.9,
          profit: profit * 0.2,
        },
        {
          name: 'Day 2',
          balance: base * 0.92,
          profit: profit * 0.35,
        },
        {
          name: 'Day 3',
          balance: base * 0.95,
          profit: profit * 0.5,
        },
        {
          name: 'Day 4',
          balance: base * 0.97,
          profit: profit * 0.65,
        },
        {
          name: 'Day 5',
          balance: base * 0.99,
          profit: profit * 0.8,
        },
        {
          name: 'Day 6',
          balance: base,
          profit: profit * 0.92,
        },
        {
          name: 'Today',
          balance: base + profit,
          profit,
        },
      ];
    }

    if (chartTimeframe === '3M') {
      return [
        {
          name: 'Month 1',
          balance: base * 0.4,
          profit: profit * 0.2,
        },
        {
          name: 'Month 2',
          balance: base * 0.75,
          profit: profit * 0.6,
        },
        {
          name: 'Month 3',
          balance: base + profit,
          profit,
        },
      ];
    }

    if (chartTimeframe === '1Y') {
      return [
        {
          name: 'Q1',
          balance: base * 0.2,
          profit: profit * 0.1,
        },
        {
          name: 'Q2',
          balance: base * 0.5,
          profit: profit * 0.3,
        },
        {
          name: 'Q3',
          balance: base * 0.8,
          profit: profit * 0.7,
        },
        {
          name: 'Q4',
          balance: base + profit,
          profit,
        },
      ];
    }

    return [
      {
        name: 'W1',
        balance: base * 0.6,
        profit: profit * 0.2,
      },
      {
        name: 'W2',
        balance: base * 0.8,
        profit: profit * 0.45,
      },
      {
        name: 'W3',
        balance: base * 0.95,
        profit: profit * 0.75,
      },
      {
        name: 'W4',
        balance: base + profit,
        profit,
      },
    ];
  }, [
    chartTimeframe,
    earningBalance,
    totalDeposits,
  ]);

  /*
   * ---------------------------------------------------------
   * Investment settlement
   *
   * Only allow settlement when the maturity date has actually
   * been reached. The backend remains responsible for the
   * authoritative validation.
   * ---------------------------------------------------------
   */

  const handleSettleInvestment = async (
    investment: Investment
  ) => {
    const investmentId = String(investment?.id ?? '');

    if (!investmentId) {
      info(
        'Unable to Settle',
        'This investment does not have a valid ID.'
      );
      return;
    }

    const maturityTimestamp = getTimestamp(
      investment?.maturityDate
    );

    if (
      maturityTimestamp === null ||
      maturityTimestamp > Date.now()
    ) {
      info(
        'Investment Still Active',
        `This contract matures on ${formatDate(
          investment?.maturityDate
        )}.`
      );
      return;
    }

    try {
      setSettlingInvestmentId(investmentId);

      const result =
        await authApi.settleInvestment(investmentId);

      if (!result?.investment) {
        throw new Error(
          'The settlement response was incomplete.'
        );
      }

      const settledInvestment = result.investment;

      setInvestments((current) =>
        current.map((item) =>
          String(item.id) === investmentId
            ? settledInvestment
            : item
        )
      );

      success(
        'Investment Settled',
        `Principal and ${formatCurrency(
          settledInvestment.expectedProfit
        )} profit have been credited according to the settlement result.`
      );

      /*
       * Refresh balances and transaction history because
       * settlement changes more than the investment record.
       */
      await loadDashboardData();
    } catch (error) {
      info(
        'Settlement Failed',
        error instanceof Error
          ? error.message
          : 'Unable to settle this investment.'
      );
    } finally {
      setSettlingInvestmentId(null);
    }
  };

  /*
   * ---------------------------------------------------------
   * Render
   * ---------------------------------------------------------
   */

  return (
    <div className="space-y-6">
      {/* =====================================================
          PRIMARY METRICS
          ===================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Balance */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs transition-all hover:border-[#2563EB]/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-[#64748B]">
              Total Balance
            </span>

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-1 text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
            ${formatCurrency(totalBalance)}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-[#E2E8F0] pt-2">
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-[#059669]">
              <TrendingUp className="h-3 w-3" />
              +14.8% this cycle
            </span>

            <button
              type="button"
              onClick={() => onNavigateTab('withdraw')}
              className="cursor-pointer text-[11px] font-bold text-[#2563EB] hover:underline"
            >
              Withdraw →
            </button>
          </div>
        </div>

        {/* Active Capital */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs transition-all hover:border-[#2563EB]/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-[#64748B]">
              Active Investments
            </span>

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
              <Layers className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-1 text-2xl font-bold tracking-tight text-[#2563EB] sm:text-3xl">
            ${formatCurrency(activeCapital)}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-[#E2E8F0] pt-2">
            <span className="text-[10px] font-semibold text-[#64748B]">
              {activeInvestments.length} Active Contract
              {activeInvestments.length === 1 ? '' : 's'}
            </span>

            <button
              type="button"
              onClick={() => onNavigateTab('investments')}
              className="cursor-pointer text-[11px] font-bold text-[#2563EB] hover:underline"
            >
              Details →
            </button>
          </div>
        </div>

        {/* Earnings */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs transition-all hover:border-[#059669]/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-[#64748B]">
              Total Earnings
            </span>

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#059669]/10 text-[#059669]">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-1 text-2xl font-bold tracking-tight text-[#059669] sm:text-3xl">
            +${formatCurrency(totalEarnings)}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-[#E2E8F0] pt-2">
            <span className="text-[10px] font-semibold text-[#059669]">
              Yield & Referral
            </span>

            <span className="text-[10px] font-bold text-[#64748B]">
              All-Time
            </span>
          </div>
        </div>

        {/* Total Deposited */}
        <div className="relative overflow-hidden rounded-2xl bg-[#2563EB] p-5 text-white shadow-md">
          <div className="pointer-events-none absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white opacity-10" />

          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide opacity-80">
              Total Deposited
            </span>

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white">
              <ArrowDownToLine className="h-4 w-4" />
            </div>
          </div>

          <div className="relative z-10 mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            ${formatCurrency(totalDeposits)}
          </div>

          <div className="relative z-10 mt-2 flex items-center justify-between border-t border-white/20 pt-2">
            <span className="text-[10px] font-semibold opacity-90">
              Verified Capital
            </span>

            <button
              type="button"
              onClick={() => onNavigateTab('deposit')}
              className="cursor-pointer text-[11px] font-bold text-white underline hover:opacity-80"
            >
              + Deposit
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          PERFORMANCE + ASSET ALLOCATION
          ===================================================== */}

      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
        {/* Performance Chart */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xs lg:col-span-8">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-base font-bold tracking-tight text-[#0F172A]">
                Performance & Yield Analytics
              </h3>

              <p className="text-xs text-[#64748B]">
                Portfolio valuation and accumulated earnings
              </p>
            </div>

            <div className="flex items-center gap-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-1">
              {(['7D', '30D', '3M', '1Y'] as const).map(
                (timeframe) => (
                  <button
                    key={timeframe}
                    type="button"
                    onClick={() =>
                      setChartTimeframe(timeframe)
                    }
                    className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                      chartTimeframe === timeframe
                        ? 'bg-[#2563EB] text-white shadow-xs'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    {timeframe}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="balanceGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#2563EB"
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="95%"
                      stopColor="#2563EB"
                      stopOpacity={0}
                    />
                  </linearGradient>

                  <linearGradient
                    id="profitGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#059669"
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="95%"
                      stopColor="#059669"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <XAxis
                  dataKey="name"
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                />

                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(value: number) =>
                    `$${formatCurrency(value, 0, 0)}`
                  }
                />

                <Tooltip
                  formatter={(value, name) => [
                    `$${formatCurrency(value)}`,
                    String(name),
                  ]}
                  contentStyle={{
                    backgroundColor: '#0B172A',
                    borderRadius: '12px',
                    border: '1px solid #1E293B',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="balance"
                  name="Portfolio Valuation"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#balanceGrad)"
                />

                <Area
                  type="monotone"
                  dataKey="profit"
                  name="Accumulated Yield"
                  stroke="#059669"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#profitGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Asset Allocation */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xs lg:col-span-4">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-[#0F172A]">
                  Asset Allocation
                </h4>

                <p className="text-xs text-[#64748B]">
                  Multi-chain liquidity channels
                </p>
              </div>

              <span className="rounded-full bg-[#059669]/10 px-2 py-0.5 text-[10px] font-bold text-[#059669]">
                Active 24/7
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {/* Bitcoin */}
              <div className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F7931A]/10 text-xs font-bold text-[#F7931A]">
                    ₿
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[#0F172A]">
                      Bitcoin
                    </p>

                    <p className="text-[10px] text-[#64748B]">
                      BTC Mainnet
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-mono text-xs font-bold text-[#0F172A]">
                    ${formatCurrency(assetValue('BTC'))}
                  </p>

                  <p className="text-[10px] font-medium text-[#059669]">
                    3 Confirms
                  </p>
                </div>
              </div>

              {/* Ethereum */}
              <div className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#627EEA]/10 text-xs font-bold text-[#627EEA]">
                    Ξ
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[#0F172A]">
                      Ethereum
                    </p>

                    <p className="text-[10px] text-[#64748B]">
                      ERC-20
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-mono text-xs font-bold text-[#0F172A]">
                    ${formatCurrency(assetValue('ETH'))}
                  </p>

                  <p className="text-[10px] font-medium text-[#059669]">
                    12 Confirms
                  </p>
                </div>
              </div>

              {/* USDT */}
              <div className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#26A17B]/10 text-xs font-bold text-[#26A17B]">
                    ₮
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[#0F172A]">
                      Tether USDT
                    </p>

                    <p className="text-[10px] text-[#64748B]">
                      TRC-20 / ERC-20
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-mono text-xs font-bold text-[#0F172A]">
                    ${formatCurrency(assetValue('USDT'))}
                  </p>

                  <p className="text-[10px] font-medium text-[#059669]">
                    Fast Payout
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('deposit')}
            className="mt-6 w-full cursor-pointer rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] py-2.5 text-center text-xs font-bold text-[#2563EB] transition-all hover:bg-[#2563EB] hover:text-white"
          >
            + Start New Investment
          </button>
        </div>
      </div>

      {/* =====================================================
          ACTIVE INVESTMENTS + REFERRAL
          ===================================================== */}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Active Investments */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xs lg:col-span-8">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold tracking-tight text-[#0F172A]">
                Active Investment Contracts
              </h3>

              <p className="text-xs text-[#64748B]">
                Structured yield contracts currently maturing
              </p>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                onNavigateTab('investments')
              }
              className="bg-[#F8FAFC] text-xs font-bold text-[#2563EB] hover:bg-[#2563EB] hover:text-white"
            >
              All Contracts ({investments.length})
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4"
                >
                  <div className="mb-4 h-4 w-32 rounded bg-[#E2E8F0]" />
                  <div className="mb-3 h-16 rounded bg-white" />
                  <div className="h-2 rounded bg-[#E2E8F0]" />
                </div>
              ))}
            </div>
          ) : activeInvestments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] py-10 text-center">
              <Layers className="mx-auto mb-2 h-8 w-8 text-[#64748B] opacity-60" />

              <h4 className="text-sm font-bold text-[#0F172A]">
                No Active Investment Contracts
              </h4>

              <p className="mx-auto mt-1 max-w-sm text-xs text-[#64748B]">
                Fund an eligible investment plan to begin
                your investment contract.
              </p>

              <Button
                size="sm"
                variant="primary"
                onClick={() =>
                  onNavigateTab('deposit')
                }
                className="mt-4 bg-[#2563EB] font-bold text-white hover:bg-blue-700"
              >
                Start an Investment
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {activeInvestments.map((investment) => {
                const investmentId = String(
                  investment.id ?? ''
                );

                const startTimestamp = getTimestamp(
                  investment.startDate
                );

                const maturityTimestamp = getTimestamp(
                  investment.maturityDate
                );

                const now = Date.now();

                let progress = 0;

                if (
                  startTimestamp !== null &&
                  maturityTimestamp !== null &&
                  maturityTimestamp > startTimestamp
                ) {
                  progress = Math.round(
                    ((now - startTimestamp) /
                      (maturityTimestamp -
                        startTimestamp)) *
                      100
                  );
                }

                progress = Math.min(
                  100,
                  Math.max(0, progress)
                );

                const isMatured =
                  maturityTimestamp !== null &&
                  maturityTimestamp <= now;

                const isSettling =
                  settlingInvestmentId === investmentId;

                return (
                  <div
                    key={investmentId}
                    className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 transition-all hover:border-[#2563EB]/40"
                  >
                    <div className="mb-2.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="block truncate text-xs font-bold text-[#0F172A]">
                          {investment.planName || 'Investment'}{' '}
                          Plan
                        </span>

                        <span className="block truncate font-mono text-[10px] text-[#64748B]">
                          ID:{' '}
                          {investmentId
                            ? investmentId.substring(
                                0,
                                10
                              )
                            : 'N/A'}
                        </span>
                      </div>

                      <span className="shrink-0 rounded-full bg-[#059669]/10 px-2 py-0.5 text-[10px] font-bold text-[#059669]">
                        +{formatCurrency(
                          investment.returnPercentage,
                          2,
                          2
                        )}
                        % ROI
                      </span>
                    </div>

                    <div className="my-2.5 grid grid-cols-3 gap-2 rounded-lg border border-[#E2E8F0] bg-white p-2.5 text-xs">
                      <div>
                        <span className="block text-[10px] text-[#64748B]">
                          Principal
                        </span>

                        <span className="font-mono font-bold text-[#0F172A]">
                          $
                          {formatCurrency(
                            investment.amount,
                            2,
                            2
                          )}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[10px] text-[#64748B]">
                          Expected Yield
                        </span>

                        <span className="font-mono font-bold text-[#059669]">
                          +$
                          {formatCurrency(
                            investment.expectedProfit,
                            2,
                            2
                          )}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[10px] text-[#64748B]">
                          Total Return
                        </span>

                        <span className="font-mono font-bold text-[#0F172A]">
                          $
                          {formatCurrency(
                            investment.totalReturn,
                            2,
                            2
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-[#64748B]">
                        <span>
                          Maturity Progress
                        </span>

                        <span className="font-bold text-[#0F172A]">
                          {progress}%
                        </span>
                      </div>

                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
                        <div
                          className="h-full rounded-full bg-[#2563EB] transition-all duration-500"
                          style={{
                            width: `${progress}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-[#E2E8F0] pt-2 text-[10px] text-[#64748B]">
                      <span>
                        Matures:{' '}
                        {formatDate(
                          investment.maturityDate
                        )}
                      </span>

                      {isMatured ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleSettleInvestment(
                              investment
                            )
                          }
                          disabled={isSettling}
                          className="flex cursor-pointer items-center gap-1 font-bold text-[#2563EB] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                          title="Settle matured investment"
                        >
                          <Play className="h-2.5 w-2.5" />

                          {isSettling
                            ? 'Settling...'
                            : 'Settle Maturity'}
                        </button>
                      ) : (
                        <span className="font-semibold text-[#64748B]">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Referral */}
        <div className="space-y-4 lg:col-span-4">
          <div className="rounded-2xl border border-[#E2E8F0]/10 bg-[#0B172A] p-6 text-white shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-lg bg-[#2563EB]/20 p-1.5 text-[#2563EB]">
                <Users className="h-4 w-4" />
              </span>

              <h4 className="text-sm font-bold text-white">
                Affiliate Partner Program
              </h4>
            </div>

            <p className="mb-4 text-xs leading-relaxed text-white/70">
              Earn an instant{' '}
              <strong className="text-[#059669]">
                5.00% commission
              </strong>{' '}
              directly credited to your available balance
              whenever your downline funds an eligible
              contract.
            </p>

            <div className="mb-4 flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 p-2.5">
              <span className="truncate font-mono text-xs text-white/90">
                {referralLink}
              </span>

              <button
                type="button"
                onClick={copyReferralLink}
                className="shrink-0 cursor-pointer rounded-lg bg-[#2563EB] p-2 text-white transition-colors hover:bg-blue-600"
                title="Copy Referral Link"
                aria-label="Copy referral link"
              >
                {copiedRef ? (
                  <Check className="h-4 w-4 text-white" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onNavigateTab('referrals')
              }
              className="w-full justify-center border-white/10 bg-white/5 text-xs font-bold text-white hover:bg-white/10"
            >
              View Affiliate Network →
            </Button>
          </div>

          {/* Pending Withdrawal */}
          {pendingWithdrawals > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800">
                  Pending Withdrawals
                </span>

                <span className="text-xs font-bold text-amber-700">
                  ${formatCurrency(pendingWithdrawals)}
                </span>
              </div>

              <p className="text-[11px] leading-relaxed text-amber-700">
                Your withdrawal request is currently being
                processed.
              </p>
            </div>
          )}

          {/* Ledger Protection */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
            <div className="mb-1 flex items-center gap-2 text-xs font-bold text-[#0F172A]">
              <ShieldCheck className="h-4 w-4 text-[#059669]" />

              <span>
                Ledger Protection
              </span>
            </div>

            <p className="text-[11px] leading-relaxed text-[#64748B]">
              Balance movements, investment activity and
              withdrawal requests are recorded through the
              platform's transaction system.
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          RECENT FINANCIAL ACTIVITY
          ===================================================== */}

      <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] p-5">
          <div>
            <h3 className="text-base font-bold tracking-tight text-[#0F172A]">
              Recent Financial Activity
            </h3>

            <p className="text-xs text-[#64748B]">
              Recent transaction history
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              onNavigateTab('transactions')
            }
            className="bg-[#F8FAFC] text-xs font-bold text-[#2563EB] hover:bg-[#2563EB] hover:text-white"
          >
            Full Ledger →
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[10px] font-bold uppercase text-[#64748B]">
              <tr>
                <th className="px-5 py-3">
                  Type
                </th>

                <th className="px-5 py-3">
                  Description
                </th>

                <th className="px-5 py-3">
                  Amount
                </th>

                <th className="px-5 py-3">
                  Asset
                </th>

                <th className="px-5 py-3">
                  Status
                </th>

                <th className="px-5 py-3 text-right">
                  Date
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E2E8F0]">
              {isLoading ? (
                Array.from({ length: 3 }).map(
                  (_, index) => (
                    <tr key={index}>
                      <td
                        colSpan={6}
                        className="px-5 py-4"
                      >
                        <div className="h-4 w-full animate-pulse rounded bg-[#F8FAFC]" />
                      </td>
                    </tr>
                  )
                )
              ) : transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-xs text-[#64748B]"
                  >
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => {
                  const transactionId = String(
                    transaction.id ?? ''
                  );

                  const type = String(
                    transaction.type ?? ''
                  ).toUpperCase();

                  const status = String(
                    transaction.status ?? 'UNKNOWN'
                  ).toUpperCase();

                  const debit =
                    isDebitTransaction(type);

                  return (
                    <tr
                      key={
                        transactionId ||
                        `${type}-${transaction.createdAt}`
                      }
                      className="transition-colors hover:bg-[#F8FAFC]/80"
                    >
                      <td className="px-5 py-3.5">
                        <span className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0F172A]">
                          {getTransactionTypeLabel(
                            transaction.type
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-medium text-[#0F172A]">
                        {transaction.description ||
                          'Financial transaction'}
                      </td>

                      <td className="px-5 py-3.5 font-mono font-bold">
                        <span
                          className={
                            debit
                              ? 'text-[#0F172A]'
                              : 'text-[#059669]'
                          }
                        >
                          {debit ? '-' : '+'}$
                          {formatCurrency(
                            transaction.amount
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-semibold text-[#64748B]">
                        {transaction.cryptoCurrency ||
                          'USD'}
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            status === 'COMPLETED'
                              ? 'bg-[#059669]/10 text-[#059669]'
                              : status === 'PENDING'
                                ? 'bg-amber-500/10 text-amber-600'
                                : status === 'FAILED' ||
                                    status === 'REJECTED'
                                  ? 'bg-rose-500/10 text-rose-600'
                                  : 'bg-slate-500/10 text-slate-600'
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right font-mono text-[11px] text-[#64748B]">
                        {formatDate(
                          transaction.createdAt
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};