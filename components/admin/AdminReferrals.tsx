import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  TrendingUp, 
  DollarSign, 
  Gift, 
  ShieldCheck 
} from 'lucide-react';
import { User, Referral } from '../../types';
import { storage } from '../../lib/storage';
import { Badge } from '../ui/Badge';

interface AdminReferralsProps {
  currentUser: User;
}

export const AdminReferrals: React.FC<AdminReferralsProps> = ({ currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const allReferrals = storage.getReferrals();
  const allUsers = storage.getUsers();

  const filtered = allReferrals.filter(r => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      r.referrerUsername.toLowerCase().includes(q) ||
      r.referredUsername.toLowerCase().includes(q) ||
      r.referredFullName.toLowerCase().includes(q)
    );
  });

  const totalCommissionsPaid = allReferrals.reduce((sum, r) => sum + r.commissionsEarned, 0);
  const totalReferredVolume = allReferrals.reduce((sum, r) => sum + r.totalDeposits, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-purple-400" />
            Affiliate & Downline Network
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Global downline trees, permanent sponsor bindings, and real-time commission disbursements.
          </p>
        </div>
      </div>

      {/* Network Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Affiliate Bindings</span>
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-black text-white font-mono">{allReferrals.length}</p>
          <span className="text-[11px] text-purple-300 mt-1 block font-semibold">Active Downlines</span>
        </div>

        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Downline Deposit Volume</span>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-black text-blue-400 font-mono">
            ${(totalReferredVolume || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Cumulative Principal</span>
        </div>

        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Commissions Paid</span>
            <Gift className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400 font-mono">
            ${(totalCommissionsPaid || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-emerald-400 mt-1 block font-semibold">Instant 5% Tier-1 Settlements</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Referrer username or Referred investor..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Referrals Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            No affiliate pairs match your search query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 pl-6">Upline Sponsor</th>
                  <th className="py-3.5">Referred Investor</th>
                  <th className="py-3.5">Downline Volume</th>
                  <th className="py-3.5">Commission Paid (5%)</th>
                  <th className="py-3.5">Status</th>
                  <th className="py-3.5 text-right pr-6">Bound Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 pl-6">
                      <span className="font-mono font-bold text-purple-400">@{r.referrerUsername}</span>
                    </td>
                    <td className="py-4">
                      <span className="font-bold text-white block">{r.referredFullName}</span>
                      <span className="text-[11px] font-mono text-slate-400">@{r.referredUsername}</span>
                    </td>
                    <td className="py-4 font-mono font-bold text-white">
                      ${(r?.totalDeposits || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 font-mono font-bold text-emerald-400">
                      +${(r?.commissionsEarned || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4">
                      <Badge variant="success">{r.status}</Badge>
                    </td>
                    <td className="py-4 font-mono text-slate-400 text-[11px] text-right pr-6">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
