import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { LedgerEntry } from '@/models/LedgerEntry';

export type MeLedgerResponse = {
  entries: Array<Record<string, unknown>>;
};

export async function GET(): Promise<NextResponse<MeLedgerResponse | { message: string }>> {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }

    await connectToDatabase();
    const entries = await LedgerEntry.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ entries });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
