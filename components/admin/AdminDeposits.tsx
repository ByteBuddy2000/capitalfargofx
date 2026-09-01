import React, { useState } from 'react';
import { 
  ArrowDownToLine, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Clock, 
  Copy, 
  Check 
} from 'lucide-react';
import { User, Deposit } from '../../types';
import { storage } from '../../lib/storage';
import { authApi } from '../../lib/api';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';

interface AdminDepositsProps {
  currentUser: User;
}

export const AdminDeposits: React.FC<AdminDepositsProps> = ({ currentUser }) => {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'REJECTED'>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Rejection modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [targetDeposit, setTargetDeposit] = useState<Deposit | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [allDeposits, setAllDeposits] = useState<Deposit[]>([]);

  const { success, error: toastError } = useToast();

  React.useEffect(() => {
    authApi.adminDeposits().then(setAllDeposits).catch(error => toastError('Loading Error', error instanceof Error ? error.message : 'Unable to load deposits.'));
  }, [toastError]);

  const filtered = allDeposits.filter(d => {
    if (filter !== 'ALL' && d.status !== filter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchUser = d.userFullName.toLowerCase().includes(q) || d.userId.toLowerCase().includes(q);
      const matchTx = d.transactionHash?.toLowerCase().includes(q) ?? false;
      const matchPlan = d.planName.toLowerCase().includes(q);
      if (!matchUser && !matchTx && !matchPlan) return false;
    }
    return true;
  });

  const handleApprove = async (deposit: Deposit) => {
    try {
      await authApi.approveDeposit(deposit.id);
      setAllDeposits(deposits => deposits.map(item => item.id === deposit.id ? { ...item, status: 'APPROVED' } : item));
      success('Deposit Approved', `$${deposit.amount.toLocaleString()} funded into ${deposit.planName || 'investment'} plan!`);
    } catch (error) {
      toastError('Approval Error', error instanceof Error ? error.message : 'Unable to approve deposit.');
    }
  };

  const handleOpenReject = (deposit: Deposit) => {
    setTargetDeposit(deposit);
    setRejectReason('Unconfirmed blockchain transaction hash or payment mismatch.');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!targetDeposit) return;
    try {
      await authApi.rejectDeposit(targetDeposit.id, rejectReason);
      success('Deposit Rejected', `Deposit #${targetDeposit.id.substring(0, 10)} marked as rejected.`);
      setRejectModalOpen(false);
    } catch (error) {
      toastError('Error', error instanceof Error ? error.message : 'Unable to reject deposit.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ArrowDownToLine className="w-6 h-6 text-emerald-400" />
            Deposit Verification Queue
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review submitted blockchain transaction hashes, approve capital deposits, and deploy yield contracts.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4">
        
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-800">
          {(['PENDING', 'ALL', 'COMPLETED', 'REJECTED'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {tab} ({
                tab === 'ALL'
                  ? allDeposits.length
                  : allDeposits.filter(d => d.status === tab).length
              })
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Investor name, plan, or TXID hash..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-amber-500"
          />
        </div>

      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            No deposits found in this view.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 pl-6">Investor</th>
                  <th className="py-3.5">Plan & Amount</th>
                  <th className="py-3.5">Crypto & Network</th>
                  <th className="py-3.5">Transaction Hash (TXID)</th>
                  <th className="py-3.5">Status</th>
                  <th className="py-3.5">Submitted</th>
                  <th className="py-3.5 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map(d => (
                  <tr key={d.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 pl-6">
                      <span className="font-bold text-white block">{d.userFullName}</span>
                      <span className="text-[11px] font-mono text-slate-400">{d.userEmail}</span>
                    </td>
                    <td className="py-4">
                      <span className="font-mono font-black text-emerald-400 text-sm block">
                        ${(d?.amount || 0).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-semibold">{d.planName} Plan</span>
                    </td>
                    <td className="py-4">
                      <span className="font-bold text-white">{d.cryptoCurrency}</span>
                      <span className="text-[10px] text-slate-400 block">{d.network}</span>
                    </td>
                    <td className="py-4">
                      <span className="font-mono text-[11px] text-amber-300 select-all break-all block max-w-xs">
                        {d.transactionHash}
                      </span>
                    </td>
                    <td className="py-4">
                      <Badge variant={d.status === 'COMPLETED' ? 'success' : d.status === 'PENDING' ? 'warning' : 'danger'}>
                        {d.status}
                      </Badge>
                    </td>
                    <td className="py-4 font-mono text-slate-400 text-[11px]">
                      {new Date(d.createdAt).toLocaleDateString()} {new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 text-right pr-6">
                      {d.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleApprove(d)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenReject(d)}
                            className="bg-rose-950/40 border-rose-800 text-rose-300 hover:bg-rose-900 text-xs"
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {targetDeposit && (
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title="Reject Deposit Request"
          description={`Reject deposit of $${(targetDeposit?.amount || 0).toLocaleString()} for ${targetDeposit.userFullName}.`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Reason for Rejection
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmReject}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
