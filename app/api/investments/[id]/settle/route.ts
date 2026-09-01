import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Investment } from '@/models/Investment';
import { User } from '@/models/User';
import { Transaction } from '@/models/Transaction';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;
    const investment = await Investment.findOne({ _id: id, userId: user._id, status: 'ACTIVE', payoutProcessed: false }).exec();

    if (!investment) {
      return NextResponse.json({ message: 'Active investment not found.' }, { status: 404 });
    }

    if (new Date(investment.maturityDate) > new Date()) {
      return NextResponse.json({ message: 'Investment has not matured yet.' }, { status: 400 });
    }

    investment.status = 'COMPLETED';
    investment.payoutProcessed = true;
    await investment.save();

    const payout = investment.expectedProfit + (investment.principalReturn ? investment.amount : 0);
    await User.findByIdAndUpdate(user._id, {
      $inc: {
        availableBalance: payout,
        earningBalance: investment.expectedProfit,
      },
    }).exec();

    await Transaction.create({
      userId: user._id,
      type: 'PROFIT',
      amount: investment.expectedProfit,
      asset: 'USD',
      status: 'COMPLETED',
      description: 'Investment maturity payout',
      referenceId: investment._id,
    });

    return NextResponse.json({ investment, payout });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
