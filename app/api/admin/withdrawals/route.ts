import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Withdrawal } from '@/models/Withdrawal';

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ message: 'Administrator access required.' }, { status: 401 });
    }

    await connectToDatabase();
    const withdrawals = await Withdrawal.find({})
      .populate('userId', 'fullName username email')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ withdrawals });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
