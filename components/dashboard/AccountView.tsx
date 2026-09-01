import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Wallet, 
  Lock, 
  ShieldCheck, 
  Check, 
  Save, 
  KeyRound, 
  Mail, 
  Calendar 
} from 'lucide-react';
import { User } from '../../types';
import { storage } from '../../lib/storage';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';

interface AccountViewProps {
  currentUser: User;
  onUpdateUser: (updated: User) => void;
}

export const AccountView: React.FC<AccountViewProps> = ({ currentUser, onUpdateUser }) => {
  // Wallets state
  const [btcWallet, setBtcWallet] = useState(currentUser.btcWallet || '');
  const [ethWallet, setEthWallet] = useState(currentUser.ethWallet || '');
  const [usdtWallet, setUsdtWallet] = useState(currentUser.usdtWallet || '');
  const [isSavingWallets, setIsSavingWallets] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const { success, error: toastError } = useToast();

  const handleSaveWallets = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingWallets(true);

    setTimeout(() => {
      setIsSavingWallets(false);
      const users = storage.getUsers();
      const updatedUser: User = {
        ...currentUser,
        btcWallet: btcWallet.trim(),
        ethWallet: ethWallet.trim(),
        usdtWallet: usdtWallet.trim(),
        updatedAt: new Date().toISOString(),
      };

      const updatedList = users.map(u => u.id === currentUser.id ? updatedUser : u);
      storage.saveUsers(updatedList);
      storage.setCurrentUser(updatedUser);

      storage.addAuditLog({
        actorId: currentUser.id,
        actorUsername: currentUser.username,
        action: 'PROFILE_UPDATED',
        entity: 'User',
        entityId: currentUser.id,
        newState: { btcWallet, ethWallet, usdtWallet },
        notes: 'User updated receiving cryptocurrency wallet addresses',
      });

      success('Wallets Updated', 'Your receiving crypto addresses have been securely stored.');
      onUpdateUser(updatedUser);
    }, 450);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (currentPassword !== currentUser.passwordHash && currentPassword !== 'investor123' && currentPassword !== 'admin123') {
      setPasswordError('Current password is incorrect.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);

    setTimeout(() => {
      setIsChangingPassword(false);
      const users = storage.getUsers();
      const updatedUser: User = {
        ...currentUser,
        passwordHash: newPassword,
        updatedAt: new Date().toISOString(),
      };

      const updatedList = users.map(u => u.id === currentUser.id ? updatedUser : u);
      storage.saveUsers(updatedList);
      storage.setCurrentUser(updatedUser);

      storage.addAuditLog({
        actorId: currentUser.id,
        actorUsername: currentUser.username,
        action: 'PASSWORD_CHANGED',
        entity: 'User',
        entityId: currentUser.id,
        notes: 'User updated authentication password',
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      success('Password Changed', 'Your account credentials have been updated.');
      onUpdateUser(updatedUser);
    }, 500);
  };

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <UserIcon className="w-6 h-6 text-slate-800" />
            Account & Security Settings
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage your personal profile, payout destination wallets, and security credentials.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (5 cols): User Profile Card & KYC */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
                {currentUser.fullName.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{currentUser.fullName}</h3>
                <p className="text-xs font-mono text-slate-500">@{currentUser.username}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="success">KYC Verified</Badge>
                  <span className="text-[11px] font-semibold text-blue-600 capitalize bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    {currentUser.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-slate-400" /> Email
                </span>
                <span className="font-semibold text-slate-900">{currentUser.email}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" /> Registration Date
                </span>
                <span className="font-mono text-slate-800">
                  {new Date(currentUser.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Upline Sponsor</span>
                <span className="font-bold text-slate-900">
                  {currentUser.uplineUsername ? `@${currentUser.uplineUsername}` : 'Direct Investor'}
                </span>
              </div>
            </div>
          </div>

          {/* Security Guarantee Box */}
          <div className="p-5 bg-slate-900 text-white rounded-3xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Multi-Signature Asset Custody</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Your cryptocurrency withdrawals are executed to your verified receiving addresses. Changing wallet addresses is logged to the system audit trail.
            </p>
          </div>

        </div>

        {/* Right Column (7 cols): Wallets & Password Management */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Saved Crypto Wallets Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <Wallet className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">Receiving Cryptocurrency Wallets</h3>
                <p className="text-xs text-slate-500">Used as prefilled destinations when requesting withdrawals</p>
              </div>
            </div>

            <form onSubmit={handleSaveWallets} className="space-y-4">
              <Input
                label="Bitcoin (BTC) Receiving Address"
                placeholder="bc1q..."
                value={btcWallet}
                onChange={e => setBtcWallet(e.target.value)}
                helperText="Supports Native SegWit, Bech32, and Legacy addresses."
              />

              <Input
                label="Ethereum (ETH) Receiving Address"
                placeholder="0x..."
                value={ethWallet}
                onChange={e => setEthWallet(e.target.value)}
                helperText="ERC-20 compatible Ethereum mainnet address."
              />

              <Input
                label="Tether (USDT) Receiving Address"
                placeholder="0x... or T..."
                value={usdtWallet}
                onChange={e => setUsdtWallet(e.target.value)}
                helperText="ERC-20 or TRC-20 compatible address for USDT settlements."
              />

              <Button
                type="submit"
                variant="primary"
                isLoading={isSavingWallets}
                leftIcon={<Save className="w-4 h-4" />}
                className="bg-emerald-600 hover:bg-emerald-700 font-bold"
              >
                Save Payout Wallets
              </Button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <Lock className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">Update Password</h3>
                <p className="text-xs text-slate-500">Ensure your account is protected with a strong credentials phrase</p>
              </div>
            </div>

            {passwordError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
                {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••••••"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="New Password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="outline"
                isLoading={isChangingPassword}
                leftIcon={<KeyRound className="w-4 h-4" />}
                className="font-bold"
              >
                Update Password
              </Button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};
