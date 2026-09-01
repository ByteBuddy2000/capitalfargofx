import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';

const publicUser = (user: any) => {
  const value = user.toObject ? user.toObject() : user;
  delete value.passwordHash;
  value.id = value._id?.toString() || value.id;
  delete value._id;
  return value;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
): Promise<NextResponse<{ user: any } | { message: string }>> {
  try {
    await connectToDatabase();
    const { username } = await params;
    const resolvedUsername = username.toLowerCase();
    const user = await User.findOne({ username: resolvedUsername }).exec();

    if (!user) {
      return NextResponse.json({ message: 'Referral user not found.' }, { status: 404 });
    }

    return NextResponse.json({ user: publicUser(user) });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

