import React from 'react';
import { motion } from 'motion/react';
import { Building2, Sparkles, Database, ArrowRight, Shield } from 'lucide-react';
import { Button } from '../ui/Button';

interface AlternativeInvestmentsProps {
  onOpenRegister?: () => void;
}

export const AlternativeInvestments: React.FC<AlternativeInvestmentsProps> = ({ onOpenRegister }) => {
  const alternatives = [
    {
      title: 'Institutional Real Estate Portfolios',
      category: 'Asset-Backed Yield',
      description: 'Access fractional exposure into prime multi-family developments and Class-A logistics hubs yielding predictable distributions.',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
      tag: 'Collateralized',
      icon: <Building2 className="w-5 h-5 text-teal-600" />,
    },
    {
      title: 'Decentralized Compute & AI Infrastructure',
      category: 'Strategic Tech',
      description: 'Capital deployment into revenue-generating decentralized GPU clusters and enterprise zero-knowledge verification nodes.',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
      tag: 'High Velocity',
      icon: <Database className="w-5 h-5 text-blue-600" />,
    },
  ];

  return (
    <section className="py-24 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Alternative Assets
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Explore More Investment Opportunities
            </h2>
            <p className="text-base text-slate-600 mt-2 max-w-xl">
              Diversify beyond liquid markets into tangible real-world assets and computational technology infrastructure.
            </p>
          </div>
          <Button
            variant="outline"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={onOpenRegister}
            className="mt-4 md:mt-0"
          >
            Access Private Placements
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {alternatives.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.15 }}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-md hover:shadow-xl transition-all group flex flex-col justify-between"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="text-xs font-bold text-slate-900 bg-white/95 px-3 py-1.5 rounded-full shadow-sm">
                    {item.category}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-xl font-bold tracking-tight text-white">{item.title}</h3>
                </div>
              </div>

              <div className="p-7">
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  {item.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span>{item.tag}</span>
                  </div>
                  <button
                    onClick={onOpenRegister}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Offering</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
