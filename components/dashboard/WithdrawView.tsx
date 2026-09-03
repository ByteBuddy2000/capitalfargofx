import React, { useEffect, useState } from 'react';
import { 
  ArrowUpFromLine, 
  DollarSign, 
  Coins, 
  Wallet, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { User, Withdrawal } from '../../types';
import { storage } from '../../lib/storage';
import { authApi } from '../../lib/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';

interface WithdrawViewProps {
  currentUser: User;
  onWithdrawSuccess: () => void;
  onNavigateAccount: () => void;
  onNavigateTransactions: () => void;
}

export const WithdrawView: React.FC<WithdrawViewProps> = ({
  currentUser,
  onWithdrawSuccess,
  onNavigateAccount,
  onNavigateTransactions,
}) => {
  const [selectedCrypto, setSelectedCrypto] = useState<'BTC' | 'ETH' | 'USDT'>('USDT');
  const [amount, setAmount] = useState<number>(100);
  const [destinationAddress, setDestinationAddress] = useState<string>(
    currentUser.usdtWallet || currentUser.btcWallet || currentUser.ethWallet || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedWithdrawal, setSubmittedWithdrawal] = useState<Withdrawal | null>(null);
  const [prices, setPrices] = useState({ BTC: 64000, ETH: 3400, USDT: 1 });

  const { success, error: toastError } = useToast();

  const minWithdrawal = 50;

  useEffect(() => {
    void authApi.prices().then(setPrices).catch(() => undefined);
  }, []);

  const selectedPrice = prices[selectedCrypto];
  const cryptoAmount = amount > 0 ? amount / selectedPrice : 0;
  const selectedAsset = currentUser.assets?.find(asset => asset.symbol === selectedCrypto);
  const selectedAssetUsdBalance = selectedAsset
    ? Number(selectedAsset.availableBalance || 0) * selectedPrice
    : Number(currentUser.availableBalance || 0);

  // Sync wallet address when selectedCrypto changes
  const handleCryptoChange = (symbol: 'BTC' | 'ETH' | 'USDT') => {
    setSelectedCrypto(symbol);
    if (symbol === 'BTC') setDestinationAddress(currentUser.btcWallet || '');
    if (symbol === 'ETH') setDestinationAddress(currentUser.ethWallet || '');
    if (symbol === 'USDT') setDestinationAddress(currentUser.usdtWallet || '');
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!amount || amount < minWithdrawal) {
      setErrorMsg(`Minimum withdrawal amount is $${minWithdrawal.toFixed(2)} USD.`);
      return;
    }

    if (amount > selectedAssetUsdBalance) {
      setErrorMsg(`Insufficient ${selectedCrypto} balance ($${selectedAssetUsdBalance.toFixed(2)} USD available).`);
      return;
    }

    if (!destinationAddress.trim()) {
      setErrorMsg(`Please specify a valid destination ${selectedCrypto} address.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await authApi.createWithdrawal({
        amount: Number(amount),
        asset: selectedCrypto,
        network: selectedCrypto === 'BTC' ? 'Bitcoin Native' : selectedCrypto === 'ETH' ? 'ERC-20' : 'ERC-20 / TRC-20',
        destinationAddress: destinationAddress.trim(),
      });
      setSubmittedWithdrawal(result.withdrawal);
      success('Withdrawal Request Submitted', `$${amount.toLocaleString()} scheduled for blockchain broadcast.`);
      onWithdrawSuccess();
    } catch (err) {
      toastError('Withdrawal Failed', err instanceof Error ? err.message : 'Error processing withdrawal request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <ArrowUpFromLine className="w-6 h-6 text-amber-600" />
            Withdraw Available Funds
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Liquidate your available principal and contract earnings directly to your cryptocurrency wallet.
          </p>
        </div>
      </div>

      {submittedWithdrawal ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 text-center max-w-2xl mx-auto shadow-sm space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              Withdrawal Order Placed
            </span>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Order #{submittedWithdrawal.id.substring(0, 10)}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Your withdrawal of <strong className="text-slate-900">${(submittedWithdrawal?.amount || 0).toLocaleString()} USD</strong> ({submittedWithdrawal?.cryptoCurrency || 'Crypto'}) is queued for automated liquidity dispatch.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-slate-500">Destination Address:</span>
              <span className="font-mono font-bold text-slate-900 truncate max-w-[200px]">{submittedWithdrawal.destinationAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Asset & Network:</span>
              <span className="font-semibold text-slate-800">{submittedWithdrawal.cryptoCurrency} ({submittedWithdrawal.network})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Processing Fee:</span>
              <span className="font-bold text-emerald-600">$0.00 (0.00%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Current Status:</span>
              <Badge variant="warning">PENDING EXECUTION</Badge>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              onClick={onNavigateTransactions}
            >
              View Transaction History
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSubmittedWithdrawal(null);
                setAmount(100);
              }}
            >
              New Withdrawal
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (8 cols): Withdrawal Form */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            
            {errorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleWithdrawSubmit} className="space-y-6">
              
              {/* Asset Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  1. Select Payout Asset
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { symbol: 'USDT' as const, name: 'Tether USD', net: 'ERC-20 / TRC-20' },
                    { symbol: 'BTC' as const, name: 'Bitcoin', net: 'Native SegWit' },
                    { symbol: 'ETH' as const, name: 'Ethereum', net: 'ERC-20' },
                  ].map(c => (
                    <button
                      key={c.symbol}
                      type="button"
                      onClick={() => handleCryptoChange(c.symbol)}
                      className={`p-3.5 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                        selectedCrypto === c.symbol
                          ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600 font-bold shadow-xs'
                          : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700'
                      }`}
                    >
                      <span className="text-sm font-black block text-slate-900">{c.symbol}</span>
                      <span className="text-[10px] text-slate-500 block truncate">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    2. Withdrawal Amount (USD)
                  </label>
                  <button
                    type="button"
                    onClick={() => setAmount(selectedAssetUsdBalance)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    Max (${selectedAssetUsdBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })})
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    min={minWithdrawal}
                    max={selectedAssetUsdBalance}
                    step={10}
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xl font-bold font-mono text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                    required
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Minimum: ${minWithdrawal.toFixed(2)}</span>
                  <span>Available: ${selectedAssetUsdBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="text-xs font-semibold text-blue-600">
                  Estimated: {cryptoAmount.toFixed(selectedCrypto === 'BTC' ? 6 : 4)} {selectedCrypto} at ${selectedPrice.toLocaleString()} USD
                </div>
              </div>

              {/* Destination Address Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    3. Destination {selectedCrypto} Address
                  </label>
                  <button
                    type="button"
                    onClick={onNavigateAccount}
                    className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    Manage Saved Wallets
                  </button>
                </div>

                <Input
                  placeholder={`Paste destination ${selectedCrypto} wallet address`}
                  value={destinationAddress}
                  onChange={e => setDestinationAddress(e.target.value)}
                  helperText="Ensure the recipient address is compatible with the selected blockchain network."
                  required
                />
              </div>

              {/* Calculation Summary Box */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Requested Amount:</span>
                  <span className="font-bold text-slate-900 font-mono">${(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Platform Execution Fee:</span>
                  <span className="font-bold text-emerald-600">$0.00 (0.00%)</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold pt-2 border-t border-slate-200">
                  <span>Net Capital Dispatched:</span>
                  <span className="font-mono text-emerald-600 text-sm font-black">${(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                disabled={selectedAssetUsdBalance < minWithdrawal}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full justify-center bg-amber-600 hover:bg-amber-700 font-bold shadow-md shadow-amber-600/20"
              >
                Submit Withdrawal Request
              </Button>
            </form>

          </div>

          {/* Right Column (4 cols): Balances & Security Policies */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Balance Card */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-sm space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Liquidity Snapshot
              </span>

              <div>
                <p className="text-xs text-slate-400">Available Balance</p>
                <p className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
                  ${(currentUser?.availableBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <p className="text-xs text-slate-400">Locked in Active Plans</p>
                <p className="text-sm font-bold font-mono text-slate-300 mt-0.5">
                  ${(currentUser?.earningBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Configured Wallets Overview */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Saved Payout Wallets
                </span>
                <button
                  onClick={onNavigateAccount}
                  className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Edit
                </button>
              </div>

              <div className="text-xs space-y-2">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Bitcoin (BTC)</span>
                  <span className="font-mono text-slate-800 text-[11px] truncate block">
                    {currentUser.btcWallet || 'Not configured'}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Ethereum (ETH)</span>
                  <span className="font-mono text-slate-800 text-[11px] truncate block">
                    {currentUser.ethWallet || 'Not configured'}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Tether (USDT)</span>
                  <span className="font-mono text-slate-800 text-[11px] truncate block">
                    {currentUser.usdtWallet || 'Not configured'}
                  </span>
                </div>
              </div>
            </div>

            {/* Security Guarantee */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-xs flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Withdrawals are audited against your ledger balance and broadcast securely to standard cryptocurrency network nodes.
              </p>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
