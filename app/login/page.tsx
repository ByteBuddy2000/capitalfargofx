'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { ForgotPasswordModal } from '@/components/auth/ForgotPasswordModal';
import { ToastProvider } from '@/components/ui/Toast';

export default function LoginPage() {
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

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
        <LoginForm
          onSwitchToRegister={() => window.location.assign('/register')}
          onForgotPassword={() => setForgotPasswordOpen(true)}
        />
      </main>

      <footer className="p-6 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} CapitalFargoFX. Institutional Cryptocurrency Investment Infrastructure.
      </footer>

      <ForgotPasswordModal
        isOpen={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
      />
      </div>
    </ToastProvider>
  );
}