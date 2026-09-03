import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { Deposit } from '@/models/Deposit';
import { Withdrawal } from '@/models/Withdrawal';
import { Investment } from '@/models/Investment';

export async function GET() {
  try {
    await requireAdmin();
    await connectToDatabase();

    const [users, deposits, withdrawals, investments] = await Promise.all([
      User.find({}).select('-passwordHash').sort({ createdAt: -1 }).lean(),
      Deposit.find({}).populate('userId', 'fullName username email').populate('planId', 'name').sort({ createdAt: -1 }).lean(),
      Withdrawal.find({}).populate('userId', 'fullName username email').sort({ createdAt: -1 }).lean(),
      Investment.find({}).populate('planId', 'name').sort({ createdAt: -1 }).lean(),
    ]);

    return NextResponse.json({ users, deposits, withdrawals, investments });
  } catch (error: unknown) {
    console.error('Failed to load admin overview:', error);
    return NextResponse.json({ message: 'Unable to load administrator data.' }, { status: 500 });
  }
}