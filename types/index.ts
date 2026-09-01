export type Role = 'USER' | 'ADMIN';
export type UserRole = Role;

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  passwordHash?: string;
  role: Role;
  status: UserStatus;
  btcWallet: string;
  ethWallet: string;
  usdtWallet: string;
  uplineId: string | null;
  uplineUsername?: string | null;
  availableBalance: number; // in USD
  earningBalance: number;    // accumulated earnings in USD
  totalDeposits: number;     // total confirmed deposits
  totalWithdrawals: number;  // total completed withdrawals
  referralEarnings: number;  // total referral commissions
  createdAt: string;
  updatedAt: string;
  kycStatus?: 'VERIFIED' | 'PENDING' | 'UNVERIFIED';
}

export interface InvestmentPlan {
  id: string;
  name: string;
  slug: string;
  minimumAmount: number;
  maximumAmount: number; // 0 for unlimited
  returnPercentage: number;
  durationHours: number;
  referralPercentage?: number;
  referralCommissionRate?: number;
  principalReturn: boolean;
  principalWithdrawable?: boolean;
  depositFeePercentage?: number;
  depositFeeFixed?: number;
  status?: 'ACTIVE' | 'INACTIVE';
  isActive?: boolean;
  featured?: boolean;
  description: string;
  badge?: string;
  createdAt: string;
  updatedAt: string;
}

export type DepositStatus = 'PENDING' | 'APPROVED' | 'COMPLETED' | 'REJECTED' | 'EXPIRED';

export interface Deposit {
  id: string;
  userId: string;
  userUsername?: string;
  userFullName: string;
  userEmail?: string;
  planId: string;
  planName: string;
  amount: number;
  asset?: 'BTC' | 'ETH' | 'USDT';
  cryptoCurrency?: 'BTC' | 'ETH' | 'USDT';
  network: string;
  receivingAddress?: string;
  destinationAddress?: string;
  txHash?: string;
  transactionHash?: string;
  status: DepositStatus;
  expectedReturnPercentage?: number;
  durationHours?: number;
  expectedProfit?: number;
  totalExpectedReturn?: number;
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  adminNotes?: string;
}

export type InvestmentStatus = 'PENDING' | 'ACTIVE' | 'MATURED' | 'COMPLETED' | 'CANCELLED';

export interface Investment {
  id: string;
  userId: string;
  userUsername?: string;
  planId: string;
  planName: string;
  depositId?: string;
  principalAmount?: number;
  amount: number;
  returnPercentage: number;
  expectedProfit: number;
  totalReturn?: number;
  totalExpectedReturn?: number;
  durationHours: number;
  startDate: string;
  maturityDate: string;
  status: InvestmentStatus;
  principalReturn: boolean;
  payoutProcessed?: boolean;
  createdAt: string;
}

export type WithdrawalStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';

export interface Withdrawal {
  id: string;
  userId: string;
  userUsername?: string;
  userFullName: string;
  userEmail?: string;
  amount: number;
  asset?: 'BTC' | 'ETH' | 'USDT';
  cryptoCurrency?: 'BTC' | 'ETH' | 'USDT';
  network: string;
  destinationAddress: string;
  status: WithdrawalStatus;
  txHash?: string;
  transactionHash?: string;
  adminNotes?: string;
  createdAt: string;
  processedAt?: string;
  completedAt?: string;
}

export type TransactionType = 
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'INVESTMENT'
  | 'INVESTMENT_DEBIT'
  | 'PROFIT'
  | 'PROFIT_PAYOUT'
  | 'PRINCIPAL_RETURN'
  | 'REFERRAL_COMMISSION'
  | 'REFUND'
  | 'ADJUSTMENT';

export type TransactionStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';

export interface Transaction {
  id: string;
  userId: string;
  userUsername?: string;
  type: TransactionType;
  amount: number;
  asset?: string;
  cryptoCurrency?: string;
  status: TransactionStatus;
  description: string;
  referenceId?: string;
  txHash?: string;
  createdAt: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  referrerUsername: string;
  referredUserId?: string;
  referredUsername: string;
  referredFullName: string;
  level?: number;
  totalDeposits: number;
  commissionsEarned: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export type LedgerDirection = 'CREDIT' | 'DEBIT';

export interface LedgerEntry {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  asset: string;
  direction: LedgerDirection;
  referenceType: 'DEPOSIT' | 'WITHDRAWAL' | 'INVESTMENT' | 'REFERRAL' | 'ADMIN_ADJUSTMENT';
  referenceId: string;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'INVESTMENT' | 'REFERRAL' | 'SECURITY' | 'SYSTEM';
  read: boolean;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  subject: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
  updatedAt: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'investing' | 'deposits' | 'withdrawals' | 'referrals' | 'security';
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  avatar: string;
  rating: number;
  message: string;
  investmentPlan: string;
  verified: boolean;
}

export interface CryptoWalletConfig {
  id?: string;
  asset?: 'BTC' | 'ETH' | 'USDT';
  name: string;
  symbol: 'BTC' | 'ETH' | 'USDT' | string;
  network: string;
  address: string;
  qrCodeUrl?: string;
  minDeposit?: number;
  depositFee?: string;
  active?: boolean;
  isActive?: boolean;
  updatedAt?: string;
}

export interface PlatformSettings {
  platformName?: string;
  siteName?: string;
  supportEmail: string;
  telegramChannel: string;
  companyAddress?: string;
  minWithdrawalAmount?: number;
  maxWithdrawalDaily?: number;
  withdrawalFeePercentage?: number;
  activeInvestorsDisplay?: string;
  statsActiveInvestors?: string;
  totalDepositsDisplay?: string;
  statsTotalDeposited?: string;
  totalWithdrawalsDisplay?: string;
  statsTotalWithdrawn?: string;
  supportedAssetsDisplay?: string;
  statsCountriesSupported?: string;
  maintenanceMode?: boolean;
  isMaintenanceMode?: boolean;
  updatedAt: string;
}

export type AuditAction = 
  | 'DEPOSIT_APPROVED'
  | 'DEPOSIT_REJECTED'
  | 'WITHDRAWAL_APPROVED'
  | 'WITHDRAWAL_PROCESSING'
  | 'WITHDRAWAL_COMPLETED'
  | 'WITHDRAWAL_REJECTED'
  | 'USER_SUSPENDED'
  | 'USER_ACTIVATED'
  | 'USER_STATUS_CHANGED'
  | 'PLAN_CREATED'
  | 'PLAN_UPDATED'
  | 'PLAN_CONFIG_UPDATED'
  | 'PLAN_DELETED'
  | 'WALLET_UPDATED'
  | 'CRYPTO_WALLET_UPDATED'
  | 'SETTINGS_UPDATED'
  | 'PLATFORM_SETTINGS_UPDATED'
  | 'BALANCE_ADJUSTED'
  | 'REFERRAL_CREATED'
  | 'PROFILE_UPDATED'
  | 'PASSWORD_CHANGED'
  | 'SUPPORT_TICKET_CREATED';

export interface AuditLog {
  id: string;
  actorId: string;
  actorUsername: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  previousState?: any;
  newState?: any;
  ipAddress?: string;
  timestamp: string;
  notes?: string;
}
