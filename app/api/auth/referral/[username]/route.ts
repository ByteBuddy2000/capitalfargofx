import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User, type IUser } from '@/models/User';

interface PublicUserData {
  id: string;
  fullName: string;
  username: string;
  email: string;
  status: string;
}

const publicUser = (user: IUser): PublicUserData => ({
  id: user._id.toString(),
  fullName: user.fullName,
  username: user.username,
  email: user.email,
  status: user.status,
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
): Promise<NextResponse<{ user: PublicUserData } | { message: string }>> {
  try {
    await connectToDatabase();
    const { username } = await params;
    const resolvedUsername = username.trim().toLowerCase();
    const user = await User.findOne({ username: resolvedUsername })
      .select('fullName username email status')
      .exec();

    if (!user) {
      return NextResponse.json({ message: 'Referral user not found.' }, { status: 404 });
    }

    return NextResponse.json({ user: publicUser(user) });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

