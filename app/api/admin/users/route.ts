import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { LedgerEntry } from '@/models/LedgerEntry';
import { Transaction } from '@/models/Transaction';

const publicUser = (user: Record<string, unknown>) => ({
  ...user,
  id: String(user._id),
  _id: undefined,
  passwordHash: undefined,
  uplineId: user.uplineId ? String(user.uplineId) : null,
  createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
  updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt,
});

export async function GET() {
  try {
    await requireAdmin();
    await connectToDatabase();
    const users = await User.find({}).select('-passwordHash').sort({ createdAt: -1 }).lean();
    return NextResponse.json({ users: users.map(user => publicUser(user as Record<string, unknown>)) });
  } catch (error: unknown) {
    console.error('Failed to load admin users:', error);
    return NextResponse.json({ message: 'Unable to load users.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    await connectToDatabase();
    const body = await request.json() as {
      userId?: string;
      status?: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
      balanceType?: 'available' | 'earning';
      operation?: 'CREDIT' | 'DEBIT';
      amount?: number;
      reason?: string;
    };

    if (!body.userId || body.userId === admin._id?.toString()) {
      return NextResponse.json({ message: 'A valid target user is required.' }, { status: 400 });
    }

    const user = await User.findById(body.userId).exec();
    if (!user) return NextResponse.json({ message: 'User not found.' }, { status: 404 });

    if (body.status) {
      user.status = body.status;
      await user.save();
    } else {
      const amount = Number(body.amount);
      if (!Number.isFinite(amount) || amount <= 0 || !body.balanceType || !body.operation || !body.reason?.trim()) {
        return NextResponse.json({ message: 'Balance type, operation, amount, and reason are required.' }, { status: 400 });
      }
      const field = body.balanceType === 'available' ? 'availableBalance' : 'earningBalance';
      const before = Number(user[field] || 0);
      const after = body.operation === 'CREDIT' ? before + amount : before - amount;
      if (after < 0) return NextResponse.json({ message: 'Balance cannot become negative.' }, { status: 400 });
      user[field] = after;
      await user.save();
      const referenceId = user._id;
      await LedgerEntry.create({ userId: user._id, type: 'ADJUSTMENT', amount, asset: 'USD', direction: body.operation === 'CREDIT' ? 'CREDIT' : 'DEBIT', referenceType: 'ADMIN_ADJUSTMENT', referenceId, balanceBefore: before, balanceAfter: after, description: body.reason.trim(), metadata: { adminId: admin._id.toString(), reason: body.reason.trim() } });
      await Transaction.create({ userId: user._id, type: 'ADJUSTMENT', amount, asset: 'USD', status: 'COMPLETED', description: body.reason.trim(), referenceId });
    }

    return NextResponse.json({ user: publicUser(user.toObject() as Record<string, unknown>) });
  } catch (error: unknown) {
    console.error('Failed to update admin user:', error);
    return NextResponse.json({ message: 'Unable to update user.' }, { status: 500 });
  }
}