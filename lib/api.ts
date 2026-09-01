import { User, InvestmentPlan, Deposit, Withdrawal, Investment, Transaction } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

function normalizeRecord<T extends { id?: string }>(record: T & { _id?: string }): T {
  if (record._id && !record.id) record.id = record._id;
  delete record._id;
  return record;
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
    const result = await request<{ deposits: (Deposit & { _id?: string })[] }>('/me/deposits');
    return result.deposits.map(normalizeRecord);
  },
  async createDeposit(data: { planId: string; amount: number; asset: string; network: string; receivingAddress?: string; txHash?: string }) {
    const result = await request<{ deposit: Deposit & { _id?: string } }>('/deposits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return normalizeRecord(result.deposit);
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
    const result = await request<{ deposits: (Deposit & { _id?: string })[] }>('/admin/deposits');
    return result.deposits.map(normalizeRecord);
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