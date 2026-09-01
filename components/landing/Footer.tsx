import React from 'react';
import { ShieldCheck, Mail, Send, Lock, ArrowUpRight } from 'lucide-react';
import { PlatformSettings } from '../../types';
import { storage } from '../../lib/storage';

interface FooterProps {
  settings?: PlatformSettings;
  onNavigateSection?: (sectionId: string) => void;
  onOpenLegal?: (type: 'terms' | 'privacy' | 'risk' | 'cookies') => void;
  onOpenAuth?: (mode: 'login' | 'register') => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onNavigateSection,
  onOpenLegal,
  onOpenAuth,
}) => {
  const currentSettings = settings || storage.getSettings();
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-850">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                CapitalFargo<span className="text-emerald-400">FX</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              An institutional digital asset management platform providing structured cryptocurrency yield strategies, automated maturity distributions, and transparent double-entry accounting.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Ledger Engine Online
              </span>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigateSection?.('about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateSection?.('how-it-works')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateSection?.('plans')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Investment Plans
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateSection?.('assets')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Supported Crypto
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateSection?.('faq')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Legal & Compliance
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onOpenLegal?.('terms')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal?.('privacy')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal?.('risk')}
                  className="text-amber-400/90 hover:text-amber-300 font-medium transition-colors cursor-pointer"
                >
                  Risk Disclosure
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal?.('cookies')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Cookie Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Support & Contact */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Investor Support
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <a href={`mailto:${currentSettings.supportEmail || 'support@capitalfargofx.com'}`} className="hover:text-white transition-colors">
                  {currentSettings.supportEmail || 'support@capitalfargofx.com'}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Send className="w-3.5 h-3.5 text-slate-500" />
                <a href={currentSettings.telegramChannel || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                  Telegram Channel <ArrowUpRight className="w-3 h-3" />
                </a>
              </li>
              <li className="pt-2">
                <button
                  onClick={() => onOpenAuth?.('login')}
                  className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                >
                  Investor Support Desk →
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Risk Warning & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p className="text-left max-w-3xl leading-relaxed">
            High-Risk Investment Warning: Cryptocurrency and digital asset investment carries market risk, including potential fluctuations in asset valuation. Past performance does not guarantee future results. Platform plans and yields are subject to configured contract terms and conditions.
          </p>
          <p className="shrink-0 font-medium text-slate-400">
            © {new Date().getFullYear()} CapitalFargoFX. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
