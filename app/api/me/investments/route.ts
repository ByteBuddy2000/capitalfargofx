import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Investment } from '@/models/Investment';

export type MeInvestmentsResponse = {
  investments: Array<Record<string, unknown>>;
};

export async function GET(): Promise<NextResponse<MeInvestmentsResponse | { message: string }>> {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }

    await connectToDatabase();
    const investments = await Investment.find({ userId: user._id }).populate('planId').sort({ createdAt: -1 }).lean();
    return NextResponse.json({ investments });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
