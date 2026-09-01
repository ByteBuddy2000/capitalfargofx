import React from 'react';
import { motion } from 'motion/react';
import { 
  Coins, 
  Globe2, 
  Database, 
  TrendingUp, 
  Building2, 
  Landmark, 
  ArrowRight 
} from 'lucide-react';

interface InvestmentCategoriesProps {
  onSelectCategory?: (category: string) => void;
}

export const InvestmentCategories: React.FC<InvestmentCategoriesProps> = ({ onSelectCategory }) => {
  const categories = [
    {
      id: 'crypto',
      title: 'Cryptocurrency Markets',
      description: 'Systematic algorithmic yield generated across major liquidity pools in Bitcoin, Ethereum, and multi-network stablecoins.',
      icon: <Coins className="w-6 h-6 text-amber-500" />,
      yieldTag: 'Primary Allocation',
      popular: true,
    },
    {
      id: 'forex',
      title: 'Global Forex Arbitrage',
      description: 'Sub-millisecond institutional currency execution capitalizing on micro-discrepancies across Tier-1 interbank exchange nodes.',
      icon: <Globe2 className="w-6 h-6 text-blue-500" />,
      yieldTag: 'High Liquidity',
    },
    {
      id: 'digital-assets',
      title: 'Tokenized Digital Assets',
      description: 'Structured exposures into tokenized treasuries, staking derivatives, and high-velocity computational infrastructure.',
      icon: <Database className="w-6 h-6 text-indigo-500" />,
      yieldTag: 'Emerging Sector',
    },
    {
      id: 'stocks',
      title: 'Institutional Equities',
      description: 'Macro hedge strategies focused on global technology, artificial intelligence infrastructure, and dividend-yielding multinationals.',
      icon: <TrendingUp className="w-6 h-6 text-emerald-500" />,
      yieldTag: 'Growth Capital',
    },
    {
      id: 'bonds',
      title: 'Sovereign Bonds & ETFs',
      description: 'Conservative capital preservation instruments anchored in short-duration treasury notes and investment-grade corporate bonds.',
      icon: <Landmark className="w-6 h-6 text-slate-700" />,
      yieldTag: 'Fixed Income',
    },
    {
      id: 'real-estate',
      title: 'Commercial Real Estate',
      description: 'Fractionalized, yield-producing commercial properties and prime logistics hubs providing steady quarterly capital distributions.',
      icon: <Building2 className="w-6 h-6 text-teal-600" />,
      yieldTag: 'Asset-Backed',
    },
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
              Multi-Asset Capabilities
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Diversified Investment Categories
            </h2>
            <p className="text-base text-slate-600 mt-2 max-w-xl">
              Access comprehensive multi-market asset classes managed by CapitalFargoFX&apos;s automated portfolio algorithms.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className={`relative p-7 rounded-2xl bg-white border transition-all hover:shadow-lg flex flex-col justify-between ${
                cat.popular
                  ? 'border-blue-300 ring-1 ring-blue-500/20'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    {cat.icon}
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                    {cat.yieldTag}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-2">
                  {cat.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  {cat.description}
                </p>
              </div>

              <button
                onClick={() => onSelectCategory?.(cat.title)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors group cursor-pointer pt-4 border-t border-slate-100"
              >
                <span>Learn More</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
