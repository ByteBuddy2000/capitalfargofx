import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

const publicUser = (user: any) => {
  const value = user.toObject ? user.toObject() : user;
  delete value.passwordHash;
  value.id = value._id?.toString() || value.id;
  delete value._id;
  return value;
};

export async function GET(_request: NextRequest): Promise<NextResponse<{ user: any } | { message: string }>> {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  }

  return NextResponse.json({ user: publicUser(user) });
}
