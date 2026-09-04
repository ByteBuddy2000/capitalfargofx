import React, { useState } from 'react';
import { 
  ReceiptText, 
  Search, 
  Filter, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Layers, 
  TrendingUp, 
  Users
} from 'lucide-react';
import { User, TransactionType } from '../../types';
import { storage } from '../../lib/storage';
import { Badge } from '../ui/Badge';

interface TransactionsViewProps {
  currentUser: User;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ currentUser }) => {
  const [activeTypeTab, setActiveTypeTab] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const allTransactions = storage.getTransactionsByUser(currentUser?.id || '') || [];

  const filtered = allTransactions.filter(tx => {
    if (!tx) return false;
    // Type tab filter
    if (activeTypeTab === 'DEPOSIT' && tx.type !== 'DEPOSIT') return false;
    if (activeTypeTab === 'WITHDRAWAL' && tx.type !== 'WITHDRAWAL') return false;
    if (activeTypeTab === 'INVESTMENT' && tx.type !== 'INVESTMENT_DEBIT') return false;
    if (activeTypeTab === 'PROFIT' && tx.type !== 'PROFIT_PAYOUT' && tx.type !== 'PRINCIPAL_RETURN') return false;
    if (activeTypeTab === 'REFERRAL' && tx.type !== 'REFERRAL_COMMISSION') return false;

    // Status filter
    if (statusFilter !== 'ALL' && tx.status !== statusFilter) return false;

    // Search query
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchId = tx.id ? tx.id.toLowerCase().includes(term) : false;
      const matchDesc = tx.description ? tx.description.toLowerCase().includes(term) : false;
      const matchHash = tx.txHash ? tx.txHash.toLowerCase().includes(term) : false;
      const matchAsset = tx.asset ? tx.asset.toLowerCase().includes(term) : false;
      if (!matchId && !matchDesc && !matchHash && !matchAsset) return false;
    }

    return true;
  });

  const getStatusBadge = (status: string) => {
    if (status === 'COMPLETED') return <Badge variant="success">COMPLETED</Badge>;
    if (status === 'PENDING') return <Badge variant="warning">PENDING</Badge>;
    return <Badge variant="danger">REJECTED</Badge>;
  };

  const getTypeIcon = (type: TransactionType) => {
    switch (type) {
      case 'DEPOSIT':
        return <ArrowDownToLine className="w-4 h-4 text-emerald-500" />;
      case 'WITHDRAWAL':
        return <ArrowUpFromLine className="w-4 h-4 text-amber-500" />;
      case 'INVESTMENT_DEBIT':
        return <Layers className="w-4 h-4 text-blue-500" />;
      case 'PROFIT_PAYOUT':
      case 'PRINCIPAL_RETURN':
        return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case 'REFERRAL_COMMISSION':
        return <Users className="w-4 h-4 text-purple-500" />;
      default:
        return <ReceiptText className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <ReceiptText className="w-6 h-6 text-slate-800" />
            Transaction Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Immutable double-entry financial records and audit receipts for your account.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        
        {/* Type Tabs */}
        <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-100">
          {[
            { id: 'ALL', label: 'All Operations' },
            { id: 'DEPOSIT', label: 'Deposits' },
            { id: 'WITHDRAWAL', label: 'Withdrawals' },
            { id: 'INVESTMENT', label: 'Investments' },
            { id: 'PROFIT', label: 'Earnings & Yield' },
            { id: 'REFERRAL', label: 'Referral Bonus' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTypeTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTypeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Status Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Transaction ID, description, or TXID hash..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="sm:col-span-4 flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

      </div>

      {/* Transactions Table / List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {(filtered?.length || 0) === 0 ? (
          <div className="text-center py-16">
            <ReceiptText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No transactions match your search</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting your filter parameters or search keyword.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 pl-6">Type & Operation</th>
                  <th className="py-3.5">Description</th>
                  <th className="py-3.5">Amount (USD)</th>
                  <th className="py-3.5">Asset</th>
                  <th className="py-3.5">Status</th>
                  <th className="py-3.5 text-right pr-6">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(tx => {
                  const isDebit = tx.type === 'WITHDRAWAL' || tx.type === 'INVESTMENT_DEBIT';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 pl-6">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-slate-100">
                            {getTypeIcon(tx.type)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{tx.type}</span>
                            <span className="font-mono text-[10px] text-slate-400">ID: {tx.id.substring(0, 10)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <p className="text-slate-800 font-medium">{tx.description}</p>
                        {tx.txHash && (
                          <p className="text-[10px] font-mono text-slate-400 truncate max-w-xs mt-0.5">
                            TXID: {tx.txHash}
                          </p>
                        )}
                      </td>
                      <td className="py-4 font-mono font-bold">
                        <span className={isDebit ? 'text-slate-900' : 'text-emerald-600'}>
                          {isDebit ? '-' : '+'}${(tx?.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-4 font-bold text-slate-600 font-mono">
                        {tx.cryptoCurrency || 'USD'}
                      </td>
                      <td className="py-4">
                        {getStatusBadge(tx.status)}
                      </td>
                      <td className="py-4 text-right pr-6 font-mono text-slate-500 text-[11px]">
                        <div>{new Date(tx.createdAt).toLocaleDateString()}</div>
                        <div className="text-[10px] text-slate-400">{new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
