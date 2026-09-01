'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { LegalModal, type LegalDocType } from '@/components/legal/LegalModal';
import { ToastProvider } from '@/components/ui/Toast';
import type { User } from '@/types';

export default function RegisterPage() {
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalDocType, setLegalDocType] = useState<LegalDocType>('terms');

  const openLegal = (type: LegalDocType = 'terms') => {
    setLegalDocType(type);
    setLegalModalOpen(true);
  };

  const handleSuccess = (_user: User) => {
    window.location.assign('/dashboard');
  };

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100">
      <header className="p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 text-white font-extrabold text-lg tracking-tight">
            <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">CF</span>
            <span>CAPITAL<span className="text-blue-500">FARGO</span>FX</span>
          </Link>
          <Link href="/" className="text-xs font-semibold text-slate-400 hover:text-white">
            Back to Home
          </Link>
        </div>
      </header>

      <main className="py-8 px-4 flex items-center justify-center">
        <RegisterForm
          onSuccess={handleSuccess}
          onSwitchToLogin={() => window.location.assign('/login')}
          onOpenTerms={() => openLegal('terms')}
        />
      </main>

      <footer className="p-6 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} CapitalFargoFX. 100% Principal Protection Guarantee.
      </footer>

      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialDocType={legalDocType}
      />
      </div>
    </ToastProvider>
  );
}