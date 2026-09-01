import React from 'react';
import { motion } from 'motion/react';
import { UserPlus, Layers, TrendingUp, ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Create Your Account',
      description: 'Register securely in under two minutes. Configure your multi-chain cryptocurrency receiving wallet addresses for automated payouts.',
      icon: <UserPlus className="w-6 h-6 text-blue-600" />,
      badge: 'Identity & Wallet Setup',
    },
    {
      step: '02',
      title: 'Choose an Investment Plan',
      description: 'Select your preferred structured yield contract (Basic, Gold, or Ultimate) and transfer your investment capital via Bitcoin, Ethereum, or USDT.',
      icon: <Layers className="w-6 h-6 text-emerald-600" />,
      badge: 'Deposit Verification',
    },
    {
      step: '03',
      title: 'Track & Withdraw Earnings',
      description: 'Watch real-time contract progress on your live investor dashboard. Upon maturity, request instant withdrawals or compound your profits.',
      icon: <TrendingUp className="w-6 h-6 text-indigo-600" />,
      badge: 'Instant Liquidity Payouts',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider mb-4">
            Simple 3-Step Process
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How CapitalFargoFX Works
          </h2>
          <p className="text-base text-slate-600 mt-4 leading-relaxed">
            A frictionless digital asset deployment workflow engineered for simplicity, verifiable transparency, and high performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, idx) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.15 }}
              className="relative bg-slate-50/80 rounded-3xl p-8 border border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-xl transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-black font-mono text-slate-300 group-hover:text-blue-600 transition-colors">
                    {item.step}
                  </span>
                  <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                </div>

                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200/60 inline-block mb-3">
                  {item.badge}
                </span>

                <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-3">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {idx < 2 && (
                <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-slate-300">
                  <ArrowRight className="w-6 h-6" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
