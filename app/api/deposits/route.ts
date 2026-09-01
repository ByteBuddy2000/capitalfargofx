import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Plan, type IPlan } from '@/models/Plan';
import { Deposit } from '@/models/Deposit';
import { Transaction } from '@/models/Transaction';
import { Notification } from '@/models/Notification';

const assets = ['BTC', 'ETH', 'USDT'];
const positiveAmount = (value: unknown): boolean => Number.isFinite(Number(value)) && Number(value) > 0;

export type DepositRequestBody = {
  planId?: string;
  amount?: number;
  asset?: string;
  network?: string;
  receivingAddress?: string;
  txHash?: string;
};

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }

    await connectToDatabase();
    const body = (await request.json()) as DepositRequestBody;
    const { planId, amount, asset, network = 'Mainnet', receivingAddress = '', txHash = '' } = body;

    const plan = await Plan.findOne({ _id: planId, status: 'ACTIVE' }).exec() as IPlan | null;
    if (!plan) {
      return NextResponse.json({ message: 'Investment plan is unavailable.' }, { status: 400 });
    }
    if (!positiveAmount(amount) || Number(amount) < plan.minimumAmount || (plan.maximumAmount > 0 && Number(amount) > plan.maximumAmount)) {
      return NextResponse.json({ message: `Deposit must be between $${plan.minimumAmount} and ${plan.maximumAmount ? `$${plan.maximumAmount}` : 'the plan maximum'}.` }, { status: 400 });
    }
    if (!assets.includes(asset ?? '')) {
      return NextResponse.json({ message: 'Unsupported asset.' }, { status: 400 });
    }

    const deposit = await Deposit.create({
      userId: user._id,
      planId,
      amount,
      asset,
      network,
      receivingAddress,
      txHash,
    });

    await Transaction.create({
      userId: user._id,
      type: 'DEPOSIT',
      amount,
      asset,
      status: 'PENDING',
      description: `${plan.name} pending deposit`,
      referenceId: deposit._id,
    });

    await Notification.create({
      userId: user._id,
      title: 'Deposit submitted',
      message: 'Your deposit is awaiting verification.',
      type: 'DEPOSIT',
    });

    return NextResponse.json({ deposit }, { status: 201 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
