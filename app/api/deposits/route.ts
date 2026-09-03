import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { authErrorStatus, requireAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Plan, type IPlan } from '@/models/Plan';
import { Deposit } from '@/models/Deposit';
import { Transaction } from '@/models/Transaction';
import { Notification } from '@/models/Notification';
import { DEFAULT_PLANS } from '@/lib/defaultPlans';

const assets = ['BTC', 'ETH', 'USDT'] as const;
const positiveAmount = (value: unknown): boolean => Number.isFinite(Number(value)) && Number(value) > 0;

export type DepositRequestBody = {
  planId?: string;
  amount?: number;
  asset?: (typeof assets)[number];
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

    const normalizedPlanId = typeof planId === 'string' ? planId.trim() : '';

    if (!normalizedPlanId) {
      return NextResponse.json({ message: 'Please choose a valid investment plan before submitting your deposit.' }, { status: 400 });
    }

    let plan: IPlan | null = null;

    const planSlug = normalizedPlanId.replace(/^plan-/i, '').toLowerCase();
    const planQuery = mongoose.isValidObjectId(normalizedPlanId)
      ? { $or: [{ _id: normalizedPlanId }, { slug: normalizedPlanId }, { slug: planSlug }], status: 'ACTIVE' }
      : { $or: [{ slug: normalizedPlanId }, { slug: planSlug }], status: 'ACTIVE' };
    plan = await Plan.findOne(planQuery).exec() as IPlan | null;
    if (!plan) {
      await Plan.insertMany(DEFAULT_PLANS, { ordered: false }).catch(() => undefined);
      plan = await Plan.findOne(planQuery).exec() as IPlan | null;
    }

    if (!plan) {
      return NextResponse.json({ message: 'That investment plan is unavailable or no longer active. Please select a different plan.' }, { status: 400 });
    }

    const normalizedAmount = Number(amount);
    const normalizedNetwork = typeof network === 'string' ? network.trim() : '';
    const normalizedAddress = typeof receivingAddress === 'string' ? receivingAddress.trim() : '';
    const normalizedTxHash = typeof txHash === 'string' ? txHash.trim() : '';

    if (!positiveAmount(amount) || normalizedAmount < plan.minimumAmount || (plan.maximumAmount > 0 && normalizedAmount > plan.maximumAmount)) {
      return NextResponse.json({ message: `Deposit must be between $${plan.minimumAmount} and ${plan.maximumAmount ? `$${plan.maximumAmount}` : 'the plan maximum'}.` }, { status: 400 });
    }
    if (!assets.includes(asset as (typeof assets)[number])) {
      return NextResponse.json({ message: 'Unsupported asset.' }, { status: 400 });
    }
    if (normalizedNetwork.length < 2 || normalizedAddress.length < 10 || normalizedTxHash.length < 10) {
      return NextResponse.json({ message: 'Network, receiving address, and transaction hash are required.' }, { status: 400 });
    }

    const duplicate = await Deposit.exists({ txHash: normalizedTxHash });
    if (duplicate) {
      return NextResponse.json({ message: 'That transaction hash has already been submitted.' }, { status: 409 });
    }

    const deposit = await Deposit.create({
      userId: user._id,
      planId: plan._id,
      amount: normalizedAmount,
      asset,
      network: normalizedNetwork,
      receivingAddress: normalizedAddress,
      txHash: normalizedTxHash,
    });

    await Transaction.create({
      userId: user._id,
      type: 'DEPOSIT',
      amount: normalizedAmount,
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

    return NextResponse.json({
      deposit: {
        ...deposit.toObject(),
        planName: plan.name,
        expectedReturnPercentage: plan.returnPercentage,
        durationHours: plan.durationHours,
        expectedProfit: normalizedAmount * Number(plan.returnPercentage) / 100,
        totalExpectedReturn: plan.principalReturn
          ? normalizedAmount + normalizedAmount * Number(plan.returnPercentage) / 100
          : normalizedAmount * Number(plan.returnPercentage) / 100,
      },
    }, { status: 201 });
  } catch (error: unknown) {
    const authStatus = authErrorStatus(error);
    if (authStatus) {
      return NextResponse.json({ message: authStatus === 401 ? 'Authentication required.' : 'Administrator access required.' }, { status: authStatus });
    }
    if (error instanceof mongoose.Error && error.name === 'MongoServerError' && (error as mongoose.mongo.MongoServerError).code === 11000) {
      return NextResponse.json({ message: 'That transaction hash has already been submitted.' }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
