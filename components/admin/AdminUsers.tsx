import React, { useState } from 'react';
import { 
  Users, 
  Search
} from 'lucide-react';
import { User, UserStatus } from '../../types';
import { authApi } from '../../lib/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';

interface AdminUsersProps {
  currentUser: User;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Balance adjustment modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [balanceType, setBalanceType] = useState<'available' | 'earning'>('available');
  const [adjustOperation, setAdjustOperation] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [adjustAmount, setAdjustAmount] = useState<number>(100);
  const [adjustReason, setAdjustReason] = useState('Administrative ledger adjustment');

  const { success, error: toastError } = useToast();

  const [allUsers, setAllUsers] = useState<User[]>([]);

  React.useEffect(() => {
    void authApi.adminUsers()
      .then(setAllUsers)
      .catch(error => toastError('Loading Error', error instanceof Error ? error.message : 'Unable to load users.'));
  }, [toastError]);

  const filtered = allUsers.filter(u => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  const handleOpenAdjust = (u: User) => {
    setTargetUser(u);
    setAdjustAmount(100);
    setAdjustReason('Manual administrative credit / correction');
    setAdjustModalOpen(true);
  };

  const handleConfirmAdjust = async () => {
    if (!targetUser) return;
    try {
      const updatedUser = await authApi.updateAdminUser({
        userId: targetUser.id,
        balanceType,
        operation: adjustOperation,
        amount: Number(adjustAmount),
        reason: adjustReason,
      });
      setAllUsers(users => users.map(user => user.id === updatedUser.id ? updatedUser : user));
      success('Balance Adjusted', `Successfully ${adjustOperation === 'CREDIT' ? 'credited' : 'debited'} $${adjustAmount} to ${targetUser.fullName}'s ${balanceType} balance.`);
      setAdjustModalOpen(false);
    } catch (error) {
      toastError('Adjustment Error', error instanceof Error ? error.message : 'Unable to adjust balance.');
    }
  };

  const handleToggleStatus = async (u: User, newStatus: UserStatus) => {
    try {
      const updatedUser = await authApi.updateAdminUser({ userId: u.id, status: newStatus });
      setAllUsers(users => users.map(user => user.id === updatedUser.id ? updatedUser : user));
      success('Status Updated', `${u.fullName} is now ${newStatus}`);
    } catch (error) {
      toastError('Status Update Error', error instanceof Error ? error.message : 'Unable to update status.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-400" />
            Investor Accounts Directory
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage registered clients, perform authoritative ledger adjustments, and audit account access.
          </p>
        </div>
      </div>

      {/* Search Controls */}
      <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search investors by full name, username, or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 pl-6">Investor</th>
                <th className="py-3.5">Available Balance</th>
                <th className="py-3.5">Locked In Plans</th>
                <th className="py-3.5">Upline Sponsor</th>
                <th className="py-3.5">Role & Status</th>
                <th className="py-3.5">Registered</th>
                <th className="py-3.5 text-right pr-6">Management Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 pl-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-900/60 border border-blue-700 text-blue-300 flex items-center justify-center font-bold text-xs">
                        {u.fullName.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-white block">{u.fullName}</span>
                        <span className="text-[11px] font-mono text-slate-400">@{u.username} • {u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 font-mono font-bold text-emerald-400 text-sm">
                    ${(u?.availableBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 font-mono text-slate-300">
                    ${(u?.earningBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 font-mono text-slate-400 text-[11px]">
                    {u.uplineUsername ? `@${u.uplineUsername}` : 'Direct (None)'}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        u.role === 'ADMIN' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {u.role}
                      </span>
                      <Badge variant={u.status === 'ACTIVE' ? 'success' : 'danger'}>
                        {u.status}
                      </Badge>
                    </div>
                  </td>
                  <td className="py-4 font-mono text-slate-400 text-[11px]">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenAdjust(u)}
                        className="bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700 text-xs py-1 px-2.5"
                      >
                        Adjust Balance
                      </Button>

                      {u.id !== currentUser.id && (
                        <select
                          value={u.status}
                          onChange={e => handleToggleStatus(u, e.target.value as UserStatus)}
                          className="py-1 px-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300 focus:outline-none"
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="SUSPENDED">SUSPENDED</option>
                          <option value="BANNED">BANNED</option>
                        </select>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Balance Modal */}
      {targetUser && (
        <Modal
          isOpen={adjustModalOpen}
          onClose={() => setAdjustModalOpen(false)}
          title="Authoritative Balance Adjustment"
          description={`Adjust financial ledger balance for ${targetUser.fullName} (@${targetUser.username}).`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Target Balance
                </label>
                <select
                  value={balanceType}
                  onChange={e => setBalanceType(e.target.value as 'available' | 'earning')}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                >
                  <option value="available">Available Balance</option>
                  <option value="earning">Earning (Locked) Balance</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Action
                </label>
                <select
                  value={adjustOperation}
                  onChange={e => setAdjustOperation(e.target.value as 'CREDIT' | 'DEBIT')}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                >
                  <option value="CREDIT">Credit (+ Add Funds)</option>
                  <option value="DEBIT">Debit (- Subtract Funds)</option>
                </select>
              </div>
            </div>

            <Input
              label="Adjustment Amount (USD)"
              type="number"
              min={1}
              step={10}
              value={adjustAmount}
              onChange={e => setAdjustAmount(Number(e.target.value))}
              required
            />

            <Input
              label="Audit Justification Reason"
              placeholder="e.g. Approved promotional incentive or balance correction"
              value={adjustReason}
              onChange={e => setAdjustReason(e.target.value)}
              helperText="This explanation will be permanently recorded in the system audit trail."
              required
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setAdjustModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmAdjust}
                className="bg-amber-600 hover:bg-amber-700 font-bold"
              >
                Apply Ledger Adjustment
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
