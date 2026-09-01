import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Deposit } from '@/models/Deposit';
import { Transaction } from '@/models/Transaction';

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

    return NextResponse.json({ deposit });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
