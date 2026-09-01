import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Layers, 
  Activity, 
  Lock, 
  Cpu, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { Button } from '../ui/Button';

interface AboutSectionProps {
  onOpenRegister?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onOpenRegister }) => {
  return (
    <section id="about" className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Visual Tech Graphic & System Highlights */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-3xl bg-slate-900 text-white p-8 border border-slate-800 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-emerald-600/20 rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 w-fit text-[11px] font-semibold text-blue-400 mb-6">
                  <Cpu className="w-3.5 h-3.5" />
                  Enterprise Grade Architecture
                </div>

                <h3 className="text-2xl font-bold text-white tracking-tight mb-4">
                  Autonomous Asset Liquidity & Yield Engine
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  Our proprietary financial core orchestrates cross-chain decentralized liquidity pools, automated arbitrage settlements, and collateralized digital strategies to ensure dependable scheduled payouts.
                </p>

                {/* Metrics Pill Grid */}
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <span className="text-xs text-slate-300">Audited Ledger Architecture</span>
                    <span className="text-xs font-bold text-emerald-400">100% Immutable</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <span className="text-xs text-slate-300">Cold-Vault Capital Reserves</span>
                    <span className="text-xs font-bold text-blue-400">Multi-Signature</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <span className="text-xs text-slate-300">Withdrawal Execution SLA</span>
                    <span className="text-xs font-bold text-white">Instant / Automated</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Institutional Value Proposition */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 flex flex-col items-start"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              About CapitalFargoFX
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
              Built Around Smarter Financial Management
            </h2>

            <p className="text-base text-slate-600 leading-relaxed mb-6">
              CapitalFargoFX is an international digital asset management and cryptocurrency investment firm engineered to deliver structured returns. By combining cutting-edge algorithmic market routing with institutional transparency, we bridge traditional financial rigor and decentralized digital opportunity.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-8">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Structured Plans</h4>
                  <p className="text-xs text-slate-500 mt-1">Predefined 24h & 72h contract terms with guaranteed principal protection.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Real-Time Monitoring</h4>
                  <p className="text-xs text-slate-500 mt-1">Live portfolio performance metrics, maturity counters, and balance ledgers.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Cold-Storage Custody</h4>
                  <p className="text-xs text-slate-500 mt-1">Institutional multi-sig protection over all Bitcoin, Ethereum, and USDT holdings.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">5% Affiliate Downline</h4>
                  <p className="text-xs text-slate-500 mt-1">Instant affiliate commission credited on every qualifying partner deposit.</p>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              variant="primary"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={onOpenRegister}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3"
            >
              Get Started with CapitalFargoFX
            </Button>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
