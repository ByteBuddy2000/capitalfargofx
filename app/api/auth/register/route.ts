// app/api/auth/register/route.ts
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from "@/lib/connectToDB";

import { User } from '@/models/User';
import { Referral } from '@/models/Referral';

export type RegisterRequestBody = {
  fullName?: string;
  username?: string;
  email?: string;
  password?: string;
  btcWallet?: string;
  ethWallet?: string;
  usdtWallet?: string;
  referralCode?: string;
};

export type PublicUser = Omit<Record<string, unknown>, 'passwordHash' | '_id'> & {
  id?: string;
};

const publicUser = (user: InstanceType<typeof User>): PublicUser => {
  const value = user.toObject ? user.toObject() : user;
  delete (value as Record<string, unknown>).passwordHash;
  (value as Record<string, unknown>).id = (value as Record<string, unknown>)._id?.toString() || (value as Record<string, unknown>).id;
  delete (value as Record<string, unknown>)._id;
  return value as PublicUser;
};

export async function POST(request: NextRequest): Promise<NextResponse<{ user: PublicUser } | { message: string }>> {
  try {
    await connectToDB();
    const body = (await request.json()) as RegisterRequestBody;
    const { fullName, username, email, password, btcWallet = '', ethWallet = '', usdtWallet = '', referralCode = '' } = body;

    if (!fullName?.trim() || !username?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ message: 'Full name, username, email, and password are required.' }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username.trim())) {
      return NextResponse.json({ message: 'Username must be 3-30 letters, numbers, or underscores.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    if (await User.exists({ $or: [{ username: normalizedUsername }, { email: normalizedEmail }] })) {
      return NextResponse.json({ message: 'That username or email is already registered.' }, { status: 409 });
    }

    const upline = referralCode?.trim() ? await User.findOne({ username: referralCode.trim().toLowerCase() }).exec() : null;
    const user = await User.create({
      fullName: fullName.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(password, 12),
      btcWallet: btcWallet.trim(),
      ethWallet: ethWallet.trim(),
      usdtWallet: usdtWallet.trim(),
      uplineId: upline?._id || null,
      uplineUsername: upline?.username || null,
    });

    if (upline) {
      await Referral.create({ referrerId: upline._id, referredUserId: user._id });
    }

    return NextResponse.json({ user: publicUser(user) }, { status: 201 });
  } catch (error: unknown) {
    console.error(error);

    if (error instanceof Error && 'code' in error && (error as { code?: number }).code === 11000) {
      return NextResponse.json({ message: 'That username or email is already registered.' }, { status: 409 });
    }

    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}