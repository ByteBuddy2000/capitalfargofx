import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { ShieldAlert, FileText, Lock, Cookie } from 'lucide-react';

export type LegalDocType = 'terms' | 'privacy' | 'risk' | 'cookies';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDocType?: LegalDocType;
  type?: LegalDocType;
}

export const LegalModal: React.FC<LegalModalProps> = ({ 
  isOpen, 
  onClose, 
  initialDocType = 'terms',
  type
}) => {
  const [activeType, setActiveType] = useState<LegalDocType>(() => type || initialDocType);

  const content = {
    terms: {
      title: 'Terms of Service',
      description: 'Terms and conditions governing the use of CapitalFargoFX digital investment services.',
      icon: <FileText className="w-5 h-5 text-blue-600" />,
      body: (
        <div className="space-y-4 text-xs text-slate-700 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
          <h4 className="text-sm font-bold text-slate-900">1. Acceptance of Terms</h4>
          <p>
            By accessing or using the CapitalFargoFX investment platform, creating an investor profile, or depositing digital cryptocurrency assets, you agree to be bound by these Terms of Service. If you do not agree to these terms, you must not access or utilize the platform.
          </p>

          <h4 className="text-sm font-bold text-slate-900">2. Investor Eligibility & Account Integrity</h4>
          <p>
            You must be at least 18 years of age or the legal age of majority in your jurisdiction. You agree to provide accurate, truthful, and complete information upon registration and maintain the security of your account credentials and multi-factor authentication.
          </p>

          <h4 className="text-sm font-bold text-slate-900">3. Investment Plans & Maturity Execution</h4>
          <p>
            All investment plans (including Basic, Gold, and Ultimate tiers) represent structured computational asset allocation agreements. Yields and durations are determined strictly by configured contract parameters. Maturity settlements are recorded irrevocably onto the platform&apos;s double-entry financial ledger.
          </p>

          <h4 className="text-sm font-bold text-slate-900">4. Deposits & Blockchain Verification</h4>
          <p>
            Deposits made in supported cryptocurrencies (Bitcoin, Ethereum, USDT) are held in cold-vault custodial reserves. Blockchain transaction hashes submitted by users require manual or automated node verification prior to capital deployment.
          </p>

          <h4 className="text-sm font-bold text-slate-900">5. Withdrawals & Anti-Fraud Procedures</h4>
          <p>
            Withdrawals are processed from verified Available Balances to user-configured destination crypto wallets. CapitalFargoFX reserves the right to conduct compliance reviews on anomalous or duplicated transactions.
          </p>
        </div>
      ),
    },
    privacy: {
      title: 'Privacy & Data Protection Policy',
      description: 'How CapitalFargoFX collects, encrypts, and handles user information.',
      icon: <Lock className="w-5 h-5 text-emerald-600" />,
      body: (
        <div className="space-y-4 text-xs text-slate-700 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
          <h4 className="text-sm font-bold text-slate-900">1. Information We Collect</h4>
          <p>
            We collect personal information necessary to establish and secure your investment account, including your legal name, username, email address, IP address for security session monitoring, and public cryptocurrency receiving addresses.
          </p>

          <h4 className="text-sm font-bold text-slate-900">2. Cryptographic Security Standards</h4>
          <p>
            All user data, password hashes, and session authentication tokens are secured with industry-standard cryptographic algorithms. We never store private cryptocurrency wallet keys on user accounts.
          </p>

          <h4 className="text-sm font-bold text-slate-900">3. Third-Party Disclosures</h4>
          <p>
            CapitalFargoFX does not sell, rent, or monetize personal user data to third-party marketing entities. Information is shared only with verified technical infrastructure providers required for system uptime.
          </p>
        </div>
      ),
    },
    risk: {
      title: 'Risk Disclosure Statement',
      description: 'Important legal disclosure regarding digital asset investment risk and volatility.',
      icon: <ShieldAlert className="w-5 h-5 text-amber-600" />,
      body: (
        <div className="space-y-4 text-xs text-slate-700 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-medium">
            Notice: Please review this Risk Disclosure carefully before depositing capital or initiating investment contracts on CapitalFargoFX.
          </div>

          <h4 className="text-sm font-bold text-slate-900">1. Cryptocurrency Market Volatility</h4>
          <p>
            Digital assets, including Bitcoin and Ethereum, are subject to extreme price volatility and macro market dynamics. The valuation of underlying crypto tokens can fluctuate rapidly due to global liquidity events, technological developments, and regulatory developments.
          </p>

          <h4 className="text-sm font-bold text-slate-900">2. Structured Plan Terms & Projections</h4>
          <p>
            Configured returns and profit percentages represent contractual system parameters executed through algorithmic liquidity management. While the platform operates with strict risk-mitigation measures and principal recovery protocols, digital investments inherently carry commercial risk.
          </p>

          <h4 className="text-sm font-bold text-slate-900">3. Independent Financial Assessment</h4>
          <p>
            Investors should carefully evaluate their financial situation, risk tolerance, and investment objectives prior to committing funds. CapitalFargoFX does not provide personalized tax or legal advice.
          </p>
        </div>
      ),
    },
    cookies: {
      title: 'Cookie & Tracking Policy',
      description: 'Information on session cookies and platform security tokens.',
      icon: <Cookie className="w-5 h-5 text-indigo-600" />,
      body: (
        <div className="space-y-4 text-xs text-slate-700 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
          <h4 className="text-sm font-bold text-slate-900">1. Session Authentication Cookies</h4>
          <p>
            CapitalFargoFX uses strictly necessary cookies and local storage items to maintain authenticated user sessions, prevent cross-site request forgery, and preserve UI preferences.
          </p>

          <h4 className="text-sm font-bold text-slate-900">2. Cookie Management</h4>
          <p>
            You can modify your browser settings to decline or clear cookies at any time; however, doing so may disable active session persistence on your investor dashboard.
          </p>
        </div>
      ),
    },
  };

  const current = content[activeType] || content.terms;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={current.title}
      description={current.description}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Navigation Tabs inside modal */}
        <div className="flex flex-wrap gap-2 pb-3 border-b border-slate-200">
          {[
            { id: 'terms' as LegalDocType, label: 'Terms of Service' },
            { id: 'privacy' as LegalDocType, label: 'Privacy Policy' },
            { id: 'risk' as LegalDocType, label: 'Risk Disclosure' },
            { id: 'cookies' as LegalDocType, label: 'Cookie Policy' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveType(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeType === t.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {current.body}
      </div>
    </Modal>
  );
};
