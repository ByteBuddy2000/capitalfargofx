import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Coins, 
  Zap, 
  BarChart3, 
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '../ui/Button';

interface HeroProps {
  onOpenRegister: () => void;
  onExplorePlans: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenRegister, onExplorePlans }) => {
  return (
    <section id="hero" className="relative min-h-[92vh] pt-32 pb-20 bg-slate-950 text-white overflow-hidden flex items-center">
      {/* Background Decorative Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-blue-600/15 via-emerald-500/10 to-transparent blur-3xl rounded-full" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
        {/* Subtle grid lines */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Trust Pill */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 text-xs font-medium mb-6 shadow-xs backdrop-blur-md"
            >
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-emerald-400">Institutional Yield Engine</span>
              <span className="text-slate-600">•</span>
              <span>Audited Multi-Asset Settlement</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6"
            >
              Build Your Financial Future With{' '}
              <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Smarter Digital Investing
              </span>
            </motion.h1>

            {/* Supporting Text */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed mb-8"
            >
              Access structured investment opportunities and manage your portfolio from one secure platform. Engineered for institutional transparency, automated yield compounding, and instantaneous cryptocurrency withdrawals.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 w-full sm:w-auto mb-10"
            >
              <Button
                size="lg"
                variant="primary"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={onOpenRegister}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 border-none shadow-lg shadow-blue-500/25 px-7 py-3.5"
              >
                Start Investing
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onExplorePlans}
                className="w-full sm:w-auto bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-white px-6 py-3.5"
              >
                Explore Plans
              </Button>
            </motion.div>

            {/* Trust Microcopy Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 w-full"
            >
              <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Secure account management</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Transparent investment terms</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>24/7 account access</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Institutional Financial Card / Visual Graphic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            {/* Glowing Backdrop Frame */}
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 p-6 border border-slate-800 shadow-2xl shadow-blue-950/40">
              
              {/* Card Header with Live Ticker */}
              <div className="flex items-center justify-between pb-5 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">Portfolio Alpha Tracker</h3>
                    <p className="text-[11px] text-slate-400 font-mono">Live Node Status: Operational</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  +55.0% APY
                </div>
              </div>

              {/* Stat Metric Grid */}
              <div className="grid grid-cols-2 gap-3.5 my-5">
                <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800">
                  <p className="text-[11px] font-medium text-slate-400">Gold Plan Benchmark</p>
                  <p className="text-xl font-extrabold text-white mt-1">$15,500.00</p>
                  <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-3 h-3" />
                    +$5,500 Profit (72h)
                  </p>
                </div>
                <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800">
                  <p className="text-[11px] font-medium text-slate-400">Affiliate Downline Yield</p>
                  <p className="text-xl font-extrabold text-white mt-1">5.00%</p>
                  <p className="text-[10px] text-blue-400 font-semibold flex items-center gap-1 mt-1">
                    <Zap className="w-3 h-3" />
                    Instant Settlement
                  </p>
                </div>
              </div>

              {/* Mini Simulated Yield Chart Visual */}
              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/80 mb-5">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span className="font-semibold text-slate-200">Continuous Growth Curve</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800">
                    24h / 72h Epochs
                  </span>
                </div>
                {/* SVG Trend Wave */}
                <div className="h-20 w-full relative flex items-end">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 300 80" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,70 Q40,65 80,45 T160,35 T240,15 T300,5"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="3"
                    />
                    <path
                      d="M0,70 Q40,65 80,45 T160,35 T240,15 T300,5 L300,80 L0,80 Z"
                      fill="url(#heroGradient)"
                    />
                  </svg>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2">
                  <span>Allocation ($10k)</span>
                  <span>Maturity ($15.5k)</span>
                </div>
              </div>

              {/* Supported Multi-Crypto Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                    ₿
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                    Ξ
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    ₮
                  </div>
                  <span className="text-xs text-slate-400 font-medium ml-1">BTC · ETH · USDT</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-400">
                  Zero Deposit Fees
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
