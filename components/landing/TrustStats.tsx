import React from 'react';
import { motion } from 'motion/react';
import { Users, ArrowDownToLine, ArrowUpFromLine, Coins } from 'lucide-react';
import { PlatformSettings } from '../../types';
import { storage } from '../../lib/storage';

interface TrustStatsProps {
  settings?: PlatformSettings;
}

export const TrustStats: React.FC<TrustStatsProps> = ({ settings }) => {
  const currentSettings = settings || storage.getSettings() || {};

  const stats = [
    {
      label: 'Active Investors',
      value: currentSettings.activeInvestorsDisplay || '2,600+',
      description: 'Verified global portfolios',
      icon: <Users className="w-5 h-5 text-blue-500" />,
      change: '+14% this month',
    },
    {
      label: 'Total Deposits',
      value: currentSettings.totalDepositsDisplay || '$967K+',
      description: 'Secured in structured vaults',
      icon: <ArrowDownToLine className="w-5 h-5 text-emerald-500" />,
      change: '100% principal protected',
    },
    {
      label: 'Withdrawals Processed',
      value: currentSettings.totalWithdrawalsDisplay || '$3.7M+',
      description: 'Instant liquidity execution',
      icon: <ArrowUpFromLine className="w-5 h-5 text-amber-500" />,
      change: 'Avg. dispatch: < 15 mins',
    },
    {
      label: 'Supported Assets',
      value: currentSettings.supportedAssetsDisplay || 'BTC · ETH · USDT',
      description: 'Major blockchain networks',
      icon: <Coins className="w-5 h-5 text-indigo-500" />,
      change: 'Zero deposit fees',
    },
  ];

  return (
    <section className="relative -mt-10 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xl shadow-slate-900/5 hover:border-slate-300 transition-all hover:translate-y-[-2px]"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {stat.label}
              </span>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                {stat.icon}
              </div>
            </div>

            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {stat.value}
            </div>

            <p className="text-xs text-slate-500 mt-1">{stat.description}</p>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-emerald-600">
              <span>{stat.change}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
