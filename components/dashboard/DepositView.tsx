import React, { useState, useEffect } from 'react';
import { 
  ArrowDownToLine, 
  Check, 
  Copy, 
  ArrowRight, 
  ArrowLeft, 
  Coins, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Layers
} from 'lucide-react';
import { User, InvestmentPlan, CryptoWalletConfig, Deposit } from '../../types';
import { storage } from '../../lib/storage';
import { authApi } from '../../lib/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { CryptoQRCode } from '../ui/CryptoQRCode';
import { useToast } from '../ui/Toast';

interface DepositViewProps {
  currentUser: User;
  preselectedPlan?: InvestmentPlan | null;
  onDepositSuccess: () => void;
  onNavigateTransactions: () => void;
}

export const DepositView: React.FC<DepositViewProps> = ({
  currentUser,
  preselectedPlan,
  onDepositSuccess,
  onNavigateTransactions,
}) => {
  const [plans, setPlans] = useState<InvestmentPlan[]>(() => storage.getPlans());
  const wallets = storage.getCryptoWallets();
  const { success, error: toastError } = useToast();

  const [step, setStep] = useState<'CONFIGURE' | 'PAYMENT' | 'SUCCESS'>('CONFIGURE');
  
  // Selection States
  const initialPlan = storage.getPlans()[0];
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    preselectedPlan?.id || storage.getPlans()[1]?.id || initialPlan?.id || 'plan-gold'
  );
  const selectedPlan = plans.find(p => p.id === selectedPlanId) || plans[0] || storage.getPlans()[0];

  const [amount, setAmount] = useState<number>(
    preselectedPlan ? preselectedPlan.minimumAmount : selectedPlan?.minimumAmount || 10000
  );
  const [selectedCrypto, setSelectedCrypto] = useState<'BTC' | 'ETH' | 'USDT'>('USDT');
  
  // Confirmation state
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedDeposit, setSubmittedDeposit] = useState<Deposit | null>(null);

  const [copiedWallet, setCopiedWallet] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fallbackPlans = storage.getPlans();
    setPlans(fallbackPlans);

    const fallbackPlan = preselectedPlan || fallbackPlans[1] || fallbackPlans[0];
    if (fallbackPlan && !fallbackPlans.some(plan => plan.id === selectedPlanId)) {
      setSelectedPlanId(fallbackPlan.id);
      setAmount(fallbackPlan.minimumAmount);
    }

    authApi.plans()
      .then((loadedPlans) => {
        const nextPlans = loadedPlans.length > 0 ? loadedPlans : fallbackPlans;
        setPlans(nextPlans);
        const nextPlan = preselectedPlan || nextPlans[1] || nextPlans[0];
        if (nextPlan && !nextPlans.some(plan => plan.id === selectedPlanId)) {
          setSelectedPlanId(nextPlan.id);
          setAmount(nextPlan.minimumAmount);
        }
      })
      .catch(error => {
        setErrorMsg(error instanceof Error ? error.message : 'Unable to load investment plans.');
        setPlans(fallbackPlans);
      });
  }, [preselectedPlan, selectedPlanId]);

  // Selected wallet from admin config
  const activeWalletConfig = wallets.find(w => w.symbol === selectedCrypto) || wallets[0];

  // Calculations
  const calculatedProfit = ((amount || 0) * (selectedPlan?.returnPercentage || 0)) / 100;
  const calculatedTotal = (amount || 0) + calculatedProfit;

  // Crypto conversion estimates (approximate for display)
  const getEstimatedCryptoAmount = () => {
    if (selectedCrypto === 'USDT') return `${amount.toFixed(2)} USDT`;
    if (selectedCrypto === 'BTC') return `${(amount / 64000).toFixed(6)} BTC`;
    if (selectedCrypto === 'ETH') return `${(amount / 3400).toFixed(4)} ETH`;
    return `${amount} USD`;
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!amount || amount < (selectedPlan?.minimumAmount || 0)) {
      setErrorMsg(`Minimum investment amount for ${selectedPlan?.name || 'this plan'} is $${(selectedPlan?.minimumAmount || 0).toLocaleString()}`);
      return;
    }

    if ((selectedPlan?.maximumAmount || 0) > 0 && amount > selectedPlan.maximumAmount) {
      setErrorMsg(`Maximum investment amount for ${selectedPlan?.name || 'this plan'} is $${(selectedPlan?.maximumAmount || 0).toLocaleString()}`);
      return;
    }

    setStep('PAYMENT');
  };

  const handleCopyWallet = () => {
    if (activeWalletConfig) {
      navigator.clipboard.writeText(activeWalletConfig.address);
      setCopiedWallet(true);
      success('Wallet Address Copied', 'Paste into your cryptocurrency exchange or hardware wallet');
      setTimeout(() => setCopiedWallet(false), 2500);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPlan) {
      setErrorMsg('Please select a valid investment plan before submitting.');
      setStep('CONFIGURE');
      return;
    }

    if (!activeWalletConfig) {
      setErrorMsg('No wallet configuration is available for this asset.');
      return;
    }

    const trimmedHash = transactionHash.trim();
    if (!trimmedHash) {
      setErrorMsg('Please paste the blockchain transaction hash before submitting your deposit.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const deposit = await authApi.createDeposit({
        planId: selectedPlan.id,
        amount: Number(amount),
        asset: selectedCrypto,
        network: activeWalletConfig?.network || 'Default Network',
        receivingAddress: activeWalletConfig?.address || '',
        txHash: trimmedHash,
      });
      setSubmittedDeposit(deposit);
      setStep('SUCCESS');
      success('Deposit Submitted', 'Your deposit verification request is pending administrative review.');
    } catch (err) {
      toastError('Submission Error', err instanceof Error ? err.message : 'Could not register deposit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <ArrowDownToLine className="w-6 h-6 text-emerald-600" />
            Make a Cryptocurrency Deposit
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Deploy capital into structured investment contracts with instant blockchain routing.
          </p>
        </div>

        {/* Stepper Pill */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className={`px-3 py-1 rounded-full ${step === 'CONFIGURE' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
            1. Configure
          </span>
          <span className="text-slate-300">→</span>
          <span className={`px-3 py-1 rounded-full ${step === 'PAYMENT' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
            2. Payment
          </span>
          <span className="text-slate-300">→</span>
          <span className={`px-3 py-1 rounded-full ${step === 'SUCCESS' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
            3. Confirmation
          </span>
        </div>
      </div>

      {/* STEP 1: CONFIGURE PLAN & AMOUNT */}
      {step === 'CONFIGURE' && (
        <form onSubmit={handleProceedToPayment} className="space-y-6">
          
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Plan Selection Cards */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
              1. Select Structured Investment Plan
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map(p => {
                const isSelected = selectedPlanId === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedPlanId(p.id);
                      if (amount < p.minimumAmount) {
                        setAmount(p.minimumAmount);
                      }
                    }}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600 shadow-md'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-extrabold text-slate-900 text-base">{p.name}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700">
                          {p.durationHours}h Cycle
                        </span>
                      </div>
                      <div className="text-2xl font-black text-emerald-600 font-mono mb-2">
                        +{p.returnPercentage}% ROI
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">
                        {p.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 text-xs space-y-1">
                      <div className="flex justify-between text-slate-500">
                        <span>Min Deposit:</span>
                        <span className="font-bold text-slate-900 font-mono">${(p?.minimumAmount || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Max Deposit:</span>
                        <span className="font-bold text-slate-900 font-mono">
                          {(p?.maximumAmount || 0) > 0 ? `$${(p?.maximumAmount || 0).toLocaleString()}` : 'Unlimited'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Amount Input & Currency Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Amount Field */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                2. Deposit Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">$</span>
                <input
                  type="number"
                  min={selectedPlan?.minimumAmount || 100}
                  max={(selectedPlan?.maximumAmount || 0) > 0 ? selectedPlan.maximumAmount : undefined}
                  step={50}
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xl font-bold font-mono text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  required
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Min: ${(selectedPlan?.minimumAmount || 0).toLocaleString()}</span>
                <span>Max: {(selectedPlan?.maximumAmount || 0) > 0 ? `$${(selectedPlan?.maximumAmount || 0).toLocaleString()}` : 'Unlimited'}</span>
              </div>
            </div>

            {/* Cryptocurrency Selector */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                3. Select Settlement Asset
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { symbol: 'USDT' as const, name: 'Tether (USDT)', color: 'border-emerald-500 text-emerald-600 bg-emerald-50/30' },
                  { symbol: 'BTC' as const, name: 'Bitcoin (BTC)', color: 'border-amber-500 text-amber-600 bg-amber-50/30' },
                  { symbol: 'ETH' as const, name: 'Ethereum (ETH)', color: 'border-blue-500 text-blue-600 bg-blue-50/30' },
                ].map(c => (
                  <button
                    key={c.symbol}
                    type="button"
                    onClick={() => setSelectedCrypto(c.symbol)}
                    className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                      selectedCrypto === c.symbol
                        ? `${c.color} font-black shadow-xs ring-1`
                        : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700 font-semibold'
                    }`}
                  >
                    <span className="text-sm block">{c.symbol}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{c.name}</span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Network: <strong>{activeWalletConfig?.network}</strong>. Zero deposit fee.
              </p>
            </div>

          </div>

          {/* Investment Yield Summary Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Contract Yield & Maturity Breakdown
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                <span className="text-slate-400 block text-[11px]">Principal Capital</span>
                <span className="text-lg font-black font-mono text-white mt-1 block">
                  ${(amount || 0).toLocaleString()}
                </span>
              </div>

              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                <span className="text-slate-400 block text-[11px]">Contract Yield ({selectedPlan?.returnPercentage || 0}%)</span>
                <span className="text-lg font-black font-mono text-emerald-400 mt-1 block">
                  +${(calculatedProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                <span className="text-slate-400 block text-[11px]">Lock Duration</span>
                <span className="text-lg font-black font-mono text-blue-400 mt-1 block">
                  {selectedPlan?.durationHours || 24} Hours
                </span>
              </div>

              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                <span className="text-slate-400 block text-[11px]">Total Payout at Maturity</span>
                <span className="text-lg font-black font-mono text-emerald-300 mt-1 block">
                  ${(calculatedTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Principal Protection Guarantee</span>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold border-none"
              >
                Proceed to Payment Details →
              </Button>
            </div>
          </div>

        </form>
      )}

      {/* STEP 2: PAYMENT & QR CODE DETAILS */}
      {step === 'PAYMENT' && (
        <form onSubmit={handleSubmitPayment} className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Payment Order Summary
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {selectedPlan?.name || 'Investment'} Plan (${(amount || 0).toLocaleString()} USD)
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                onClick={() => setStep('CONFIGURE')}
              >
                Modify Order
              </Button>
            </div>

            {/* QR Code & Wallet Address Display Box */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200">
              
              {/* QR Code */}
              <div className="md:col-span-4 flex flex-col items-center justify-center">
                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <CryptoQRCode
                    address={activeWalletConfig?.address || ''}
                    asset={selectedCrypto as 'BTC' | 'ETH' | 'USDT'}
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-2 font-semibold">
                  Scan to Pay in Wallet App
                </span>
              </div>

              {/* Address & Instructions */}
              <div className="md:col-span-8 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Send Exact Cryptocurrency Amount:
                  </label>
                  <div className="text-2xl font-black font-mono text-blue-600">
                    {getEstimatedCryptoAmount()}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Rate pegged at standard market index for {selectedCrypto}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Deposit Receiving Address ({activeWalletConfig?.symbol} - {activeWalletConfig?.network})
                  </label>
                  <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-slate-300">
                    <span className="font-mono text-xs font-bold text-slate-900 break-all select-all flex-1">
                      {activeWalletConfig?.address}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyWallet}
                      className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer shrink-0"
                      title="Copy Address"
                    >
                      {copiedWallet ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                  <strong>Important:</strong> Please ensure you send funds over the <strong>{activeWalletConfig?.network}</strong> network. Sending via incorrect blockchain networks may lead to irreversible loss of funds.
                </div>
              </div>

            </div>

            {/* Transaction Hash Input */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Submit Blockchain Transaction Hash / TXID
              </label>
              <Input
                placeholder="e.g. 0x4f89d31b2... or Bitcoin Tx Hash"
                value={transactionHash}
                onChange={e => setTransactionHash(e.target.value)}
                helperText="Paste the transaction ID or transaction hash provided by your wallet or exchange."
                required
              />
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Verification typically settles within 5-15 minutes after blockchain confirmation.</span>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                rightIcon={<CheckCircle2 className="w-4 h-4" />}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 border-none font-bold"
              >
                I Have Sent Payment
              </Button>
            </div>

          </div>
        </form>
      )}

      {/* STEP 3: SUCCESS NOTIFICATION */}
      {step === 'SUCCESS' && submittedDeposit && (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 text-center max-w-2xl mx-auto shadow-sm space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Deposit Successfully Registered
            </span>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Deposit Order #{submittedDeposit?.id?.substring(0, 10) || ''}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Your deposit of <strong className="text-slate-900">${(submittedDeposit?.amount || 0).toLocaleString()} USD</strong> ({submittedDeposit?.cryptoCurrency || 'Crypto'}) has been recorded into the platform verification queue.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-slate-500">Target Plan:</span>
              <span className="font-bold text-slate-900">{submittedDeposit.planName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Asset & Network:</span>
              <span className="font-semibold text-slate-800">{submittedDeposit.cryptoCurrency} ({submittedDeposit.network})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Transaction TXID:</span>
              <span className="font-mono text-slate-800 truncate max-w-[200px]">{submittedDeposit.transactionHash}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Current Status:</span>
              <Badge variant="warning">PENDING VERIFICATION</Badge>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              onClick={onNavigateTransactions}
            >
              View in Transaction Ledger
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setStep('CONFIGURE');
                setTransactionHash('');
                onDepositSuccess();
              }}
            >
              Create Another Deposit
            </Button>
          </div>
        </div>
      )}

    </div>
  );
};
