import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface FinalCtaProps {
  onOpenRegister?: () => void;
  onOpenLogin?: () => void;
}

export const FinalCta: React.FC<FinalCtaProps> = ({ onOpenRegister, onOpenLogin }) => {
  return (
    <section className="py-20 bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-600/20 via-emerald-600/20 to-teal-600/15 blur-3xl rounded-full" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6">
          <ShieldCheck className="w-4 h-4" />
          Institutional Capital Deployment
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-6">
          Start Managing Your Investment Journey Today
        </h2>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          Create your verified investor account, explore structured cryptocurrency investment plans, and experience dependable digital market liquidity.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button
            size="lg"
            variant="primary"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={onOpenRegister}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 border-none shadow-xl shadow-blue-500/20 px-8 py-3.5 text-base font-bold"
          >
            Create Account
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={onOpenLogin}
            className="w-full sm:w-auto bg-slate-900 border-slate-700 text-white hover:bg-slate-800 px-8 py-3.5"
          >
            Login to Dashboard
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            No account opening fees
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Zero deposit transaction charges
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            24/7 account monitoring
          </span>
        </div>
      </div>
    </section>
  );
};
