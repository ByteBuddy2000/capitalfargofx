import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { User } from '@/models/User';

interface PublicUserData {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: string;
  status: string;
  btcWallet?: string;
  ethWallet?: string;
  usdtWallet?: string;
  [key: string]: unknown;
}

const publicUser = (user: InstanceType<typeof User>): PublicUserData => {
  const value = user.toObject ? user.toObject() : user;
  delete (value as Record<string, unknown>).passwordHash;
  (value as Record<string, unknown>).id = (value as Record<string, unknown>)._id?.toString() || (value as Record<string, unknown>).id;
  delete (value as Record<string, unknown>)._id;
  return value as PublicUserData;
};

export async function GET(): Promise<NextResponse<{ user: PublicUserData } | { message: string }>> {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  }

  return NextResponse.json({ user: publicUser(user as InstanceType<typeof User>) });
}
