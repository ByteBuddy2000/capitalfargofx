import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Plan } from '@/models/Plan';
import { DEFAULT_PLANS } from '@/lib/defaultPlans';

export type PlansResponse = {
  plans: Array<Record<string, unknown>>;
};

export async function GET(): Promise<NextResponse<PlansResponse | { message: string }>> {
  try {
    await connectToDatabase();
    let plans = await Plan.find({ status: 'ACTIVE' }).sort({ featured: -1, minimumAmount: 1 }).lean();
    if (plans.length === 0) {
      await Plan.insertMany(DEFAULT_PLANS, { ordered: false });
      plans = await Plan.find({ status: 'ACTIVE' }).sort({ featured: -1, minimumAmount: 1 }).lean();
    }
    return NextResponse.json({ plans });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
