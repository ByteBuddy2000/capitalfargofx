import React from 'react';
import { motion } from 'motion/react';
import { Coins, CheckCircle2, Zap } from 'lucide-react';
import { CryptoWalletConfig } from '../../types';
import { storage } from '../../lib/storage';

interface CryptoAssetsProps {
  wallets?: CryptoWalletConfig[];
}

export const CryptoAssets: React.FC<CryptoAssetsProps> = ({ wallets }) => {
  const currentWallets = wallets || storage.getWallets();
  const assetDetails = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      network: 'Bitcoin Core / Native SegWit',
      color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-500',
      iconText: '₿',
      rate: '$64,280.00',
      change24h: '+2.84%',
      status: 'Instant Deposit & Withdrawal',
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      network: 'ERC-20 (Ethereum Mainnet)',
      color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-500',
      iconText: 'Ξ',
      rate: '$3,485.50',
      change24h: '+4.12%',
      status: 'Instant Deposit & Withdrawal',
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      network: 'ERC-20 / TRC-20 Compatible',
      color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-500',
      iconText: '₮',
      rate: '$1.00 USD',
      change24h: '0.00%',
      status: 'Instant Deposit & Withdrawal',
    },
  ];

  return (
    <section id="assets" className="py-24 bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider mb-4">
              <Coins className="w-4 h-4 text-emerald-400" />
              Supported Digital Assets
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Cryptocurrency Settlement Rails
            </h2>
            <p className="text-base text-slate-400 mt-2 max-w-xl">
              We provide seamless cross-chain deposits and withdrawals backed by multi-signature cold custody.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {assetDetails.map((asset, idx) => (
            <motion.div
              key={asset.symbol}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="bg-slate-900/90 rounded-3xl p-8 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${asset.color} border flex items-center justify-center text-2xl font-black`}>
                      {asset.iconText}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{asset.name}</h3>
                      <p className="text-xs font-mono text-slate-400">{asset.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold text-white">{asset.rate}</p>
                    <p className="text-[11px] font-semibold text-emerald-400">{asset.change24h}</p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-slate-300 mb-6 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Settlement Network:</span>
                    <span className="font-semibold text-slate-300">{asset.network}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Deposit Fee:</span>
                    <span className="font-bold text-emerald-400">0.00%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Confirmation Speed:</span>
                    <span className="font-semibold text-white">Instant / 1 Confirmation</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 pt-4 border-t border-slate-800">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{asset.status}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
