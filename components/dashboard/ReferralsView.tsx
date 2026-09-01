import React, { useState } from 'react';
import { 
  Users, 
  Copy, 
  Check, 
  TrendingUp, 
  ShieldCheck, 
  UserCheck, 
  ExternalLink,
  DollarSign,
  Gift
} from 'lucide-react';
import { User, Referral } from '../../types';
import { storage } from '../../lib/storage';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';

interface ReferralsViewProps {
  currentUser: User;
}

export const ReferralsView: React.FC<ReferralsViewProps> = ({ currentUser }) => {
  const [copied, setCopied] = useState(false);
  const { success } = useToast();

  const referrals = storage.getReferralsByReferrer(currentUser?.id || '') || [];
  const upline = currentUser?.uplineId ? storage.getUserById(currentUser.uplineId) : null;

  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}/?ref=${currentUser?.username || ''}`
    : `/?ref=${currentUser?.username || ''}`;

  const copyLink = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(referralLink);
    }
    setCopied(true);
    success('Referral Link Copied', 'Share your link to earn 5% instant commissions');
    setTimeout(() => setCopied(false), 2500);
  };

  const totalDownlineDeposits = referrals.reduce((sum, r) => sum + (r?.totalDeposits || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-purple-600" />
            Affiliate & Referral Network
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Build your capital network and earn instant 5% commission on qualifying partner contracts.
          </p>
        </div>
      </div>

      {/* Referral Link Hero Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-purple-800 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-700 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Gift className="w-3.5 h-3.5" />
              5.00% Instant Tier-1 Commission
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Your Unique Referral Link
            </h3>
            <p className="text-xs text-purple-200 mt-1 max-w-xl">
              Every investor who registers through your link is permanently bound as your direct downline partner. You automatically earn 5% on their deposits.
            </p>
          </div>
        </div>

        {/* Copy Box */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-950/80 p-2 rounded-2xl border border-purple-700/60">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="w-full bg-transparent px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none select-all"
          />
          <Button
            variant="primary"
            size="md"
            onClick={copyLink}
            rightIcon={copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            className="bg-purple-600 hover:bg-purple-500 shrink-0 font-bold"
          >
            {copied ? 'Copied Link' : 'Copy Link'}
          </Button>
        </div>
      </div>

      {/* Referral Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Downline</span>
            <Users className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 font-mono">{referrals?.length || 0}</p>
          <span className="text-xs text-slate-500 mt-1 block">Registered Partners</span>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Downline Volume</span>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 font-mono">
            ${(totalDownlineDeposits || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">Cumulative Principal</span>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Commissions Paid</span>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-emerald-600 font-mono">
            ${(currentUser?.referralEarnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">100% Settled to Balance</span>
        </div>

      </div>

      {/* Upline Sponsor Card */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Your Upline Sponsor
            </span>
            <p className="text-base font-bold text-slate-900">
              {upline ? `${upline.fullName} (@${upline.username})` : currentUser.uplineUsername ? `@${currentUser.uplineUsername}` : 'Direct Investor (No Upline)'}
            </p>
            <p className="text-xs text-slate-500">
              {upline ? 'Verified Active Partner' : 'Registered directly via platform portal'}
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Permanent Upline Relationship
        </div>
      </div>

      {/* Downline Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Downline Investors ({referrals?.length || 0})</h3>
        </div>

        {(referrals?.length || 0) === 0 ? (
          <div className="text-center py-16">
            <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No downline partners yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Share your referral link with colleagues and partners to begin earning instant 5% commission.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={copyLink}
              className="mt-4 bg-purple-600 hover:bg-purple-700"
            >
              Copy Referral Link
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 pl-6">Referred Investor</th>
                  <th className="py-3.5">Username</th>
                  <th className="py-3.5">Total Deposits</th>
                  <th className="py-3.5">Commission Generated (5%)</th>
                  <th className="py-3.5">Status</th>
                  <th className="py-3.5 text-right pr-6">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {referrals.map(ref => (
                  <tr key={ref.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 pl-6 font-bold text-slate-900">
                      {ref.referredFullName}
                    </td>
                    <td className="py-4 font-mono text-slate-600">
                      @{ref.referredUsername}
                    </td>
                    <td className="py-4 font-mono font-bold text-slate-900">
                      ${(ref?.totalDeposits || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 font-mono font-bold text-emerald-600">
                      +${(ref?.commissionsEarned || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4">
                      <Badge variant="success">{ref.status}</Badge>
                    </td>
                    <td className="py-4 text-right pr-6 font-mono text-slate-500 text-[11px]">
                      {new Date(ref.createdAt).toLocaleDateString()}
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
