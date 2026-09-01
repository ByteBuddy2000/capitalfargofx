import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Transaction } from '@/models/Transaction';

export type MeTransactionsResponse = {
  transactions: Array<Record<string, unknown>>;
};

export async function GET(): Promise<NextResponse<MeTransactionsResponse | { message: string }>> {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }

    await connectToDatabase();
    const transactions = await Transaction.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ transactions });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
