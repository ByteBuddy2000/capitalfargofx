import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Referral } from '@/models/Referral';

export type MeReferralsResponse = {
  referrals: Array<Record<string, unknown>>;
};

export async function GET(): Promise<NextResponse<MeReferralsResponse | { message: string }>> {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }

    await connectToDatabase();
    const referrals = await Referral.find({ referrerId: user._id }).populate('referredUserId', 'fullName username email status').lean();
    return NextResponse.json({ referrals });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
