import React from 'react';
import { 
  Users, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Layers, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowRight,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { User, Deposit, Withdrawal } from '../../types';
import { storage } from '../../lib/storage';
import { ledgerEngine } from '../../lib/ledgerEngine';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';
import { AdminTab } from './AdminLayout';

interface AdminOverviewProps {
  currentUser: User;
  onNavigateTab: (tab: AdminTab) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ currentUser, onNavigateTab }) => {
  const { success, error: toastError } = useToast();

  const users = storage.getUsers();
  const deposits = storage.getDeposits();
  const withdrawals = storage.getWithdrawals();
  const investments = storage.getInvestments();
  const auditLogs = storage.getAuditLogs().slice(0, 6);

  const pendingDeposits = deposits.filter(d => d.status === 'PENDING');
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'PENDING');

  const totalDepositsVolume = deposits
    .filter(d => d.status === 'COMPLETED')
    .reduce((sum, d) => sum + d.amount, 0);

  const totalWithdrawalsVolume = withdrawals
    .filter(w => w.status === 'COMPLETED')
    .reduce((sum, w) => sum + w.amount, 0);

  const totalActiveCapital = investments
    .filter(i => i.status === 'ACTIVE')
    .reduce((sum, i) => sum + i.amount, 0);

  const handleQuickApproveDeposit = (deposit: Deposit) => {
    try {
      const res = ledgerEngine.approveDeposit(deposit.id, currentUser.id);
      if (res.success) {
        success('Deposit Approved', `$${(deposit?.amount || 0).toLocaleString()} credited and investment activated!`);
      }
    } catch (e: any) {
      toastError('Approval Error', e.message);
    }
  };

  const handleQuickApproveWithdrawal = (withdrawal: Withdrawal) => {
    try {
      const res = ledgerEngine.approveWithdrawal(withdrawal.id, currentUser.id);
      if (res.success) {
        success('Withdrawal Dispatched', `$${(withdrawal?.amount || 0).toLocaleString()} broadcast to blockchain network.`);
      }
    } catch (e: any) {
      toastError('Approval Error', e.message);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
            Institutional Operations Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Financial & Node Administration
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Real-time ledger reconciliation, cryptocurrency verification queues, and system parameters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={() => onNavigateTab('deposits')}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border-none"
          >
            Review Deposit Queue ({pendingDeposits.length})
          </Button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Registered Investors</span>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-black text-white font-mono">{users.length}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Verified Portfolios</span>
        </div>

        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Settled Deposits</span>
            <ArrowDownToLine className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400 font-mono">
            ${(totalDepositsVolume || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">100% On-Chain Settled</span>
        </div>

        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Active Contract Capital</span>
            <Layers className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-black text-purple-400 font-mono">
            ${(totalActiveCapital || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-purple-300 font-semibold mt-1 block">Yield Generating Cycles</span>
        </div>

        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Withdrawals</span>
            <ArrowUpFromLine className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-amber-400 font-mono">
            ${(totalWithdrawalsVolume || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-amber-300 font-semibold mt-1 block">Executed Liquidity</span>
        </div>

      </div>

      {/* Pending Queues Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Pending Deposits Queue */}
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ArrowDownToLine className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Pending Deposits ({pendingDeposits.length})</h3>
            </div>
            <button
              onClick={() => onNavigateTab('deposits')}
              className="text-xs font-bold text-amber-400 hover:underline cursor-pointer"
            >
              View All →
            </button>
          </div>

          {pendingDeposits.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">No deposits awaiting verification.</p>
          ) : (
            <div className="space-y-3">
              {pendingDeposits.slice(0, 3).map(dep => (
                <div key={dep.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white text-sm">{dep.userFullName}</span>
                      <span className="text-slate-400 font-mono text-[11px] block">@{dep.userId}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black text-emerald-400 text-base">
                        ${(dep?.amount || 0).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">{dep.cryptoCurrency} ({dep.planName})</span>
                    </div>
                  </div>

                  <div className="p-2 bg-slate-900 rounded-xl font-mono text-[10px] text-slate-400 truncate">
                    TXID: {dep.transactionHash}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleQuickApproveDeposit(dep)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold"
                    >
                      Approve & Credit Plan
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Withdrawals Queue */}
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ArrowUpFromLine className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">Pending Withdrawals ({pendingWithdrawals.length})</h3>
            </div>
            <button
              onClick={() => onNavigateTab('withdrawals')}
              className="text-xs font-bold text-amber-400 hover:underline cursor-pointer"
            >
              View All →
            </button>
          </div>

          {pendingWithdrawals.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">No withdrawals pending liquidity dispatch.</p>
          ) : (
            <div className="space-y-3">
              {pendingWithdrawals.slice(0, 3).map(w => (
                <div key={w.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white text-sm">{w.userFullName}</span>
                      <span className="text-slate-400 font-mono text-[11px] block">To: {w.destinationAddress.substring(0, 14)}...</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black text-amber-400 text-base">
                        ${(w?.amount || 0).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">{w.cryptoCurrency}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleQuickApproveWithdrawal(w)}
                      className="bg-amber-600 hover:bg-amber-700 text-slate-950 text-xs font-bold"
                    >
                      Approve & Broadcast
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Recent System Audit Logs Preview */}
      <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">Recent System Audit Trail</h3>
          </div>
          <button
            onClick={() => onNavigateTab('audit')}
            className="text-xs font-bold text-blue-400 hover:underline cursor-pointer"
          >
            Full Audit Logs →
          </button>
        </div>

        <div className="space-y-2.5">
          {auditLogs.map(log => (
            <div key={log.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-amber-400 mr-2">[{log.action}]</span>
                <span className="text-slate-300 font-medium">{log.notes || `${log.entity} ${log.entityId}`}</span>
                <span className="text-slate-500 ml-2 font-mono text-[11px]">by @{log.actorUsername}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 shrink-0">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
