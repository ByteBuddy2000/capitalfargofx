import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Withdrawal } from '@/models/Withdrawal';

export type MeWithdrawalsResponse = {
  withdrawals: Array<Record<string, unknown>>;
};

export async function GET(): Promise<NextResponse<MeWithdrawalsResponse | { message: string }>> {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }

    await connectToDatabase();
    const withdrawals = await Withdrawal.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ withdrawals });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
