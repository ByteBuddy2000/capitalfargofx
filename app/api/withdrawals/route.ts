import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { Withdrawal } from '@/models/Withdrawal';
import { Transaction } from '@/models/Transaction';
import { LedgerEntry } from '@/models/LedgerEntry';

const assets = ['BTC', 'ETH', 'USDT'];

const positiveAmount = (value: unknown): boolean => Number.isFinite(Number(value)) && Number(value) > 0;

export type WithdrawalRequestBody = {
  amount?: number;
  asset?: string;
  network?: string;
  destinationAddress?: string;
};

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }

    const body = (await request.json()) as WithdrawalRequestBody;
    const { amount, asset, network = 'Mainnet', destinationAddress } = body;

    if (!positiveAmount(amount) || !assets.includes(asset ?? '') || !destinationAddress?.trim() || destinationAddress.trim().length < 10) {
      return NextResponse.json({ message: 'Valid amount, asset, and destination address are required.' }, { status: 400 });
    }

    const minimum = Number(process.env.MIN_WITHDRAWAL_AMOUNT || 50);
    if (Number(amount) < minimum) {
      return NextResponse.json({ message: `Minimum withdrawal amount is $${minimum}.` }, { status: 400 });
    }

    await connectToDatabase();
    const updated = await User.findOneAndUpdate(
      { _id: user._id, availableBalance: { $gte: Number(amount) } },
      { $inc: { availableBalance: -Number(amount) } },
      { new: true }
    ).exec();

    if (!updated) {
      return NextResponse.json({ message: 'Insufficient available balance.' }, { status: 400 });
    }

    const withdrawal = await Withdrawal.create({
      userId: user._id,
      amount,
      asset,
      network,
      destinationAddress: destinationAddress.trim(),
    });

    await Transaction.create({
      userId: user._id,
      type: 'WITHDRAWAL',
      amount,
      asset,
      status: 'PENDING',
      description: `Withdrawal to ${asset}`,
      referenceId: withdrawal._id,
    });

    await LedgerEntry.create({
      userId: user._id,
      type: 'WITHDRAWAL',
      amount,
      asset: 'USD',
      direction: 'DEBIT',
      referenceType: 'WITHDRAWAL',
      referenceId: withdrawal._id,
      balanceBefore: updated.availableBalance + Number(amount),
      balanceAfter: updated.availableBalance,
      description: 'Pending withdrawal reserve',
    });

    return NextResponse.json({ withdrawal, user: updated.toObject ? updated.toObject() : updated });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
