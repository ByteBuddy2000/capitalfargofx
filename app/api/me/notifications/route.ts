import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Notification } from '@/models/Notification';

export type MeNotificationsResponse = {
  notifications: Array<Record<string, unknown>>;
};

export async function GET(): Promise<NextResponse<MeNotificationsResponse | { message: string }>> {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }

    await connectToDatabase();
    const notifications = await Notification.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ notifications });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

export async function PATCH(request: Request): Promise<NextResponse<{ notification: Record<string, unknown> } | { message: string }>> {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }

    const body = (await request.json()) as { id?: string };
    if (!body.id) {
      return NextResponse.json({ message: 'Notification id is required.' }, { status: 400 });
    }

    await connectToDatabase();
    const notification = await Notification.findOneAndUpdate({ _id: body.id, userId: user._id }, { read: true }, { new: true }).lean();
    if (!notification) {
      return NextResponse.json({ message: 'Notification not found.' }, { status: 404 });
    }

    return NextResponse.json({ notification });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
