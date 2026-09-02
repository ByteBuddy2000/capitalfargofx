import { User, InvestmentPlan, Deposit, Withdrawal, Investment, Transaction } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

type MongoRecord = { _id?: string };

function normalizeRecord<T extends { id?: string }>(record: T & MongoRecord): T {
  const normalized = { ...record } as T & MongoRecord;
  if (normalized._id && !normalized.id) normalized.id = normalized._id;
  delete normalized._id;
  return normalized;
}

type PopulatedUser = { _id?: string; fullName?: string; username?: string; email?: string };
type PopulatedPlan = { _id?: string; name?: string };
type ApiDeposit = Omit<Deposit, 'userId' | 'planId'> & {
  _id?: string;
  userId: string | PopulatedUser;
  planId: string | PopulatedPlan;
};

function normalizeDeposit(record: ApiDeposit): Deposit {
  const user = typeof record.userId === 'object' && record.userId !== null ? record.userId : undefined;
  const plan = typeof record.planId === 'object' && record.planId !== null ? record.planId : undefined;

  const userId = user?._id || (typeof(record.userId) === 'string' ? record.userId : '');
  const planId = plan?._id || (typeof(record.planId) === 'string' ? record.planId : '');
  const deposit = { ...normalizeRecord(record as ApiDeposit), userId, planId } as Deposit;

  deposit.userFullName = deposit.userFullName || user?.fullName || '';
  deposit.userUsername = deposit.userUsername || user?.username;
  deposit.userEmail = deposit.userEmail || user?.email;
  deposit.planName = deposit.planName || plan?.name || '';
  deposit.asset = deposit.asset || deposit.cryptoCurrency;
  deposit.cryptoCurrency = deposit.cryptoCurrency || deposit.asset;
  deposit.txHash = deposit.txHash || deposit.transactionHash;
  deposit.transactionHash = deposit.transactionHash || deposit.txHash;
  return deposit;
}

function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Headers) return Object.fromEntries(headers.entries());
  if (Array.isArray(headers)) return Object.fromEntries(headers);
  return { ...headers };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...normalizeHeaders(options.headers),
    },
  });

  const body = await response.json().catch(() => ({}));

  if (response.status === 401) {
    throw new Error(body.message || 'Session expired. Please log in again.');
  }

  if (!response.ok) throw new Error(body.message || 'Request failed.');

  return body as T;
}

export const authApi = {
  async plans() {
    const result = await request<{ plans: (InvestmentPlan & { _id?: string })[] }>('/plans');
    return result.plans.map(normalizeRecord);
  },
  async deposits() {
    const result = await request<{ deposits: ApiDeposit[] }>('/me/deposits');
    return result.deposits.map(normalizeDeposit);
  },
  async createDeposit(data: { planId: string; amount: number; asset: string; network: string; receivingAddress?: string; txHash?: string }) {
    const result = await request<{ deposit: ApiDeposit }>('/deposits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return normalizeDeposit(result.deposit);
  },
  async withdrawals() {
    const result = await request<{ withdrawals: (Withdrawal & { _id?: string })[] }>('/me/withdrawals');
    return result.withdrawals.map(normalizeRecord);
  },
  async createWithdrawal(data: { amount: number; asset: string; network: string; destinationAddress: string }) {
    const result = await request<{ withdrawal: Withdrawal & { _id?: string }; user: User }>('/withdrawals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { withdrawal: normalizeRecord(result.withdrawal), user: result.user };
  },
  async investments() {
    const result = await request<{ investments: (Investment & { _id?: string })[] }>('/me/investments');
    return result.investments.map(normalizeRecord);
  },
  async settleInvestment(id: string) {
    const result = await request<{ investment: Investment & { _id?: string }; payout: number }>(`/investments/${id}/settle`, {
      method: 'POST',
    });
    return { investment: normalizeRecord(result.investment), payout: result.payout };
  },
  async transactions() {
    const result = await request<{ transactions: (Transaction & { _id?: string })[] }>('/me/transactions');
    return result.transactions.map(normalizeRecord);
  },
  async adminDeposits() {
    const result = await request<{ deposits: ApiDeposit[] }>('/admin/deposits');
    return result.deposits.map(normalizeDeposit);
  },
  async approveDeposit(id: string, adminNotes = '') {
    return request(`/admin/deposits/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ adminNotes }),
    });
  },
  async rejectDeposit(id: string, reason: string) {
    return request(`/admin/deposits/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
  async adminWithdrawals() {
    const result = await request<{ withdrawals: (Withdrawal & { _id?: string })[] }>('/admin/withdrawals');
    return result.withdrawals.map(normalizeRecord);
  },
  async updateWithdrawal(id: string, status: string, txHash = '', adminNotes = '') {
    return request(`/admin/withdrawals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, txHash, adminNotes }),
    });
  },
};