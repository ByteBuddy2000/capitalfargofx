import React, { useState } from 'react';
import { 
  Wallet, 
  Edit2, 
  Save, 
  Check, 
  Plus, 
  QrCode, 
  Copy 
} from 'lucide-react';
import { User, CryptoWalletConfig } from '../../types';
import { storage } from '../../lib/storage';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { CryptoQRCode } from '../ui/CryptoQRCode';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';

interface AdminWalletsProps {
  currentUser: User;
}

export const AdminWallets: React.FC<AdminWalletsProps> = ({ currentUser }) => {
  const [wallets, setWallets] = useState<CryptoWalletConfig[]>(storage.getCryptoWallets());
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<CryptoWalletConfig | null>(null);

  const { success } = useToast();

  const handleOpenEdit = (w: CryptoWalletConfig) => {
    setEditingWallet({ ...w });
    setEditModalOpen(true);
  };

  const handleOpenCreate = () => {
    const newWallet: CryptoWalletConfig = {
      id: `wallet-${Date.now()}`,
      symbol: 'USDT',
      name: 'Tether USD (TRC-20)',
      network: 'TRC-20 (TRON)',
      address: 'TYDzsYUEWpYm...deposit_address',
      isActive: true,
      updatedAt: new Date().toISOString(),
    };
    setEditingWallet(newWallet);
    setEditModalOpen(true);
  };

  const handleSaveWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWallet) return;

    const currentWallets = storage.getCryptoWallets();
    const exists = currentWallets.some(w => w.id === editingWallet.id);
    let updated: CryptoWalletConfig[];

    if (exists) {
      updated = currentWallets.map(w => w.id === editingWallet.id ? { ...editingWallet, updatedAt: new Date().toISOString() } : w);
    } else {
      updated = [...currentWallets, editingWallet];
    }

    storage.saveCryptoWallets(updated);
    setWallets(updated);

    storage.addAuditLog({
      actorId: currentUser.id,
      actorUsername: currentUser.username,
      action: 'CRYPTO_WALLET_UPDATED',
      entity: 'CryptoWalletConfig',
      entityId: editingWallet.id || 'new-wallet',
      newState: editingWallet,
      notes: `Admin updated receiving address for ${editingWallet.symbol}`,
    });

    success('Wallet Address Updated', `Deposit receiving address for ${editingWallet.name} saved.`);
    setEditModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Wallet className="w-6 h-6 text-teal-400" />
            Receiving Cryptocurrency Wallets
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure system cold/hot receiving deposit addresses shown to investors during deposit requests.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenCreate}
          leftIcon={<Plus className="w-4 h-4" />}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
        >
          Add Settlement Address
        </Button>
      </div>

      {/* Wallets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {wallets.map(w => (
          <div
            key={w.id}
            className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-950 border border-teal-800 text-teal-300 flex items-center justify-center font-bold text-xs">
                    {w.symbol}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{w.name}</h3>
                    <p className="text-[11px] text-teal-400 font-semibold">{w.network}</p>
                  </div>
                </div>
                <Badge variant={w.isActive ? 'success' : 'neutral'}>
                  {w.isActive ? 'ACTIVE' : 'DISABLED'}
                </Badge>
              </div>

              {/* QR Preview Box */}
              <div className="my-4 p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center">
                <div className="p-2 bg-white rounded-xl shadow-xs">
                  <CryptoQRCode address={w.address} asset={w.asset || 'BTC'} />
                </div>
                <span className="text-[10px] text-slate-400 mt-2 font-mono">Live In-App QR Render</span>
              </div>

              <div className="space-y-1 mb-6">
                <label className="text-[10px] uppercase font-bold text-slate-400">Current Receiving Address</label>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-white break-all select-all font-bold">
                  {w.address}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => handleOpenEdit(w)}
              leftIcon={<Edit2 className="w-4 h-4" />}
              className="w-full justify-center bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 font-bold"
            >
              Update Address & Network
            </Button>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingWallet && (
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title={`Edit Receiving Address (${editingWallet.symbol})`}
          description="Update cryptocurrency receiving address and blockchain network parameter."
          maxWidth="md"
        >
          <form onSubmit={handleSaveWallet} className="space-y-4">
            <Input
              label="Asset Label / Name"
              value={editingWallet.name}
              onChange={e => setEditingWallet({ ...editingWallet, name: e.target.value })}
              required
            />

            <Input
              label="Blockchain Network"
              value={editingWallet.network}
              onChange={e => setEditingWallet({ ...editingWallet, network: e.target.value })}
              helperText="e.g. ERC-20, TRC-20, Native SegWit"
              required
            />

            <Input
              label="Destination Wallet Address"
              value={editingWallet.address}
              onChange={e => setEditingWallet({ ...editingWallet, address: e.target.value })}
              helperText="Double-check the address carefully before saving."
              required
            />

            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={editingWallet.isActive}
                onChange={e => setEditingWallet({ ...editingWallet, isActive: e.target.checked })}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span>Enabled as Active Deposit Destination</span>
            </label>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="bg-teal-600 hover:bg-teal-700 font-bold"
              >
                Save Receiving Address
              </Button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
