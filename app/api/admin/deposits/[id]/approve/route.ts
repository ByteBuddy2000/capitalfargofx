import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Deposit, type IDeposit } from '@/models/Deposit';
import { Investment } from '@/models/Investment';
import { User } from '@/models/User';
import { Transaction } from '@/models/Transaction';
import { type IPlan } from '@/models/Plan';

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
    const body = (await request.json().catch(() => ({}))) as { adminNotes?: string };

    const deposit = await Deposit.findOne({ _id: id, status: 'PENDING' }).populate('planId').populate('userId').exec() as (IDeposit & { planId: IPlan; userId: any }) | null;
    if (!deposit) {
      return NextResponse.json({ message: 'Pending deposit not found.' }, { status: 404 });
    }

    const plan = deposit.planId as IPlan;
    if (!plan) {
      return NextResponse.json({ message: 'Associated investment plan not found.' }, { status: 400 });
    }

    const investor = await User.findById(deposit.userId).exec();
    if (!investor) {
      return NextResponse.json({ message: 'Investor account not found.' }, { status: 404 });
    }

    const expectedProfit = Number(deposit.amount) * Number(plan.returnPercentage || 0) / 100;
    const totalExpectedReturn = plan.principalReturn ? Number(deposit.amount) + expectedProfit : expectedProfit;

    deposit.status = 'APPROVED';
    deposit.approvedAt = new Date();
    deposit.adminNotes = body.adminNotes || 'Approved via Admin Security Console';
    await deposit.save();

    const investment = await Investment.create({
      userId: deposit.userId,
      planId: plan._id ?? plan.id,
      depositId: deposit._id,
      amount: deposit.amount,
      returnPercentage: plan.returnPercentage,
      expectedProfit,
      totalExpectedReturn,
      durationHours: plan.durationHours,
      startDate: new Date(),
      maturityDate: new Date(Date.now() + plan.durationHours * 60 * 60 * 1000),
      status: 'ACTIVE',
      principalReturn: Boolean(plan.principalReturn),
      payoutProcessed: false,
    });

    investor.totalDeposits = Number(investor.totalDeposits || 0) + Number(deposit.amount);
    await investor.save();

    const existingTx = await Transaction.findOne({ referenceId: deposit._id }).exec();
    if (existingTx) {
      existingTx.status = 'COMPLETED';
      existingTx.description = `${plan.name} confirmed deposit`;
      await existingTx.save();
    } else {
      await Transaction.create({
        userId: deposit.userId,
        type: 'DEPOSIT',
        amount: deposit.amount,
        asset: deposit.asset,
        status: 'COMPLETED',
        description: `${plan.name} confirmed deposit`,
        referenceId: deposit._id,
      });
    }

    await Transaction.create({
      userId: deposit.userId,
      type: 'INVESTMENT',
      amount: deposit.amount,
      asset: 'USD',
      status: 'COMPLETED',
      description: `${plan.name} investment activated`,
      referenceId: investment._id,
    });

    if (investor.uplineId) {
      const uplineUser = await User.findById(investor.uplineId).exec();
      if (uplineUser && uplineUser._id.toString() !== investor._id.toString()) {
        const rate = Number(plan.referralPercentage || 5);
        const commissionAmount = (Number(deposit.amount) * rate) / 100;
        if (commissionAmount > 0) {
          uplineUser.availableBalance = Number(uplineUser.availableBalance || 0) + commissionAmount;
          uplineUser.referralEarnings = Number(uplineUser.referralEarnings || 0) + commissionAmount;
          await uplineUser.save();

          await Transaction.create({
            userId: uplineUser._id,
            type: 'REFERRAL_COMMISSION',
            amount: commissionAmount,
            asset: 'USD',
            status: 'COMPLETED',
            description: `${rate}% referral bonus on ${investor.username}'s investment`,
            referenceId: deposit._id,
          });
        }
      }
    }

    return NextResponse.json({ deposit, investment });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
