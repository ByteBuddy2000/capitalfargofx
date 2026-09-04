import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  FileText, 
  Layers, 
  Zap, 
  PieChart, 
  Headphones
} from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const features = [
    {
      title: 'Secure Platform',
      description: 'End-to-end cryptographic encryption, cold vault asset storage, and double-entry immutable accounting logs for complete capital protection.',
      icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
      tag: 'Bank-Grade Security',
    },
    {
      title: 'Transparent Terms',
      description: 'No hidden fees or ambiguous lockups. Exact return percentages, contract maturities, and principal conditions are established upfront.',
      icon: <FileText className="w-6 h-6 text-emerald-600" />,
      tag: 'Zero Hidden Fees',
    },
    {
      title: 'Flexible Investment Plans',
      description: 'Tailored investment tiers ranging from the 24-hour Basic plan to the high-yield 72-hour Gold & Ultimate institutional allocations.',
      icon: <Layers className="w-6 h-6 text-indigo-600" />,
      tag: '10% to 100% Returns',
    },
    {
      title: 'Fast Account Management',
      description: 'Streamlined deposit verification, live crypto wallet address generation, and automated withdrawal processing on BTC, ETH, and USDT.',
      icon: <Zap className="w-6 h-6 text-amber-600" />,
      tag: 'Instant Crypto Routes',
    },
    {
      title: 'Portfolio Monitoring',
      description: 'Comprehensive dashboard analytics, historical chart tracking, real-time yield maturity progress, and itemized transaction receipts.',
      icon: <PieChart className="w-6 h-6 text-sky-600" />,
      tag: 'Live Alpha Telemetry',
    },
    {
      title: 'Dedicated Support',
      description: '24/7 dedicated institutional investor assistance via prioritized in-app ticketing, email support, and verified VIP communication channels.',
      icon: <Headphones className="w-6 h-6 text-teal-600" />,
      tag: '24/7 Investor Desk',
    },
  ];

  return (
    <section className="py-24 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider mb-4">
            Fintech Excellence
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Why High-Net-Worth Investors Choose CapitalFargoFX
          </h2>
          <p className="text-base text-slate-600 mt-4 leading-relaxed">
            Our technology stack is purpose-built to eliminate volatility friction, deliver predictable yield schedules, and safeguard investor liquidity across all market conditions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="p-7 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-blue-300 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 transition-all group"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <span className="text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200/80">
                  {feature.tag}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-2 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
