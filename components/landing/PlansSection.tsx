import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Check, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  Users, 
  Calculator, 
  DollarSign, 
  TrendingUp,
  Percent,
  CheckCircle2
} from 'lucide-react';
import { InvestmentPlan } from '../../types';
import { Button } from '../ui/Button';
import { storage } from '../../lib/storage';

interface PlansSectionProps {
  plans?: InvestmentPlan[];
  onSelectPlan?: (plan: InvestmentPlan) => void;
}

export const PlansSection: React.FC<PlansSectionProps> = ({ plans, onSelectPlan }) => {
  const activePlans = plans && plans.length > 0 ? plans : storage.getPlans();
  const [calculatorAmount, setCalculatorAmount] = useState<number>(10000);
  const [selectedCalcPlanId, setSelectedCalcPlanId] = useState<string>(activePlans[1]?.id || activePlans[0]?.id || 'plan-gold');

  const currentCalcPlan = activePlans.find(p => p.id === selectedCalcPlanId) || activePlans[0];

  // Dynamic calculations
  const calcAmount = Math.max(100, calculatorAmount || 100);
  const calculatedProfit = (calcAmount * (currentCalcPlan?.returnPercentage || 0)) / 100;
  const calculatedTotal = currentCalcPlan?.principalReturn ? calcAmount + calculatedProfit : calculatedProfit;
  const calculatedReferral = (calcAmount * (currentCalcPlan?.referralPercentage || 5)) / 100;

  return (
    <section id="plans" className="py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-950 border border-blue-800 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Structured Yield Tiers
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Transparent Investment Plans
          </h2>
          <p className="text-base text-slate-300 mt-4 leading-relaxed">
            Select an institutional contract tier configured for automated yield distribution and principal recovery.
          </p>
        </div>

        {/* 3 Core Investment Plan Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-20">
          {activePlans.map((plan, idx) => {
            const isGold = plan.slug === 'gold' || plan.featured;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  isGold
                    ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-emerald-500 shadow-2xl shadow-emerald-950/50 scale-100 lg:scale-105 z-20'
                    : 'bg-slate-950/80 border border-slate-800 hover:border-slate-700 shadow-xl'
                }`}
              >
                {/* Featured Badge */}
                {isGold && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md">
                    ★ Most Popular Choice
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-black text-white tracking-tight">{plan.name}</h3>
                    <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                      {plan.durationHours}h Cycle
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 min-h-[36px] leading-relaxed mb-6">
                    {plan.description}
                  </p>

                  {/* Return Percentage Highlight */}
                  <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 mb-6">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Contract Yield
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-4xl font-black text-emerald-400">{plan.returnPercentage}%</span>
                      <span className="text-xs text-slate-400 font-medium">ROI / {plan.durationHours} Hours</span>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="space-y-3.5 text-xs text-slate-300 mb-8">
                    <li className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                      <span className="text-slate-400">Minimum Deposit:</span>
                      <span className="font-bold text-white font-mono">${(plan?.minimumAmount || 0).toLocaleString()}</span>
                    </li>
                    <li className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                      <span className="text-slate-400">Maximum Deposit:</span>
                      <span className="font-bold text-white font-mono">
                        {(plan?.maximumAmount || 0) > 0 ? `$${(plan?.maximumAmount || 0).toLocaleString()}` : 'Unlimited'}
                      </span>
                    </li>
                    <li className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                      <span className="text-slate-400">Duration / Lock:</span>
                      <span className="font-bold text-emerald-400 font-mono">{plan?.durationHours || 24} Hours</span>
                    </li>
                    <li className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                      <span className="text-slate-400">Principal Return:</span>
                      <span className="font-bold text-white flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Yes, 100% Back
                      </span>
                    </li>
                    <li className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                      <span className="text-slate-400">Affiliate Commission:</span>
                      <span className="font-bold text-blue-400 font-mono">{plan?.referralPercentage || 5}% Instant</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-slate-400">Deposit / Setup Fee:</span>
                      <span className="font-bold text-slate-200">0.00% (Free)</span>
                    </li>
                  </ul>
                </div>

                <Button
                  size="lg"
                  variant={isGold ? 'primary' : 'outline'}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => plan && onSelectPlan?.(plan)}
                  className={`w-full justify-center py-3.5 font-bold ${
                    isGold
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 border-none shadow-lg shadow-emerald-500/25'
                      : 'bg-slate-900 border-slate-700 text-white hover:bg-slate-800'
                  }`}
                >
                  Choose {plan?.name || 'Plan'}
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Interactive Live Investment Profit Calculator */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 max-w-4xl mx-auto shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                <Calculator className="w-4 h-4" />
                Live Yield Simulator
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Calculate Your Projected Return
              </h3>
            </div>
            {/* Plan Selector Buttons */}
            <div className="flex flex-wrap gap-2">
              {activePlans.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedCalcPlanId(p.id);
                    if (calculatorAmount < (p?.minimumAmount || 0)) {
                      setCalculatorAmount(p?.minimumAmount || 100);
                    }
                  }}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    selectedCalcPlanId === p.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {p.name} ({p.returnPercentage}%)
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Slider and Input Controls */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Investment Capital (USD)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-slate-500 font-bold text-lg">$</span>
                  <input
                    type="number"
                    min={currentCalcPlan?.minimumAmount || 100}
                    max={(currentCalcPlan?.maximumAmount || 0) > 0 ? currentCalcPlan.maximumAmount : 1000000}
                    step={100}
                    value={calculatorAmount}
                    onChange={(e) => setCalculatorAmount(Number(e.target.value))}
                    className="w-full pl-9 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-lg font-mono font-bold text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Range Slider */}
              <div>
                <input
                  type="range"
                  min={currentCalcPlan?.minimumAmount || 100}
                  max={(currentCalcPlan?.maximumAmount || 0) > 0 ? currentCalcPlan.maximumAmount : 50000}
                  step={100}
                  value={calculatorAmount}
                  onChange={(e) => setCalculatorAmount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-2">
                  <span>Min: ${(currentCalcPlan?.minimumAmount || 100).toLocaleString()}</span>
                  <span>
                    Max: {(currentCalcPlan?.maximumAmount || 0) > 0 ? `$${(currentCalcPlan?.maximumAmount || 0).toLocaleString()}` : 'Unlimited'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Calculated under {currentCalcPlan?.name || 'Configured Plan'} ({currentCalcPlan?.durationHours || 24} Hours Cycle)</span>
              </div>
            </div>

            {/* Simulated Return Summary Box */}
            <div className="lg:col-span-6 bg-slate-900/90 rounded-2xl p-6 border border-slate-800">
              <div className="space-y-3.5 text-xs text-slate-300">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Principal Investment:</span>
                  <span className="font-mono font-bold text-white">${(calcAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Configured Yield ({currentCalcPlan?.returnPercentage || 0}%):</span>
                  <span className="font-mono font-bold text-emerald-400">+${(calculatedProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Principal Return:</span>
                  <span className="font-bold text-emerald-400">100% Unlocked</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Upline Affiliate Bonus (5%):</span>
                  <span className="font-mono font-bold text-blue-400">${(calculatedReferral || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-bold text-white">Total Payout at Maturity:</span>
                  <span className="text-2xl font-mono font-black text-emerald-400">
                    ${(calculatedTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => currentCalcPlan && onSelectPlan?.(currentCalcPlan)}
                className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold border-none"
              >
                Invest ${(calcAmount || 0).toLocaleString()} in {currentCalcPlan?.name || 'Selected Plan'}
              </Button>
            </div>

          </div>

          <p className="text-[11px] text-slate-500 mt-6 text-center leading-relaxed">
            Disclaimer: Investment returns and payouts are strictly determined server-side based on configured contract terms, active operational liquidity, and applicable terms of service.
          </p>
        </div>

      </div>
    </section>
  );
};
