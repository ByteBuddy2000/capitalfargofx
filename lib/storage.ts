import {
  User,
  InvestmentPlan,
  Deposit,
  Investment,
  Withdrawal,
  Transaction,
  Referral,
  LedgerEntry,
  Notification,
  FAQItem,
  Testimonial,
  CryptoWalletConfig,
  PlatformSettings,
  AuditLog
} from '../types';

const STORAGE_KEYS = {
  USERS: 'cffx_users',
  CURRENT_USER: 'cffx_current_user',
  PLANS: 'cffx_plans',
  DEPOSITS: 'cffx_deposits',
  INVESTMENTS: 'cffx_investments',
  WITHDRAWALS: 'cffx_withdrawals',
  TRANSACTIONS: 'cffx_transactions',
  REFERRALS: 'cffx_referrals',
  LEDGER: 'cffx_ledger',
  NOTIFICATIONS: 'cffx_notifications',
  WALLETS: 'cffx_wallets',
  SETTINGS: 'cffx_settings',
  AUDIT_LOGS: 'cffx_audit_logs',
  FAQS: 'cffx_faqs',
  TESTIMONIALS: 'cffx_testimonials',
};

// Initial Investment Plans conforming to Master Prompt
export const INITIAL_PLANS: InvestmentPlan[] = [
  {
    id: 'plan-basic',
    name: 'Basic Plan',
    slug: 'basic',
    minimumAmount: 100,
    maximumAmount: 3999,
    returnPercentage: 10,
    durationHours: 24,
    referralPercentage: 5,
    principalReturn: true,
    principalWithdrawable: true,
    depositFeePercentage: 0,
    depositFeeFixed: 0,
    status: 'ACTIVE',
    featured: false,
    description: 'Designed for beginners and exploratory digital asset allocations with standard 24-hour liquidity.',
    badge: 'Starter Tier',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'plan-gold',
    name: 'Gold Plan',
    slug: 'gold',
    minimumAmount: 10000,
    maximumAmount: 14999,
    returnPercentage: 55,
    durationHours: 72,
    referralPercentage: 5,
    principalReturn: true,
    principalWithdrawable: true,
    depositFeePercentage: 0,
    depositFeeFixed: 0,
    status: 'ACTIVE',
    featured: true,
    description: 'Institutional-grade structured yield plan with enhanced performance metrics and 72-hour cycle.',
    badge: 'Most Popular',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'plan-ultimate',
    name: 'Ultimate Plan',
    slug: 'ultimate',
    minimumAmount: 15000,
    maximumAmount: 0, // Unlimited
    returnPercentage: 100,
    durationHours: 24,
    referralPercentage: 5,
    principalReturn: true,
    principalWithdrawable: true,
    depositFeePercentage: 0,
    depositFeeFixed: 0,
    status: 'ACTIVE',
    featured: false,
    description: 'High-tier strategic asset deployment maximizing computational liquidity across multi-market nodes.',
    badge: 'Institutional High Yield',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Initial Admin receiving crypto wallets
export const INITIAL_WALLETS: CryptoWalletConfig[] = [
  {
    asset: 'BTC',
    name: 'Bitcoin',
    symbol: 'BTC',
    network: 'Bitcoin Core / Native SegWit',
    address: 'bc1q9v808m3z6r9w2h03d2v6w5nckqg55365e94lku',
    minDeposit: 100,
    depositFee: '0.00%',
    active: true,
  },
  {
    asset: 'ETH',
    name: 'Ethereum',
    symbol: 'ETH',
    network: 'ERC-20 (Ethereum Network)',
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    minDeposit: 100,
    depositFee: '0.00%',
    active: true,
  },
  {
    asset: 'USDT',
    name: 'Tether USD',
    symbol: 'USDT',
    network: 'ERC-20 / TRC-20 Compatible',
    address: '0x8894E0a0c962CB723c1976a4421c95949bE2D4E3',
    minDeposit: 100,
    depositFee: '0.00%',
    active: true,
  },
];

// Initial Platform Settings
export const INITIAL_SETTINGS: PlatformSettings = {
  siteName: 'CapitalFargoFX',
  supportEmail: 'support@capitalfargofx.com',
  telegramChannel: 'https://t.me/capitalfargofx_official',
  minWithdrawalAmount: 50,
  maxWithdrawalDaily: 250000,
  withdrawalFeePercentage: 0,
  activeInvestorsDisplay: '2,600+',
  totalDepositsDisplay: '$967K+',
  totalWithdrawalsDisplay: '$3.7M+',
  supportedAssetsDisplay: 'BTC · ETH · USDT',
  maintenanceMode: false,
  updatedAt: new Date().toISOString(),
};

// Initial Seed Users
export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin-01',
    fullName: 'System Administrator',
    username: 'admin',
    email: 'admin@capitalfargofx.com',
    passwordHash: 'admin123',
    role: 'ADMIN',
    status: 'ACTIVE',
    btcWallet: 'bc1q9v808m3z6r9w2h03d2v6w5nckqg55365e94lku',
    ethWallet: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    usdtWallet: '0x8894E0a0c962CB723c1976a4421c95949bE2D4E3',
    uplineId: null,
    uplineUsername: null,
    availableBalance: 0,
    earningBalance: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    referralEarnings: 0,
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    kycStatus: 'VERIFIED',
  },
  {
    id: 'user-investor-01',
    fullName: 'Johnathan Vance',
    username: 'john123',
    email: 'john.investor@example.com',
    passwordHash: 'investor123',
    role: 'USER',
    status: 'ACTIVE',
    btcWallet: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    ethWallet: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5',
    usdtWallet: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5',
    uplineId: null,
    uplineUsername: null,
    availableBalance: 3250.00,
    earningBalance: 5500.00,
    totalDeposits: 14500.00,
    totalWithdrawals: 4250.00,
    referralEarnings: 625.00,
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    kycStatus: 'VERIFIED',
  },
  {
    id: 'user-investor-02',
    fullName: 'Sarah Miller',
    username: 'sarahm',
    email: 'sarah.miller@example.com',
    passwordHash: 'investor123',
    role: 'USER',
    status: 'ACTIVE',
    btcWallet: 'bc1qsarahmillerbtc9485hskd9382ksld9283jsd',
    ethWallet: '0x32Be343B94f860124dC4fEe278FDCBD38C102D88',
    usdtWallet: '0x32Be343B94f860124dC4fEe278FDCBD38C102D88',
    uplineId: 'user-investor-01',
    uplineUsername: 'john123',
    availableBalance: 1200.00,
    earningBalance: 5500.00,
    totalDeposits: 10000.00,
    totalWithdrawals: 1500.00,
    referralEarnings: 0,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    kycStatus: 'VERIFIED',
  },
  {
    id: 'user-investor-03',
    fullName: 'David Chen',
    username: 'davidc',
    email: 'david.chen@example.com',
    passwordHash: 'investor123',
    role: 'USER',
    status: 'ACTIVE',
    btcWallet: 'bc1qchencrypto7382kald029472ksld910283js',
    ethWallet: '0x1Db3439a222C519ab44bb1144fC23CC7b173a0de',
    usdtWallet: '0x1Db3439a222C519ab44bb1144fC23CC7b173a0de',
    uplineId: 'user-investor-01',
    uplineUsername: 'john123',
    availableBalance: 450.00,
    earningBalance: 250.00,
    totalDeposits: 2500.00,
    totalWithdrawals: 0,
    referralEarnings: 0,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    kycStatus: 'VERIFIED',
  },
  {
    id: 'user-investor-04',
    fullName: 'Michael Ross',
    username: 'michaelr',
    email: 'michael.ross@example.com',
    passwordHash: 'investor123',
    role: 'USER',
    status: 'ACTIVE',
    btcWallet: '',
    ethWallet: '',
    usdtWallet: '',
    uplineId: 'user-investor-01',
    uplineUsername: 'john123',
    availableBalance: 0,
    earningBalance: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    referralEarnings: 0,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    kycStatus: 'UNVERIFIED',
  }
];

export const INITIAL_REFERRALS: Referral[] = [
  {
    id: 'ref-01',
    referrerId: 'user-investor-01',
    referrerUsername: 'john123',
    referredUserId: 'user-investor-02',
    referredUsername: 'sarahm',
    referredFullName: 'Sarah Miller',
    level: 1,
    totalDeposits: 10000.00,
    commissionsEarned: 500.00,
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'ref-02',
    referrerId: 'user-investor-01',
    referrerUsername: 'john123',
    referredUserId: 'user-investor-03',
    referredUsername: 'davidc',
    referredFullName: 'David Chen',
    level: 1,
    totalDeposits: 2500.00,
    commissionsEarned: 125.00,
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'ref-03',
    referrerId: 'user-investor-01',
    referrerUsername: 'john123',
    referredUserId: 'user-investor-04',
    referredUsername: 'michaelr',
    referredFullName: 'Michael Ross',
    level: 1,
    totalDeposits: 0,
    commissionsEarned: 0,
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  }
];

export const INITIAL_INVESTMENTS: Investment[] = [
  {
    id: 'inv-01',
    userId: 'user-investor-01',
    userUsername: 'john123',
    planId: 'plan-gold',
    planName: 'Gold Plan',
    depositId: 'dep-01',
    principalAmount: 10000.00,
    amount: 10000.00,
    returnPercentage: 55,
    expectedProfit: 5500.00,
    totalExpectedReturn: 15500.00,
    durationHours: 72,
    startDate: new Date(Date.now() - 36 * 3600000).toISOString(),
    maturityDate: new Date(Date.now() + 36 * 3600000).toISOString(),
    status: 'ACTIVE',
    principalReturn: true,
    payoutProcessed: false,
    createdAt: new Date(Date.now() - 36 * 3600000).toISOString(),
  },
  {
    id: 'inv-02',
    userId: 'user-investor-01',
    userUsername: 'john123',
    planId: 'plan-basic',
    planName: 'Basic Plan',
    depositId: 'dep-prev-01',
    principalAmount: 4500.00,
    amount: 4500.00,
    returnPercentage: 10,
    expectedProfit: 450.00,
    totalExpectedReturn: 4950.00,
    durationHours: 24,
    startDate: new Date(Date.now() - 10 * 86400000).toISOString(),
    maturityDate: new Date(Date.now() - 9 * 86400000).toISOString(),
    status: 'COMPLETED',
    principalReturn: true,
    payoutProcessed: true,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'inv-03',
    userId: 'user-investor-02',
    userUsername: 'sarahm',
    planId: 'plan-gold',
    planName: 'Gold Plan',
    depositId: 'dep-02',
    principalAmount: 10000.00,
    amount: 10000.00,
    returnPercentage: 55,
    expectedProfit: 5500.00,
    totalExpectedReturn: 15500.00,
    durationHours: 72,
    startDate: new Date(Date.now() - 15 * 3600000).toISOString(),
    maturityDate: new Date(Date.now() + 57 * 3600000).toISOString(),
    status: 'ACTIVE',
    principalReturn: true,
    payoutProcessed: false,
    createdAt: new Date(Date.now() - 15 * 3600000).toISOString(),
  }
];

export const INITIAL_DEPOSITS: Deposit[] = [
  {
    id: 'dep-01',
    userId: 'user-investor-01',
    userUsername: 'john123',
    userFullName: 'Johnathan Vance',
    planId: 'plan-gold',
    planName: 'Gold Plan',
    amount: 10000.00,
    asset: 'USDT',
    network: 'ERC-20 (Ethereum Network)',
    receivingAddress: '0x8894E0a0c962CB723c1976a4421c95949bE2D4E3',
    txHash: '0x7e8c4a92b71efc5421d09e86338b291a13b69e4f58c7320b73c4d7e25d2a9f11',
    status: 'APPROVED',
    expectedReturnPercentage: 55,
    durationHours: 72,
    expectedProfit: 5500.00,
    totalExpectedReturn: 15500.00,
    createdAt: new Date(Date.now() - 36 * 3600000).toISOString(),
    approvedAt: new Date(Date.now() - 36 * 3600000).toISOString(),
  },
  {
    id: 'dep-pending-01',
    userId: 'user-investor-03',
    userUsername: 'davidc',
    userFullName: 'David Chen',
    planId: 'plan-basic',
    planName: 'Basic Plan',
    amount: 2500.00,
    asset: 'BTC',
    network: 'Bitcoin Core / Native SegWit',
    receivingAddress: 'bc1q9v808m3z6r9w2h03d2v6w5nckqg55365e94lku',
    txHash: '9f83a7c64d291e0a8451b63c25e89d104523c914bf689e41d8e6c739f50e7a2b',
    status: 'PENDING',
    expectedReturnPercentage: 10,
    durationHours: 24,
    expectedProfit: 250.00,
    totalExpectedReturn: 2750.00,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  }
];

export const INITIAL_WITHDRAWALS: Withdrawal[] = [
  {
    id: 'wth-01',
    userId: 'user-investor-01',
    userUsername: 'john123',
    userFullName: 'Johnathan Vance',
    amount: 4250.00,
    asset: 'USDT',
    network: 'ERC-20',
    destinationAddress: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5',
    status: 'COMPLETED',
    txHash: '0x4f128bcde9284102948721cba56123e410294812cc18294719284ba102947e81',
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    completedAt: new Date(Date.now() - 8 * 86400000 + 45 * 60000).toISOString(),
  },
  {
    id: 'wth-pending-01',
    userId: 'user-investor-02',
    userUsername: 'sarahm',
    userFullName: 'Sarah Miller',
    amount: 1500.00,
    asset: 'ETH',
    network: 'ERC-20',
    destinationAddress: '0x32Be343B94f860124dC4fEe278FDCBD38C102D88',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
  }
];

export const INITIAL_LEDGER: LedgerEntry[] = [
  {
    id: 'ldg-01',
    userId: 'user-investor-01',
    type: 'DEPOSIT',
    amount: 10000.00,
    asset: 'USD',
    direction: 'CREDIT',
    referenceType: 'DEPOSIT',
    referenceId: 'dep-01',
    balanceBefore: 3250.00,
    balanceAfter: 13250.00,
    description: 'Deposit approved for Gold Plan deployment',
    createdAt: new Date(Date.now() - 36 * 3600000).toISOString(),
  },
  {
    id: 'ldg-02',
    userId: 'user-investor-01',
    type: 'INVESTMENT',
    amount: 10000.00,
    asset: 'USD',
    direction: 'DEBIT',
    referenceType: 'INVESTMENT',
    referenceId: 'inv-01',
    balanceBefore: 13250.00,
    balanceAfter: 3250.00,
    description: 'Principal locked in Gold Plan (72h duration)',
    createdAt: new Date(Date.now() - 36 * 3600000).toISOString(),
  },
  {
    id: 'ldg-03',
    userId: 'user-investor-01',
    type: 'REFERRAL_COMMISSION',
    amount: 500.00,
    asset: 'USD',
    direction: 'CREDIT',
    referenceType: 'REFERRAL',
    referenceId: 'ref-01',
    balanceBefore: 2750.00,
    balanceAfter: 3250.00,
    description: '5% Referral commission from Sarah Miller ($10,000 Gold Plan)',
    createdAt: new Date(Date.now() - 15 * 3600000).toISOString(),
  },
  {
    id: 'ldg-04',
    userId: 'user-investor-01',
    type: 'REFERRAL_COMMISSION',
    amount: 125.00,
    asset: 'USD',
    direction: 'CREDIT',
    referenceType: 'REFERRAL',
    referenceId: 'ref-02',
    balanceBefore: 2625.00,
    balanceAfter: 2750.00,
    description: '5% Referral commission from David Chen ($2,500 Basic Plan)',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-01',
    userId: 'user-investor-01',
    userUsername: 'john123',
    type: 'DEPOSIT',
    amount: 10000.00,
    asset: 'USDT',
    status: 'COMPLETED',
    description: 'Gold Plan Capital Deposit',
    referenceId: 'dep-01',
    createdAt: new Date(Date.now() - 36 * 3600000).toISOString(),
  },
  {
    id: 'tx-02',
    userId: 'user-investor-01',
    userUsername: 'john123',
    type: 'INVESTMENT',
    amount: 10000.00,
    asset: 'USD',
    status: 'COMPLETED',
    description: 'Allocated to Gold Plan (55% Return / 72h)',
    referenceId: 'inv-01',
    createdAt: new Date(Date.now() - 36 * 3600000).toISOString(),
  },
  {
    id: 'tx-03',
    userId: 'user-investor-01',
    userUsername: 'john123',
    type: 'REFERRAL_COMMISSION',
    amount: 500.00,
    asset: 'USD',
    status: 'COMPLETED',
    description: 'Downline Commission (Sarah Miller)',
    referenceId: 'ref-01',
    createdAt: new Date(Date.now() - 15 * 3600000).toISOString(),
  },
  {
    id: 'tx-04',
    userId: 'user-investor-01',
    userUsername: 'john123',
    type: 'WITHDRAWAL',
    amount: 4250.00,
    asset: 'USDT',
    status: 'COMPLETED',
    description: 'Payout to 0x9522...fe5',
    referenceId: 'wth-01',
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-01',
    userId: 'user-investor-01',
    title: 'Deposit Approved',
    message: 'Your deposit of $10,000 USDT for the Gold Plan has been verified and activated.',
    type: 'DEPOSIT',
    read: true,
    createdAt: new Date(Date.now() - 36 * 3600000).toISOString(),
  },
  {
    id: 'notif-02',
    userId: 'user-investor-01',
    title: 'Referral Commission Received',
    message: 'You earned $500.00 (5%) commission from Sarah Miller\'s qualifying deposit.',
    type: 'REFERRAL',
    read: false,
    createdAt: new Date(Date.now() - 15 * 3600000).toISOString(),
  },
  {
    id: 'notif-03',
    userId: 'user-investor-01',
    title: 'Security Notice',
    message: 'Your investor account successfully verified two-factor session authentication.',
    type: 'SECURITY',
    read: true,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-01',
    actorId: 'user-admin-01',
    actorUsername: 'admin',
    action: 'DEPOSIT_APPROVED',
    entity: 'Deposit',
    entityId: 'dep-01',
    previousState: { status: 'PENDING' },
    newState: { status: 'APPROVED', amount: 10000 },
    timestamp: new Date(Date.now() - 36 * 3600000).toISOString(),
    notes: 'Verified on Ethereum explorer tx 0x7e8c...9f11',
  },
  {
    id: 'audit-02',
    actorId: 'user-admin-01',
    actorUsername: 'admin',
    action: 'WITHDRAWAL_COMPLETED',
    entity: 'Withdrawal',
    entityId: 'wth-01',
    previousState: { status: 'PENDING' },
    newState: { status: 'COMPLETED', amount: 4250 },
    timestamp: new Date(Date.now() - 8 * 86400000).toISOString(),
    notes: 'Dispatched via ERC-20 liquidity router',
  }
];

export const INITIAL_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'general',
    question: 'What is CapitalFargoFX?',
    answer: 'CapitalFargoFX is a premier institutional-grade digital asset management and cryptocurrency investment platform. We provide individual and corporate investors with transparent, structured investment plans designed to maximize risk-adjusted digital market returns.',
  },
  {
    id: 'faq-2',
    category: 'general',
    question: 'How do I create an account?',
    answer: 'Simply click "Create Account" in the top navigation, enter your legal name, username, verified email address, secure password, and your receiving cryptocurrency wallet addresses. If you have an upline referral link, it will be automatically registered.',
  },
  {
    id: 'faq-3',
    category: 'deposits',
    question: 'How do I make a deposit?',
    answer: 'Navigate to your Investor Dashboard, select "Make a Deposit", choose your desired Investment Plan (Basic, Gold, or Ultimate), specify the investment amount, and select your preferred asset (BTC, ETH, or USDT). You will receive an admin-verified deposit address and QR code.',
  },
  {
    id: 'faq-4',
    category: 'deposits',
    question: 'Which cryptocurrencies are supported?',
    answer: 'We natively support Bitcoin (BTC Native SegWit), Ethereum (ETH ERC-20), and Tether USD (USDT ERC-20 and TRC-20 compatible). All deposit addresses are monitored and verified directly by the security engine.',
  },
  {
    id: 'faq-5',
    category: 'investing',
    question: 'How are investment returns calculated?',
    answer: 'Returns are calculated strictly server-side based on the fixed return percentage and duration parameters of your selected plan (e.g., 10% in 24 hours for Basic, 55% in 72 hours for Gold, and 100% in 24 hours for Ultimate). Total payout includes principal return upon contract maturity.',
  },
  {
    id: 'faq-6',
    category: 'withdrawals',
    question: 'How do withdrawals work?',
    answer: 'You can request a withdrawal at any time from your Available Balance. Withdrawals are processed directly to your configured cryptocurrency wallet addresses. Every withdrawal produces an immutable financial ledger entry.',
  },
  {
    id: 'faq-7',
    category: 'referrals',
    question: 'How does the referral system work?',
    answer: 'Every registered investor receives a unique referral link (e.g., capitalfargofx.com/register?ref=username). When your referred partners make an approved deposit into an active investment plan, you earn an instant 5% commission credited directly to your Available Balance.',
  },
  {
    id: 'faq-8',
    category: 'investing',
    question: 'Can I change my investment plan?',
    answer: 'Once an investment contract is active, its terms are locked until maturity. However, you can operate multiple concurrent investment plans simultaneously across different asset tiers.',
  },
  {
    id: 'faq-9',
    category: 'security',
    question: 'How can I contact support?',
    answer: 'Our dedicated investor support desk is available 24/7 via the in-app Support ticket system, email at support@capitalfargofx.com, and our official verified Telegram channel.',
  },
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Marcus Sterling',
    role: 'Managing Partner, Sterling Capital',
    location: 'London, United Kingdom',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    message: 'CapitalFargoFX has provided unprecedented transparency and precision for our family office crypto allocations. The Gold Plan yields have matured with zero downtime.',
    investmentPlan: 'Gold Plan Investor',
    verified: true,
  },
  {
    id: 'test-2',
    name: 'Elena Rostova',
    role: 'Fintech Portfolio Strategist',
    location: 'Zurich, Switzerland',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    message: 'The immutable ledger architecture gives me complete confidence. Every deposit, referral bonus, and withdrawal is accounted for down to the cent.',
    investmentPlan: 'Ultimate Plan Investor',
    verified: true,
  },
  {
    id: 'test-3',
    name: 'David K. Henderson',
    role: 'Private Asset Allocator',
    location: 'Singapore',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    message: 'The instant settlement and 5% affiliate downline payouts are the fastest in the modern digital fintech ecosystem. Superior execution across all metrics.',
    investmentPlan: 'Gold Plan Investor',
    verified: true,
  },
];

// In-memory / localStorage synchronizer
class StorageService {
  private get<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
      const stored = localStorage.getItem(key);
      if (!stored || stored === 'undefined' || stored === 'null') return fallback;
      const parsed = JSON.parse(stored);
      if (parsed === null || parsed === undefined) return fallback;
      if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
      return parsed;
    } catch {
      return fallback;
    }
  }

  private set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      window.dispatchEvent(new Event('cffx_storage_updated'));
    } catch (err) {
      console.error('Storage write error:', err);
    }
  }

  // Users
  getUsers(): User[] {
    const users = this.get<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    return Array.isArray(users) ? users : INITIAL_USERS;
  }

  saveUsers(users: User[]): void {
    this.set(STORAGE_KEYS.USERS, users);
  }

  getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u && u.id === id);
  }

  getUserByUsername(username: string): User | undefined {
    if (!username) return undefined;
    return this.getUsers().find(u => u && u.username && u.username.toLowerCase() === username.toLowerCase());
  }

  getUserByEmail(email: string): User | undefined {
    if (!email) return undefined;
    return this.getUsers().find(u => u && u.email && u.email.toLowerCase() === email.toLowerCase());
  }

  updateUser(updatedUser: User): void {
    const users = this.getUsers().map(u => (u && u.id === updatedUser.id) ? { ...updatedUser, updatedAt: new Date().toISOString() } : u);
    this.saveUsers(users);
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === updatedUser.id) {
      this.setCurrentUser({ ...updatedUser, updatedAt: new Date().toISOString() });
    }
  }

  // Session
  getCurrentUser(): User | null {
    // Default to the active investor for immediate visual feedback if not logged in
    const user = this.get<User | null>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[1]);
    return user || INITIAL_USERS[1];
  }

  setCurrentUser(user: User | null): void {
    this.set(STORAGE_KEYS.CURRENT_USER, user);
  }

  // Plans
  getPlans(): InvestmentPlan[] {
    const plans = this.get<InvestmentPlan[]>(STORAGE_KEYS.PLANS, INITIAL_PLANS);
    return Array.isArray(plans) && plans.length > 0 ? plans : INITIAL_PLANS;
  }

  savePlans(plans: InvestmentPlan[]): void {
    this.set(STORAGE_KEYS.PLANS, plans);
  }

  getPlanById(id: string): InvestmentPlan | undefined {
    return this.getPlans().find(p => p && p.id === id);
  }

  // Deposits
  getDeposits(): Deposit[] {
    const deposits = this.get<Deposit[]>(STORAGE_KEYS.DEPOSITS, INITIAL_DEPOSITS);
    return Array.isArray(deposits) ? deposits : INITIAL_DEPOSITS;
  }

  saveDeposits(deposits: Deposit[]): void {
    this.set(STORAGE_KEYS.DEPOSITS, deposits);
  }

  getDepositById(id: string): Deposit | undefined {
    return this.getDeposits().find(d => d && d.id === id);
  }

  // Withdrawals
  getWithdrawals(): Withdrawal[] {
    const withdrawals = this.get<Withdrawal[]>(STORAGE_KEYS.WITHDRAWALS, INITIAL_WITHDRAWALS);
    return Array.isArray(withdrawals) ? withdrawals : INITIAL_WITHDRAWALS;
  }

  getWithdrawalsByUser(userId: string): Withdrawal[] {
    return this.getWithdrawals().filter(w => w && w.userId === userId);
  }

  saveWithdrawals(withdrawals: Withdrawal[]): void {
    this.set(STORAGE_KEYS.WITHDRAWALS, withdrawals);
  }

  // Transactions
  getTransactions(): Transaction[] {
    const transactions = this.get<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    return Array.isArray(transactions) ? transactions : INITIAL_TRANSACTIONS;
  }

  getTransactionsByUser(userId: string): Transaction[] {
    return this.getTransactions().filter(t => t && t.userId === userId);
  }

  saveTransactions(transactions: Transaction[]): void {
    this.set(STORAGE_KEYS.TRANSACTIONS, transactions);
  }

  // Investments
  getInvestments(): Investment[] {
    const investments = this.get<Investment[]>(STORAGE_KEYS.INVESTMENTS, INITIAL_INVESTMENTS);
    return Array.isArray(investments) ? investments : INITIAL_INVESTMENTS;
  }

  saveInvestments(investments: Investment[]): void {
    this.set(STORAGE_KEYS.INVESTMENTS, investments);
  }

  getInvestmentsByUser(userId: string): Investment[] {
    return this.getInvestments().filter(i => i && i.userId === userId);
  }

  // Referrals
  getReferrals(): Referral[] {
    const referrals = this.get<Referral[]>(STORAGE_KEYS.REFERRALS, INITIAL_REFERRALS);
    return Array.isArray(referrals) ? referrals : INITIAL_REFERRALS;
  }

  getReferralsByReferrer(referrerId: string): Referral[] {
    return this.getReferrals().filter(r => r && r.referrerId === referrerId);
  }

  saveReferrals(referrals: Referral[]): void {
    this.set(STORAGE_KEYS.REFERRALS, referrals);
  }

  // Ledger
  getLedger(): LedgerEntry[] {
    const ledger = this.get<LedgerEntry[]>(STORAGE_KEYS.LEDGER, INITIAL_LEDGER);
    return Array.isArray(ledger) ? ledger : INITIAL_LEDGER;
  }

  saveLedger(ledger: LedgerEntry[]): void {
    this.set(STORAGE_KEYS.LEDGER, ledger);
  }

  // Notifications
  getNotifications(): Notification[] {
    const notifs = this.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    return Array.isArray(notifs) ? notifs : INITIAL_NOTIFICATIONS;
  }

  saveNotifications(notifs: Notification[]): void {
    this.set(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }

  // Crypto Wallets
  getWallets(): CryptoWalletConfig[] {
    const wallets = this.get<CryptoWalletConfig[]>(STORAGE_KEYS.WALLETS, INITIAL_WALLETS);
    return Array.isArray(wallets) && wallets.length > 0 ? wallets : INITIAL_WALLETS;
  }

  getCryptoWallets(): CryptoWalletConfig[] {
    return this.getWallets();
  }

  saveWallets(wallets: CryptoWalletConfig[]): void {
    this.set(STORAGE_KEYS.WALLETS, wallets);
  }

  saveCryptoWallets(wallets: CryptoWalletConfig[]): void {
    this.saveWallets(wallets);
  }

  // Settings
  getSettings(): PlatformSettings {
    const s = this.get<PlatformSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    return s && typeof s === 'object' ? s : INITIAL_SETTINGS;
  }

  getPlatformSettings(): PlatformSettings {
    return this.getSettings();
  }

  saveSettings(settings: PlatformSettings): void {
    this.set(STORAGE_KEYS.SETTINGS, settings);
  }

  savePlatformSettings(settings: PlatformSettings): void {
    this.saveSettings(settings);
  }

  // FAQs
  getFaqs(): FAQItem[] {
    const faqs = this.get<FAQItem[]>(STORAGE_KEYS.FAQS, INITIAL_FAQS);
    return Array.isArray(faqs) && faqs.length > 0 ? faqs : INITIAL_FAQS;
  }

  saveFaqs(faqs: FAQItem[]): void {
    this.set(STORAGE_KEYS.FAQS, faqs);
  }

  // Testimonials
  getTestimonials(): Testimonial[] {
    const t = this.get<Testimonial[]>(STORAGE_KEYS.TESTIMONIALS, INITIAL_TESTIMONIALS);
    return Array.isArray(t) && t.length > 0 ? t : INITIAL_TESTIMONIALS;
  }

  saveTestimonials(testimonials: Testimonial[]): void {
    this.set(STORAGE_KEYS.TESTIMONIALS, testimonials);
  }

  // Support Tickets
  getSupportTickets(): any[] {
    const tickets = this.get<any[]>('capitalfargo_support_tickets', []);
    return Array.isArray(tickets) ? tickets : [];
  }

  saveSupportTickets(tickets: any[]): void {
    this.set('capitalfargo_support_tickets', tickets);
  }

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    const logs = this.get<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    return Array.isArray(logs) ? logs : INITIAL_AUDIT_LOGS;
  }

  saveAuditLogs(logs: AuditLog[]): void {
    this.set(STORAGE_KEYS.AUDIT_LOGS, logs);
  }

  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      ...log,
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    };
    this.saveAuditLogs([newLog, ...logs]);
  }

  // Reset to default
  resetAllData(): void {
    if (typeof window === 'undefined') return;
    localStorage.clear();
    window.location.reload();
  }
}

export const storage = new StorageService();
