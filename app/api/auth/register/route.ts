// app/api/auth/register/route.ts
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from "@/lib/connectToDB";

import { User, type IUser } from '@/models/User';
import { Referral } from '@/models/Referral';
import { Asset, ASSET_SYMBOLS } from '@/models/Asset';

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

export type PublicUser = {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: string;
  status: string;
  btcWallet: string;
  ethWallet: string;
  usdtWallet: string;
  uplineUsername: string | null;
};

const publicUser = (user: IUser): PublicUser => ({
  id: user._id.toString(),
  fullName: user.fullName,
  username: user.username,
  email: user.email,
  role: user.role,
  status: user.status,
  btcWallet: user.btcWallet,
  ethWallet: user.ethWallet,
  usdtWallet: user.usdtWallet,
  uplineUsername: user.uplineUsername,
});

export async function POST(request: NextRequest): Promise<NextResponse<{ user: PublicUser } | { message: string }>> {
  let createdUser: IUser | null = null;

  try {
    await connectToDB();
    const body = (await request.json()) as RegisterRequestBody;
    const { fullName, username, email, password, btcWallet, ethWallet, usdtWallet, referralCode = '' } = body;

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
    const normalizedWallets = {
      BTC: typeof btcWallet === 'string' ? btcWallet.trim() : '',
      ETH: typeof ethWallet === 'string' ? ethWallet.trim() : '',
      USDT: typeof usdtWallet === 'string' ? usdtWallet.trim() : '',
    };

    if (await User.exists({ $or: [{ username: normalizedUsername }, { email: normalizedEmail }] })) {
      return NextResponse.json({ message: 'That username or email is already registered.' }, { status: 409 });
    }

    const upline = referralCode?.trim() ? await User.findOne({ username: referralCode.trim().toLowerCase() }).exec() : null;
    createdUser = await User.create({
      fullName: fullName.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(password, 12),
      btcWallet: normalizedWallets.BTC,
      ethWallet: normalizedWallets.ETH,
      usdtWallet: normalizedWallets.USDT,
      uplineId: upline?._id || null,
      uplineUsername: upline?.username || null,
    });

    const registeredUser = createdUser;

    await Asset.insertMany(
      ASSET_SYMBOLS.map(symbol => ({
        userId: registeredUser._id,
        symbol,
        walletAddress: normalizedWallets[symbol],
      })),
    );

    if (upline) {
      await Referral.create({ referrerId: upline._id, referredUserId: registeredUser._id });
    }

    return NextResponse.json({ user: publicUser(registeredUser) }, { status: 201 });
  } catch (error: unknown) {
    console.error(error);

    if (createdUser) {
      await Asset.deleteMany({ userId: createdUser._id });
      await User.deleteOne({ _id: createdUser._id });
    }

    if (error instanceof Error && 'code' in error && (error as { code?: number }).code === 11000) {
      return NextResponse.json({ message: 'That username or email is already registered.' }, { status: 409 });
    }

    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}