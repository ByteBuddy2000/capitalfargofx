import React, { useState } from 'react';
import { 
  ArrowUpFromLine, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Send, 
  AlertCircle 
} from 'lucide-react';
import { User, Withdrawal } from '../../types';
import { storage } from '../../lib/storage';
import { authApi } from '../../lib/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';

interface AdminWithdrawalsProps {
  currentUser: User;
}

export const AdminWithdrawals: React.FC<AdminWithdrawalsProps> = ({ currentUser }) => {
  const [filter, setFilter] = useState<'PENDING' | 'ALL' | 'COMPLETED' | 'REJECTED'>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [targetWithdrawal, setTargetWithdrawal] = useState<Withdrawal | null>(null);
  
  const [broadcastTxHash, setBroadcastTxHash] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [allWithdrawals, setAllWithdrawals] = useState<Withdrawal[]>([]);

  const { success, error: toastError } = useToast();

  React.useEffect(() => {
    authApi.adminWithdrawals().then(setAllWithdrawals).catch(error => toastError('Loading Error', error instanceof Error ? error.message : 'Unable to load withdrawals.'));
  }, [toastError]);

  const filtered = allWithdrawals.filter(w => {
    if (filter !== 'ALL' && w.status !== filter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchUser = w.userFullName.toLowerCase().includes(q) || w.userId.toLowerCase().includes(q);
      const matchDest = w.destinationAddress.toLowerCase().includes(q);
      if (!matchUser && !matchDest) return false;
    }
    return true;
  });

  const handleOpenApprove = (w: Withdrawal) => {
    setTargetWithdrawal(w);
    setBroadcastTxHash(`0x${Math.random().toString(36).substring(2, 12)}broadcast_${Date.now()}`);
    setApproveModalOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!targetWithdrawal) return;
    try {
      await authApi.updateWithdrawal(targetWithdrawal.id, 'COMPLETED', broadcastTxHash);
      setAllWithdrawals(withdrawals => withdrawals.map(item => item.id === targetWithdrawal.id ? { ...item, status: 'COMPLETED', txHash: broadcastTxHash } : item));
      success('Withdrawal Dispatched', `$${targetWithdrawal.amount.toLocaleString()} broadcast to blockchain network!`);
      setApproveModalOpen(false);
    } catch (error) {
      toastError('Approval Error', error instanceof Error ? error.message : 'Unable to process withdrawal.');
    }
  };

  const handleOpenReject = (w: Withdrawal) => {
    setTargetWithdrawal(w);
    setRejectReason('Invalid or blacklisted wallet address. Balance restored.');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!targetWithdrawal) return;
    try {
      await authApi.updateWithdrawal(targetWithdrawal.id, 'REJECTED', '', rejectReason);
      setAllWithdrawals(withdrawals => withdrawals.map(item => item.id === targetWithdrawal.id ? { ...item, status: 'REJECTED' } : item));
      success('Withdrawal Rejected & Refunded', `$${targetWithdrawal.amount.toLocaleString()} refunded to user available balance.`);
      setRejectModalOpen(false);
    } catch (error) {
      toastError('Error', error instanceof Error ? error.message : 'Unable to reject withdrawal.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ArrowUpFromLine className="w-6 h-6 text-amber-400" />
            Withdrawal Execution Queue
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Authorize outbound cryptocurrency liquidations and broadcast network transaction hashes.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4">
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
                  ? allWithdrawals.length
                  : allWithdrawals.filter(w => w.status === tab).length
              })
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Investor or destination wallet address..."
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
            No withdrawals found in this view.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 pl-6">Investor</th>
                  <th className="py-3.5">Amount (USD)</th>
                  <th className="py-3.5">Asset</th>
                  <th className="py-3.5">Destination Address</th>
                  <th className="py-3.5">Broadcast Hash</th>
                  <th className="py-3.5">Status</th>
                  <th className="py-3.5">Requested</th>
                  <th className="py-3.5 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map(w => (
                  <tr key={w.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 pl-6">
                      <span className="font-bold text-white block">{w.userFullName}</span>
                      <span className="text-[11px] font-mono text-slate-400">{w.userEmail}</span>
                    </td>
                    <td className="py-4 font-mono font-black text-amber-400 text-sm">
                      ${(w?.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 font-bold text-white">
                      {w.cryptoCurrency} ({w.network})
                    </td>
                    <td className="py-4 font-mono text-[11px] text-slate-300 max-w-xs break-all">
                      {w.destinationAddress}
                    </td>
                    <td className="py-4 font-mono text-[11px] text-emerald-400 max-w-[150px] truncate">
                      {w.transactionHash || '—'}
                    </td>
                    <td className="py-4">
                      <Badge variant={w.status === 'COMPLETED' ? 'success' : w.status === 'PENDING' ? 'warning' : 'danger'}>
                        {w.status}
                      </Badge>
                    </td>
                    <td className="py-4 font-mono text-slate-400 text-[11px]">
                      {new Date(w.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 text-right pr-6">
                      {w.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleOpenApprove(w)}
                            className="bg-amber-600 hover:bg-amber-700 text-slate-950 font-bold text-xs"
                          >
                            Dispatch
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenReject(w)}
                            className="bg-rose-950/40 border-rose-800 text-rose-300 hover:bg-rose-900 text-xs"
                          >
                            Reject & Refund
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono">Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {targetWithdrawal && (
        <Modal
          isOpen={approveModalOpen}
          onClose={() => setApproveModalOpen(false)}
          title="Broadcast & Finalize Withdrawal"
          description={`Dispatching $${(targetWithdrawal?.amount || 0).toLocaleString()} ${targetWithdrawal.cryptoCurrency} to ${targetWithdrawal.destinationAddress}.`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <Input
              label="Blockchain Broadcast TXID Hash"
              placeholder="e.g. 0x8a72b..."
              value={broadcastTxHash}
              onChange={e => setBroadcastTxHash(e.target.value)}
              helperText="Enter the network transaction ID after broadcasting the transfer."
              required
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setApproveModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmApprove}
                className="bg-amber-600 hover:bg-amber-700 font-bold"
              >
                Confirm Broadcast
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      {targetWithdrawal && (
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title="Reject Withdrawal & Refund Balance"
          description={`Rejecting will immediately refund $${(targetWithdrawal?.amount || 0).toLocaleString()} back to ${targetWithdrawal.userFullName}'s Available Balance.`}
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
                Reject & Restore Balance
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
