 'use client';

import React, { useState } from 'react';
import { User as UserIcon, Lock, ArrowRight, ShieldCheck, UserCheck, KeyRound } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToRegister,
  onForgotPassword,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { success, error: toastError } = useToast();

  const getFriendlyLoginError = (rawError?: string | null) => {
    if (!rawError) return 'Unable to sign you in. Please try again.';

    if (rawError === 'CredentialsSignin' || rawError.toLowerCase().includes('invalid') || rawError.toLowerCase().includes('incorrect')) {
      return 'Incorrect email/username or password. Please try again.';
    }

    if (rawError === 'Configuration') {
      return 'There is a temporary sign-in problem. Please try again in a moment.';
    }

    return rawError.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password) {
      setError('Please enter both your email/username and password.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email: identifier,
        password,
        redirect: false,
      });

      if (result?.error) {
        const message = getFriendlyLoginError(result.error);
        setError(message);
        toastError('Authentication Failed', message);
        return;
      }

      success('Authentication Successful', 'Welcome back to CapitalFargoFX.');
      window.location.assign('/dashboard');
    } catch (requestError) {
      const message = requestError instanceof Error ? getFriendlyLoginError(requestError.message) : 'Unable to sign you in.';
      setError(message);
      toastError('Authentication Failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role: 'INVESTOR' | 'ADMIN') => {
    setError(`Demo access is disabled. Sign in with your ${role === 'ADMIN' ? 'admin' : 'investor'} account.`);
  };

  return (
    <div className="space-y-6">
      {/* Demo Shortcut Bar */}
      <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-2xl">
        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 mb-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Quick Demo Access</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleDemoLogin('INVESTOR')}
            className="p-2 text-left bg-white border border-blue-200 rounded-xl hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer text-xs"
          >
            <span className="font-bold text-slate-900 block truncate">Investor Account</span>
            <span className="text-[10px] text-slate-500 font-mono">john123 ($14.5k vol)</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('ADMIN')}
            className="p-2 text-left bg-white border border-amber-200 rounded-xl hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer text-xs"
          >
            <span className="font-bold text-amber-900 block truncate">Admin Console</span>
            <span className="text-[10px] text-slate-500 font-mono">Full Security Suite</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 shadow-sm"
          >
            {error}
          </div>
        )}

        <Input
          label="Email or Username"
          placeholder="e.g. john.investor@example.com or john123"
          value={identifier}
          onChange={e => {
            setIdentifier(e.target.value);
            if (error) setError('');
          }}
          leftIcon={<UserIcon className="w-4 h-4" />}
          autoComplete="username"
          required
        />

        <div className="space-y-1">
          <Input
            label="Password"
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={e => {
              setPassword(e.target.value);
              if (error) setError('');
            }}
            leftIcon={<Lock className="w-4 h-4" />}
            autoComplete="current-password"
            required
          />
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="w-full justify-center mt-2 py-3 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20"
        >
          Sign In to Dashboard
        </Button>
      </form>

      <div className="text-center pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-600">
          Don&apos;t have an investor profile?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
};
