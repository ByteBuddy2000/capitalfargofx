import { NextRequest, NextResponse } from 'next/server';
import { authErrorStatus, requireAdmin } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Deposit } from '@/models/Deposit';
import { Transaction } from '@/models/Transaction';
import { Notification } from '@/models/Notification';

export async function POST(
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
    const body = (await request.json().catch(() => ({}))) as { reason?: string };

    const deposit = await Deposit.findOne({ _id: id, status: 'PENDING' }).exec();
    if (!deposit) {
      return NextResponse.json({ message: 'Pending deposit not found.' }, { status: 404 });
    }

    deposit.status = 'REJECTED';
    deposit.rejectedAt = new Date();
    deposit.adminNotes = body.reason || 'Rejected by administrator.';
    await deposit.save();

    const existingTx = await Transaction.findOne({ referenceId: deposit._id }).exec();
    if (existingTx) {
      existingTx.status = 'REJECTED';
      existingTx.description = `Deposit rejected: ${deposit.adminNotes}`;
      await existingTx.save();
    }

    await Notification.create({
      userId: deposit.userId,
      title: 'Deposit rejected',
      message: deposit.adminNotes,
      type: 'DEPOSIT',
    });

    return NextResponse.json({ deposit });
  } catch (error: unknown) {
    const authStatus = authErrorStatus(error);
    if (authStatus) return NextResponse.json({ message: authStatus === 401 ? 'Authentication required.' : 'Administrator access required.' }, { status: authStatus });
    console.error(error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
