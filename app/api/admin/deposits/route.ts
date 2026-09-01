import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Deposit } from '@/models/Deposit';

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ message: 'Administrator access required.' }, { status: 401 });
    }

    await connectToDatabase();
    const deposits = await Deposit.find({})
      .populate('userId', 'fullName username email')
      .populate('planId')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ deposits });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
