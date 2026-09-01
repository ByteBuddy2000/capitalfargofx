import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Withdrawal } from '@/models/Withdrawal';
import { User } from '@/models/User';
import { Transaction } from '@/models/Transaction';
import { LedgerEntry } from '@/models/LedgerEntry';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ message: 'Administrator access required.' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as { status?: string; txHash?: string; adminNotes?: string };
    const status = body.status;

    if (!status || !['PROCESSING', 'COMPLETED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ message: 'Invalid withdrawal status.' }, { status: 400 });
    }

    const normalizedStatus = status as 'PROCESSING' | 'COMPLETED' | 'REJECTED';

    const withdrawal = await Withdrawal.findById(id).exec();
    if (!withdrawal || withdrawal.status === 'COMPLETED' || withdrawal.status === 'REJECTED') {
      return NextResponse.json({ message: 'Pending withdrawal not found.' }, { status: 404 });
    }

    withdrawal.status = normalizedStatus;
    withdrawal.txHash = body.txHash || '';
    withdrawal.adminNotes = body.adminNotes || '';

    if (normalizedStatus === 'PROCESSING') {
      withdrawal.processedAt = new Date();
    }

    if (normalizedStatus === 'COMPLETED') {
      withdrawal.completedAt = new Date();
      await User.findByIdAndUpdate(withdrawal.userId, { $inc: { totalWithdrawals: withdrawal.amount } }).exec();
    }

    if (normalizedStatus === 'REJECTED') {
      const user = await User.findByIdAndUpdate(withdrawal.userId, { $inc: { availableBalance: withdrawal.amount } }, { new: true }).exec();
      if (user) {
        await LedgerEntry.create({
          userId: withdrawal.userId,
          type: 'REFUND',
          amount: withdrawal.amount,
          asset: 'USD',
          direction: 'CREDIT',
          referenceType: 'WITHDRAWAL',
          referenceId: withdrawal._id,
          balanceBefore: Number(user.availableBalance || 0) - Number(withdrawal.amount),
          balanceAfter: Number(user.availableBalance || 0),
          description: withdrawal.adminNotes || 'Withdrawal rejected and refunded',
        });
      }
    }

    await withdrawal.save();
    await Transaction.findOneAndUpdate(
      { referenceId: withdrawal._id },
      { status: normalizedStatus, txHash: withdrawal.txHash, description: `Withdrawal ${normalizedStatus.toLowerCase()}` },
      { new: true }
    ).exec();

    return NextResponse.json({ withdrawal });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
