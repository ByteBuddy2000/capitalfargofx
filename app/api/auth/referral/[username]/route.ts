import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';

interface PublicUserData {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: string;
  status: string;
  [key: string]: unknown;
}

const publicUser = (user: InstanceType<typeof User>): PublicUserData => {
  const value = user.toObject ? user.toObject() : user;
  delete (value as Record<string, unknown>).passwordHash;
  (value as Record<string, unknown>).id = (value as Record<string, unknown>)._id?.toString() || (value as Record<string, unknown>).id;
  delete (value as Record<string, unknown>)._id;
  return value as PublicUserData;
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
): Promise<NextResponse<{ user: PublicUserData } | { message: string }>> {
  try {
    await connectToDatabase();
    const { username } = await params;
    const resolvedUsername = username.toLowerCase();
    const user = await User.findOne({ username: resolvedUsername }).exec();

    if (!user) {
      return NextResponse.json({ message: 'Referral user not found.' }, { status: 404 });
    }

    return NextResponse.json({ user: publicUser(user as InstanceType<typeof User>) });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

