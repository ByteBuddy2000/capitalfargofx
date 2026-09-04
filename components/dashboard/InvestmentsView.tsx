import React, { useState } from 'react';
import { 
  Layers, 
  ArrowRight, 
  Play, 
  ShieldCheck
} from 'lucide-react';
import { User, Investment } from '../../types';
import { authApi } from '../../lib/api';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';

interface InvestmentsViewProps {
  currentUser: User;
  onNavigateDeposit: () => void;
}

export const InvestmentsView: React.FC<InvestmentsViewProps> = ({
  onNavigateDeposit,
}) => {
  const [currentTime] = useState(() => Date.now());
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [allInvestments, setAllInvestments] = useState<Investment[]>([]);
  const { success, info } = useToast();

  React.useEffect(() => {
    authApi.investments().then(setAllInvestments).catch(error => info('Unable to load investments', error instanceof Error ? error.message : 'Please try again.'));
  }, [info]);
  const filtered = allInvestments.filter(i => {
    if (!i) return false;
    if (filter === 'ACTIVE') return i.status === 'ACTIVE';
    if (filter === 'COMPLETED') return i.status === 'COMPLETED';
    return true;
  });

  const totalActiveCapital = allInvestments
    .filter(i => i && i.status === 'ACTIVE')
    .reduce((sum, i) => sum + (i?.amount || 0), 0);

  const totalCompletedProfits = allInvestments
    .filter(i => i && i.status === 'COMPLETED')
    .reduce((sum, i) => sum + (i?.expectedProfit || 0), 0);

  const handleSettle = async (invId: string) => {
    try {
      const result = await authApi.settleInvestment(invId);
      setAllInvestments(investments => investments.map(investment => investment.id === result.investment.id ? result.investment : investment));
      success('Contract Matured & Settled', `Principal and $${result.investment.expectedProfit.toLocaleString()} profit deposited!`);
    } catch (error) {
      info('Notice', error instanceof Error ? error.message : 'Unable to settle investment.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-blue-600" />
            My Investment Portfolio
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Active and historical yield-generating cryptocurrency contracts.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={onNavigateDeposit}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="bg-blue-600 hover:bg-blue-700"
        >
          New Investment Contract
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Active Capital in Contracts
          </span>
          <p className="text-2xl font-black font-mono text-slate-900 mt-1">
            ${(totalActiveCapital || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-blue-600 font-semibold mt-1 block">
            {(allInvestments || []).filter(i => i && i.status === 'ACTIVE').length} active cycle(s)
          </span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Realized Historical Profits
          </span>
          <p className="text-2xl font-black font-mono text-emerald-600 mt-1">
            +${(totalCompletedProfits || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            {(allInvestments || []).filter(i => i && i.status === 'COMPLETED').length} settled contract(s)
          </span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Accounting Security
          </span>
          <p className="text-sm font-bold text-slate-900 mt-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Double-Entry Verified
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            100% Principal Protection Guarantee
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === tab
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab} Contracts ({
              tab === 'ALL' 
                ? (allInvestments?.length || 0) 
                : tab === 'ACTIVE'
                ? (allInvestments || []).filter(i => i && i.status === 'ACTIVE').length
                : (allInvestments || []).filter(i => i && i.status === 'COMPLETED').length
            })
          </button>
        ))}
      </div>

      {/* Investments List */}
      {(filtered?.length || 0) === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
          <Layers className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No {filter.toLowerCase()} contracts found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Fund your desired plan to start compounding returns under institutional liquidity parameters.
          </p>
          <Button
            variant="primary"
            onClick={onNavigateDeposit}
            className="mt-5"
          >
            Choose an Investment Plan
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(inv => {
            const start = new Date(inv.startDate).getTime();
            const end = new Date(inv.maturityDate).getTime();
            const now = currentTime;
            const progress = inv.status === 'COMPLETED' 
              ? 100 
              : Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));

            return (
              <div
                key={inv.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">{inv.planName} Plan</h3>
                      <p className="text-[11px] font-mono text-slate-400">Ref #{inv.id.substring(0, 14)}</p>
                    </div>
                    <Badge variant={inv.status === 'ACTIVE' ? 'success' : 'neutral'}>
                      {inv.status} (+{inv.returnPercentage}%)
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-2xl mb-4 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Invested Principal</span>
                      <span className="font-bold font-mono text-slate-900">${(inv?.amount || 0).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Yield Profit</span>
                      <span className="font-bold font-mono text-emerald-600">+{inv?.returnPercentage || 0}% (${(inv?.expectedProfit || 0).toLocaleString()})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Total Maturity</span>
                      <span className="font-bold font-mono text-slate-900">${(inv?.totalReturn || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Maturity Progress</span>
                      <span className="font-bold font-mono text-slate-900">{progress}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          inv.status === 'COMPLETED'
                            ? 'bg-emerald-500'
                            : 'bg-gradient-to-r from-blue-600 to-emerald-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 space-y-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100 mb-4">
                    <div className="flex justify-between">
                      <span>Contract Activated:</span>
                      <span className="font-mono text-slate-700">{new Date(inv.startDate).toLocaleDateString()} {new Date(inv.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Scheduled Maturity:</span>
                      <span className="font-mono text-slate-700">{new Date(inv.maturityDate).toLocaleDateString()} {new Date(inv.maturityDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-bold text-slate-800">{inv.durationHours} Hours Cycle</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] font-semibold text-slate-500">
                    {inv.status === 'ACTIVE' ? 'Status: Compounding In Progress' : 'Status: Contract Settled'}
                  </div>

                  {inv.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleSettle(inv.id)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 border border-blue-200 cursor-pointer transition-colors"
                      title="Simulate contract maturity for testing"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Simulate Settlement
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
