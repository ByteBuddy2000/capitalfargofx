'use client';

import React, { useState } from 'react';
import { User as UserIcon, Mail, Lock, ArrowRight, Wallet, Users, CheckCircle2 } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { storage } from '../../lib/storage';
import { User } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';

interface RegisterFormProps {
  initialReferralCode?: string;
  onSuccess: (user: User) => void;
  onSwitchToLogin: () => void;
  onOpenTerms: () => void;
}

const getReferralCodeFromURL = (initial?: string): string => {
  if (initial) return initial;
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('ref') || '';
  }
  return '';
};

export const RegisterForm: React.FC<RegisterFormProps> = ({
  initialReferralCode,
  onSuccess,
  onSwitchToLogin,
  onOpenTerms,
}) => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [btcWallet, setBtcWallet] = useState('');
  const [ethWallet, setEthWallet] = useState('');
  const [usdtWallet, setUsdtWallet] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);

  const [referralCode] = useState(() => getReferralCodeFromURL(initialReferralCode));
  const [uplineUser] = useState<User | null>(() => {
    const code = getReferralCodeFromURL(initialReferralCode);
    return code.trim() ? storage.getUserByUsername(code.trim()) || null : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { success, error: toastError } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!fullName.trim() || !username.trim() || !email.trim() || !password) {
      setError('Please fill in all mandatory fields marked with an asterisk (*).');
      return;
    }

    if (username.trim().length < 3) {
      setError('Username must be at least 3 alphanumeric characters.');
      return;
    }

    if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
      setError('Email addresses do not match.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!agreedTerms) {
      setError('You must accept the Terms of Service and Risk Disclosure to proceed.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        btcWallet: btcWallet.trim(),
        ethWallet: ethWallet.trim(),
        usdtWallet: usdtWallet.trim(),
        referralCode: referralCode.trim(),
        }),
      });
      const result = (await response.json()) as { user?: User; message?: string };
      if (!response.ok || !result.user) {
        throw new Error(result.message || 'Unable to create your account.');
      }

      const signInResult = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });
      if (!signInResult || signInResult.error) {
        throw new Error('Account created, but automatic sign-in failed. Please sign in manually.');
      }

      success('Account Created Successfully', `Welcome to CapitalFargoFX, ${result.user.fullName}!`);
      onSuccess(result.user);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to create your account.');
      toastError('Registration Failed', 'Please review your details and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* Upline Card */}
      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-semibold text-slate-700">Your Upline Sponsor:</span>
        </div>
        <div className="text-xs font-bold">
          {uplineUser ? (
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {uplineUser.fullName} (@{uplineUser.username})
            </span>
          ) : (
            <span className="text-slate-500 font-mono">None (Direct Registration)</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Input
          label="Full Legal Name"
          placeholder="e.g. Alexander Hamilton"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          leftIcon={<UserIcon className="w-4 h-4" />}
          required
        />

        <Input
          label="Desired Username"
          placeholder="e.g. alexander88"
          value={username}
          onChange={e => setUsername(e.target.value)}
          leftIcon={<UserIcon className="w-4 h-4" />}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Input
          label="Email Address"
          type="email"
          placeholder="alex@investor.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          required
        />

        <Input
          label="Confirm Email Address"
          type="email"
          placeholder="alex@investor.com"
          value={confirmEmail}
          onChange={e => setConfirmEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Input
          label="Password"
          type="password"
          placeholder="At least 6 characters"
          value={password}
          onChange={e => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Repeat password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />
      </div>

      {/* Wallet Addresses (Optional at registration, configurable later) */}
      <div className="pt-2 border-t border-slate-100 space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <Wallet className="w-4 h-4 text-emerald-600" />
          <span>Payout Receiving Wallets (Optional - Can be set in Account)</span>
        </div>

        <Input
          label="Bitcoin Receiving Address"
          placeholder="bc1q..."
          value={btcWallet}
          onChange={e => setBtcWallet(e.target.value)}
        />

        <Input
          label="Ethereum Receiving Address"
          placeholder="0x..."
          value={ethWallet}
          onChange={e => setEthWallet(e.target.value)}
        />

        <Input
          label="USDT (ERC-20 / TRC-20) Receiving Address"
          placeholder="0x... or T..."
          value={usdtWallet}
          onChange={e => setUsdtWallet(e.target.value)}
        />
      </div>

      {/* Terms & Conditions Acceptance */}
      <div className="pt-2">
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreedTerms}
            onChange={e => setAgreedTerms(e.target.checked)}
            className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <span className="text-xs text-slate-600 leading-tight">
            I certify that I am at least 18 years old and agree to the{' '}
            <button
              type="button"
              onClick={onOpenTerms}
              className="font-bold text-blue-600 hover:underline"
            >
              Terms of Service
            </button>
            {' '}and{' '}
            <button
              type="button"
              onClick={onOpenTerms}
              className="font-bold text-blue-600 hover:underline"
            >
              Risk Disclosure
            </button>.
          </span>
        </label>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        rightIcon={<ArrowRight className="w-4 h-4" />}
        className="w-full justify-center mt-3 py-3 bg-linear-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 border-none shadow-md shadow-blue-500/20"
      >
        Complete Registration
      </Button>

      <div className="text-center pt-3 border-t border-slate-100">
        <p className="text-xs text-slate-600">
          Already registered?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            Sign In Here
          </button>
        </p>
      </div>
    </form>
  );
};
